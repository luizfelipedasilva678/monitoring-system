#include <Arduino.h>
#include <WiFi.h>
#include <PubSubClient.h>

#define LED_BUILTIN 2
#define TRIG_PIN 13
#define ECHO_PIN 12
#define PIR_PIN 14

const char* ssid = "ssid";
const char* password = "password";
const char* mqtt_server = "local_ip";
const char* topic = "motion_detection";

WiFiClient espClient;
PubSubClient client(espClient);

void setup() {
    Serial.begin(115200);

    pinMode(LED_BUILTIN, OUTPUT);
    pinMode(TRIG_PIN, OUTPUT);
    pinMode(ECHO_PIN, INPUT);
    pinMode(PIR_PIN, INPUT);

    WiFi.begin(ssid, password);

    while (WiFi.status() != WL_CONNECTED) {
        digitalWrite(LED_BUILTIN, HIGH);
        delay(300);
        digitalWrite(LED_BUILTIN, LOW);
        delay(300);
    }

    digitalWrite(LED_BUILTIN, HIGH);

    client.setServer(mqtt_server, 1883);
}

void connect_to_broker() {
    while (!client.connected()) {
        String clientId = "ESP32-PIR-";
        clientId += String(random(0xffff), HEX);

        if (client.connect(clientId.c_str(), "admin", "123456")) {
            Serial.println("Connected!!");
        } else {
            Serial.print(client.state());
            delay(2000);
        }
    }
}

float get_distance() {
    digitalWrite(TRIG_PIN, LOW);
    delayMicroseconds(2);

    digitalWrite(TRIG_PIN, HIGH);
    delayMicroseconds(10);
    digitalWrite(TRIG_PIN, LOW);

    long duration = pulseIn(ECHO_PIN, HIGH);

    float distance = duration * 0.0343 / 2;

    return distance;
}

void loop() {
    if (!client.connected()) {
        connect_to_broker();
    }

    client.loop();

    float distance = get_distance();

    Serial.print("Distância: ");
    Serial.print(distance);
    Serial.println(" cm");

    if (digitalRead(PIR_PIN) == HIGH && distance > 0 && distance < 20) {
        Serial.println("Objeto próximo!");

        digitalWrite(LED_BUILTIN, HIGH);
        client.publish(topic, "detection");
    } else {
        digitalWrite(LED_BUILTIN, LOW);
    }

    delay(300);
}