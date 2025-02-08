from ultralytics import YOLO

# Load a COCO-pretrained YOLO11n model
model = YOLO("./model/best.pt")

# Run inference with the YOLO11n model on the 'bus.jpg' image
results = model("./test_images/ornage-peels.jpg")
