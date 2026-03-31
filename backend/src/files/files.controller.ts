import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { AskQuestionDto } from './dto/askQuestion.dto';
import { CreateFileDto } from './dto/createFile.dto';
import { FilesService } from './files.service';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post()
  async createFile(@Body() body: CreateFileDto) {
    console.log('CREATE FILE BODY:', JSON.stringify(body));
    return this.filesService.createFile(body.email, body.filename, body.s3Key);
  }

  @Get(':fileId/status')
  async getStatus(@Param('fileId') fileId: string) {
    return this.filesService.getFileStatus(fileId);
  }
  @Post('ask')
  async askQuestion(@Body() body: AskQuestionDto) {
    return this.filesService.askQuestionAboutFile(body.email, body.question);
  }

  @Delete(':email')
  async deleteFile(@Param('email') email: string) {
    return this.filesService.deleteFile(email);
  }
}

