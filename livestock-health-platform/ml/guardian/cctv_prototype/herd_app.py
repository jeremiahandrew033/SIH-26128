"""Strict all-cow uploaded-video behaviour screening prototype.

Displays live tracking via a native OpenCV desktop window to simulate
low-latency CCTV monitoring, while keeping Streamlit for UI and reporting.
"""

from __future__ import annotations

import os
import tempfile
from collections import Counter, deque
from dataclasses import dataclass, field
from pathlib import Path
from typing import Deque, Optional, Tuple, Dict, List

import cv2
import numpy as np
import pandas as pd
import streamlit as st
from ultralytics import YOLO


APP_TITLE = "Livestock CCTV Prototype"
COW_CLASS_ID = 19
TRACKER_CONFIG = Path(__file__).with_name("strict_fasttrack.yaml")
STABLE_BEHAVIOURS = {"walking", "standing", "lying / resting"}


@dataclass
class Observation:
    second: float
    center_x: float
    center_y: float
    diagonal: float
    aspect_ratio: float
    speed: float
    detection_confidence: float
    raw_behaviour: str
    behaviour: str = "observing"
    behaviour_confidence: float = 0.0


@dataclass
class TrackState:
    cow_number: int
    raw_track_ids: set[int] = field(default_factory=set)
    history: Deque[Observation] = field(default_factory=lambda: deque(maxlen=3600))
    detection_confidences: Deque[float] = field(default_factory=lambda: deque(maxlen=600))
    last_bbox: Optional[np.ndarray] = None
    first_seen_frame: int = 0
    last_seen_frame: int = 0
    last_updated_frame: int = 0
    frames_seen: int = 0

    @property
    def name(self) -> str:
        return f"Cow #{self.cow_number:02d}"

    @property
    def latest(self) -> Optional[Observation]:
        return self.history[-1] if self.history else None


class HerdRegistry:
    def __init__(self, reacquire_frames: int) -> None:
        self.reacquire_frames = reacquire_frames
        self.states: dict[int, TrackState] = {}
        self.raw_to_cow: dict[int, int] = {}
        self.next_cow_number = 1

    def resolve(self, raw_track_id: int, bbox: np.ndarray, frame_number: int) -> TrackState:
        if raw_track_id in self.raw_to_cow:
            return self.states[self.raw_to_cow[raw_track_id]]

        bridge_candidates = [
            state
            for state in self.states.values()
            if state.last_bbox is not None
            and state.last_updated_frame != frame_number
            and 1 <= frame_number - state.last_seen_frame <= self.reacquire_frames
            and self._is_unambiguous_continuation(bbox, state.last_bbox)
        ]
        if len(bridge_candidates) == 1:
            state = bridge_candidates[0]
        else:
            state = TrackState(cow_number=self.next_cow_number)
            self.states[state.cow_number] = state
            self.next_cow_number += 1

        state.raw_track_ids.add(raw_track_id)
        self.raw_to_cow[raw_track_id] = state.cow_number
        return state

    @staticmethod
    def _is_unambiguous_continuation(candidate: np.ndarray, previous: np.ndarray) -> bool:
        overlap = bbox_iou(candidate, previous)
        candidate_center = bbox_center(candidate)
        previous_center = bbox_center(previous)
        shift = np.hypot(candidate_center[0] - previous_center[0], candidate_center[1] - previous_center[1])
        return overlap >= 0.65 and shift / max(bbox_diagonal(previous), 1.0) <= 0.25


@dataclass
class AnalysisResult:
    registry: HerdRegistry
    total_frames: int
    fps: float
    duration_seconds: float
    max_visible_cows: int
    tracked_frames: int
    model_weights: str


@st.cache_resource(show_spinner=False)
def load_detector(weights: str) -> YOLO:
    return YOLO(weights)


def reset_trackers(model: YOLO) -> None:
    trackers = getattr(getattr(model, "predictor", None), "trackers", None)
    if trackers is not None:
        for tracker in trackers:
            tracker.reset()


def bbox_center(bbox: np.ndarray) -> tuple[float, float]:
    x1, y1, x2, y2 = np.asarray(bbox, dtype=float)
    return (x1 + x2) / 2, (y1 + y2) / 2


