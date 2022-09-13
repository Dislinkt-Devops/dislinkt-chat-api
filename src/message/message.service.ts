import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, LessThanOrEqual, Repository, UpdateResult } from 'typeorm';
import { Message } from './message.entity';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message) private repository: Repository<Message>,
  ) {}

  async sendMessage(
    receiver: number,
    sender: number,
    content: string,
  ): Promise<Message> {
    return this.repository.save({ receiver, sender, content });
  }

  async markAsRead(
    receiver: number,
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

  async getMessages(receiver: number, sender: number): Promise<Message[]> {
    return this.repository.findBy([
      { receiver, sender },
      { receiver: sender, sender: receiver },
    ]);
  }
}
