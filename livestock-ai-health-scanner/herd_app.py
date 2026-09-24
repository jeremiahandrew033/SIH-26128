"""
Livestock AI Health Scanner

Generic multi-species livestock monitoring prototype.

Supports all livestock classes that exist in the loaded YOLO model.
Standard COCO YOLO models currently provide useful livestock classes such
as cow, horse and sheep. Custom livestock-trained YOLO models can add
goats, buffalo, pigs, poultry, etc.

The application performs:
    - Multi-species livestock detection
    - Persistent animal tracking
    - Individual animal IDs
    - Movement estimation
    - Standing / walking / resting estimation
    - Activity monitoring
    - Tracking-quality estimation
    - Per-animal reports
    - Species-level herd summary

IMPORTANT:
This is a behavioural monitoring prototype, not a veterinary diagnostic
system. Behavioural signals should be validated against farm-specific data.
"""

from __future__ import annotations

import os
import tempfile
from collections import Counter, deque
from dataclasses import dataclass, field
from pathlib import Path
from typing import Deque, Optional

import cv2
import numpy as np
import pandas as pd
import streamlit as st
from ultralytics import YOLO


# ============================================================
# APPLICATION CONFIGURATION
# ============================================================

APP_TITLE = "Livestock AI Health Scanner"

TRACKER_CONFIG = Path(__file__).with_name("strict_fasttrack.yaml")


# Livestock names that the application understands.
#
# Standard COCO:
#   horse
#   sheep
#   cow
#
# Custom livestock models can additionally provide:
#   goat
#   buffalo
#   pig
#   cattle
#   calf
#   donkey
#   mule
#   chicken
#   hen
#   rooster
#   duck
#   turkey
#   camel
#   llama
#   alpaca
#   etc.

LIVESTOCK_ALIASES = {
    "cow": "Cattle",
    "cattle": "Cattle",
    "bull": "Cattle",
    "calf": "Cattle",

    "buffalo": "Buffalo",
    "water buffalo": "Buffalo",

    "goat": "Goat",
    "kid": "Goat",

    "sheep": "Sheep",
    "lamb": "Sheep",

    "horse": "Horse",
    "foal": "Horse",

    "donkey": "Donkey",
    "mule": "Mule",

    "pig": "Pig",
    "swine": "Pig",
    "hog": "Pig",

    "chicken": "Chicken",
    "hen": "Chicken",
    "rooster": "Chicken",
    "cock": "Chicken",

    "duck": "Duck",
    "turkey": "Turkey",

    "camel": "Camel",
    "dromedary": "Camel",

    "llama": "Llama",
    "alpaca": "Alpaca",
}


STABLE_BEHAVIOURS = {
    "walking",
    "standing",
    "lying / resting",
}


# ============================================================
# DATA STRUCTURES
# ============================================================

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
    animal_number: int
    species: str

    raw_track_ids: set[int] = field(default_factory=set)

    history: Deque[Observation] = field(
        default_factory=lambda: deque(maxlen=3600)
    )

    detection_confidences: Deque[float] = field(
        default_factory=lambda: deque(maxlen=600)
    )

    last_bbox: Optional[np.ndarray] = None

    first_seen_frame: int = 0
    last_seen_frame: int = 0
    last_updated_frame: int = 0

    frames_seen: int = 0

    @property
    def name(self) -> str:
        return f"{self.species} #{self.animal_number:02d}"

    @property
    def latest(self) -> Optional[Observation]:
        return self.history[-1] if self.history else None


# ============================================================
# LIVESTOCK REGISTRY
# ============================================================

class LivestockRegistry:

    def __init__(self, reacquire_frames: int) -> None:
        self.reacquire_frames = reacquire_frames

        self.states: dict[int, TrackState] = {}

        self.raw_to_animal: dict[int, int] = {}

        self.next_animal_number = 1

    def resolve(
        self,
        raw_track_id: int,
        species: str,
        bbox: np.ndarray,
        frame_number: int,
    ) -> TrackState:

        # Existing tracker ID
        if raw_track_id in self.raw_to_animal:

            animal_number = self.raw_to_animal[raw_track_id]

            return self.states[animal_number]

        # Try to reconnect a temporarily lost animal.
        bridge_candidates = [
            state
            for state in self.states.values()
            if state.last_bbox is not None
            and state.last_updated_frame != frame_number
            and state.species == species
            and 1
            <= frame_number - state.last_seen_frame
            <= self.reacquire_frames
            and self._is_unambiguous_continuation(
                bbox,
                state.last_bbox,
            )
        ]

        if len(bridge_candidates) == 1:

            state = bridge_candidates[0]

        else:

            state = TrackState(
                animal_number=self.next_animal_number,
                species=species,
            )

            self.states[state.animal_number] = state

            self.next_animal_number += 1

        state.raw_track_ids.add(raw_track_id)

        self.raw_to_animal[raw_track_id] = state.animal_number

        return state

    @staticmethod
    def _is_unambiguous_continuation(
        candidate: np.ndarray,
        previous: np.ndarray,
    ) -> bool:

        overlap = bbox_iou(candidate, previous)

        candidate_center = bbox_center(candidate)
        previous_center = bbox_center(previous)

        shift = np.hypot(
            candidate_center[0] - previous_center[0],
            candidate_center[1] - previous_center[1],
        )

        return (
            overlap >= 0.65
            and shift / max(
                bbox_diagonal(previous),
                1.0,
            )
            <= 0.25
        )


