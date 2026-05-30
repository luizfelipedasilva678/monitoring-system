import { Module } from '@nestjs/common';
import { MotionEventsService } from './motion-events.service';
import { EventsController } from './events.controller';

@Module({
  controllers: [EventsController],
  providers: [MotionEventsService],
  exports: [MotionEventsService],
})
export class EventsModule {}
