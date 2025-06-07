// src/notifications/notifications.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { WsJwtGuard } from '../auth/guards/ws-jwt.guard';
import { Logger, UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service';

@WebSocketGateway({
  namespace: '/notification',
  cors: { origin: '*' },
})
@UseGuards(WsJwtGuard)
export class NotificationGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private logger = new Logger(NotificationGateway.name);

  constructor(
    private jwtService: JwtService,
    private notificationsService: NotificationService,
  ) {}

  afterInit(server: Server) {
    this.logger.log('NotificationGateway initialized');
    // Let NotificationsService know about this server instance
    this.notificationsService.registerServer(server);
  }

  handleConnection(client: Socket) {
    // At this point WsJwtGuard has verified token and attached payload to client.user
    // const user = (client as any).user as { sub: string; role: string };
    // console.log(user);
    // this.logger.log(
    //   `Client connected: ${client.id}, userId=${user.sub}, role=${user.role}`,
    // );
    // // Join rooms so we can emit by role or by userId
    // client.join(user.role);
    // client.join(user.sub);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  /**
   * Example of handling a client-sent acknowledgment.
   * Client could emit { event: 'order:new', id: '<orderId>' } when they receive it.
   */
  @SubscribeMessage('acknowledge')
  handleAcknowledge(
    @MessageBody() payload: { event: string; id: string },
    @ConnectedSocket() client: Socket,
  ) {
    this.logger.log(
      `Ack from ${client.id}: ${payload.event} for ${payload.id}`,
    );
    // You could update an in-memory map or database to track delivery
    return { status: 'received', ...payload };
  }
}