def bbox_diagonal(bbox: np.ndarray) -> float:
    x1, y1, x2, y2 = np.asarray(bbox, dtype=float)
    return float(np.hypot(max(1.0, x2 - x1), max(1.0, y2 - y1)))


def bbox_iou(first: np.ndarray, second: np.ndarray) -> float:
    ax1, ay1, ax2, ay2 = np.asarray(first, dtype=float)
    bx1, by1, bx2, by2 = np.asarray(second, dtype=float)
    width = max(0.0, min(ax2, bx2) - max(ax1, bx1))
    height = max(0.0, min(ay2, by2) - max(ay1, by1))
    intersection = width * height
    first_area = max(0.0, ax2 - ax1) * max(0.0, ay2 - ay1)
    second_area = max(0.0, bx2 - bx1) * max(0.0, by2 - by1)
    return intersection / max(first_area + second_area - intersection, 1e-6)


def recent_history(history: Deque[Observation], seconds: float) -> list[Observation]:
    if not history:
        return []
    cutoff = history[-1].second - seconds
    return [item for item in history if item.second >= cutoff]


def make_observation(bbox: np.ndarray, confidence: float, state: TrackState, second: float) -> Observation:
    x1, y1, x2, y2 = np.asarray(bbox, dtype=float)
    width, height = max(1.0, x2 - x1), max(1.0, y2 - y1)
    center_x, center_y = (x1 + x2) / 2, (y1 + y2) / 2
    diagonal = float(np.hypot(width, height))
    aspect_ratio = height / width
    previous = state.latest
    speed = 0.0
    if previous is not None:
        elapsed = max(0.1, second - previous.second)
        displacement = float(np.hypot(center_x - previous.center_x, center_y - previous.center_y))
        speed = displacement / diagonal / elapsed

    window = recent_history(state.history, seconds=2.0)
    rolling_speed = float(np.mean([item.speed for item in window] + [speed]))
    median_aspect = float(np.median([item.aspect_ratio for item in window] + [aspect_ratio]))
    
    if median_aspect < 0.72:
        raw_behaviour = "lying / resting"
    elif rolling_speed >= 0.065:
        raw_behaviour = "walking"
    else:
        raw_behaviour = "standing"

    return Observation(
        second=second,
        center_x=center_x,
        center_y=center_y,
        diagonal=diagonal,
        aspect_ratio=aspect_ratio,
        speed=speed,
        detection_confidence=confidence,
        raw_behaviour=raw_behaviour,
    )


def stabilise_behaviour(
    history: Deque[Observation], minimum_hold_seconds: float, agreement_threshold: float
) -> tuple[str, float]:
    window = recent_history(history, seconds=minimum_hold_seconds)
    if len(window) < 3:
        return "observing", 0.0
    duration = window[-1].second - window[0].second
    counts = Counter(item.raw_behaviour for item in window)
    label, count = counts.most_common(1)[0]
    agreement = count / len(window)
    detection_quality = float(np.mean([item.detection_confidence for item in window]))
    confidence = agreement * min(1.0, duration / minimum_hold_seconds) * detection_quality
    if duration < minimum_hold_seconds * 0.8:
        return "observing", confidence
    if agreement < agreement_threshold:
        return "transition", confidence
    return label, confidence


def update_track(
    state: TrackState,
    bbox: np.ndarray,
    confidence: float,
    second: float,
    frame_number: int,
    minimum_hold_seconds: float,
    agreement_threshold: float,
) -> None:
    observation = make_observation(bbox, confidence, state, second)
    state.history.append(observation)
    observation.behaviour, observation.behaviour_confidence = stabilise_behaviour(
        state.history, minimum_hold_seconds, agreement_threshold
    )
    state.last_bbox = np.asarray(bbox, dtype=float)
    state.last_seen_frame = frame_number
    state.last_updated_frame = frame_number
    state.frames_seen += 1
    state.detection_confidences.append(confidence)


def tracking_coverage(state: TrackState, final_frame: int) -> float:
    if state.first_seen_frame == 0:
        return 0.0
    return min(1.0, state.frames_seen / max(1, final_frame - state.first_seen_frame + 1))


