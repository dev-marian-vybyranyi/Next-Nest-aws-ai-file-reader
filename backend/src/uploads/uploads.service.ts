import { S3Client } from '@aws-sdk/client-s3';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UploadsService {
  private readonly s3: S3Client;
  private readonly bucket: string;

  constructor(private readonly config: ConfigService) {
    this.bucket = this.config.get('AWS_S3_BUCKET')!;
    this.s3 = new S3Client({
      region: this.config.get('AWS_REGION'),
      credentials: {
        accessKeyId: this.config.get('AWS_ACCESS_KEY_ID')!,
        secretAccessKey: this.config.get('AWS_SECRET_ACCESS_KEY')!,
      },
    });
  }

  async getPresignedUrl() {
    const fileId = uuidv4();
    const s3Key = `tmp/${fileId}.pdf`;

    const { url, fields } = await createPresignedPost(this.s3, {
      Bucket: this.bucket,
      Key: s3Key,
      Conditions: [
        ['content-length-range', 0, 10 * 1024 * 1024],
        ['eq', '$Content-Type', 'application/pdf'],
      ],
      Fields: { 'Content-Type': 'application/pdf' },
      Expires: 86400,
    });

    return { url, fields, fileId };
  }
}
