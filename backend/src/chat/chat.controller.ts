import { Body, Controller, Post } from '@nestjs/common';
import { ChatService } from './chat.service';
import { AskQuestionDto } from './dto/askQuestion.dto';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('ask')
  async askQuestion(@Body() body: AskQuestionDto) {
    return this.chatService.askQuestion(body.email, body.question);
  }
}