def score_behaviour(state: TrackState, final_frame: int, fps: float) -> dict[str, object]:
    observations = list(state.history)
    coverage = tracking_coverage(state, final_frame)
    observed_seconds = observations[-1].second - observations[0].second if len(observations) > 1 else 0.0
    latest = state.latest
    behaviour = latest.behaviour if latest else "observing"
    behaviour_confidence = latest.behaviour_confidence if latest else 0.0
    if len(observations) < 15 or observed_seconds < 8.0:
        return {
            "risk": 0,
            "status": "INSUFFICIENT EVIDENCE",
            "activity": "Need a longer observation",
            "movement": "Need a longer observation",
            "resting": "Unknown",
            "behaviour": behaviour,
            "behaviour_confidence": behaviour_confidence,
            "tracking_quality": coverage,
            "observed_seconds": observed_seconds,
            "recommendation": "Keep this cow clearly visible for at least 10 seconds.",
        }

    stable = [item for item in observations if item.behaviour in STABLE_BEHAVIOURS]
    counts = Counter(item.behaviour for item in stable)
    stable_total = max(1, len(stable))
    walking_share = counts["walking"] / stable_total
    resting_share = counts["lying / resting"] / stable_total
    mean_speed = float(np.mean([item.speed for item in observations]))
    mean_detection = float(np.mean(state.detection_confidences)) if state.detection_confidences else 0.0
    quality = coverage * mean_detection
    low_activity = walking_share < 0.03 and mean_speed < 0.025
    sustained_resting = resting_share > 0.85
    risk = min(90, 5 + (23 if low_activity else 0) + (20 if sustained_resting else 0) + (8 if behaviour == "transition" else 0))

    if quality < 0.55:
        status = "REVIEW VIDEO QUALITY"
        recommendation = "The track is incomplete or uncertain. Use a clearer, less-occluded video before interpreting behaviour."
    elif risk >= 45:
        status = "MONITOR"
        recommendation = "Compare this pattern with the cow's normal activity. If it persists, review the animal and consider veterinary advice."
    else:
        status = "NORMAL PATTERN OBSERVED"
        recommendation = "No strong behavioural concern appears in this video. Continue routine observation."

    return {
        "risk": risk,
        "status": status,
        "activity": "Low" if low_activity else "Normal",
        "movement": "Low" if mean_speed < 0.025 else "Detected",
        "resting": "High" if sustained_resting else "Normal",
        "behaviour": behaviour,
        "behaviour_confidence": behaviour_confidence,
        "tracking_quality": quality,
        "observed_seconds": observed_seconds,
        "recommendation": recommendation,
    }


def extract_tracked_cows(result) -> list[tuple[int, np.ndarray, float]]:
    boxes = result.boxes
    if boxes is None or len(boxes) == 0 or boxes.id is None:
        return []
    return [
        (int(track_id), box, float(confidence))
        for track_id, box, confidence in zip(
            boxes.id.int().cpu().tolist(), boxes.xyxy.cpu().numpy(), boxes.conf.cpu().numpy().tolist()
        )
    ]


def overlay_colour(report: dict[str, object]) -> tuple[int, int, int]:
    if report["status"] == "MONITOR":
        return (44, 90, 240)
    if report["status"] in {"INSUFFICIENT EVIDENCE", "REVIEW VIDEO QUALITY"}:
        return (30, 180, 240)
    return (40, 180, 70)


def draw_overlay(frame: np.ndarray, visible: list[TrackState], final_frame: int, fps: float, known_count: int) -> np.ndarray:
    annotated = frame.copy()
    for state in visible:
        if state.last_bbox is None:
            continue
        report = score_behaviour(state, final_frame, fps)
        x1, y1, x2, y2 = map(int, state.last_bbox)
        colour = overlay_colour(report)
        label = f"{state.name.upper()} | {str(report['behaviour']).upper()} {int(float(report['behaviour_confidence']) * 100)}%"
        (width, height), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_DUPLEX, 0.53, 1)
        baseline = max(height + 12, y1 - 5)
        cv2.rectangle(annotated, (x1, y1), (x2, y2), colour, 3)
        cv2.rectangle(annotated, (x1, baseline - height - 9), (x1 + width + 12, baseline + 3), colour, -1)
        cv2.putText(annotated, label, (x1 + 6, baseline - 5), cv2.FONT_HERSHEY_DUPLEX, 0.53, (255, 255, 255), 1, cv2.LINE_AA)
    header = f"STRICT HERD TRACKING | visible: {len(visible)} | known: {known_count}"
    cv2.putText(annotated, header, (16, 32), cv2.FONT_HERSHEY_SIMPLEX, 0.65, (15, 15, 15), 3, cv2.LINE_AA)
    cv2.putText(annotated, header, (16, 32), cv2.FONT_HERSHEY_SIMPLEX, 0.65, (255, 255, 255), 1, cv2.LINE_AA)
    return annotated


