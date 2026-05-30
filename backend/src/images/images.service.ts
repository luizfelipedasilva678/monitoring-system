import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateImageDto } from './dto/create-image.dto';

@Injectable()
export class ImagesService {
  constructor(private readonly prisma: PrismaService) {}

  findAllByUserWithData(userId: string) {
    return this.prisma.image.findMany({
      where: { userId },
      include: {
        motionEvent: { select: { id: true, payload: true, createdAt: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  findAllByUser(userId: string) {
    return this.prisma.image.findMany({
      where: { userId },
      select: {
        id: true,
        mimeType: true,
        filename: true,
        motionEventId: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: string, id: string) {
    const image = await this.prisma.image.findUnique({ where: { id } });

    if (!image) {
      throw new NotFoundException('Image not found');
    }

    if (image.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return image;
  }

  async create(userId: string, dto: CreateImageDto) {
    if (dto.motionEventId) {
      const event = await this.prisma.motionEvent.findUnique({
        where: { id: dto.motionEventId },
      });

      if (!event) {
        throw new NotFoundException('Motion event not found');
      }
    }

    return this.prisma.image.create({
      data: {
        userId,
        data: dto.data,
        mimeType: dto.mimeType,
        filename: dto.filename,
        motionEventId: dto.motionEventId,
      },
    });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    await this.prisma.image.delete({ where: { id } });
    return { success: true };
  }
}
