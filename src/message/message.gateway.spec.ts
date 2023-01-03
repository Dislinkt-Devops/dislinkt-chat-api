import { Test, TestingModule } from '@nestjs/testing';
import { UpdateResult } from 'typeorm';
import { MessageEntity } from './message.entity';
import { MessageGateway } from './message.gateway';
import { MessageService } from './message.service';

const messagesArray = [
  {
    id: 1,
    content: 'first',
    sender: 'bde85af2-44d6-4aff-90c4-52a98995fe7c',
    receiver: '49876fdd-4387-41e5-bf3e-43d907c9dfbc',
    unread: true,
    timestamp: new Date('2022-09-18'),
  },
  {
    id: 2,
    content: 'second',
    sender: '49876fdd-4387-41e5-bf3e-43d907c9dfbc',
    receiver: 'bde85af2-44d6-4aff-90c4-52a98995fe7c',
    unread: true,
    timestamp: new Date('2022-09-19'),
  },
] as MessageEntity[];

const updateResult = { raw: null, affected: 1 } as UpdateResult;

describe('MessageGateway', () => {
  let gateway: MessageGateway;
  let service: MessageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessageGateway,
        {
          provide: MessageService,
          useValue: {
            sendMessage: jest.fn().mockResolvedValue(messagesArray[0]),
            markAsRead: jest.fn().mockResolvedValue(updateResult),
            getMessages: jest.fn().mockReturnValue(messagesArray),
          },
        },
      ],
    }).compile();

    gateway = module.get<MessageGateway>(MessageGateway);
    service = module.get<MessageService>(MessageService);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
    expect(service).toBeDefined();
  });
});
