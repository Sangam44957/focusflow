// backend/src/controllers/oauth.controller.js
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import prisma from '../config/database.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

export const googleAuth = asyncHandler(async (req, res) => {
  const { token } = req.body;
  
  if (!token) {
    throw new ApiError(400, 'Google token is required');
  }

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    let user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      const hashedPassword = await bcrypt.hash(googleId, 10);
      user = await prisma.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
          avatar: picture,
          provider: 'google',
          providerId: googleId
        }
      });
    } else if (!user.providerId) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { 
          providerId: googleId,
          provider: 'google',
          avatar: picture || user.avatar,
          name: name || user.name
        }
      });
    }

    const accessToken = jwt.sign(
      { userId: user.id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { userId: user.id, tokenVersion: user.tokenVersion },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Google login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar: user.avatar
        },
        accessToken,
        refreshToken
      }
    });

  } catch (error) {
    console.error('Google OAuth error:', error);
    throw new ApiError(401, 'Invalid Google token');
  }
});

export const googleCallback = asyncHandler(async (req, res) => {
  const { code, state } = req.query;
  
  if (!code) {
    throw new ApiError(400, 'Authorization code is required');
  }

  try {
    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);

    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    let user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      const hashedPassword = await bcrypt.hash(googleId, 10);
      user = await prisma.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
          avatar: picture,
          googleId
        }
      });
    } else if (!user.googleId) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { 
          googleId,
          avatar: picture || user.avatar,
          name: name || user.name
        }
      });
    }

    const accessToken = jwt.sign(
      { userId: user.id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { userId: user.id, tokenVersion: user.tokenVersion },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    const returnTo = state ? JSON.parse(state).returnTo : '/dashboard';
    res.redirect(`${process.env.FRONTEND_URL}${returnTo}?auth=success`);

  } catch (error) {
    console.error('Google OAuth error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
  }
});