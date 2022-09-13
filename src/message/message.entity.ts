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
export class Message {
  private readonly logger = new Logger(Message.name);

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  content: string;

  @Column({ nullable: false })
  sender: number;

  @Column({ nullable: false })
  receiver: number;

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
