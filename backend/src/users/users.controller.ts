import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { GetOrCreateUserDto } from './dto/getOrCreateUser.dto';
import { FilesService } from '../files/files.service';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly filesService: FilesService,
  ) {}

  @Get(':email')
  async findUser(@Param('email') email: string) {
    return this.usersService.findUser(email);
  }

  @Get(':email/files')
  async getFileByEmail(@Param('email') email: string) {
    return this.filesService.getFileByEmail(email);
  }

  @Post()
  async getOrCreateUser(@Body() body: GetOrCreateUserDto) {
    return this.usersService.getOrCreateUser(body.email);
  }
}
