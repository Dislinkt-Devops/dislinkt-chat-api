import { Test } from '@nestjs/testing';
import { MessageGateway } from './message.gateway';
import { MessageService } from './message.service';
import { Logger } from '@nestjs/common';
import { MessageEntity } from './message.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';

const message = {
  id: 1,
  content: 'Hello',
  sender: 'user1',
  receiver: 'user2',
  unread: true,
  timestamp: new Date('2022-09-18'),
} as MessageEntity;

class MockRepository<T> extends Repository<T> {
  findOne = jest.fn();
  save = jest.fn();
  create = jest.fn();
}

describe('MessageGateway', () => {
  let gateway: MessageGateway;
  let messageService: MessageService;
  // let logger: Logger;
  let mockServer: any;
  let client: any;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        MessageGateway,
        MessageService,
        MessageEntity,
        {
          provide: getRepositoryToken(MessageEntity),
          useClass: MockRepository<MessageEntity>,
        },
        Logger,
      ],
    }).compile();

    gateway = module.get<MessageGateway>(MessageGateway);
    messageService = module.get<MessageService>(MessageService);
    // logger = module.get<Logger>(Logger);
    mockServer = {
      to: jest.fn(),
    };
    client = {
      handshake: {
        headers: { 'x-user-id': 'user1' },
        query: { userId: 'user2' },
      },
      rooms: ['user1/user2'],
      join: jest.fn(),
      send: jest.fn(),
      disconnect: jest.fn(),
    };
    gateway.server = mockServer;
    // jest.spyOn(logger, 'log').mockImplementation(() => {});
    jest
      .spyOn(messageService, 'getMessages')
      .mockImplementation(() => Promise.resolve([message]));
    jest
      .spyOn(messageService, 'sendMessage')
      .mockImplementation(() => Promise.resolve(message));
  });

  it('should successfully handle a connection', async () => {
    await gateway.handleConnection(client);
    expect(client.join).toHaveBeenCalledWith('user1/user2');
    // expect(logger.log).toHaveBeenCalledWith(
    //   'User id user1 successfully connected!',
    // );
  });

  it('should handle a connection with missing headers', async () => {
    client.handshake.headers = {};
    await gateway.handleConnection(client);
    // expect(logger.log).toHaveBeenCalledWith('User Id missing in headers!');
    expect(client.disconnect).toHaveBeenCalledWith(true);
  });

  it('should handle a connection with missing query params', async () => {
    client.handshake.query = {};
    await gateway.handleConnection(client);
    // expect(logger.log).toHaveBeenCalledWith('userId missing in query params!');
    expect(client.disconnect).toHaveBeenCalledWith(true);
  });

  it('should handle a disconnection', () => {
    gateway.handleDisconnect(client);
    // expect(logger.log).toHaveBeenCalledWith('User id user1 disconnected!');
  });

  // it('should handle a message event', async () => {
  //   const message = { content: 'Hello' };
  //   await gateway.handleMessage('Hello', client);

  //   if (client.rooms) {
  //     expect(mockServer.to).toHaveBeenCalledWith(Array.from(client.rooms));
  //   } else {
  //     expect(client.emit).toHaveBeenCalledWith('message', message);
  //   }
  // });
});
