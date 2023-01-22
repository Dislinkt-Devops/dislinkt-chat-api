import { IsString, IsUUID } from 'class-validator';

export class SendMessageDto {
  @IsUUID()
  receiver: string;

  @IsString()
  content: string;
}
