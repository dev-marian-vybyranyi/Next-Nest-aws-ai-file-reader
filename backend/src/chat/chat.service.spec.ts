import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { FilesService } from '../files/files.service';
import { ChatService } from './chat.service';

const mockSearchRecords = jest.fn();
const mockIndex = jest.fn().mockReturnValue({ searchRecords: mockSearchRecords });
jest.mock('@pinecone-database/pinecone', () => ({
  __esModule: true,
  Pinecone: jest.fn().mockImplementation(() => ({ index: mockIndex })),
}));

const mockChatCreate = jest.fn();
jest.mock('openai', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    chat: { completions: { create: mockChatCreate } },
  })),
}));

const pendingFile = { fileId: 'file-1', email: 'user@test.com', status: 'pending' };
const readyFile = { fileId: 'file-1', email: 'user@test.com', status: 'success' };

describe('ChatService', () => {
  let service: ChatService;
  let mockGetFileByEmail: jest.Mock;

  beforeEach(async () => {
    mockGetFileByEmail = jest.fn();
    mockSearchRecords.mockReset();
    mockChatCreate.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        {
          provide: FilesService,
          useValue: { getFileByEmail: mockGetFileByEmail },
        },
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) =>
              ({
                PINECONE_API_KEY: 'test-pinecone-key',
                OPENAI_API_KEY: 'test-openai-key',
                PINECONE_INDEX: 'pdf-chat-index',
              })[key],
          },
        },
      ],
    }).compile();

    service = module.get<ChatService>(ChatService);
  });

  describe('askQuestion', () => {
    it('should throw BadRequestException if no file found', async () => {
      mockGetFileByEmail.mockResolvedValue(null);

      await expect(
        service.askQuestion('user@test.com', 'What is this?'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if file is not ready', async () => {
      mockGetFileByEmail.mockResolvedValue(pendingFile);

      await expect(
        service.askQuestion('user@test.com', 'What is this?'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if no relevant chunks found', async () => {
      mockGetFileByEmail.mockResolvedValue(readyFile);
      mockSearchRecords.mockResolvedValue({ result: { hits: [] } });

      await expect(
        service.askQuestion('user@test.com', 'What is this?'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should return answer and chunksUsed on success', async () => {
      mockGetFileByEmail.mockResolvedValue(readyFile);
      mockSearchRecords.mockResolvedValue({
        result: {
          hits: [
            { fields: { chunk_text: 'Chunk one content' } },
            { fields: { chunk_text: 'Chunk two content' } },
          ],
        },
      });
      mockChatCreate.mockResolvedValue({
        choices: [{ message: { content: 'This is the answer.' } }],
      });

      const result = await service.askQuestion('user@test.com', 'What is this?');

      expect(result).toEqual({ answer: 'This is the answer.', chunksUsed: 2 });
      expect(mockSearchRecords).toHaveBeenCalledTimes(1);
      expect(mockChatCreate).toHaveBeenCalledTimes(1);
    });

    it('should pass user email as filter when searching Pinecone', async () => {
      mockGetFileByEmail.mockResolvedValue(readyFile);
      mockSearchRecords.mockResolvedValue({
        result: { hits: [{ fields: { chunk_text: 'Some text' } }] },
      });
      mockChatCreate.mockResolvedValue({
        choices: [{ message: { content: 'Answer' } }],
      });

      await service.askQuestion('user@test.com', 'Tell me something');

      expect(mockSearchRecords).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.objectContaining({
            filter: { email: { $eq: 'user@test.com' } },
          }),
        }),
      );
    });
  });
});
