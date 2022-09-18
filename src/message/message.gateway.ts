import { Logger } from '@nestjs/common';
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessageService } from './message.service';

@WebSocketGateway({ namespace: 'chat' })
export class MessageGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;
  private readonly logger = new Logger(MessageGateway.name);

  handleDisconnect(client: Socket) {
    const userId = client.handshake.headers['user-id'];

    this.logger.log('User id ' + userId + ' disconnected!');
  }

  constructor(private readonly messageService: MessageService) {}

  async handleConnection(client: Socket) {
    const roomNameArray: string[] = new Array(2);
    const userId = client.handshake.headers['user-id'] as string;

    if (!userId) {
      this.logger.log('User Id missing in headers!');
      client.disconnect(true);
      return;
    }

    roomNameArray.push(userId);

    const secondUserId = client.handshake.query.userId as string;
    if (!secondUserId) {
      this.logger.log('userId missing in query params!');
      client.disconnect(true);
      return;
    }
    roomNameArray.push(secondUserId);
    roomNameArray.sort();

    this.logger.log('User id ' + userId + ' successfully connected!');

    const roomNameString = roomNameArray[0] + '/' + roomNameArray[1];
    this.logger.log(
      'User id ' + userId + ' joining room with user id ' + secondUserId + '!',
    );
    this.logger.log('Room name: ' + roomNameString);
    client.send(
      await this.messageService.getMessages(
        Number(userId),
        Number(secondUserId),
      ),
    );
    client.join(roomNameString);
  }

  @SubscribeMessage('message')
  async handleMessage(
    @MessageBody() messageContent: string,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const userId = client.handshake.headers['user-id'] as string;
    const secondUserId = client.handshake.query.userId as string;

    const message = await this.messageService.sendMessage(
      Number(secondUserId),
      Number(userId),
      messageContent,
    );

    this.server.to(Array.from(client.rooms)).emit('message', message);
  }
}
