# AskPDF: AI-Powered PDF Question Answering

<a href="https://askyourpdf-client.vercel.app" target="_blank">
  <img src="/thumbnail.png" alt="AskPDF Preview">
</a>

## Project Overview

AskPDF is a full-stack application that allows users to upload PDF documents and ask questions about their content. The application uses AI models to analyze the documents and provide accurate answers to user queries.

## Features

- Secure user authentication and authorization using JWT.
- PDF document upload and processing.
- AI-powered question answering system for PDF content.
- Responsive and intuitive user interface built with Next.js and styled using Tailwind CSS.
- Robust backend architecture using Express.js and database integration with Prisma ORM.
- Integration with AI services like OpenAI, Pinecone and Langchain for enhanced document analysis.
- Stripe integration for handling payments and subscriptions.

## Tech Stack

### Frontend (client)

- Next.js with TypeScript / Tailwind CSS for styling
- React Query for data fetching and cache management
- Shadcn UI for accessible component primitives
- Zustand for state management
- React Hook Form with Zod for form handling and validation

### Backend (server)

- Node.js with Express.js
- PostgreSQL with Prisma ORM
- JWT for authentication
- Uploadthing for file uploading and management
- OpenAI and Langchain for AI-powered features
- Pinecone for vector database functionality
- Stripe for payment processing

## Project Structure

The project is divided into two main parts:

1. Client (/client)

   - `app`: Next.js app directory
   - `components`: Reusable UI components
   - `contexts`: React contexts
   - `hooks`: Custom React hooks
   - `lib`: Shared libraries and utilities
   - `types`: TypeScript type definitions
   - `utils`: Utility functions and components

2. Server (/server)
   - `controllers`: Request handling and business logic
   - `db`: Database-related files
   - `lib`: Shared libraries and utilities
   - `middleware`: Express middleware functions
   - `routes`: API route definitions
   - `utils`: Utility functions
   - `webhook`: Webhook-related functionality

## Key Features Explained

- **PDF Processing**: Utilizes PDF parsing libraries to extract and analyze document content.
- **AI-Powered Q&A**: Leverages OpenAI and Langchain to provide intelligent answers to user queries about PDF content.
- **Vector Database**: Implements Pinecone for efficient storage and retrieval of document embeddings.
- **User Authentication**: Uses JWT for secure user sessions and route protection.
- **Payment Integration**: Incorporates Stripe for handling user subscriptions and payments.
- **Responsive Design**: Implements a mobile-first approach using Tailwind CSS for a smooth user experience across devices.

## Future Enhancements

- Implement multi-language support for PDF analysis
- Add collaborative document sharing and querying features
- Enhance AI model fine-tuning for improved accuracy

## Live Link

- <a href="https://askyourpdf-client.vercel.app" target="_blank">Live Link</a>
