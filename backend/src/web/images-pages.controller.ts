import {
  Controller,
  Get,
  Render,
  Req,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import type { AuthenticatedRequest } from '../auth/auth.constants';
import { AuthService } from '../auth/auth.service';
import { PageAuthGuard } from '../auth/page-auth.guard';
import { ImagesService } from '../images/images.service';
import { NoCacheInterceptor } from './no-cache.interceptor';
import { UnauthorizedRedirectFilter } from './unauthorized-redirect.filter';

@Controller()
@UseFilters(UnauthorizedRedirectFilter)
@UseInterceptors(NoCacheInterceptor)
export class ImagesPagesController {
  constructor(
    private readonly authService: AuthService,
    private readonly imagesService: ImagesService,
  ) {}

  @Get('images')
  @UseGuards(PageAuthGuard)
  @Render('images')
  async imagesPage(@Req() req: AuthenticatedRequest) {
    const user = await this.authService.getProfile(req.user.sub);
    const images = await this.imagesService.findAllByUserWithData(req.user.sub);

    return {
      title: 'Imagens capturadas',
      user,
      images: images.map((image) => ({
        id: image.id,
        data: image.data,
        mimeType: image.mimeType,
        filename: image.filename,
        createdAt: image.createdAt.toISOString(),
        motionEvent: image.motionEvent
          ? {
              id: image.motionEvent.id,
              payload: image.motionEvent.payload,
              createdAt: image.motionEvent.createdAt.toISOString(),
            }
          : null,
      })),
    };
  }
}
