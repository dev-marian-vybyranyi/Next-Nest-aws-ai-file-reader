import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { UploadsService } from './uploads.service';

jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn().mockImplementation(() => ({})),
}));

const mockCreatePresignedPost = jest.fn();
jest.mock('@aws-sdk/s3-presigned-post', () => ({
  createPresignedPost: (...args: any[]) => mockCreatePresignedPost(...args),
}));

describe('UploadsService', () => {
  let service: UploadsService;

  beforeEach(async () => {
    mockCreatePresignedPost.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UploadsService,
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) =>
              ({
                AWS_S3_BUCKET: 'test-bucket',
                AWS_REGION: 'us-east-1',
                AWS_ACCESS_KEY_ID: 'test-key',
                AWS_SECRET_ACCESS_KEY: 'test-secret',
              })[key],
          },
        },
      ],
    }).compile();

    service = module.get<UploadsService>(UploadsService);
  });

  describe('getPresignedUrl', () => {
    it('should return fileId, s3Key, url and fields', async () => {
      mockCreatePresignedPost.mockResolvedValue({
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
      mockCreatePresignedPost.mockResolvedValue({
        url: 'https://s3.amazonaws.com/',
        fields: {},
      });

      const result = await service.getPresignedUrl();

      expect(result.s3Key).toContain('tmp/');
    });

    it('should call createPresignedPost with correct bucket and PDF constraints', async () => {
      mockCreatePresignedPost.mockResolvedValue({
        url: 'https://s3.amazonaws.com/',
        fields: {},
      });

      await service.getPresignedUrl();

      expect(mockCreatePresignedPost).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          Bucket: 'test-bucket',
          Fields: { 'Content-Type': 'application/pdf' },
        }),
      );
    });
  });
});