# ============================================================
# ANALYSIS RESULT
# ============================================================

@dataclass
class AnalysisResult:

    registry: LivestockRegistry

    total_frames: int

    fps: float

    duration_seconds: float

    max_visible_animals: int

    tracked_frames: int

    model_weights: str


# ============================================================
# MODEL LOADING
# ============================================================

@st.cache_resource(show_spinner=False)
def load_detector(weights: str) -> YOLO:
    return YOLO(weights)


def reset_trackers(model: YOLO) -> None:

    trackers = getattr(
        getattr(model, "predictor", None),
        "trackers",
        None,
    )

    if trackers is not None:

        for tracker in trackers:
            tracker.reset()


# ============================================================
# MODEL CLASS HANDLING
# ============================================================

def normalize_class_name(name: str) -> str:

    name = str(name).strip().lower()

    name = name.replace("_", " ")
    name = " ".join(name.split())

    return name


def livestock_species_from_name(name: str) -> Optional[str]:

    normalized = normalize_class_name(name)

    return LIVESTOCK_ALIASES.get(normalized)


def get_livestock_class_ids(model: YOLO) -> dict[int, str]:

    names = model.names

    if isinstance(names, list):

        names = {
            index: value
            for index, value in enumerate(names)
        }

    livestock_classes: dict[int, str] = {}

    for class_id, class_name in names.items():

        species = livestock_species_from_name(
            str(class_name)
        )

        if species is not None:

            livestock_classes[int(class_id)] = species

    return livestock_classes


# ============================================================
# BOUNDING BOX FUNCTIONS
# ============================================================

def bbox_center(
    bbox: np.ndarray,
) -> tuple[float, float]:

    x1, y1, x2, y2 = np.asarray(
        bbox,
        dtype=float,
    )

    return (
        (x1 + x2) / 2,
        (y1 + y2) / 2,
    )


def bbox_diagonal(
    bbox: np.ndarray,
) -> float:

    x1, y1, x2, y2 = np.asarray(
        bbox,
        dtype=float,
    )

    return float(
        np.hypot(
            max(1.0, x2 - x1),
            max(1.0, y2 - y1),
        )
    )


def bbox_iou(
    first: np.ndarray,
    second: np.ndarray,
) -> float:

    ax1, ay1, ax2, ay2 = np.asarray(
        first,
        dtype=float,
    )

    bx1, by1, bx2, by2 = np.asarray(
        second,
        dtype=float,
    )

    width = max(
        0.0,
        min(ax2, bx2) - max(ax1, bx1),
    )

    height = max(
        0.0,
        min(ay2, by2) - max(ay1, by1),
    )

    intersection = width * height

    first_area = (
        max(0.0, ax2 - ax1)
        * max(0.0, ay2 - ay1)
    )

    second_area = (
        max(0.0, bx2 - bx1)
        * max(0.0, ay2 - ay1)
    )

    return intersection / max(
        first_area + second_area - intersection,
        1e-6,
    )


# ============================================================
# HISTORY
# ============================================================

def recent_history(
    history: Deque[Observation],
    seconds: float,
) -> list[Observation]:

    if not history:
        return []

    cutoff = history[-1].second - seconds

    return [
        item
        for item in history
        if item.second >= cutoff
    ]


# ============================================================
# BEHAVIOUR ESTIMATION
# ============================================================

