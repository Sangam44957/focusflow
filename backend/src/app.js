// backend/src/app.js
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { config } from './config/env.js';
import { errorHandler } from './middlewares/errorHandler.middleware.js';
import { generalLimiter } from './middlewares/rateLimiter.middleware.js';
import routes from './routes/index.js';
import subscriptionRoutes from './routes/subscription.routes.js';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: [config.frontendUrl, 'https://focusflow-drab.vercel.app', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Stripe webhook needs raw body (before json parser)
app.use('/api/subscription/webhook', express.raw({ type: 'application/json' }));

// Rate limiting
app.use(generalLimiter);

// Body parsing
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api', routes);
app.use('/api/subscription', subscriptionRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Error handler
app.use(errorHandler);

export default app;