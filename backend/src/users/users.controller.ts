import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { UpsertUserDto } from './dto/upsertUser.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':email')
  async findUser(@Param('email') email: string) {
    return this.usersService.findUser(email);
  }

  @Post()
  async upsertUser(@Body() body: UpsertUserDto) {
    return this.usersService.upsertUser(body.email);
  }
}
