import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check current user on component mount
  useEffect(() => {
    checkUser();
    
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user || null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    } catch (error) {
      console.error('Error checking user:', error);
      setLoading(false);
    }
  };

  // Google Login
  const handleGoogleLogin = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
      });
      if (error) {
        console.error('Google Login Error:', error);
        alert('Login failed: ' + error.message);
      }
    } catch (err) {
      console.error('Exception:', err);
    }
  };

  // GitHub Login
  const handleGithubLogin = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
      });
      if (error) {
        console.error('GitHub Login Error:', error);
        alert('Login failed: ' + error.message);
      }
    } catch (err) {
      console.error('Exception:', err);
    }
  };

  // Logout
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout Error:', error);
      }
    } catch (err) {
      console.error('Exception:', err);
    }
  };

  // Folder toggle functionality
  useEffect(() => {
    const folders = document.querySelectorAll('.file-item.folder');
    folders.forEach(folder => {
      folder.addEventListener('click', function(e) {
        if (e.target !== this && !e.target.classList.contains('action-btn')) {
          return;
        }
        this.classList.toggle('open');
        const icon = this.querySelector('.file-icon i');
        if (this.classList.contains('open')) {
          icon.classList.remove('fa-folder');
          icon.classList.add('fa-folder-open');
        } else {
          icon.classList.remove('fa-folder-open');
          icon.classList.add('fa-folder');
        }
      });
    });
    
    // Tab switching functionality
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', function() {
        tabs.forEach(t => t.classList.remove('active'));
        this.classList.add('active');
      });
    });
  }, [user]); // Re-run when user changes

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <div className="App">
      {/* Header */}
      <header style={{ 
        padding: '15px 20px', 
        background: '#2c3e50', 
        color: 'white',
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{ margin: 0, fontSize: '24px' }}>📁 File Manager</h1>
        
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <span>Welcome, {user.email}</span>
            <button 
              onClick={handleLogout}
              style={{
                padding: '8px 16px',
                background: '#e74c3c',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Logout
            </button>
          </div>
        ) : (
          <span>Please login to continue</span>
        )}
      </header>

      {/* Main Content */}
      <main style={{ padding: '20px' }}>
        {!user ? (
          // Login Section
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
            gap: '20px'
          }}>
            <h2 style={{ fontSize: '28px', marginBottom: '10px' }}>Login Karo Bhai! 🚀</h2>
            <p style={{ fontSize: '16px', color: '#666', marginBottom: '30px' }}>
              Choose your login method
            </p>
            
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', justifyContent: 'center' }}>
              {/* Google Login Button */}
              <button 
                onClick={handleGoogleLogin}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#4285F4',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  minWidth: '180px'
                }}
              >
                <span>🔗</span> Google Se Login
              </button>

              {/* GitHub Login Button */}
              <button 
                onClick={handleGithubLogin}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#333',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  minWidth: '180px'
                }}
              >
                <span>🐙</span> GitHub Se Login
              </button>
            </div>
          </div>
        ) : (
          // File Manager Section (Your existing UI)
          <div className="file-manager">
            {/* Tabs */}
            <div className="tabs" style={{ 
              display: 'flex', 
              gap: '10px', 
              marginBottom: '20px',
              borderBottom: '1px solid #ddd',
              paddingBottom: '10px'
            }}>
              <div className="tab active" style={{
                padding: '8px 16px',
                background: '#3498db',
                color: 'white',
                borderRadius: '4px',
                cursor: 'pointer'
              }}>All Files</div>
              <div className="tab" style={{
                padding: '8px 16px',
                background: '#ecf0f1',
                borderRadius: '4px',
                cursor: 'pointer'
              }}>Documents</div>
              <div className="tab" style={{
                padding: '8px 16px',
                background: '#ecf0f1',
                borderRadius: '4px',
                cursor: 'pointer'
              }}>Images</div>
            </div>
            
            {/* File List */}
            <div className="file-list">
              <div className="file-item folder" style={{
                display: 'flex',
                alignItems: 'center',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                marginBottom: '5px',
                cursor: 'pointer'
              }}>
                <div className="file-icon" style={{ marginRight: '10px' }}>
                  <i className="fas fa-folder" style={{ color: '#f39c12' }}></i>
                </div>
                <div className="file-name">Projects</div>
              </div>
              
              {/* Add more file items as needed */}
              <div className="file-item" style={{
                display: 'flex',
                alignItems: 'center',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                marginBottom: '5px'
              }}>
                <div className="file-icon" style={{ marginRight: '10px' }}>
                  <i className="fas fa-file" style={{ color: '#3498db' }}></i>
                </div>
                <div className="file-name">document.pdf</div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;