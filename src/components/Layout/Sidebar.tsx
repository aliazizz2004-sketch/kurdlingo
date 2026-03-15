import { NavLink } from 'react-router-dom';
import { Home, BookOpen, Trophy, Target, Store, User, MessageCircle, Book, MoreHorizontal, ChevronLeft, ChevronRight, LogIn } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { SignedIn, SignedOut, UserButton, SignInButton } from '@insforge/react';
import './Layout.css';

interface SidebarProps {
    isCollapsed: boolean;
    toggleSidebar: () => void;
}

const Sidebar = ({ isCollapsed, toggleSidebar }: SidebarProps) => {
    const { t } = useLanguage();

    const navItems = [
        { icon: Home, label: t('learn'), path: '/learn', color: 'blue' },
        { icon: BookOpen, label: t('guidebook'), path: '/guidebook-hub', color: 'purple' },
        { icon: MessageCircle, label: t('roleplay') || 'Role-Play', path: '/roleplay', color: 'pink' },
        { icon: Book, label: t('dictionary'), path: '/dictionary', color: 'green' },
        { icon: Trophy, label: t('leaderboards'), path: '/leaderboard', color: 'yellow' },
        { icon: Target, label: t('quests'), path: '/quests', color: 'red' },
        { icon: Store, label: t('shop'), path: '/shop', color: 'teal' },
        { icon: User, label: t('profile'), path: '/profile', color: 'orange' },
    ];

    return (
        <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-logo">
                {!isCollapsed && <h1 className="logo-text">KurdLingo</h1>}
                {isCollapsed && <h1 className="logo-text">K</h1>}
            </div>
            <nav className="sidebar-nav">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                        title={isCollapsed ? item.label : ''}
                    >
                        <div className={`nav-icon-wrapper ${item.color}`}>
                            <item.icon size={22} className="nav-icon-inner" />
                        </div>
                        {!isCollapsed && <span className="nav-label">{item.label}</span>}
                    </NavLink>
                ))}
                
                <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingBottom: '16px' }}>
                    <SignedIn>
                        <div className="nav-item" style={{ cursor: 'default' }}>
                            <UserButton />
                            {!isCollapsed && <span className="nav-label" style={{ marginLeft: 8 }}>Account</span>}
                        </div>
                    </SignedIn>
                    <SignedOut>
                        <div className="nav-item">
                            <div className="nav-icon-wrapper gray">
                                <LogIn size={22} className="nav-icon-inner" />
                            </div>
                            {!isCollapsed && (
                                <span className="nav-label"><SignInButton /></span>
                            )}
                        </div>
                    </SignedOut>
                    <button className="nav-item more-btn">
                        <div className="nav-icon-wrapper gray">
                            <MoreHorizontal size={22} className="nav-icon-inner" />
                        </div>
                        {!isCollapsed && <span className="nav-label">{t('more')}</span>}
                    </button>
                </div>
            </nav>

            <button className="collapse-btn" onClick={toggleSidebar}>
                {isCollapsed ? <ChevronRight size={24} /> : <ChevronLeft size={24} />}
            </button>
        </aside>
    );
};

export default Sidebar;
