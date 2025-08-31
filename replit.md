# MindConnect - Healthcare Video Consultation Platform

## Overview

MindConnect is a HIPAA-compliant telemedicine platform designed specifically for psychology and mental health consultations in Queensland, Australia. The platform provides secure video conferencing capabilities with real-time chat messaging, enabling healthcare professionals to conduct remote consultations with patients. Built with modern web technologies, it emphasizes security, reliability, and user experience for both therapists and patients.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client application is built using React 18 with TypeScript and follows a component-based architecture. Key architectural decisions include:

- **Build System**: Vite for fast development and optimized production builds, providing hot module replacement and efficient bundling
- **Routing**: Wouter for lightweight client-side routing without the overhead of React Router
- **State Management**: TanStack Query v5 for server state management and caching, eliminating the need for complex client state management
- **UI Framework**: shadcn/ui components built on Radix UI primitives for accessible, customizable components
- **Styling**: Tailwind CSS with a custom healthcare-focused color palette emphasizing trust (blue), health (green), and medical standards
- **Real-time Communication**: WebRTC for peer-to-peer video calls with WebSocket fallback for signaling and chat

### Backend Architecture
The server follows a RESTful API design with real-time capabilities:

- **Runtime**: Node.js with Express.js framework using ES modules for modern JavaScript features
- **Language**: TypeScript throughout the stack for type safety and better developer experience
- **Real-time**: WebSocket server handling chat messages, session coordination, and WebRTC signaling
- **API Design**: RESTful endpoints for session management, user operations, and chat history
- **Error Handling**: Centralized error handling middleware with proper HTTP status codes

### Database Design
PostgreSQL database with Drizzle ORM providing type-safe database operations:

- **Users Table**: Stores user profiles with roles (patient/therapist/admin), contact information, and account status
- **Consultation Sessions Table**: Manages session lifecycle from scheduling to completion with room IDs for WebRTC connections
- **Chat Messages Table**: Stores all chat communications with session association and sender tracking
- **Session Storage**: PostgreSQL-based session storage for user authentication and session persistence

### Authentication & Security
- **Session Management**: Connect-pg-simple for PostgreSQL-backed session storage
- **Data Validation**: Zod schemas with Drizzle for runtime type checking and validation
- **Environment Configuration**: Secure environment variable management for database connections and external services

### Real-time Communication Stack
- **WebRTC**: Direct peer-to-peer video/audio communication for low latency
- **TURN/STUN Servers**: Twilio integration for NAT traversal and connectivity in restrictive network environments
- **WebSocket Signaling**: Custom signaling server for WebRTC negotiation and chat messaging
- **Fallback Strategy**: Graceful degradation to public STUN servers when Twilio is unavailable

## External Dependencies

### Database Services
- **Neon Database**: Serverless PostgreSQL hosting with built-in connection pooling and scaling
- **Drizzle ORM**: Type-safe database operations with migration support

### Communication Services
- **Twilio**: TURN server provisioning for WebRTC connectivity in enterprise networks
- **WebSocket**: Real-time bidirectional communication for chat and session coordination

### Development Tools
- **Vite**: Development server and build tooling with optimized bundling
- **TypeScript**: Static type checking across the entire stack
- **Tailwind CSS**: Utility-first CSS framework with custom healthcare theming

### UI Components
- **Radix UI**: Unstyled, accessible UI primitives for complex interactions
- **shadcn/ui**: Pre-built component library with healthcare-appropriate styling
- **Lucide React**: Icon library optimized for healthcare and medical applications

### State Management
- **TanStack Query**: Server state synchronization with caching, background refetching, and optimistic updates