import { Expose } from 'class-transformer';

export class MessageDto {
  @Expose()
  id: number;

  @Expose()
  sender: number;

  @Expose()
  content: string;

  @Expose()
  receiver: number;

  @Expose()
  unread: boolean;

  @Expose()
  timestamp: Date;
}
