import { NavLink } from 'react-router-dom';
import { Home, BookOpen, Trophy, Target, Store, User, MessageCircle, Book } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import './Layout.css';

const BottomNav = () => {
    const { t } = useLanguage();

    // Comprehensive list matching Sidebar
    const navItems = [
        { id: 'learn', label: t('learn'), path: '/learn', icon: Home, color: 'blue' },
        { id: 'guidebook', label: t('guidebook'), path: '/guidebook-hub', icon: BookOpen, color: 'purple' },
        { id: 'roleplay', label: t('roleplay') || 'Role-Play', path: '/roleplay', icon: MessageCircle, color: 'pink' },
        { id: 'dictionary', label: t('dictionary'), path: '/dictionary', icon: Book, color: 'green' },
        { id: 'leaderboard', label: t('leaderboards'), path: '/leaderboard', icon: Trophy, color: 'yellow' },
        { id: 'quests', label: t('quests'), path: '/quests', icon: Target, color: 'red' },
        { id: 'shop', label: t('shop'), path: '/shop', icon: Store, color: 'teal' },
        { id: 'profile', label: t('profile'), path: '/profile', icon: User, color: 'orange' },
    ];

    return (
        <nav className="bottom-nav">
            {navItems.map((item) => {
                const Icon = item.icon;
                return (
                    <NavLink
                        key={item.id}
                        to={item.path}
                        className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
                    >
                        <div className={`nav-icon-wrapper ${item.color}`} style={{ width: '32px', height: '32px', borderRadius: '10px' }}>
                            <Icon size={18} className="nav-icon-mobile" />
                        </div>
                        <span className="nav-label">{item.label}</span>
                    </NavLink>
                );
            })}
        </nav>
    );
};

export default BottomNav;
