import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import mqtt, { MqttClient } from 'mqtt';
import { MotionEventsService } from '../events/motion-events.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';

@Injectable()
export class MqttService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MqttService.name);
  private client: MqttClient | null = null;

  constructor(
    private readonly configService: ConfigService,
    private readonly motionEventsService: MotionEventsService,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  onModuleInit() {
    const brokerUrl = this.configService.getOrThrow<string>('MQTT_BROKER_URL');
    const username = this.configService.get<string>('MQTT_USERNAME');
    const password = this.configService.get<string>('MQTT_PASSWORD');
    const motionTopic = this.configService.get<string>(
      'MQTT_TOPIC_MOTION',
      'motion_detection',
    );

    this.client = mqtt.connect(brokerUrl, {
      username: username || undefined,
      password: password || undefined,
      reconnectPeriod: 5000,
    });

    this.client.on('connect', () => {
      this.logger.log(`Connected to MQTT broker at ${brokerUrl}`);
      this.client?.subscribe(motionTopic, (err) => {
        if (err) {
          this.logger.error(`Failed to subscribe to ${motionTopic}`, err);
        } else {
          this.logger.log(`Subscribed to topic: ${motionTopic}`);
        }
      });
    });

    this.client.on('message', async (topic, message) => {
      if (topic !== motionTopic) {
        return;
      }

      const payload = message.toString();
      this.logger.log(`Motion detected: ${payload}`);

      try {
        const event = await this.motionEventsService.create(payload);
        this.notificationsGateway.broadcastMotionEvent(event);
      } catch (error) {
        this.logger.error('Failed to process motion event', error);
      }
    });

    this.client.on('error', (error) => {
      this.logger.error('MQTT connection error', error);
    });

    this.client.on('reconnect', () => {
      this.logger.warn('Reconnecting to MQTT broker...');
    });
  }

  onModuleDestroy() {
    this.client?.end(true);
  }
}
