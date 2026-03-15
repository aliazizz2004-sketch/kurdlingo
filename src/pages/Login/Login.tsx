import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { insforge } from '../../lib/insforge';
import { Eye, EyeSlash, EnvelopeSimple, LockKey, Translate } from '@phosphor-icons/react';
import './Login.css';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const { data, error } = await insforge.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError('هەڵەیەک ڕوویدا لە کاتی چوونەژوورەوە، تکایە دڵنیابە لە زانیارییەکانت یان هێڵی ئینتەرنێتەکەت.');
            setLoading(false);
            return;
        }

        if (data) {
            navigate('/learn');
        }
    };

    const handleOAuthLogin = async (provider: 'google') => {
        setLoading(true);
        setError('');
        
        const { error } = await insforge.auth.signInWithOAuth({
            provider,
            redirectTo: window.location.origin + '/learn'
        });

        if (error) {
            setError('هەڵەیەک ڕوویدا لە کاتی چوونەژوورەوە بە ' + provider);
            setLoading(false);
        }
    };

    return (
        <div className="login-page" dir="rtl">
            <div className="login-container">
                {/* Form section */}
                <div className="login-form-side">
                    <div className="login-form-inner">
                        <div className="login-mobile-brand">
                            <div className="login-brand-icon">
                                <Translate size={20} weight="bold" />
                            </div>
                            <h1 className="login-brand-text" style={{ fontSize: '1.25rem' }}>KurdLingo</h1>
                        </div>

                        <div className="login-welcome">
                            <h3 className="login-welcome-title">بەخێربێیتەوە!</h3>
                            <p className="login-welcome-desc">چوونەژوورەوە بۆ بەردەوامبوون لە فێربوون.</p>
                        </div>

                        {error && (
                            <div className="login-error">
                                {error}
                            </div>
                        )}

                        <form className="login-form" onSubmit={handleLogin}>
                            <div className="login-form-group">
                                <label className="login-label">ئیمەیڵ</label>
                                <div className="login-input-wrapper">
                                    <EnvelopeSimple size={20} className="login-input-icon" weight="bold" />
                                    <input 
                                        type="email" 
                                        className="login-input" 
                                        placeholder="ئیمەیڵەکەت بنووسە"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="login-form-group">
                                <div className="login-label-row">
                                    <label className="login-label" style={{ marginBottom: 0 }}>وشەی نهێنی</label>
                                    <a href="#" className="login-link">لەبیرت چووە؟</a>
                                </div>
                                <div className="login-input-wrapper">
                                    <LockKey size={20} className="login-input-icon" weight="bold" />
                                    <input 
                                        type={showPassword ? "text" : "password"} 
                                        className="login-input has-action" 
                                        placeholder="وشەی نهێنییەکەت بنووسە"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                    <button 
                                        type="button" 
                                        className="login-input-action"
                                        onClick={() => setShowPassword(!showPassword)}
                                        aria-label={showPassword ? "شاردنەوەی وشەی نهێنی" : "نیشاندانی وشەی نهێنی"}
                                    >
                                        {showPassword ? <EyeSlash size={20} weight="bold" /> : <Eye size={20} weight="bold" />}
                                    </button>
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                className="login-submit"
                                disabled={loading || !email || !password}
                            >
                                {loading ? 'چاوەڕێ بکە...' : 'چوونەژوورەوە'}
                            </button>
                        </form>

                        <div className="login-divider">
                            <span>یان لە ڕێگەی ئەمانەوە</span>
                        </div>

                        <div className="login-socials" style={{ gridTemplateColumns: '1fr' }}>
                            <button 
                                type="button" 
                                className="login-social-btn"
                                onClick={() => handleOAuthLogin('google')}
                                disabled={loading}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                                </svg>
                                لەگەڵ گۆگڵ بەردەوام بە
                            </button>
                        </div>

                        <div className="login-footer">
                            <p>
                                هەژمارت نییە؟ 
                                <a href="#" className="login-link" style={{ marginRight: '0.4rem' }}>ئێستا دروستی بکە</a>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Branding section - RTL layout puts it securely on the left when rendered 2nd */}
                <div className="login-illustration">
                    <div className="login-brand-top">
                        <div className="login-brand-icon">
                            <Translate size={24} weight="bold" />
                        </div>
                        <h1 className="login-brand-text">KurdLingo</h1>
                    </div>

                    <div className="login-illustration-content">
                        <div className="login-image-wrapper">
                            <img 
                                alt="KurdLingo learning" 
                                className="login-image" 
                                src="/login-illustration.jpg" 
                            />
                        </div>
                        <h2 className="login-title">
                            خۆشترین ڕێگای <br/> جیهان بۆ فێربوون.
                        </h2>
                        <p className="login-desc">
                            شارەزایی پەیدا بکە لە ڕێگەی وانەی کورت <br/> و ئاڵەنگارییەوە.
                        </p>
                    </div>

                    {/* Gradient background decoration */}
                    <div className="login-accent-1"></div>
                    <div className="login-accent-2"></div>
                </div>
            </div>
        </div>
    );
};

export default Login;
