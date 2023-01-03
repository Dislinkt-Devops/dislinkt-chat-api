import { Logger } from '@nestjs/common';
import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ObjectIdColumn,
} from 'typeorm';

@Entity({
  orderBy: {
    timestamp: 'ASC',
    id: 'ASC',
  },
})
export class MessageEntity {
  private readonly logger = new Logger(MessageEntity.name);

  @ObjectIdColumn()
  id: number;

  @Column({ nullable: false })
  content: string;

  @Column({ nullable: false, type: 'uuid' })
  @Index()
  sender: string;

  @Column({ nullable: false, type: 'uuid' })
  @Index()
  receiver: string;

  @Column({ default: true })
  unread: boolean;

  @CreateDateColumn()
  timestamp: Date;

  @BeforeInsert()
  logMessage() {
    this.logger.log(
      `User id ${this.sender} sent message id ${this.id} to user id ${this.receiver} with content: ${this.content}`,
    );
  }
}
