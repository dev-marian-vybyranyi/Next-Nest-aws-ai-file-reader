# AI File Reader (Next, Nest, AWS)

## What is this project?
This application is a full-stack AI-powered document reader. It allows users to upload PDF documents and interact with them using an artificial intelligence chatbot. The project incorporates modern web frameworks, cloud storage, a serverless architecture, and a vector database for semantic search and question-answering based on the content of the files.

## What does it do?
The application processes uploaded PDF files, extracts the text from them, and stores the text content mathematically (as vector embeddings) in Pinecone. Users can then ask the AI questions about their documents, and the system matches the query against the stored document content to provide accurate, context-aware answers using OpenAI. All files and initial interactions are securely tracked using AWS.

## Folder Structure

### `backend`
The main API server, built with **NestJS**. It is responsible for orchestrating the interactions between the frontend, the database, and the AI services. It handles request routing, user authentication paths, and general file metadata storage using AWS DynamoDB. It also manages file upload credentials to AWS S3.

### `frontend`
The web user interface, built with **Next.js** (React) and styled using Tailwind CSS and shadcn/ui. This is the client-facing application where users can view their files, upload new PDFs, and use the interactive chat window. It heavily leverages React Query for data fetching and state management.

### `lambdas`
The background processing layer, built using the **Serverless Framework** and deployed to **AWS Lambda**. These serverless functions are triggered asynchronously to handle the heavy lifting: parsing the uploaded PDFs (`unpdf`), generating AI text embeddings using OpenAI, and indexing those embeddings into the Pinecone database.

## `.env` Example

You need to set up environment variables for the system to run locally or be deployed. Make sure to create a `.env` file at the root of the project:

```env
# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_S3_BUCKET=pdf-chat-uploads-bucket-for-files

# AWS DynamoDB
DYNAMODB_USERS_TABLE=pdf-chat-users
DYNAMODB_FILES_TABLE=pdf-chat-files

# Pinecone Database Configuration
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX=pdf-chat-index

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# Backend Application Configuration
PORT=3001

# Front-end API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001/api/
```
