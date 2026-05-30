import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ImagesService } from './images.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthenticatedRequest } from '../auth/auth.constants';
import { CreateImageDto } from './dto/create-image.dto';

@Controller('api/images')
@UseGuards(JwtAuthGuard)
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Get()
  findAll(@Req() req: AuthenticatedRequest) {
    return this.imagesService.findAllByUser(req.user.sub);
  }

  @Post()
  create(@Req() req: AuthenticatedRequest, @Body() dto: CreateImageDto) {
    return this.imagesService.create(req.user.sub, dto);
  }

  @Get(':id')
  findOne(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.imagesService.findOne(req.user.sub, id);
  }

  @Delete(':id')
  remove(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.imagesService.remove(req.user.sub, id);
  }
}
