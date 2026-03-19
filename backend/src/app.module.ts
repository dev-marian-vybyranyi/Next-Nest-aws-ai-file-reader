import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ChatModule } from './chat/chat.module';
import { FilesModule } from './files/files.module';
import { SharedModule } from './shared/shared.module';
import { UsersModule } from './users/users.module';
import { UploadsModule } from './uploads/uploads.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '../.env' }),
    SharedModule,
    UsersModule,
    FilesModule,
    ChatModule,
    UploadsModule,
  ],
})
export class AppModule {}
