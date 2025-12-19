# 🎯 FocusFlow

> AI-Powered Goal & Task Tracker SaaS

[![CI/CD](https://github.com/Sangam44-tech/focusflow/actions/workflows/deploy.yml/badge.svg)](https://github.com/Sangam44-tech/focusflow/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 📖 Overview

FocusFlow is a modern, full-stack productivity application that combines traditional task management with AI-powered planning capabilities. Transform vague goals into actionable, structured task plans.

### ✨ Key Features

- 🤖 **AI Planning** - Generate structured task plans from goals using Google Gemini
- 📁 **Project Management** - Organize tasks into projects with deadlines
- 📊 **Analytics Dashboard** - Track progress with charts and streaks
- 🎯 **Task Management** - Kanban-style boards with priority levels
- 🔐 **Secure Auth** - JWT-based authentication with refresh tokens
- 📱 **Responsive Design** - Works seamlessly on all devices

## 🛠️ Tech Stack

### Backend
- Node.js + Express
- PostgreSQL + Prisma ORM
- JWT Authentication
- Google Gemini AI
- Rate limiting & Security

### Frontend
- React 18 + Vite
- Tailwind CSS
- React Router v6
- React Hook Form + Zod
- Axios + React Hot Toast

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL
- Google Gemini API Key

### Installation

```bash
# Clone repository
git clone https://github.com/Sangam44-tech/focusflow.git
cd focusflow

# Backend setup
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
npx prisma generate
npx prisma db push
npm run dev

# Frontend setup (new terminal)
cd frontend
npm install
cp .env.example .env
npm run dev
```

### Environment Variables

**Backend (.env)**
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/focusflow_db"
ACCESS_TOKEN_SECRET="your-access-token-secret"
REFRESH_TOKEN_SECRET="your-refresh-token-secret"
GEMINI_API_KEY="your-gemini-api-key"
FRONTEND_URL="http://localhost:3000"
```

**Frontend (.env)**
```env
VITE_API_URL="http://localhost:5000/api"
```

## 📁 Project Structure

```
focusflow/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── repositories/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   └── validations/
│   ├── prisma/
│   └── tests/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── features/
│   │   ├── pages/
│   │   ├── context/
│   │   └── services/
│   └── public/
└── docs/
```

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/refresh` | Refresh token |
| POST | `/api/auth/logout` | Logout user |

### Projects
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | Get all projects |
| POST | `/api/projects` | Create project |
| GET | `/api/projects/:id` | Get project |
| PUT | `/api/projects/:id` | Update project |
| DELETE | `/api/projects/:id` | Delete project |

### AI Planner
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/generate` | Generate AI plan |
| GET | `/api/ai/plans` | Get user plans |
| POST | `/api/ai/import` | Import plan as project |

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

## 🚢 Deployment

### Backend (Render)
1. Connect GitHub repository
2. Set environment variables
3. Deploy using `render.yaml`

### Frontend (Vercel)
1. Import project from GitHub
2. Set `VITE_API_URL` environment variable
3. Deploy using `vercel.json`

### Database
- **Development**: Local PostgreSQL
- **Production**: Neon, Supabase, or Render PostgreSQL

## 🐳 Docker

```bash
# Run with Docker Compose
docker-compose up

# Build individual services
docker build -t focusflow-backend ./backend
docker build -t focusflow-frontend ./frontend
```

## 📄 License

MIT License

Copyright (c) 2024 Sangam & Abhinandan

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## 👥 Authors

**Sangam** - [@Sangam44-tech](https://github.com/Sangam44-tech)
**Abhinandan** - [@abhi2004c](https://github.com/abhi2004c)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## ⭐ Star this repo if you found it helpful!

---

**Live Demo**: [Live](https://focusflow-drab.vercel.app)
**Documentation**: [API Docs](docs/api.md)