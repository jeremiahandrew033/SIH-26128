#!/usr/bin/env python
"""Test if ultralytics tracking works with the fixed default.yaml"""

from ultralytics import YOLO
import cv2
import sys

# Load model
model = YOLO('yolo11s.pt')
print("✓ Model loaded")

# Load test image
img = cv2.imread('bus.jpg')
if img is None:
    print("✗ Test image not found")
    sys.exit(1)

print(f"✓ Test image loaded: {img.shape}")

# Test tracking (this will trigger the fuse_score error if not fixed)
try:
    result = model.track(img, classes=[19], verbose=False)
    print("✓ Tracking works! No fuse_score error")
    if result and result[0].boxes:
        print(f"  Boxes detected: {len(result[0].boxes)}")
    else:
        print("  No objects detected (this is okay for cow detection on this image)")
    sys.exit(0)
except AttributeError as e:
    if 'fuse_score' in str(e):
        print(f"✗ fuse_score error still present!")
        print(str(e))
        sys.exit(1)
    else:
        raise
except Exception as e:
    print(f"? Other error: {type(e).__name__}: {e}")
    sys.exit(1)
