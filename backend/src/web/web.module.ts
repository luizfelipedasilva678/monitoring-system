import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { EventsModule } from '../events/events.module';
import { ImagesModule } from '../images/images.module';
import { AuthPagesController } from './auth-pages.controller';
import { DashboardController } from './dashboard.controller';
import { ImagesPagesController } from './images-pages.controller';

@Module({
  imports: [AuthModule, EventsModule, ImagesModule],
  controllers: [
    AuthPagesController,
    DashboardController,
    ImagesPagesController,
  ],
})
export class WebModule {}
