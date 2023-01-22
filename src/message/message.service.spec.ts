import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { In, LessThanOrEqual, Repository } from 'typeorm';
import { MessageEntity } from './message.entity';
import { MessageService } from './message.service';

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
            save: jest.fn().mockResolvedValue({}),
            update: jest.fn().mockResolvedValue({ affected: 1 }),
            findBy: jest.fn().mockResolvedValue([]),
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

  describe('sendMessage', () => {
    it('should call repository.save with the correct arguments', async () => {
      const receiver = 'receiver';
      const sender = 'sender';
      const content = 'content';
      await service.saveMessage(receiver, sender, content);
      expect(repo.save).toHaveBeenCalledWith({
        receiver,
        sender,
        content,
      });
    });

    it('should return the result of repository.save', async () => {
      const result = { id: 1 };
      (repo.save as jest.Mock).mockResolvedValue(result);
      const sendResult = await service.saveMessage(
        'receiver',
        'sender',
        'content',
      );
      expect(sendResult).toEqual(result);
    });
  });

  describe('markAsRead', () => {
    it('should call repository.update with the correct arguments if id is provided', async () => {
      const receiver = 'receiver';
      const id = [1, 2];
      const timestamp = new Date();
      await service.markAsRead(receiver, id, timestamp);
      expect(repo.update).toHaveBeenCalledWith(
        { id: In(id), receiver, unread: true },
        { unread: false },
      );
    });

    it('should call repository.update with the correct arguments if id is not provided', async () => {
      const receiver = 'receiver';
      const timestamp = new Date();
      await service.markAsRead(receiver, undefined, timestamp);
      expect(repo.update).toHaveBeenCalledWith(
        { timestamp: LessThanOrEqual(timestamp), receiver, unread: true },
        { unread: false },
      );
    });

    it('should return the result of repository.update', async () => {
      const result = { affected: 1 };
      (repo.update as jest.Mock).mockResolvedValue(result);
      const markResult = await service.markAsRead(
        'receiver',
        [1, 2],
        new Date(),
      );
      expect(markResult).toEqual(result);
    });
  });

  describe('getMessages', () => {
    it('should call repository.findBy with the correct arguments', async () => {
      const receiver = 'receiver';
      const sender = 'sender';
      await service.getMessages(receiver, sender);
      expect(repo.findBy).toHaveBeenCalledWith({
        sender,
        receiver,
      });
    });

    it('should return the result of repository.findBy', async () => {
      const result = [{ id: 1 }, { id: 2 }];
      (repo.findBy as jest.Mock).mockResolvedValue(result);
      const getResult = await service.getMessages('receiver', 'sender');
      expect(getResult).toEqual(result);
    });
  });
});
