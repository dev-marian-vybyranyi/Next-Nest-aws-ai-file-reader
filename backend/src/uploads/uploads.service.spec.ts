import { Test, TestingModule } from '@nestjs/testing';
import { S3Service } from '../libs/s3/s3.service';
import { UploadsService } from './uploads.service';

const mockS3Service = {
  createPresignedPost: jest.fn(),
};

describe('UploadsService', () => {
  let service: UploadsService;

  beforeEach(async () => {
    mockS3Service.createPresignedPost.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UploadsService,
        {
          provide: S3Service,
          useValue: mockS3Service,
        },
      ],
    }).compile();

    service = module.get<UploadsService>(UploadsService);
  });

  describe('getPresignedUrl', () => {
    it('should return fileId, s3Key, url and fields', async () => {
      mockS3Service.createPresignedPost.mockResolvedValue({
        url: 'https://test-bucket.s3.amazonaws.com/',
        fields: { key: 'tmp/some-uuid.pdf', 'Content-Type': 'application/pdf' },
      });

      const result = await service.getPresignedUrl();

      expect(result).toHaveProperty('fileId');
      expect(result).toHaveProperty('s3Key');
      expect(result).toHaveProperty('url');
      expect(result).toHaveProperty('fields');
      expect(result.s3Key).toMatch(/^tmp\/.+\.pdf$/);
    });

    it('should use tmp prefix for the S3 key', async () => {
      mockS3Service.createPresignedPost.mockResolvedValue({
        url: 'https://s3.amazonaws.com/',
        fields: {},
      });

      const result = await service.getPresignedUrl();

      expect(result.s3Key).toContain('tmp/');
    });

    it('should call createPresignedPost with correct constraints', async () => {
      mockS3Service.createPresignedPost.mockResolvedValue({
        url: 'https://s3.amazonaws.com/',
        fields: {},
      });

      await service.getPresignedUrl();

      expect(mockS3Service.createPresignedPost).toHaveBeenCalledWith(
        expect.objectContaining({
          contentType: 'application/pdf',
          maxSize: 10485760,
        }),
      );
    });
  });
});
