import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { GetOrCreateUserDto } from './dto/getOrCreateUser.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':email')
  async findUser(@Param('email') email: string) {
    return this.usersService.findUser(email);
  }

  @Post()
  async getOrCreateUser(@Body() body: GetOrCreateUserDto) {
    return this.usersService.getOrCreateUser(body.email);
  }
}
