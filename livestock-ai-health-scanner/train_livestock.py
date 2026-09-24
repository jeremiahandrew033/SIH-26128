from ultralytics import YOLO

model = YOLO("yolo11s.pt")

results = model.train(
    data="C:/livestock_dataset/data.yaml",
    epochs=100,
    imgsz=640,
    batch=4,
    device="cpu",
    workers=4,
    project="livestock_training",
    name="yolo11_livestock",
)