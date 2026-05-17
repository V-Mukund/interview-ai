# INTERVIEW AI

A full-stack AI-powered interview preparation platform.

## Technology Stack

- **Frontend**: Next.js, TypeScript, Tailwind CSS, ShadCN UI
- **Backend**: NestJS, TypeScript, JWT Auth
- **Database**: PostgreSQL (Dockerized)
- **Architecture**: Monolithic

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js (v18+)
- npm or yarn

### Installation & Setup

1. **Clone the repository**
2. **Setup environment variables**
   ```bash
   cp .env.example .env
   ```
3. **Run with Docker**
   ```bash
   docker-compose up --build
   ```

### Project Structure

```
project/
│
├── frontend/          # Next.js app
│   ├── app/           # App Router
│   ├── components/    # Reusable UI
│   ├── services/      # API logic
│   ├── hooks/         # Custom hooks
│   └── types/         # TS Definitions
│
├── backend/           # NestJS app
│   ├── src/
│   │   ├── auth/      # Auth module
│   │   ├── users/     # User module
│   │   ├── chatbot/   # AI Logic
│   │   ├── common/    # Utilities
│   │   └── database/  # DB Config
│
├── docker-compose.yml
└── README.md
```

## Features

- [ ] User Authentication (JWT)
- [ ] AI Interview Simulation
- [ ] Real-time Feedback
- [ ] Personalized Dashboard
