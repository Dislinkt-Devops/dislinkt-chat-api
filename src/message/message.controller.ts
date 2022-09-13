import {
  Body,
  Controller,
  Get,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { Serialize } from 'src/interceptors/serialize.interceptor';
import { MarkAsRead } from './dtos/mark-as-read.dto';
import { MessageDto } from './dtos/message.dto';
import { SendMessageDto } from './dtos/send-message.dto';
import { MessageService } from './message.service';

@Controller('message')
@Serialize(MessageDto)
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post()
  async sendMessage(@Body() body: SendMessageDto) {
    const { sender, receiver, content } = body;

    return await this.messageService.sendMessage(receiver, sender, content);
  }

  @Put('/read')
  async markAsRead(@Body() body: MarkAsRead) {
    const { receiver, id, timestamp } = body;

    return {
      messagesRead: (
        await this.messageService.markAsRead(receiver, id, timestamp)
      ).affected,
    };
  }

  @Get()
  async getMessages(
    @Query('receiver', ParseIntPipe) receiver: number,
    @Query('sender', ParseIntPipe) sender: number,
  ) {
    return await this.messageService.getMessages(receiver, sender);
  }
}
