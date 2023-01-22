import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, LessThanOrEqual, Repository, UpdateResult } from 'typeorm';
import { MessageEntity } from './message.entity';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(MessageEntity)
    private readonly repository: Repository<MessageEntity>,
  ) {}

  async saveMessage(
    receiver: string,
    sender: string,
    content: string,
  ): Promise<MessageEntity> {
    return this.repository.save({ receiver, sender, content });
  }

  //TODO: Add proper logic to trigger markAsRead and refactor this function
  async markAsRead(
    receiver: string,
    id: number[],
    timestamp: Date,
  ): Promise<UpdateResult> {
    return this.repository.update(
      id
        ? { id: In(id), receiver, unread: true }
        : { timestamp: LessThanOrEqual(timestamp), receiver, unread: true },
      { unread: false },
    );
  }

  async getMessages(
    receiver: string,
    sender: string,
  ): Promise<MessageEntity[]> {
    //TODO: Return received messages as well
    return this.repository.findBy({
      sender,
      receiver,
    });
  }
}