def write_uploaded_video(uploaded_file) -> str:
    suffix = Path(uploaded_file.name).suffix or ".mp4"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temporary_file:
        temporary_file.write(uploaded_file.getbuffer())
        return temporary_file.name


def run_analysis(
    uploaded_file,
    model_weights: str,
    detection_confidence: float,
    inference_size: int,
    minimum_hold_seconds: float,
    agreement_threshold: float,
) -> AnalysisResult:
    video_path = write_uploaded_video(uploaded_file)
    capture = cv2.VideoCapture(video_path)
    if not capture.isOpened():
        if os.path.exists(video_path):
            os.unlink(video_path)
        raise RuntimeError("The uploaded file could not be opened as a video.")

    fps = float(capture.get(cv2.CAP_PROP_FPS) or 25.0)
    total_frames = int(capture.get(cv2.CAP_PROP_FRAME_COUNT) or 0)

    registry = HerdRegistry(reacquire_frames=max(15, int(fps * 2.5)))
    model = load_detector(model_weights)
    reset_trackers(model)
    
    frame_number = max_visible = tracked_frames = 0
    live_status = st.empty()
    progress = st.progress(0, text="CCTV Prototype Initializing... Check your taskbar for the video window.")

    # Calculate optimal wait time based on FPS to mimic live playback speed
    delay = max(1, int(1000 / fps))

    try:
        while True:
            ok, frame = capture.read()
            if not ok:
                break
            frame_number += 1
            second = frame_number / fps
            
            # Run YOLO tracking
            result = model.track(
                frame,
                persist=True,
                classes=[COW_CLASS_ID],
                conf=detection_confidence,
                iou=0.55,
                imgsz=inference_size,
                tracker=str(TRACKER_CONFIG),
                verbose=False,
            )[0]
            
            visible: list[TrackState] = []
            for raw_id, bbox, confidence in extract_tracked_cows(result):
                state = registry.resolve(raw_id, bbox, frame_number)
                if state.first_seen_frame == 0:
                    state.first_seen_frame = frame_number
                if frame_number % max(1, round(fps / 5)) == 0 or not state.history:
                    update_track(
                        state, bbox, confidence, second, frame_number, minimum_hold_seconds, agreement_threshold
                    )
                else:
                    state.last_bbox = np.asarray(bbox, dtype=float)
                    state.last_seen_frame = frame_number
                    state.last_updated_frame = frame_number
                    state.frames_seen += 1
                    state.detection_confidences.append(confidence)
                visible.append(state)

            visible.sort(key=lambda state: state.cow_number)
            max_visible = max(max_visible, len(visible))
            if visible:
                tracked_frames += 1
            
            # Draw the bounding boxes
            annotated = draw_overlay(frame, visible, frame_number, fps, len(registry.states))
            
            # ---------------------------------------------------------
            # HARDWARE-ACCELERATED DESKTOP WINDOW DISPLAY (NO BROWSER LAG)
            # ---------------------------------------------------------
            cv2.imshow("Live CCTV Prototype - Press 'q' to Stop", annotated)
            
            # Capture keyboard input. If 'q' is pressed, break the loop early.
            if cv2.waitKey(delay) & 0xFF == ord('q'):
                st.warning("Video stopped early by user.")
                break
            # ---------------------------------------------------------

            # Update Streamlit text without pushing heavy images
            if frame_number % int(fps) == 0:
                live_status.info(
                    f"Live Status - Visible now: **{len(visible)}** | Unique cows tracked: **{len(registry.states)}** | Peak visible: **{max_visible}**"
                )
            if total_frames:
                progress.progress(
                    min(frame_number / total_frames, 1.0), text=f"Processing CCTV stream - {second:.1f}s analyzed"
                )
    finally:
        capture.release()
        cv2.destroyAllWindows()  # Cleanly closes the OpenCV desktop window
        if os.path.exists(video_path):
            os.unlink(video_path)

    progress.empty()
    live_status.empty()
    return AnalysisResult(
        registry=registry,
        total_frames=frame_number,
        fps=fps,
        duration_seconds=frame_number / fps if frame_number else 0.0,
        max_visible_cows=max_visible,
        tracked_frames=tracked_frames,
        model_weights=model_weights,
    )


