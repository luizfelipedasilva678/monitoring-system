import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import {
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { MotionEvent } from '@prisma/client';
import { Server, Socket } from 'socket.io';
import { ACCESS_TOKEN_COOKIE } from '../auth/auth.constants';
import { AuthService } from '../auth/auth.service';
import { getCameraCorsOrigin } from '../common/camera-cors';

@Injectable()
@WebSocketGateway({
  namespace: '/notifications',
  cors: {
    origin: getCameraCorsOrigin(),
    credentials: true,
  },
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(NotificationsGateway.name);

  @WebSocketServer()
  server!: Server;

  constructor(private readonly authService: AuthService) {}

  handleConnection(@ConnectedSocket() client: Socket) {
    try {
      const token = this.extractToken(client);

      if (!token) {
        throw new UnauthorizedException('Missing token');
      }

      const payload = this.authService.verifyToken(token);
      client.data.user = payload;
      this.logger.log(`Camera client connected: ${payload.email}`);
    } catch {
      this.logger.warn('Unauthorized WebSocket connection attempt');
      client.disconnect(true);
    }
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    const email = client.data?.user?.email as string | undefined;
    if (email) {
      this.logger.log(`Camera client disconnected: ${email}`);
    }
  }

  broadcastMotionEvent(event: MotionEvent) {
    this.server.emit('motion_detection', {
      id: event.id,
      payload: event.payload,
      createdAt: event.createdAt.toISOString(),
    });
  }

  private extractToken(client: Socket): string | null {
    const authToken = client.handshake.auth?.token as string | undefined;
    if (authToken) {
      return authToken;
    }

    const cookieHeader = client.handshake.headers.cookie;
    if (!cookieHeader) {
      return null;
    }

    const cookies = cookieHeader.split(';').map((part) => part.trim());
    for (const cookie of cookies) {
      const [name, ...rest] = cookie.split('=');
      if (name === ACCESS_TOKEN_COOKIE) {
        return decodeURIComponent(rest.join('='));
      }
    }

    return null;
  }
}
