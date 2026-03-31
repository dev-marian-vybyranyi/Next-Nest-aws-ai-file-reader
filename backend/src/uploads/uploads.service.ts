import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { S3Service } from '../libs/s3/s3.service';

@Injectable()
export class UploadsService {
  constructor(private readonly s3Service: S3Service) {}

  async getPresignedUrl() {
    const fileId = uuidv4();
    const s3Key = `tmp/${fileId}.pdf`;

    const { url, fields } = await this.s3Service.createPresignedPost({
      key: s3Key,
      contentType: 'application/pdf',
      maxSize: 10 * 1024 * 1024,
    });

    return { fileId, s3Key, url, fields };
  }
}

