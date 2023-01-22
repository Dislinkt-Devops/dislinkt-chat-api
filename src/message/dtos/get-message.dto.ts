import { IsUUID } from 'class-validator';

export class GetMessageDto {
  @IsUUID()
  userId: string;
}
