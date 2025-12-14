// frontend/src/components/auth/GoogleLoginButton.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export const GoogleLoginButton = () => {
  const [loading, setLoading] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const navigate = useNavigate();

  const handleCredentialResponse = async (response) => {
    if (!response?.credential) return;
    
    setLoading(true);
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: response.credential }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      const data = await res.json();

      if (data.success) {
        localStorage.setItem('accessToken', data.data.accessToken);
        localStorage.setItem('refreshToken', data.data.refreshToken);
        toast.success('Welcome!');
        window.location.href = '/dashboard';
        return;
      }
      
      toast.error(data.message || 'Login failed');
    } catch (error) {
      if (error.name === 'AbortError') {
        toast.error('Login timeout. Please try again.');
      } else {
        toast.error('Connection failed. Try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    
    const initGoogle = () => {
      if (!mounted || !window.google?.accounts?.id) return;
      
      try {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
          itp_support: true
        });
        
        if (mounted) setGoogleReady(true);
      } catch (error) {
        console.error('Google init failed:', error);
        if (mounted && retryCount < 3) {
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
            initGoogle();
          }, 1000);
        }
      }
    };

    if (window.google?.accounts?.id) {
      initGoogle();
    } else {
      const checkGoogle = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(checkGoogle);
          initGoogle();
        }
      }, 100);
      
      const timeout = setTimeout(() => {
        clearInterval(checkGoogle);
        if (mounted && !googleReady) {
          toast.error('Google login unavailable. Please refresh.');
        }
      }, 5000);
      
      return () => {
        clearInterval(checkGoogle);
        clearTimeout(timeout);
        mounted = false;
      };
    }
    
    return () => { mounted = false; };
  }, [retryCount]);

  return (
    <div className="relative">
      <button
        onClick={() => {
          if (loading) return;
          
          if (googleReady && window.google?.accounts?.id) {
            try {
              window.google.accounts.id.prompt();
            } catch (error) {
              console.error('Prompt failed:', error);
              toast.error('Please try again or refresh the page.');
            }
          } else {
            toast.error('Google login not ready. Please wait or refresh.');
          }
        }}
        disabled={loading || !googleReady}
        className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-xl bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 font-medium"
      >
        {loading ? (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600 mr-3"></div>
        ) : (
          <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
        )}
        <span className="text-sm sm:text-base">
          {loading ? 'Signing in...' : 'Continue with Google'}
        </span>
      </button>
    </div>
  );
};