def make_observation(
    bbox: np.ndarray,
    confidence: float,
    state: TrackState,
    second: float,
) -> Observation:

    x1, y1, x2, y2 = np.asarray(
        bbox,
        dtype=float,
    )

    width = max(
        1.0,
        x2 - x1,
    )

    height = max(
        1.0,
        y2 - y1,
    )

    center_x = (x1 + x2) / 2
    center_y = (y1 + y2) / 2

    diagonal = float(
        np.hypot(
            width,
            height,
        )
    )

    aspect_ratio = height / width

    previous = state.latest

    speed = 0.0

    if previous is not None:

        elapsed = max(
            0.1,
            second - previous.second,
        )

        displacement = float(
            np.hypot(
                center_x - previous.center_x,
                center_y - previous.center_y,
            )
        )

        speed = (
            displacement
            / diagonal
            / elapsed
        )

    window = recent_history(
        state.history,
        seconds=2.0,
    )

    rolling_speed = float(
        np.mean(
            [
                item.speed
                for item in window
            ]
            + [speed]
        )
    )

    median_aspect = float(
        np.median(
            [
                item.aspect_ratio
                for item in window
            ]
            + [aspect_ratio]
        )
    )

    # --------------------------------------------------------
    # Generic livestock behaviour estimation
    #
    # These are behavioural heuristics, NOT veterinary
    # diagnostics.
    # --------------------------------------------------------

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
    history: Deque[Observation],
    minimum_hold_seconds: float,
    agreement_threshold: float,
) -> tuple[str, float]:

    window = recent_history(
        history,
        seconds=minimum_hold_seconds,
    )

    if len(window) < 3:

        return "observing", 0.0

    duration = (
        window[-1].second
        - window[0].second
    )

    counts = Counter(
        item.raw_behaviour
        for item in window
    )

    label, count = counts.most_common(1)[0]

    agreement = count / len(window)

    detection_quality = float(
        np.mean(
            [
                item.detection_confidence
                for item in window
            ]
        )
    )

    confidence = (
        agreement
        * min(
            1.0,
            duration / minimum_hold_seconds,
        )
        * detection_quality
    )

    if duration < minimum_hold_seconds * 0.8:

        return "observing", confidence

    if agreement < agreement_threshold:

        return "transition", confidence

    return label, confidence


# ============================================================
# TRACK UPDATE
# ============================================================

def update_track(
    state: TrackState,
    bbox: np.ndarray,
    confidence: float,
    second: float,
    frame_number: int,
    minimum_hold_seconds: float,
    agreement_threshold: float,
) -> None:

    observation = make_observation(
        bbox,
        confidence,
        state,
        second,
    )

    state.history.append(observation)

    (
        observation.behaviour,
        observation.behaviour_confidence,
    ) = stabilise_behaviour(
        state.history,
        minimum_hold_seconds,
        agreement_threshold,
    )

    state.last_bbox = np.asarray(
        bbox,
        dtype=float,
    )

    state.last_seen_frame = frame_number

    state.last_updated_frame = frame_number

    state.frames_seen += 1

    state.detection_confidences.append(
        confidence
    )


# ============================================================
# TRACKING QUALITY
# ============================================================

def tracking_coverage(
    state: TrackState,
    final_frame: int,
) -> float:

    if state.first_seen_frame == 0:

        return 0.0

    return min(
        1.0,
        state.frames_seen
        / max(
            1,
            final_frame
            - state.first_seen_frame
            + 1,
        ),
    )


# ============================================================
# BEHAVIOUR / HEALTH SCREENING
# ============================================================

def score_behaviour(
    state: TrackState,
    final_frame: int,
    fps: float,
) -> dict[str, object]:

    observations = list(
        state.history
    )

    coverage = tracking_coverage(
        state,
        final_frame,
    )

    observed_seconds = (
        observations[-1].second
        - observations[0].second
        if len(observations) > 1
        else 0.0
    )

    latest = state.latest

    behaviour = (
        latest.behaviour
        if latest
        else "observing"
    )

    behaviour_confidence = (
        latest.behaviour_confidence
        if latest
        else 0.0
    )

    # --------------------------------------------------------
    # Not enough information
    # --------------------------------------------------------

    if (
        len(observations) < 15
        or observed_seconds < 8.0
    ):

        return {
            "risk": 0,

            "status":
                "INSUFFICIENT EVIDENCE",

            "activity":
                "Need a longer observation",

            "movement":
                "Need a longer observation",

            "resting":
                "Unknown",

            "behaviour":
                behaviour,

            "behaviour_confidence":
                behaviour_confidence,

            "tracking_quality":
                coverage,

            "observed_seconds":
                observed_seconds,

            "recommendation":
                "Keep this animal clearly visible for at least 10 seconds.",
        }

    stable = [
        item
        for item in observations
        if item.behaviour
        in STABLE_BEHAVIOURS
    ]

    counts = Counter(
        item.behaviour
        for item in stable
    )

    stable_total = max(
        1,
        len(stable),
    )

    walking_share = (
        counts["walking"]
        / stable_total
    )

    resting_share = (
        counts["lying / resting"]
        / stable_total
    )

    mean_speed = float(
        np.mean(
            [
                item.speed
                for item in observations
            ]
        )
    )

    mean_detection = (
        float(
            np.mean(
                state.detection_confidences
            )
        )
        if state.detection_confidences
        else 0.0
    )

    quality = (
        coverage
        * mean_detection
    )

    low_activity = (
        walking_share < 0.03
        and mean_speed < 0.025
    )

    sustained_resting = (
        resting_share > 0.85
    )

    # This is a behavioural signal, not disease probability.
    risk = min(
        90,
        5
        + (23 if low_activity else 0)
        + (20 if sustained_resting else 0)
        + (8 if behaviour == "transition" else 0),
    )

    if quality < 0.55:

        status = "REVIEW VIDEO QUALITY"

        recommendation = (
            "The track is incomplete or uncertain. "
            "Use clearer footage with less occlusion."
        )

    elif risk >= 45:

        status = "MONITOR"

        recommendation = (
            f"Review this {state.species.lower()}'s "
            "activity against its normal pattern. "
            "Persistent changes should be checked by farm staff "
            "and, where appropriate, a veterinarian."
        )

    else:

        status = "NORMAL PATTERN OBSERVED"

        recommendation = (
            "No strong behavioural signal appears "
            "in this video. Continue routine observation."
        )

    return {
        "risk": risk,

        "status": status,

        "activity":
            "Low" if low_activity else "Normal",

        "movement":
            "Low"
            if mean_speed < 0.025
            else "Detected",

        "resting":
            "High"
            if sustained_resting
            else "Normal",

        "behaviour":
            behaviour,

        "behaviour_confidence":
            behaviour_confidence,

        "tracking_quality":
            quality,

        "observed_seconds":
            observed_seconds,

        "recommendation":
            recommendation,
    }


