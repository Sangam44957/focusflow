// backend/src/controllers/auth.controller.js
import { asyncHandler } from '../utils/asyncHandler.js';
import { authService } from '../services/auth.service.js';
import { setRefreshTokenCookie, clearRefreshTokenCookie } from '../utils/jwt.js';

export const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  
  setRefreshTokenCookie(res, result.refreshToken);
  
  res.status(201).json({
    success: true,
    message: 'Registration successful',
    data: {
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken
    }
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password);
  
  setRefreshTokenCookie(res, result.refreshToken);
  
  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken
    }
  });
});

export const refresh = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  const result = await authService.refresh(refreshToken);
  
  setRefreshTokenCookie(res, result.refreshToken);
  
  res.json({
    success: true,
    data: {
      accessToken: result.accessToken
    }
  });
});

export const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.user.id);
  clearRefreshTokenCookie(res);
  
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

export const getMe = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: {
      user: req.user
    }
  });
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  // Validate inputs
  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: 'Both current and new passwords are required'
    });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({
      success: false,
      message: 'New password must be at least 8 characters long'
    });
  }

  await authService.changePassword(req.user.id, currentPassword, newPassword);
  
  res.json({
    success: true,
    message: 'Password changed successfully'
  });
});

export const updateProfile = asyncHandler(async (req, res) => {
  console.log('🔄 Profile update request received:', {
    userId: req.user?.id,
    body: req.body,
    headers: req.headers.authorization ? 'Token present' : 'No token'
  });
  
  const { name } = req.body;
  
  // Validate name
  if (!name || !name.trim()) {
    console.log('❌ Validation failed: Name is empty');
    return res.status(400).json({
      success: false,
      message: 'Name is required'
    });
  }

  const updatedUser = await authService.updateProfile(req.user.id, { name: name.trim() });
  
  console.log('✅ Profile updated successfully:', updatedUser);
  
  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: updatedUser
  });
});