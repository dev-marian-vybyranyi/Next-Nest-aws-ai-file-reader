import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async findUser(email: string) {
    return this.usersRepository.findByEmail(email);
  }

  async getOrCreateUser(email: string) {
    const existing = await this.findUser(email);
    if (existing) return existing;

    const user = {
      email,
      createdAt: new Date().toISOString(),
    };

    return this.usersRepository.createUser(user);
  }
}