# ============================================================
# YOLO TRACK EXTRACTION
# ============================================================

def extract_tracked_animals(
    result,
    livestock_classes: dict[int, str],
) -> list[
    tuple[int, int, str, np.ndarray, float]
]:

    boxes = result.boxes

    if (
        boxes is None
        or len(boxes) == 0
        or boxes.id is None
    ):

        return []

    track_ids = (
        boxes.id
        .int()
        .cpu()
        .tolist()
    )

    class_ids = (
        boxes.cls
        .int()
        .cpu()
        .tolist()
    )

    bboxes = (
        boxes.xyxy
        .cpu()
        .numpy()
    )

    confidences = (
        boxes.conf
        .cpu()
        .numpy()
        .tolist()
    )

    animals = []

    for (
        track_id,
        class_id,
        bbox,
        confidence,
    ) in zip(
        track_ids,
        class_ids,
        bboxes,
        confidences,
    ):

        if class_id not in livestock_classes:
            continue

        species = livestock_classes[
            class_id
        ]

        animals.append(
            (
                int(track_id),
                int(class_id),
                species,
                bbox,
                float(confidence),
            )
        )

    return animals


# ============================================================
# OVERLAY
# ============================================================

def overlay_colour(
    report: dict[str, object],
) -> tuple[int, int, int]:

    if report["status"] == "MONITOR":

        return (44, 90, 240)

    if report["status"] in {
        "INSUFFICIENT EVIDENCE",
        "REVIEW VIDEO QUALITY",
    }:

        return (30, 180, 240)

    return (40, 180, 70)


def draw_overlay(
    frame: np.ndarray,
    visible: list[TrackState],
    final_frame: int,
    fps: float,
    known_count: int,
) -> np.ndarray:

    annotated = frame.copy()

    for state in visible:

        if state.last_bbox is None:
            continue

        report = score_behaviour(
            state,
            final_frame,
            fps,
        )

        x1, y1, x2, y2 = map(
            int,
            state.last_bbox,
        )

        colour = overlay_colour(
            report
        )

        label = (
            f"{state.name.upper()} | "
            f"{str(report['behaviour']).upper()} "
            f"{int(float(report['behaviour_confidence']) * 100)}%"
        )

        (
            width,
            height
        ), _ = cv2.getTextSize(
            label,
            cv2.FONT_HERSHEY_DUPLEX,
            0.53,
            1,
        )

        baseline = max(
            height + 12,
            y1 - 5,
        )

        cv2.rectangle(
            annotated,
            (x1, y1),
            (x2, y2),
            colour,
            3,
        )

        cv2.rectangle(
            annotated,
            (
                x1,
                baseline - height - 9,
            ),
            (
                x1 + width + 12,
                baseline + 3,
            ),
            colour,
            -1,
        )

        cv2.putText(
            annotated,
            label,
            (
                x1 + 6,
                baseline - 5,
            ),
            cv2.FONT_HERSHEY_DUPLEX,
            0.53,
            (255, 255, 255),
            1,
            cv2.LINE_AA,
        )

    header = (
        "LIVESTOCK TRACKING | "
        f"visible: {len(visible)} | "
        f"known: {known_count}"
    )

    cv2.putText(
        annotated,
        header,
        (16, 32),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.65,
        (15, 15, 15),
        3,
        cv2.LINE_AA,
    )

    cv2.putText(
        annotated,
        header,
        (16, 32),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.65,
        (255, 255, 255),
        1,
        cv2.LINE_AA,
    )

    return annotated


