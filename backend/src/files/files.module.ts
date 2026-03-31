import { Module } from '@nestjs/common';
import { ChatModule } from '../chat/chat.module';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';

@Module({
  imports: [ChatModule],
  controllers: [FilesController],
  providers: [FilesService],
  exports: [FilesService],
})
export class FilesModule {}
