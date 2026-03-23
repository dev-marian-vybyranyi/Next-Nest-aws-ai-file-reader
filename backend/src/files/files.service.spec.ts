import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { DynamoDBService } from '../shared/dynamodb.service';
import { FilesService } from './files.service';

const mockS3Send = jest.fn();
jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn().mockImplementation(() => ({ send: mockS3Send })),
  CopyObjectCommand: jest.fn(),
  DeleteObjectCommand: jest.fn(),
  HeadObjectCommand: jest.fn(),
}));

const mockFile = {
  fileId: 'file-123',
  email: 'user@test.com',
  s3Key: 'uploads/user@test.com/file-123.pdf',
  filename: 'test.pdf',
  status: 'pending',
  createdAt: '2024-01-01',
};

describe('FilesService', () => {
  let service: FilesService;
  let mockDbSend: jest.Mock;

  beforeEach(async () => {
    mockDbSend = jest.fn();
    mockS3Send.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FilesService,
        {
          provide: DynamoDBService,
          useValue: { client: { send: mockDbSend } },
        },
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) =>
              ({
                DYNAMODB_FILES_TABLE: 'files-table',
                AWS_S3_BUCKET: 'test-bucket',
                AWS_REGION: 'us-east-1',
                AWS_ACCESS_KEY_ID: 'test-key',
                AWS_SECRET_ACCESS_KEY: 'test-secret',
              })[key],
          },
        },
      ],
    }).compile();

    service = module.get<FilesService>(FilesService);
  });

  describe('getFileByEmail', () => {
    it('should return file when found', async () => {
      mockDbSend.mockResolvedValue({ Items: [mockFile] });

      const result = await service.getFileByEmail('user@test.com');

      expect(result).toEqual(mockFile);
    });

    it('should return null when no file found', async () => {
      mockDbSend.mockResolvedValue({ Items: [] });

      const result = await service.getFileByEmail('user@test.com');

      expect(result).toBeNull();
    });
  });

  describe('getFileStatus', () => {
    it('should return file when found', async () => {
      mockDbSend.mockResolvedValue({ Item: mockFile });

      const result = await service.getFileStatus('file-123');

      expect(result).toEqual(mockFile);
    });

    it('should return null when file not found', async () => {
      mockDbSend.mockResolvedValue({ Item: undefined });

      const result = await service.getFileStatus('unknown');

      expect(result).toBeNull();
    });
  });

  describe('createFile', () => {
    it('should throw BadRequestException if user already has a file', async () => {
      mockDbSend.mockResolvedValue({ Items: [mockFile] });

      await expect(
        service.createFile('user@test.com', 'new.pdf', 'tmp/new.pdf'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if file not in S3', async () => {
      mockDbSend.mockResolvedValue({ Items: [] });
      mockS3Send.mockRejectedValue(new Error('NoSuchKey'));

      await expect(
        service.createFile('user@test.com', 'test.pdf', 'tmp/abc.pdf'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should create file record and return it', async () => {
      mockDbSend
        .mockResolvedValueOnce({ Items: [] })
        .mockResolvedValueOnce({});
      mockS3Send.mockResolvedValue({});

      const result = await service.createFile(
        'user@test.com',
        'test.pdf',
        'tmp/abc.pdf',
      );

      expect(result).toMatchObject({
        email: 'user@test.com',
        filename: 'test.pdf',
        status: 'pending',
      });
      expect(result).toHaveProperty('fileId');
      expect(result.s3Key).toContain('uploads/user@test.com/');
    });
  });

  describe('deleteFile', () => {
    it('should throw BadRequestException if no file found', async () => {
      mockDbSend.mockResolvedValue({ Items: [] });

      await expect(service.deleteFile('user@test.com')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should delete file from S3 and DynamoDB', async () => {
      mockDbSend
        .mockResolvedValueOnce({ Items: [mockFile] })
        .mockResolvedValueOnce({});
      mockS3Send.mockResolvedValue({});

      const result = await service.deleteFile('user@test.com');

      expect(result).toEqual({ success: true });
      expect(mockS3Send).toHaveBeenCalledTimes(1);
      expect(mockDbSend).toHaveBeenCalledTimes(2);
    });
  });

  describe('updateFileStatus', () => {
    it('should update status to success when file exists', async () => {
      mockDbSend
        .mockResolvedValueOnce({ Item: mockFile })
        .mockResolvedValueOnce({});

      await service.updateFileStatus('file-123', 'success');

      expect(mockDbSend).toHaveBeenCalledTimes(2);
    });

    it('should do nothing when file not found', async () => {
      mockDbSend.mockResolvedValue({ Item: undefined });

      await service.updateFileStatus('unknown-id', 'success');

      expect(mockDbSend).toHaveBeenCalledTimes(1);
    });
  });
});
