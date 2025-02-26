from flask import Flask, request, jsonify
from ultralytics import YOLO
import cv2
import numpy as np
import os
import requests

app = Flask(__name__)

# Load YOLO model
model = YOLO("./model/best_v2.pt")

# Define class names
CLASS_NAMES = ['Bottle', 'Can', 'Carton', 'E-Waste', 'Electric Cable', 'Glass', 'Glass Bottle', 'Metal', 'Organic Waste', 'Phone Case', 'Plastic bag', 'Plastics', 'Spoon', 'Styrofoam', 'Trash', 'Trash- Brush', 'Wooden Waste', 'Yoga Mat', 'paper']

# Define biodegradable vs non-biodegradable
BIODEGRADABLE_CLASSES = {8, 16, 18}  # Indices of biodegradable items (Organic Waste, Wooden Waste, paper)

def process_image(image):
    """Run inference on an image and return detection results."""
    results = model(image)
    detections = []
    for result in results:
        for box in result.boxes:
            class_id = int(box.cls[0])
            class_name = CLASS_NAMES[class_id] if class_id < len(CLASS_NAMES) else "unknown"
            bio_status = "Biodegradable" if class_id in BIODEGRADABLE_CLASSES else "Non-Biodegradable"
            detections.append({
                "class": class_name,
                "bio_status": bio_status,
                "confidence": float(box.conf[0]),
                "x1": float(box.xyxy[0][0]),
                "y1": float(box.xyxy[0][1]),
                "x2": float(box.xyxy[0][2]),
                "y2": float(box.xyxy[0][3])
            })
    return detections

@app.route('/predict', methods=['POST'])
def predict():
    if 'image' not in request.files:
        return jsonify({"error": "No image provided"}), 400
    
    file = request.files['image']
    
    # Read image from request
    image = np.frombuffer(file.read(), np.uint8)
    image = cv2.imdecode(image, cv2.IMREAD_COLOR)
    
    detections = process_image(image)
    return jsonify({"detections": detections})

@app.route('/get_prediction', methods=['GET'])
def get_prediction():
    image_url = "http://10.21.8.195:8080/photo.jpg"
    response = requests.get(image_url)
    
    if response.status_code != 200:
        return jsonify({"error": "Failed to fetch image from the URL"}), 400
    
    image = np.frombuffer(response.content, np.uint8)
    image = cv2.imdecode(image, cv2.IMREAD_COLOR)
    
    detections = process_image(image)
    return jsonify({"detections": detections})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
