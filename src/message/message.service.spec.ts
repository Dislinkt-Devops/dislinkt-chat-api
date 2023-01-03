import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MessageEntity } from './message.entity';
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

describe('MessageService', () => {
  let service: MessageService;
  let repo: Repository<MessageEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessageService,
        {
          provide: getRepositoryToken(MessageEntity),
          useValue: {
            find: jest.fn().mockResolvedValue(messagesArray),
            findOneOrFail: jest.fn().mockResolvedValue(messagesArray[0]),
            create: jest.fn().mockReturnValue(messagesArray[1]),
            save: jest.fn(),
            update: jest.fn().mockResolvedValue(true),
            delete: jest.fn().mockResolvedValue(true),
          },
        },
      ],
    }).compile();

    service = module.get<MessageService>(MessageService);
    repo = module.get<Repository<MessageEntity>>(
      getRepositoryToken(MessageEntity),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(repo).toBeDefined();
  });
});
