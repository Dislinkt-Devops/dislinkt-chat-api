import { Logger } from '@nestjs/common';
import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({
  orderBy: {
    timestamp: 'ASC',
    id: 'ASC',
  },
})
export class MessageEntity {
  private readonly logger = new Logger(MessageEntity.name);

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  content: string;

  @Column({ nullable: false, type: 'uuid' })
  sender: string;

  @Column({ nullable: false, type: 'uuid' })
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
