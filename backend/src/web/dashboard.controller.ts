import {
  Controller,
  Get,
  Render,
  Req,
  Res,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import type { Response } from 'express';
import type { AuthenticatedRequest } from '../auth/auth.constants';
import { AuthService } from '../auth/auth.service';
import { PageAuthGuard } from '../auth/page-auth.guard';
import { MotionEventsService } from '../events/motion-events.service';
import { NoCacheInterceptor } from './no-cache.interceptor';
import { UnauthorizedRedirectFilter } from './unauthorized-redirect.filter';

@Controller()
@UseFilters(UnauthorizedRedirectFilter)
@UseInterceptors(NoCacheInterceptor)
export class DashboardController {
  constructor(
    private readonly authService: AuthService,
    private readonly motionEventsService: MotionEventsService,
  ) {}

  @Get('dashboard')
  @UseGuards(PageAuthGuard)
  @Render('dashboard')
  async dashboard(@Req() req: AuthenticatedRequest) {
    const user = await this.authService.getProfile(req.user.sub);
    const events = await this.motionEventsService.findRecentForUser(
      req.user.sub,
      20,
    );

    return {
      title: 'Detecções',
      user,
      events: events.map((event) => ({
        ...event,
        createdAt: event.createdAt.toISOString(),
      })),
    };
  }
}
