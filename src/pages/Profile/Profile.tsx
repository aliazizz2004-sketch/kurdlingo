import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Flame, Zap, Plus, Settings, Type, BookOpen, User, Edit2, LogOut, Sun, Moon } from 'lucide-react';
import Button from '../../components/Button/Button';
import { kurdishFonts, useLanguage } from '../../context/LanguageContext';
import { getUserStats } from '../../utils/progressManager';
import { supabase } from '../../lib/supabase';
import { useUser } from '../../context/AuthContext';
import { openProfileModal } from '../../components/ProfileSetupModal';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import './Profile.css';

const Profile = () => {
    const { t, kurdishFont, setKurdishFont } = useLanguage();
    const { toggleTheme, isDark } = useTheme();
    const [stats, setStats] = useState(getUserStats());
    const { user, isLoaded } = useUser();
    const [dbProfile, setDbProfile] = useState<any>(null);
    const navigate = useNavigate();

    const fetchProfile = useCallback(async () => {
        if (!user) return;
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (profile) setDbProfile(profile);
    }, [user]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    useEffect(() => {
        const handleFocus = () => {
            setStats(getUserStats());
            fetchProfile();
        };
        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
    }, [fetchProfile]);

    if (!isLoaded) return <div className="profile-loading"><span className="loader"></span></div>;

    const displayName = dbProfile?.name || dbProfile?.username || user?.email?.split('@')[0] || t('you');
    const avatarUrl = dbProfile?.avatar_url;

    return (
        <div className="profile-page">
            {/* Profile Content */}
            <div className="profile-hero">
                <div className="profile-cover"></div>
                <div className="profile-header-content">
                    <div className="profile-avatar-wrapper">
                        {avatarUrl ? (
                            <img src={avatarUrl} alt="avatar" className="profile-avatar-img" />
                        ) : (
                            <div className="profile-avatar-placeholder"><User size={48} color="#c8c8c8" /></div>
                        )}
                    </div>
                    <div className="profile-identity">
                        <h1 className="profile-name">{displayName}</h1>
                        {user?.email && <p className="profile-email">{user.email}</p>}
                        <div className="profile-badges">
                            <span className="stat-pill"><Flame size={16} color="#ff9600" fill="#ff9600" /> {stats.streak} {t('dayStreak')}</span>
                            <span className="stat-pill"><Zap size={16} color="#ffc800" fill="#ffc800" /> {dbProfile?.xp || stats.totalXp} XP</span>
                        </div>
                    </div>
                    {user && (
                        <button onClick={openProfileModal} className="edit-profile-action">
                            <Edit2 size={18} /> {t('editProfile') || 'دەستکاری پرۆفایل'}
                        </button>
                    )}
                </div>
            </div>

            <div className="profile-content">
                <section className="profile-section">
                    <h2 className="section-title">{t('statistics')}</h2>
                    <div className="bento-stats-grid">
                        <div className="bento-card streak">
                            <div className="bento-icon-wrapper"><Flame size={36} color="#ff9600" /></div>
                            <div className="bento-info">
                                <h3 className="bento-value">{stats.streak}</h3>
                                <p className="bento-label">{t('dayStreak')}</p>
                            </div>
                        </div>
                        <div className="bento-card xp">
                            <div className="bento-icon-wrapper"><Zap size={36} color="#ffc800" /></div>
                            <div className="bento-info">
                                <h3 className="bento-value">{dbProfile?.xp || stats.totalXp}</h3>
                                <p className="bento-label">{t('totalXp')}</p>
                            </div>
                        </div>
                        <div className="bento-card lessons">
                            <div className="bento-icon-wrapper"><BookOpen size={36} color="#1cb0f6" /></div>
                            <div className="bento-info">
                                <h3 className="bento-value">{stats.lessonsCompleted}</h3>
                                <p className="bento-label">{t('lessonsCompleted') || 'Lessons'}</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="profile-section">
                    <h2 className="section-title">
                        <Type size={24} style={{ marginInlineEnd: '8px' }} />
                        {t('kurdishFont')}
                    </h2>
                    <div className="font-selector-container">
                        <p className="font-selector-description">{t('selectKurdishFont')}</p>
                        <div className="font-preview" style={{ fontFamily: kurdishFont }}>
                            کوردلینگۆ - فێربوونی زمانی کوردی
                        </div>
                        <select
                            className="font-selector"
                            value={kurdishFont}
                            onChange={(e) => setKurdishFont(e.target.value)}
                        >
                            {kurdishFonts.map((font) => (
                                <option key={font.id} value={font.id}>
                                    {font.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </section>

                <section className="profile-section">
                    <h2 className="section-title">
                        {isDark ? <Moon size={24} style={{ marginInlineEnd: '8px' }} /> : <Sun size={24} style={{ marginInlineEnd: '8px' }} />}
                        دۆخی ڕووناکی (Theme)
                    </h2>
                    <div className="font-selector-container">
                        <p className="font-selector-description">دۆخی تاریک یان ڕووناک هەڵبژێرە بەپێی ئارەزووی خۆت.</p>
                        <Button variant="secondary" fullWidth size="lg" onClick={toggleTheme}>
                            {isDark ? <Sun size={20} style={{ marginRight: '8px' }} /> : <Moon size={20} style={{ marginRight: '8px' }} />}
                            {isDark ? 'دۆخی ڕووناکی' : 'دۆخی تاریکی'}
                        </Button>
                    </div>
                </section>

                {user && (
                    <section className="profile-section">
                        <h2 className="section-title">{t('adminControls')}</h2>
                        <div className="admin-controls-grid">
                            <Link to="/create-lesson" style={{ textDecoration: 'none' }}>
                                <Button variant="secondary" fullWidth size="lg">
                                    <Plus size={20} style={{ marginRight: '8px' }} />
                                    {t('createLesson')}
                                </Button>
                            </Link>
                            <Link to="/admin" style={{ textDecoration: 'none' }}>
                                <Button variant="outline" fullWidth size="lg">
                                    <Settings size={20} style={{ marginRight: '8px' }} />
                                    {t('adminPanel')}
                                </Button>
                            </Link>
                        </div>
                    </section>
                )}
                
                {user && (
                    <div className="sign-out-container" style={{ cursor: 'pointer' }} onClick={async () => { await supabase.auth.signOut(); navigate('/login'); }}>
                        <div className="sign-out-trigger">
                            <LogOut size={20} />
                            <span>چوونەدەرەوە</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;
