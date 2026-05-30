import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import type { AuthenticatedRequest } from '../auth/auth.constants';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MotionEventsService } from './motion-events.service';

@Controller('api/events')
@UseGuards(JwtAuthGuard)
export class EventsController {
  constructor(private readonly motionEventsService: MotionEventsService) {}

  @Get('motion')
  findMotionEvents(
    @Req() req: AuthenticatedRequest,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.motionEventsService.findPaginatedForUser(
      req.user.sub,
      page ? Number(page) : 1,
      limit ? Number(limit) : 20,
    );
  }
}
