import { IsNumber, IsString } from 'class-validator';

export class SendMessageDto {
  @IsNumber()
  sender: number;

  @IsNumber()
  receiver: number;

  @IsString()
  content: string;
}
