import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { ChatService } from './chat.service';

const mockChatCreate = jest.fn();
jest.mock('openai', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    chat: { completions: { create: mockChatCreate } },
  })),
}));

describe('ChatService', () => {
  let service: ChatService;

  beforeEach(async () => {
    mockChatCreate.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) =>
              ({
                OPENAI_API_KEY: 'test-openai-key',
              })[key],
          },
        },
      ],
    }).compile();

    service = module.get<ChatService>(ChatService);
  });

  describe('generateAnswer', () => {
    it('should return generated answer', async () => {
      mockChatCreate.mockResolvedValue({
        choices: [{ message: { content: 'This is the answer.' } }],
      });

      const result = await service.generateAnswer('some context', 'what is this?');

      expect(result).toEqual({ answer: 'This is the answer.' });
      expect(mockChatCreate).toHaveBeenCalledTimes(1);
      expect(mockChatCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'gpt-4o-mini',
          messages: expect.arrayContaining([
            expect.objectContaining({ role: 'user' }),
          ]),
        }),
      );
    });

    it('should return fallback if no content', async () => {
      mockChatCreate.mockResolvedValue({
        choices: [{ message: { content: null } }],
      });

      const result = await service.generateAnswer('ctx', 'question?');

      expect(result).toEqual({ answer: 'No answer generated.' });
    });
  });
});

