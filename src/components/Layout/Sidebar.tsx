import { NavLink } from 'react-router-dom';
import { HugeiconsIcon } from '@hugeicons/react';
import {
    Home01Icon,
    Book02Icon,
    MessageMultiple02Icon,
    Book04Icon,
    Award01Icon,
    Target02Icon,
    ShoppingBag01Icon,
    UserCircle02Icon,
    MoreHorizontalIcon,
    ArrowLeft01Icon,
    Login01Icon,
} from '@hugeicons/core-free-icons';
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
        { icon: Home01Icon, label: t('learn'), path: '/learn' },
        { icon: Book02Icon, label: t('guidebook'), path: '/guidebook-hub' },
        { icon: MessageMultiple02Icon, label: t('roleplay') || 'Role-Play', path: '/roleplay' },
        { icon: Book04Icon, label: t('dictionary'), path: '/dictionary' },
        { icon: Award01Icon, label: t('leaderboards'), path: '/leaderboard' },
        { icon: Target02Icon, label: t('quests'), path: '/quests' },
        { icon: ShoppingBag01Icon, label: t('shop'), path: '/shop' },
        { icon: UserCircle02Icon, label: t('profile'), path: '/profile' },
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
                        {({ isActive }) => (
                            <>
                                <div className="nav-icon-hi">
                                    <HugeiconsIcon
                                        icon={item.icon}
                                        size={22}
                                        color={isActive ? '#e07600' : '#6b7280'}
                                        strokeWidth={isActive ? 2 : 1.75}
                                    />
                                </div>
                                {!isCollapsed && <span className="nav-label-hi">{item.label}</span>}
                            </>
                        )}
                    </NavLink>
                ))}

                <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingBottom: '16px' }}>
                    <SignedIn>
                        <div className="nav-item" style={{ cursor: 'default' }}>
                            <UserButton />
                            {!isCollapsed && <span className="nav-label-hi" style={{ marginLeft: 8 }}>Account</span>}
                        </div>
                    </SignedIn>
                    <SignedOut>
                        <div className="nav-item">
                            <div className="nav-icon-hi">
                                <HugeiconsIcon icon={Login01Icon} size={22} color="#6b7280" strokeWidth={1.75} />
                            </div>
                            {!isCollapsed && (
                                <span className="nav-label-hi"><SignInButton /></span>
                            )}
                        </div>
                    </SignedOut>
                    <button
                        className="nav-item more-btn"
                        onClick={toggleSidebar}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}
                    >
                        <div className="nav-icon-hi">
                            <HugeiconsIcon
                                icon={isCollapsed ? ArrowLeft01Icon : MoreHorizontalIcon}
                                size={22}
                                color="#6b7280"
                                strokeWidth={1.75}
                            />
                        </div>
                        {!isCollapsed && <span className="nav-label-hi">{t('more')}</span>}
                    </button>
                </div>
            </nav>
        </aside>
    );
};

export default Sidebar;
