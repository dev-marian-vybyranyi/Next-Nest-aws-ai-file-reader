import { Test, TestingModule } from '@nestjs/testing';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let mockRepository: Partial<Record<keyof UsersRepository, jest.Mock>>;

  beforeEach(async () => {
    mockRepository = {
      findByEmail: jest.fn(),
      createUser: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UsersRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  describe('findUser', () => {
    it('should return user when found', async () => {
      const user = { email: 'test@test.com', createdAt: '2024-01-01' };
      mockRepository.findByEmail!.mockResolvedValue(user);

      const result = await service.findUser('test@test.com');

      expect(result).toEqual(user);
    });

    it('should return null when user not found', async () => {
      mockRepository.findByEmail!.mockResolvedValue(null);

      const result = await service.findUser('notfound@test.com');

      expect(result).toBeNull();
    });
  });

  describe('getOrCreateUser', () => {
    it('should return existing user without creating a new one', async () => {
      const existing = { email: 'existing@test.com', createdAt: '2024-01-01' };
      mockRepository.findByEmail!.mockResolvedValue(existing);

      const result = await service.getOrCreateUser('existing@test.com');

      expect(result).toEqual(existing);
      expect(mockRepository.createUser).not.toHaveBeenCalled();
    });

    it('should create and return new user when not found', async () => {
      mockRepository.findByEmail!.mockResolvedValue(null);
      mockRepository.createUser!.mockImplementation((user) => Promise.resolve(user));

      const result = await service.getOrCreateUser('new@test.com');

      expect(result).toMatchObject({ email: 'new@test.com' });
      expect(result).toHaveProperty('createdAt');
      expect(mockRepository.createUser).toHaveBeenCalled();
    });
  });
});
