#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <Servo.h>  // Include Servo library

// Wi-Fi credentials
const char* ssid = "710";
const char* password = "45352515";

// MQTT Broker details
const char* mqttServer = "abhii.local";  // Replace with your broker's IP or hostname
const int mqttPort = 1883;

// Declare mqttUser and mqttPassword if you need authentication
const char* mqttUser = "";  // Set to your MQTT username if required
const char* mqttPassword = "";  // Set to your MQTT password if required

WiFiClient espClient;
PubSubClient client(espClient);

// Servo objects
Servo servo1;
Servo servo2;

// Function Prototypes
void setup_wifi();
void mqttCallback(char* topic, byte* payload, unsigned int length);
void moveServos(int position);

void setup() {
  // Start Serial communication
  Serial.begin(115200);
  
  // Connect to Wi-Fi
  setup_wifi();
  
  // Set up MQTT server and callback
  client.setServer(mqttServer, mqttPort);
  client.setCallback(mqttCallback);

  // Attach servos to GPIO pins
  servo1.attach(D1);  // Change to the GPIO pin where servo1 is connected
  servo2.attach(D2);  // Change to the GPIO pin where servo2 is connected

  // Connect to MQTT broker and subscribe to the exact /servo topic
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    if (client.connect("ESP8266Client", mqttUser, mqttPassword)) {
      Serial.println("connected");
      // Subscribe to the exact /servo topic
      client.subscribe("/servo");
    } else {
      Serial.print("Failed, rc=");
      Serial.print(client.state());
      delay(2000);
    }
  }
}

void loop() {
  // Keep the MQTT client connected and handle incoming messages
  client.loop();
}

void setup_wifi() {
  delay(10);
  // Connect to Wi-Fi
  Serial.println();
  Serial.print("Connecting to WiFi...");
  WiFi.begin(ssid, password);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.println("Connected to WiFi");
}

void mqttCallback(char* topic, byte* payload, unsigned int length) {
  // Print the topic that was received
  Serial.print("Message arrived [");
  Serial.print(topic);
  Serial.print("] ");
  
  // Convert the payload into a string
  String message = "";
  for (unsigned int i = 0; i < length; i++) {
    message += (char)payload[i];
  }
  
  // Log the received message
  Serial.println("Received message: " + message);
  
  // Check the message content and move servos accordingly
  if (message == "0") {
    Serial.println("Received 0, moving servo1 to 0° and servo2 to 0°");
    moveServos(0);
  } else if (message == "1") {
    Serial.println("Received 1, moving servo1 to 90° and servo2 to 0°");
    moveServos(1);
  } else if (message == "2") {
    Serial.println("Received 2, moving servo1 to 0° and servo2 to 90°");
    moveServos(2);
  } else {
    Serial.println("Received unknown message, no action taken");
  }
}

// Function to control the servos based on the position
void moveServos(int position) {
  if (position == 0) {
    servo1.write(0);
    servo2.write(0);
  } else if (position == 1) {
    servo1.write(90);
    servo2.write(0);
  } else if (position == 2) {
    servo1.write(0);
    servo2.write(90);
  }
}
