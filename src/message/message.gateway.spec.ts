import { Test } from '@nestjs/testing';
import { MessageGateway } from './message.gateway';
import { MessageService } from './message.service';
import { Logger } from '@nestjs/common';
import { MessageEntity } from './message.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import { ConfigService } from '@nestjs/config';

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
          provide: HttpService,
          useValue: {
            get: jest.fn(() =>
              of({
                data: {
                  data: 'true',
                },
              }),
            ),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(() => {
              return 'dislinkt-posts:8080';
            }),
          },
        },
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
      to: jest.fn(() => {
        return {
          emit: jest.fn(),
        };
      }),
    };
    client = {
      handshake: {
        headers: { 'x-user-id': 'user1' },
      },
      rooms: ['user1'],
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
      .spyOn(messageService, 'saveMessage')
      .mockImplementation(() => Promise.resolve(message));
  });

  it('should successfully handle a connection', async () => {
    await gateway.handleConnection(client);
    expect(client.join).toHaveBeenCalledWith('user1');
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

  it('should handle a disconnection', () => {
    gateway.handleDisconnect(client);
    // expect(logger.log).toHaveBeenCalledWith('User id user1 disconnected!');
  });

  it('should handle a getMessages event', async () => {
    const body = { userId: 'user2' };
    await gateway.getMessages(body, client);

    expect(messageService.getMessages).toHaveBeenCalledWith('user2', 'user1');
    expect(client.send).toHaveBeenCalledTimes(1);
  });

  it('should handle a message event', async () => {
    const message = { content: 'Hello', receiver: 'user2' };
    await gateway.handleMessage(message, client);

    expect(messageService.saveMessage).toHaveBeenCalledWith(
      'user2',
      'user1',
      'Hello',
    );

    expect(mockServer.to).toHaveBeenCalledWith(['user2', 'user1']);
  });
});
