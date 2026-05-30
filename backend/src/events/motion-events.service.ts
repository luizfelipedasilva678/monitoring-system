import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MotionEventsService {
  constructor(private readonly prisma: PrismaService) {}

  create(payload: string) {
    return this.prisma.motionEvent.create({
      data: { payload },
    });
  }

  async findPaginated(page = 1, limit = 20) {
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(Math.max(1, limit), 100);
    const skip = (safePage - 1) * safeLimit;

    const [items, total] = await Promise.all([
      this.prisma.motionEvent.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: safeLimit,
      }),
      this.prisma.motionEvent.count(),
    ]);

    return {
      items,
      total,
      page: safePage,
      limit: safeLimit,
      totalPages: Math.ceil(total / safeLimit),
    };
  }

  findRecentForUser(userId: string, limit = 20) {
    return this.prisma.motionEvent.findMany({
      where: {
        images: { some: { userId } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async findPaginatedForUser(userId: string, page = 1, limit = 20) {
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(Math.max(1, limit), 100);
    const skip = (safePage - 1) * safeLimit;
    const where = { images: { some: { userId } } };

    const [items, total] = await Promise.all([
      this.prisma.motionEvent.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: safeLimit,
      }),
      this.prisma.motionEvent.count({ where }),
    ]);

    return {
      items,
      total,
      page: safePage,
      limit: safeLimit,
      totalPages: Math.ceil(total / safeLimit),
    };
  }

  findRecent(limit = 20) {
    return this.prisma.motionEvent.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
