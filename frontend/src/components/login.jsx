import React from 'react';
import { supabase } from '../supabaseClient';

const LoginPage = () => {
  // Google Login function
  const handleGoogleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
  };

  // GitHub Login function
  const handleGithubLogin = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
    });
  };

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>Login Karo Bhai! 🚀</h2>
      <button onClick={handleGoogleLogin}>Google Se Login</button>
      <button onClick={handleGithubLogin}>GitHub Se Login</button>
    </div>
  );
};

export default LoginPage;