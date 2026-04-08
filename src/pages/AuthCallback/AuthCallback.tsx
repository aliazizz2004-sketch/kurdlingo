import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

/**
 * AuthCallback - handles OAuth redirects from Supabase (Google, GitHub, etc.)
 * 
 * Supabase redirects here after OAuth with the session in the URL hash:
 *   #access_token=...&refresh_token=...&type=recovery (etc.)
 * 
 * The supabase-js client auto-detects these tokens from the hash,
 * so we just wait for the session to be established and then navigate.
 */
const AuthCallback: React.FC = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const handleCallback = async () => {
            // supabase-js v2 automatically parses the token from the URL hash
            const { data, error } = await supabase.auth.getSession();

            if (error) {
                console.error('Auth callback error:', error.message);
                navigate('/login', { replace: true });
                return;
            }

            if (data.session) {
                // Logged in successfully - go to learn page
                navigate('/learn', { replace: true });
            } else {
                // No session found - go back to login
                navigate('/login', { replace: true });
            }
        };

        // Small timeout to ensure supabase-js has parsed the URL hash
        const timer = setTimeout(handleCallback, 300);
        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <div
            style={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'var(--color-background, #0f172a)',
                color: 'var(--color-text-main, white)',
                gap: '1rem',
                fontFamily: 'Vazirmatn, sans-serif',
            }}
            dir="rtl"
        >
            <div
                style={{
                    width: '48px',
                    height: '48px',
                    border: '4px solid rgba(255,255,255,0.1)',
                    borderTop: '4px solid #1cb0f6',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                }}
            />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <p style={{ fontSize: '1.1rem', opacity: 0.8 }}>چوونەژوورەوە...</p>
        </div>
    );
};

export default AuthCallback;