# ============================================================
# VIDEO TEMP FILE
# ============================================================

def write_uploaded_video(
    uploaded_file,
) -> str:

    suffix = (
        Path(uploaded_file.name).suffix
        or ".mp4"
    )

    with tempfile.NamedTemporaryFile(
        delete=False,
        suffix=suffix,
    ) as temporary_file:

        temporary_file.write(
            uploaded_file.getbuffer()
        )

        return temporary_file.name


# ============================================================
# MAIN ANALYSIS
# ============================================================

def run_analysis(
    uploaded_file,
    model_weights: str,
    detection_confidence: float,
    inference_size: int,
    minimum_hold_seconds: float,
    agreement_threshold: float,
) -> AnalysisResult:

    video_path = write_uploaded_video(
        uploaded_file
    )

    capture = cv2.VideoCapture(
        video_path
    )

    if not capture.isOpened():

        if os.path.exists(video_path):
            os.unlink(video_path)

        raise RuntimeError(
            "The uploaded file could not be opened as a video."
        )

    fps = float(
        capture.get(
            cv2.CAP_PROP_FPS
        )
        or 25.0
    )

    total_frames = int(
        capture.get(
            cv2.CAP_PROP_FRAME_COUNT
        )
        or 0
    )

    registry = LivestockRegistry(
        reacquire_frames=max(
            15,
            int(fps * 2.5),
        )
    )

    model = load_detector(
        model_weights
    )

    reset_trackers(model)

    # Detect which livestock classes
    # are actually available in this model.
    livestock_classes = (
        get_livestock_class_ids(
            model
        )
    )

    if not livestock_classes:

        capture.release()

        if os.path.exists(video_path):
            os.unlink(video_path)

        available_names = list(
            model.names.values()
            if isinstance(model.names, dict)
            else model.names
        )

        raise RuntimeError(
            "No supported livestock classes were found "
            "in the selected YOLO model.\n\n"
            "The current standard YOLO model usually supports "
            "cattle/cow, horse and sheep. A custom livestock "
            "model is required for species such as goat, "
            "buffalo or pig.\n\n"
            f"Model classes detected: {available_names[:30]}"
        )

    frame_number = 0

    max_visible = 0

    tracked_frames = 0

    live_status = st.empty()

    progress = st.progress(
        0,
        text="Livestock CCTV system initializing...",
    )

    delay = max(
        1,
        int(1000 / fps),
    )

    try:

        while True:

            ok, frame = capture.read()

            if not ok:
                break

            frame_number += 1

            second = (
                frame_number / fps
            )

            # ------------------------------------------------
            # YOLO MULTI-SPECIES TRACKING
            # ------------------------------------------------

            result = model.track(
                frame,

                persist=True,

                # Instead of classes=[19],
                # detect all classes present in
                # the model. We filter livestock
                # after detection.
                classes=None,

                conf=detection_confidence,

                iou=0.55,

                imgsz=inference_size,

                tracker=str(
                    TRACKER_CONFIG
                ),

                verbose=False,
            )[0]

            visible: list[
                TrackState
            ] = []

            tracked_animals = (
                extract_tracked_animals(
                    result,
                    livestock_classes,
                )
            )

            for (
                raw_id,
                class_id,
                species,
                bbox,
                confidence,
            ) in tracked_animals:

                state = registry.resolve(
                    raw_id,
                    species,
                    bbox,
                    frame_number,
                )

                if state.first_seen_frame == 0:

                    state.first_seen_frame = (
                        frame_number
                    )

                # Update behavioural history
                # approximately 5 times per second.
                if (
                    frame_number
                    % max(
                        1,
                        round(fps / 5),
                    )
                    == 0
                    or not state.history
                ):

                    update_track(
                        state,
                        bbox,
                        confidence,
                        second,
                        frame_number,
                        minimum_hold_seconds,
                        agreement_threshold,
                    )

                else:

                    state.last_bbox = (
                        np.asarray(
                            bbox,
                            dtype=float,
                        )
                    )

                    state.last_seen_frame = (
                        frame_number
                    )

                    state.last_updated_frame = (
                        frame_number
                    )

                    state.frames_seen += 1

                    state.detection_confidences.append(
                        confidence
                    )

                visible.append(state)

            visible.sort(
                key=lambda state:
                    (
                        state.species,
                        state.animal_number,
                    )
            )

            max_visible = max(
                max_visible,
                len(visible),
            )

            if visible:

                tracked_frames += 1

            # ------------------------------------------------
            # DRAW LIVE VIDEO
            # ------------------------------------------------

            annotated = draw_overlay(
                frame,
                visible,
                frame_number,
                fps,
                len(registry.states),
            )

            cv2.imshow(
                "Live Livestock CCTV - Press 'q' to Stop",
                annotated,
            )

            if (
                cv2.waitKey(delay)
                & 0xFF
                == ord("q")
            ):

                st.warning(
                    "Video stopped early by user."
                )

                break

            # ------------------------------------------------
            # STREAMLIT STATUS
            # ------------------------------------------------

            if (
                frame_number
                % max(1, int(fps))
                == 0
            ):

                species_counts = Counter(
                    state.species
                    for state in visible
                )

                species_text = " | ".join(
                    f"{species}: {count}"
                    for species, count
                    in sorted(
                        species_counts.items()
                    )
                )

                live_status.info(
                    f"Live Status — "
                    f"Visible: **{len(visible)}** | "
                    f"Unique animals: **{len(registry.states)}** | "
                    f"Peak visible: **{max_visible}**"
                    + (
                        f" | {species_text}"
                        if species_text
                        else ""
                    )
                )

            if total_frames:

                progress.progress(
                    min(
                        frame_number
                        / total_frames,
                        1.0,
                    ),
                    text=(
                        "Processing livestock CCTV stream — "
                        f"{second:.1f}s analyzed"
                    ),
                )

    finally:

        capture.release()

        cv2.destroyAllWindows()

        if os.path.exists(video_path):
            os.unlink(video_path)

    progress.empty()

    live_status.empty()

    return AnalysisResult(
        registry=registry,
        total_frames=frame_number,
        fps=fps,
        duration_seconds=(
            frame_number / fps
            if frame_number
            else 0.0
        ),
        max_visible_animals=max_visible,
        tracked_frames=tracked_frames,
        model_weights=model_weights,
    )


