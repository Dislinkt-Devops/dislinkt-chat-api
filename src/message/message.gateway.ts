import { HttpService } from '@nestjs/axios/dist';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
} from '@nestjs/websockets';
import { lastValueFrom } from 'rxjs';
import { Server, Socket } from 'socket.io';
import { GetMessageDto } from './dtos/get-message.dto';
import { SendMessageDto } from './dtos/send-message.dto';
import { MessageService } from './message.service';

@WebSocketGateway({
  cors: { origin: '*' },
})
export class MessageGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;
  private readonly logger = new Logger(MessageGateway.name);
  private postsApi: string;

  constructor(
    private httpService: HttpService,
    configService: ConfigService,
    private messageService: MessageService,
  ) {
    this.postsApi = configService.get('POSTS_API', 'localhost:8080');
  }

  handleDisconnect(client: Socket) {
    const userId = client.handshake.headers['x-user-id'];

    this.logger.log('User id ' + userId + ' disconnected!');
  }

  async handleConnection(client: Socket) {
    const userId = client.handshake.headers['x-user-id'] as string;

    if (!userId) {
      this.logger.log('User Id missing in headers!');
      client.disconnect(true);
      return;
    }

    this.logger.log('User id ' + userId + ' successfully connected!');

    client.join(userId);
  }

  @SubscribeMessage('getMessages')
  async getMessages(
    @MessageBody() body: GetMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    const currentUser = client.handshake.headers['x-user-id'] as string;

    const messages = await this.messageService.getMessages(
      body.userId,
      currentUser,
    );

    messages.forEach((message) => {
      client.send(message);
    });
  }

  @SubscribeMessage('message')
  async handleMessage(
    @MessageBody() message: SendMessageDto,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const sender = client.handshake.headers['x-user-id'] as string;
    const { receiver } = message;

    const { data: isCommunicationAllowed } = (
      await lastValueFrom(
        this.httpService.get(`http://${this.postsApi}/people/${receiver}`, {
          headers: {
            'x-user-id': sender,
          },
        }),
      )
    ).data;

    if (!isCommunicationAllowed) {
      const errorMessage = `Communication between user ${sender} and ${receiver} not allowed.`;
      client.emit('exception', {
        errorMessage,
      });
      this.logger.log(errorMessage);
      return;
    }

    this.messageService.saveMessage(receiver, sender, message.content);

    this.server
      .to([receiver, sender])
      .emit('message', { ...message, sender, timestamp: new Date() });
  }
}