def report_rows(analysis: AnalysisResult) -> list[dict[str, object]]:
    rows: list[dict[str, object]] = []
    for state in sorted(analysis.registry.states.values(), key=lambda item: item.cow_number):
        report = score_behaviour(state, analysis.total_frames, analysis.fps)
        visible = "Yes" if analysis.total_frames - state.last_seen_frame <= max(1, int(analysis.fps)) else "No"
        rows.append(
            {
                "Cow": state.name,
                "Visible at end": visible,
                "Current behaviour": f"{str(report['behaviour']).title()} ({int(float(report['behaviour_confidence']) * 100)}%)",
                "Activity": report["activity"],
                "Tracking quality": f"{int(float(report['tracking_quality']) * 100)}%",
                "Screening status": report["status"],
                "Risk signal": f"{int(report['risk'])}%",
                "Observed": f"{float(report['observed_seconds']):.1f}s",
                "Tracker aliases": ", ".join(str(item) for item in sorted(state.raw_track_ids)),
            }
        )
    return rows


def render_animal_report(analysis: AnalysisResult, cow_number: int) -> None:
    state = analysis.registry.states[cow_number]
    report = score_behaviour(state, analysis.total_frames, analysis.fps)
    st.subheader(f"{state.name} behaviour report")

    # For the prototype, map cow_number (1-4) to demo animal UUIDs in the database
    demo_uuids = {
        1: "a1111111-1111-1111-1111-111111111111", # COW-0001
        2: "a2222222-2222-2222-2222-222222222222", # COW-0002
        3: "a3333333-3333-3333-3333-333333333333", # COW-0003
        4: "a4444444-4444-4444-4444-444444444444", # COW-0004
    }
    animal_uuid = demo_uuids.get(cow_number, demo_uuids[1])
    st.markdown(f"**[🔗 View Full Animal Profile & Health Records in Farmer Portal](http://localhost:5173/farmer/animals/{animal_uuid})**")
    
    if report["status"] == "MONITOR":
        st.warning(f"Monitor - behavioural risk signal: {report['risk']}%")
    elif report["status"] in {"INSUFFICIENT EVIDENCE", "REVIEW VIDEO QUALITY"}:
        st.info(str(report["status"]).replace("_", " ").title())
    else:
        st.success(f"Normal pattern observed - behavioural risk signal: {report['risk']}%")

    columns = st.columns(4)
    columns[0].metric("Behaviour", str(report["behaviour"]).title(), border=True)
    columns[1].metric("Behaviour confidence", f"{int(float(report['behaviour_confidence']) * 100)}%", border=True)
    columns[2].metric("Tracking quality", f"{int(float(report['tracking_quality']) * 100)}%", border=True)
    columns[3].metric("Observed", f"{float(report['observed_seconds']):.1f}s", border=True)
    st.markdown(
        f"**Activity:** {report['activity']} \n\n**Movement:** {report['movement']} \n\n**Resting:** {report['resting']} \n\n**Recommendation:** {report['recommendation']}"
    )
    history = list(state.history)
    if history:
        movement = pd.DataFrame(
            {"Second": [round(item.second, 2) for item in history], "Normalised movement": [item.speed for item in history]}
        )
        st.line_chart(movement, x="Second", y="Normalised movement", height=230)
        behaviours = pd.DataFrame({"Behaviour": [item.behaviour.title() for item in history]})
        counts = behaviours.value_counts().rename("Observations").reset_index()
        st.bar_chart(counts, x="Behaviour", y="Observations", height=230)