# ============================================================
# REPORT TABLE
# ============================================================

def report_rows(
    analysis: AnalysisResult,
) -> list[dict[str, object]]:

    rows = []

    for state in sorted(
        analysis.registry.states.values(),
        key=lambda item: (
            item.species,
            item.animal_number,
        ),
    ):

        report = score_behaviour(
            state,
            analysis.total_frames,
            analysis.fps,
        )

        visible = (
            "Yes"
            if (
                analysis.total_frames
                - state.last_seen_frame
                <= max(
                    1,
                    int(analysis.fps),
                )
            )
            else "No"
        )

        rows.append(
            {
                "Species":
                    state.species,

                "Animal":
                    state.name,

                "Visible at end":
                    visible,

                "Current behaviour":
                    (
                        f"{str(report['behaviour']).title()} "
                        f"({int(float(report['behaviour_confidence']) * 100)}%)"
                    ),

                "Activity":
                    report["activity"],

                "Movement":
                    report["movement"],

                "Resting":
                    report["resting"],

                "Tracking quality":
                    (
                        f"{int(float(report['tracking_quality']) * 100)}%"
                    ),

                "Screening status":
                    report["status"],

                "Behaviour signal":
                    f"{int(report['risk'])}%",

                "Observed":
                    f"{float(report['observed_seconds']):.1f}s",

                "Tracker aliases":
                    ", ".join(
                        str(item)
                        for item
                        in sorted(
                            state.raw_track_ids
                        )
                    ),
            }
        )

    return rows


# ============================================================
# INDIVIDUAL ANIMAL REPORT
# ============================================================

def render_animal_report(
    analysis: AnalysisResult,
    animal_number: int,
) -> None:

    state = (
        analysis.registry.states[
            animal_number
        ]
    )

    report = score_behaviour(
        state,
        analysis.total_frames,
        analysis.fps,
    )

    st.subheader(
        f"{state.name} behaviour report"
    )

    if report["status"] == "MONITOR":

        st.warning(
            f"Monitor — behavioural signal: "
            f"{report['risk']}%"
        )

    elif report["status"] in {
        "INSUFFICIENT EVIDENCE",
        "REVIEW VIDEO QUALITY",
    }:

        st.info(
            str(report["status"])
        )

    else:

        st.success(
            f"Normal pattern observed — "
            f"behavioural signal: "
            f"{report['risk']}%"
        )

    columns = st.columns(5)

    columns[0].metric(
        "Species",
        state.species,
        border=True,
    )

    columns[1].metric(
        "Behaviour",
        str(
            report["behaviour"]
        ).title(),
        border=True,
    )

    columns[2].metric(
        "Behaviour confidence",
        (
            f"{int(float(report['behaviour_confidence']) * 100)}%"
        ),
        border=True,
    )

    columns[3].metric(
        "Tracking quality",
        (
            f"{int(float(report['tracking_quality']) * 100)}%"
        ),
        border=True,
    )

    columns[4].metric(
        "Observed",
        (
            f"{float(report['observed_seconds']):.1f}s"
        ),
        border=True,
    )

    st.markdown(
        f"""
**Activity:** {report['activity']}

**Movement:** {report['movement']}

**Resting:** {report['resting']}

**Recommendation:** {report['recommendation']}
"""
    )

    history = list(
        state.history
    )

    if history:

        movement = pd.DataFrame(
            {
                "Second":
                    [
                        round(
                            item.second,
                            2,
                        )
                        for item in history
                    ],

                "Normalised movement":
                    [
                        item.speed
                        for item in history
                    ],
            }
        )

        st.line_chart(
            movement,
            x="Second",
            y="Normalised movement",
            height=230,
        )

        behaviours = pd.DataFrame(
            {
                "Behaviour":
                    [
                        item.behaviour.title()
                        for item in history
                    ]
            }
        )

        counts = (
            behaviours
            .value_counts()
            .rename("Observations")
            .reset_index()
        )

        st.bar_chart(
            counts,
            x="Behaviour",
            y="Observations",
            height=230,
        )


