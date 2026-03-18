import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { CreateFileDto } from './dto/createFile.dto';
import { FilesService } from './files.service';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Get('status/:fileId')
  async getStatus(@Param('fileId') fileId: string) {
    return this.filesService.getFileStatus(fileId);
  }

  @Get('by-email/:email')
  async getFileByEmail(@Param('email') email: string) {
    return this.filesService.getFileByEmail(email);
  }
  @Post()
  async createFile(@Body() body: CreateFileDto) {
    return this.filesService.createFile(body.email, body.filename, body.s3Key);
  }

  @Delete(':email')
  async deleteFile(@Param('email') email: string) {
    return this.filesService.deleteFile(email);
  }
}
