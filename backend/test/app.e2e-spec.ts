import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { ChatService } from '../src/chat/chat.service';
import { FilesService } from '../src/files/files.service';
import { UploadsService } from '../src/uploads/uploads.service';
import { UsersService } from '../src/users/users.service';

const mockUser = { email: 'user@test.com', createdAt: '2024-01-01' };
const mockFile = {
  fileId: 'file-123',
  email: 'user@test.com',
  filename: 'test.pdf',
  s3Key: 'uploads/user@test.com/file-123.pdf',
  status: 'success',
  createdAt: '2024-01-01',
};

describe('App (e2e)', () => {
  let app: INestApplication<App>;

  const usersServiceMock = {
    findUser: jest.fn().mockResolvedValue(mockUser),
    getOrCreateUser: jest.fn().mockResolvedValue(mockUser),
  };

  const filesServiceMock = {
    createFile: jest.fn().mockResolvedValue(mockFile),
    getFileStatus: jest.fn().mockResolvedValue(mockFile),
    getFileByEmail: jest.fn().mockResolvedValue(mockFile),
    deleteFile: jest.fn().mockResolvedValue({ success: true }),
    updateFileStatus: jest.fn().mockResolvedValue(undefined),
  };

  const chatServiceMock = {
    askQuestion: jest
      .fn()
      .mockResolvedValue({ answer: 'Test answer', chunksUsed: 3 }),
  };

  const uploadsServiceMock = {
    getPresignedUrl: jest.fn().mockResolvedValue({
      fileId: 'new-file-id',
      s3Key: 'tmp/new-file-id.pdf',
      url: 'https://s3.amazonaws.com/',
      fields: { 'Content-Type': 'application/pdf' },
    }),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(UsersService)
      .useValue(usersServiceMock)
      .overrideProvider(FilesService)
      .useValue(filesServiceMock)
      .overrideProvider(ChatService)
      .useValue(chatServiceMock)
      .overrideProvider(UploadsService)
      .useValue(uploadsServiceMock)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    usersServiceMock.findUser.mockResolvedValue(mockUser);
    usersServiceMock.getOrCreateUser.mockResolvedValue(mockUser);
    filesServiceMock.createFile.mockResolvedValue(mockFile);
    filesServiceMock.getFileStatus.mockResolvedValue(mockFile);
    filesServiceMock.getFileByEmail.mockResolvedValue(mockFile);
    filesServiceMock.deleteFile.mockResolvedValue({ success: true });
    chatServiceMock.askQuestion.mockResolvedValue({
      answer: 'Test answer',
      chunksUsed: 3,
    });
    uploadsServiceMock.getPresignedUrl.mockResolvedValue({
      fileId: 'new-file-id',
      s3Key: 'tmp/new-file-id.pdf',
      url: 'https://s3.amazonaws.com/',
      fields: {},
    });
  });

  describe('GET /api/users/:email', () => {
    it('should return user by email', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/users/user@test.com')
        .expect(200);

      expect(res.body).toMatchObject({ email: 'user@test.com' });
    });
  });

  describe('POST /api/users', () => {
    it('should upsert and return user', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/users')
        .send({ email: 'user@test.com' })
        .expect(201);

      expect(res.body).toMatchObject({ email: 'user@test.com' });
    });

    it('should return 400 for invalid email', async () => {
      await request(app.getHttpServer())
        .post('/api/users')
        .send({ email: 'not-an-email' })
        .expect(400);
    });

    it('should return 400 when email is missing', async () => {
      await request(app.getHttpServer())
        .post('/api/users')
        .send({})
        .expect(400);
    });
  });

  describe('POST /api/files', () => {
    it('should create and return file record', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/files')
        .send({
          email: 'user@test.com',
          filename: 'test.pdf',
          s3Key: 'tmp/abc.pdf',
        })
        .expect(201);

      expect(res.body).toMatchObject({ email: 'user@test.com', status: 'success' });
    });

    it('should return 400 for missing fields', async () => {
      await request(app.getHttpServer())
        .post('/api/files')
        .send({ email: 'user@test.com' })
        .expect(400);
    });
  });

  describe('GET /api/files/:fileId/status', () => {
    it('should return file status', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/files/file-123/status')
        .expect(200);

      expect(res.body).toMatchObject({ fileId: 'file-123' });
    });
  });

  describe('GET /api/files/by-email/:email', () => {
    it('should return file for given email', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/files/by-email/user@test.com')
        .expect(200);

      expect(res.body).toMatchObject({ email: 'user@test.com' });
    });

    it('should return empty body when no file found', async () => {
      filesServiceMock.getFileByEmail.mockResolvedValue(null);

      const res = await request(app.getHttpServer())
        .get('/api/files/by-email/nobody@test.com')
        .expect(200);

      expect(res.body?.email).toBeUndefined();
    });
  });

  describe('DELETE /api/files/:email', () => {
    it('should delete file and return success', async () => {
      const res = await request(app.getHttpServer())
        .delete('/api/files/user@test.com')
        .expect(200);

      expect(res.body).toEqual({ success: true });
    });
  });

  describe('POST /api/chat/ask', () => {
    it('should return answer from AI', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/chat/ask')
        .send({ email: 'user@test.com', question: 'What is this document?' })
        .expect(201);

      expect(res.body).toMatchObject({ answer: 'Test answer', chunksUsed: 3 });
    });

    it('should return 400 for invalid email', async () => {
      await request(app.getHttpServer())
        .post('/api/chat/ask')
        .send({ email: 'bad-email', question: 'Some question here' })
        .expect(400);
    });

    it('should return 400 when question is too short', async () => {
      await request(app.getHttpServer())
        .post('/api/chat/ask')
        .send({ email: 'user@test.com', question: 'Hi' })
        .expect(400);
    });
  });

  describe('GET /api/uploads/presigned-url', () => {
    it('should return presigned URL data', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/uploads/presigned-url')
        .expect(200);

      expect(res.body).toHaveProperty('fileId');
      expect(res.body).toHaveProperty('s3Key');
      expect(res.body).toHaveProperty('url');
      expect(res.body).toHaveProperty('fields');
    });
  });
});