def render_app() -> None:
    st.set_page_config(page_title=APP_TITLE, page_icon="🐄", layout="wide")
    st.title("Livestock CCTV Prototype")
    st.caption("Testing live low-latency video monitoring via local OpenCV display")

    with st.sidebar:
        st.header("Upload and tracking setup")
        uploaded = st.file_uploader("Upload test CCTV recording", type=["mp4", "mov", "avi", "mkv"])
        with st.form("tracking_settings", border=False):
            model_label = st.selectbox("Detection model", ["Balanced accuracy (recommended)", "High accuracy (slower)"])
            detection_confidence = st.slider(
                "Minimum cow detection confidence", min_value=0.10, max_value=0.70, value=0.22, step=0.02
            )
            inference_size = st.select_slider("Inference resolution", options=[640, 768, 960, 1152, 1280], value=960)
            minimum_hold_seconds = st.slider(
                "Minimum behaviour hold", min_value=0.5, max_value=3.0, value=1.5, step=0.25
            )
            agreement_threshold = st.slider(
                "Required behaviour agreement", min_value=0.50, max_value=0.90, value=0.70, step=0.05
            )
            analyse = st.form_submit_button("Start CCTV Prototype", type="primary")
        st.caption("Higher resolution improves small or distant cow detection but increases processing time.")

    file_signature = (uploaded.name, uploaded.size) if uploaded is not None else None
    if st.session_state.get("uploaded_file_signature") != file_signature:
        st.session_state["uploaded_file_signature"] = file_signature
        st.session_state.pop("analysis", None)

    st.info(
        "**NOTE:** When you start the analysis, a separate desktop window will open to display the video feed smoothly. "
        "Keep an eye on your taskbar. To stop the video and view reports early, click on the video window and press 'q'."
    )

    if uploaded is None:
        with st.container(border=True):
            st.subheader("Ready for a herd video")
            st.write("Upload a video to see a stable label for every cow, live tracking boxes, and individual behaviour reports.")
            st.markdown("**For reliable IDs:** keep the camera stable, avoid heavy overlap, and show each cow clearly for 10 seconds or more.")
    elif analyse:
        weights = "yolo11s.pt" if model_label.startswith("Balanced") else "yolo11m.pt"
        st.session_state.pop("analysis", None)
        try:
            st.session_state["analysis"] = run_analysis(
                uploaded,
                model_weights=weights,
                detection_confidence=detection_confidence,
                inference_size=int(inference_size),
                minimum_hold_seconds=minimum_hold_seconds,
                agreement_threshold=agreement_threshold,
            )
        except RuntimeError as error:
            st.error(str(error))

    analysis: Optional[AnalysisResult] = st.session_state.get("analysis")
    
    if analysis is not None:
        st.divider()
        st.subheader("Herd tracking summary")
        rows = report_rows(analysis)
        monitoring = sum(row["Screening status"] == "MONITOR" for row in rows)
        normal = sum(row["Screening status"] == "NORMAL PATTERN OBSERVED" for row in rows)
        review = len(rows) - normal - monitoring
        columns = st.columns(4)
        columns[0].metric("Unique cows tracked", len(rows), border=True)
        columns[1].metric("Peak visible together", analysis.max_visible_cows, border=True)
        columns[2].metric("Normal pattern", normal, border=True)
        columns[3].metric("Monitor or review", monitoring + review, border=True)
        st.caption(
            f"Video analysed: {analysis.duration_seconds:.1f}s | Detector: {analysis.model_weights} | "
            f"Frames with confirmed cow tracks: {analysis.tracked_frames}"
        )
        st.dataframe(pd.DataFrame(rows), hide_index=True, key="herd_tracking_table")
        choices = {state.name: cow_number for cow_number, state in sorted(analysis.registry.states.items())}
        if choices:
            selected_name = st.selectbox("Inspect one tracked cow", list(choices), key="selected_cow")
            render_animal_report(analysis, choices[selected_name])

    st.divider()
    with st.expander("Tracking reliability and limits"):
        st.markdown(
            """
            - Every confirmed COCO `cow` detection receives a label. IDs persist through brief occlusion; if two cows become fully indistinguishable, the app creates a new identity instead of guessing a merge.
            - A behaviour is shown only after the selected hold period and agreement threshold. Until then, the overlay says `OBSERVING` or `TRANSITION`.
            - Walking, standing, and resting are conservative video-based estimates. Eating/grazing, lameness, disease labels, and clinical conclusions require labelled pose/behaviour data and repeated observations over time.
            - Validate the detector, tracker, and behaviour settings with representative footage from the target farm before relying on any monitoring signal.
            """
        )
