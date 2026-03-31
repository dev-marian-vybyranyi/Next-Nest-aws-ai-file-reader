import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { DynamoDBService } from '../shared/dynamodb.service';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let mockDbSend: jest.Mock;

  beforeEach(async () => {
    mockDbSend = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: DynamoDBService,
          useValue: { client: { send: mockDbSend } },
        },
        {
          provide: ConfigService,
          useValue: { get: () => 'users-table' },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  describe('findUser', () => {
    it('should return user when found', async () => {
      const user = { email: 'test@test.com', createdAt: '2024-01-01' };
      mockDbSend.mockResolvedValue({ Item: user });

      const result = await service.findUser('test@test.com');

      expect(result).toEqual(user);
    });

    it('should return null when user not found', async () => {
      mockDbSend.mockResolvedValue({ Item: undefined });

      const result = await service.findUser('notfound@test.com');

      expect(result).toBeNull();
    });
  });

  describe('upsertUser', () => {
    it('should return existing user without creating a new one', async () => {
      const existing = { email: 'existing@test.com', createdAt: '2024-01-01' };
      mockDbSend.mockResolvedValue({ Item: existing });

      const result = await service.upsertUser('existing@test.com');

      expect(result).toEqual(existing);
      expect(mockDbSend).toHaveBeenCalledTimes(1);
    });

    it('should create and return new user when not found', async () => {
      mockDbSend
        .mockResolvedValueOnce({ Item: undefined })
        .mockResolvedValueOnce({});

      const result = await service.upsertUser('new@test.com');

      expect(result).toMatchObject({ email: 'new@test.com' });
      expect(result).toHaveProperty('createdAt');
      expect(mockDbSend).toHaveBeenCalledTimes(2);
    });
  });
});