# ============================================================
# MAIN STREAMLIT APPLICATION
# ============================================================

def render_app() -> None:

    st.set_page_config(
        page_title=APP_TITLE,
        page_icon="🐄",
        layout="wide",
    )

    st.title(
        "Livestock AI Health Scanner"
    )

    st.caption(
        "Multi-species livestock CCTV monitoring and behavioural screening prototype"
    )

    # ========================================================
    # SIDEBAR
    # ========================================================

    with st.sidebar:

        st.header(
            "Livestock CCTV Setup"
        )

        uploaded = st.file_uploader(
            "Upload test CCTV recording",
            type=[
                "mp4",
                "mov",
                "avi",
                "mkv",
            ],
        )

        with st.form(
            "tracking_settings",
            border=False,
        ):

            model_label = st.selectbox(
                "Detection model",
                [
                    "Balanced accuracy (YOLO11s)",
                    "High accuracy (YOLO11m)",
                ],
            )

            detection_confidence = st.slider(
                "Minimum animal detection confidence",
                min_value=0.10,
                max_value=0.70,
                value=0.22,
                step=0.02,
            )

            inference_size = st.select_slider(
                "Inference resolution",
                options=[
                    640,
                    768,
                    960,
                    1152,
                    1280,
                ],
                value=960,
            )

            minimum_hold_seconds = st.slider(
                "Minimum behaviour hold",
                min_value=0.5,
                max_value=3.0,
                value=1.5,
                step=0.25,
            )

            agreement_threshold = st.slider(
                "Required behaviour agreement",
                min_value=0.50,
                max_value=0.90,
                value=0.70,
                step=0.05,
            )

            analyse = st.form_submit_button(
                "Start Livestock CCTV",
                type="primary",
            )

        st.caption(
            "Higher resolution improves detection of small or distant animals but increases processing time."
        )

    # ========================================================
    # RESET WHEN FILE CHANGES
    # ========================================================

    file_signature = (
        uploaded.name,
        uploaded.size,
    ) if uploaded is not None else None

    if (
        st.session_state.get(
            "uploaded_file_signature"
        )
        != file_signature
    ):

        st.session_state[
            "uploaded_file_signature"
        ] = file_signature

        st.session_state.pop(
            "analysis",
            None,
        )

    # ========================================================
    # INFORMATION
    # ========================================================

    st.info(
        "**CCTV mode:** Starting analysis opens a separate "
        "desktop OpenCV window. Click that window and press "
        "**Q** to stop early."
    )

    # ========================================================
    # NO VIDEO
    # ========================================================

    if uploaded is None:

        with st.container(
            border=True
        ):

            st.subheader(
                "Ready for a livestock video"
            )

            st.write(
                "Upload a CCTV recording to detect and track supported livestock species, "
                "assign individual IDs, estimate behaviour, and generate monitoring reports."
            )

            st.markdown(
                """
**Supported automatically when present in the model:**

- 🐄 Cattle
- 🐎 Horse
- 🐑 Sheep
- 🐐 Goat
- 🐃 Buffalo
- 🐖 Pig
- 🐓 Chicken
- 🦆 Duck
- 🐫 Camel
- 🦙 Llama / Alpaca
- Other livestock classes from a compatible custom YOLO model
"""
            )

            st.warning(
                "The standard YOLO11 COCO models do not contain every livestock species. "
                "A custom livestock-trained model is required for species such as goats, "
                "buffalo and pigs."
            )

    # ========================================================
    # START ANALYSIS
    # ========================================================

    elif analyse:

        weights = (
            "yolo11s.pt"
            if model_label.startswith(
                "Balanced"
            )
            else "yolo11m.pt"
        )

        st.session_state.pop(
            "analysis",
            None,
        )

        try:

            st.session_state[
                "analysis"
            ] = run_analysis(
                uploaded,
                model_weights=weights,
                detection_confidence=(
                    detection_confidence
                ),
                inference_size=int(
                    inference_size
                ),
                minimum_hold_seconds=(
                    minimum_hold_seconds
                ),
                agreement_threshold=(
                    agreement_threshold
                ),
            )

        except RuntimeError as error:

            st.error(
                str(error)
            )

    # ========================================================
    # DISPLAY ANALYSIS
    # ========================================================

    analysis: Optional[
        AnalysisResult
    ] = st.session_state.get(
        "analysis"
    )

    if analysis is not None:

        st.divider()

        st.subheader(
            "Livestock tracking summary"
        )

        rows = report_rows(
            analysis
        )

        monitoring = sum(
            row["Screening status"]
            == "MONITOR"
            for row in rows
        )

        normal = sum(
            row["Screening status"]
            == "NORMAL PATTERN OBSERVED"
            for row in rows
        )

        review = (
            len(rows)
            - normal
            - monitoring
        )

        # ----------------------------------------------------
        # TOP METRICS
        # ----------------------------------------------------

        columns = st.columns(5)

        columns[0].metric(
            "Unique animals",
            len(rows),
            border=True,
        )

        columns[1].metric(
            "Peak visible",
            analysis.max_visible_animals,
            border=True,
        )

        columns[2].metric(
            "Normal pattern",
            normal,
            border=True,
        )

        columns[3].metric(
            "Monitor",
            monitoring,
            border=True,
        )

        columns[4].metric(
            "Review",
            review,
            border=True,
        )

        st.caption(
            f"Video analysed: "
            f"{analysis.duration_seconds:.1f}s | "
            f"Detector: {analysis.model_weights} | "
            f"Frames with confirmed livestock tracks: "
            f"{analysis.tracked_frames}"
        )

        # ----------------------------------------------------
        # SPECIES SUMMARY
        # ----------------------------------------------------

        st.subheader(
            "Species summary"
        )

        species_counts = Counter(
            state.species
            for state
            in analysis.registry.states.values()
        )

        species_df = pd.DataFrame(
            [
                {
                    "Species":
                        species,

                    "Unique tracked":
                        count,
                }

                for species, count
                in sorted(
                    species_counts.items()
                )
            ]
        )

        if not species_df.empty:

            st.dataframe(
                species_df,
                hide_index=True,
                use_container_width=True,
            )

        # ----------------------------------------------------
        # FULL ANIMAL TABLE
        # ----------------------------------------------------

        st.subheader(
            "Individual livestock tracking"
        )

        st.dataframe(
            pd.DataFrame(rows),
            hide_index=True,
            use_container_width=True,
            key="livestock_tracking_table",
        )

        # ----------------------------------------------------
        # INDIVIDUAL SELECTION
        # ----------------------------------------------------

        choices = {
            state.name:
                animal_number

            for (
                animal_number,
                state
            )
            in sorted(
                analysis.registry.states.items(),
                key=lambda item: (
                    item[1].species,
                    item[1].animal_number,
                ),
            )
        }

        if choices:

            selected_name = st.selectbox(
                "Inspect one tracked animal",
                list(choices),
                key="selected_animal",
            )

            render_animal_report(
                analysis,
                choices[selected_name],
            )

    # ========================================================
    # LIMITATIONS
    # ========================================================

    st.divider()

    with st.expander(
        "Tracking reliability and limitations"
    ):

        st.markdown(
            """
### Detection

The detector can only recognize species that exist in the
selected YOLO model.

The standard COCO YOLO models provide classes such as:

- Cow
- Horse
- Sheep

For goats, buffalo, pigs, poultry and other farm animals,
use a livestock-specific/custom-trained YOLO model.

### Tracking

Each detected animal receives an individual tracking ID.

The system attempts to preserve an identity during brief
occlusion. If two animals become completely indistinguishable,
the system can create a new identity rather than pretending
that it knows the correct identity.

### Behaviour

The prototype estimates:

- Walking
- Standing
- Lying / resting
- Transition
- Observing

These are video-based behavioural estimates.

### Health screening

The displayed behavioural signal is NOT a disease probability
and does not diagnose an animal.

Persistent unusual activity should be reviewed by farm staff
and, where appropriate, a veterinarian.

### Camera recommendations

For better results:

- Keep the camera relatively stable.
- Avoid extreme camera movement.
- Avoid heavy animal overlap.
- Keep animals sufficiently large in the frame.
- Use good lighting.
- Provide at least 10 seconds of visible footage per animal.
- For production use, validate the detector and behaviour
  thresholds using representative farm footage.
"""
        )