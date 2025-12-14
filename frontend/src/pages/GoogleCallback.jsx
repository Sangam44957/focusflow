// frontend/src/pages/GoogleCallback.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export const GoogleCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const authSuccess = urlParams.get('auth');
    const error = urlParams.get('error');

    if (error) {
      toast.error('Google login failed');
      navigate('/login');
      return;
    }

    if (authSuccess === 'success') {
      toast.success('Login successful!');
      navigate('/dashboard');
      return;
    }

    // If no params, redirect to login
    toast.error('Invalid callback');
    navigate('/login');
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <span className="ml-3 text-gray-600">Completing login...</span>
    </div>
  );
};