import { Module, forwardRef } from '@nestjs/common';
import { EventsModule } from '../events/events.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { MqttService } from './mqtt.service';

@Module({
  imports: [EventsModule, forwardRef(() => NotificationsModule)],
  providers: [MqttService],
})
export class MqttModule { }
