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

    if (!(await this.isCommunicationAllowed(currentUser, body.userId))) {
      const errorMessage = `Communication between user ${currentUser} and ${body.userId} is allowed.`;
      client.emit('exception', errorMessage);
      this.logger.error(errorMessage);
      return;
    }

    const messages = await this.messageService.getMessages(
      body.userId,
      currentUser,
    );

    messages
      .sort((a, b) => (a.timestamp > b.timestamp ? 1 : -1))
      .forEach((message) => {
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

    if (!(await this.isCommunicationAllowed(sender, receiver))) {
      const errorMessage = `Communication between user ${sender} and ${receiver} is allowed.`;
      client.emit('exception', errorMessage);
      this.logger.error(errorMessage);
      return;
    }

    const { timestamp, id } = await this.messageService.saveMessage(
      receiver,
      sender,
      message.content,
    );

    this.server
      .to([receiver, sender])
      .emit('message', { ...message, sender, timestamp, id });
  }

  private async isCommunicationAllowed(id1: string, id2: string) {
    const { data: isCommunicationAllowed } = (
      await lastValueFrom(
        this.httpService.get(`http://${this.postsApi}/people/${id2}`, {
          headers: {
            'x-user-id': id1,
          },
        }),
      )
    ).data;

    return isCommunicationAllowed;
  }
}
