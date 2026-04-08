import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Eye, EyeSlash, EnvelopeSimple, LockKey, Translate } from '@phosphor-icons/react';
import { useUser } from '../../context/AuthContext';
import './Login.css';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { user, isLoaded } = useUser();

    // Auto-redirect to dashboard if already logged in
    useEffect(() => {
        if (isLoaded && user) {
            navigate('/learn', { replace: true });
        }
    }, [user, isLoaded, navigate]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const { data, error } = await supabase.auth.signInWithPassword({
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
