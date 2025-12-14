// frontend/src/components/auth/GoogleLoginButton.jsx
import React, { useState } from 'react';
import toast from 'react-hot-toast';

// Global callback function
window.handleCredentialResponse = async (response) => {
  if (!response?.credential) return;
  
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: response.credential }),
    });
    
    const data = await res.json();

    if (data.success) {
      localStorage.setItem('accessToken', data.data.accessToken);
      localStorage.setItem('refreshToken', data.data.refreshToken);
      toast.success('Welcome!');
      window.location.href = '/dashboard';
    } else {
      toast.error(data.message || 'Login failed');
    }
  } catch (error) {
    toast.error('Connection failed. Try again.');
  }
};

export const GoogleLoginButton = () => {
  const [loading, setLoading] = useState(false);

  const handleFallbackLogin = () => {
    setLoading(true);
    const params = new URLSearchParams({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      redirect_uri: `${import.meta.env.VITE_API_URL.replace('/api', '')}/api/oauth/google/callback`,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'select_account'
    });
    
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
  };

  return (
    <div className="relative">
      {/* Google One Tap */}
      <div 
        id="g_id_onload"
        data-client_id={import.meta.env.VITE_GOOGLE_CLIENT_ID}
        data-context="signin"
        data-ux_mode="popup"
        data-callback="handleCredentialResponse"
        data-auto_prompt="false"
        data-use_fedcm_for_prompt="false"
      ></div>
      
      {/* Google Sign-In Button */}
      <div 
        className="g_id_signin"
        data-type="standard"
        data-shape="rectangular"
        data-theme="outline"
        data-text="signin_with"
        data-size="large"
        data-logo_alignment="left"
        data-width="100%"
      ></div>
      
      {/* Fallback Button */}
      <button
        onClick={handleFallbackLogin}
        disabled={loading}
        className="w-full mt-2 flex items-center justify-center px-4 py-2 text-sm border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 text-gray-600"
      >
        {loading ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
        ) : (
          <span>Alternative Google Login</span>
        )}
      </button>
    </div>
  );
};