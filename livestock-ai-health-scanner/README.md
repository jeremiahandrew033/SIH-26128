# Livestock behaviour tracker

An uploaded-video prototype that tracks **every detected cow** and produces a
separate, time-smoothed behavioural screening report for each animal.

## Run it

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m streamlit run app.py
```

Using `python -m` intentionally avoids Windows PATH warnings about package
scripts. On first use, Ultralytics will download the selected YOLO model.

## What is implemented

1. Upload one `.mp4`, `.mov`, `.avi`, or `.mkv` herd video.
2. Detect all COCO `cow` detections with a higher-accuracy YOLO option.
3. Track every cow using an occlusion-aware FastTracker configuration and
   stable display labels: `Cow #01`, `Cow #02`, and so on.
4. Preserve a display ID across a brief, unambiguous tracker-ID change.
5. Confirm walking, standing, or lying/resting only after the chosen behaviour
   hold period and agreement threshold are met.
6. Show a live all-cow feed, herd table, individual movement charts, and a
   cautious per-cow monitoring signal.

## Important limitations

This is not a medical device and must not be used to diagnose an animal. A
short, still video can capture normal rest, not illness. The app deliberately
does not claim verified eating/grazing, lameness, disease, or head pose; those
need labelled behaviour clips and a dedicated pose/temporal model.

Perfect identity tracking is impossible if animals are fully hidden or look
indistinguishable during a long occlusion. In ambiguous cases this app creates
a new display identity rather than silently declaring that two cows are the
same.

## Next stages

- Evaluate the detector, tracker, and behaviour thresholds on representative
  footage from the target farm.
- Replace the conservative video heuristics with a labelled temporal behaviour
  classifier.
- Add pose/head detection for grazing and rumination candidates.
- Store per-animal baselines and trend anomalies across days.
- Review Ultralytics licensing before commercial deployment.
