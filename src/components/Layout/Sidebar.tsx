import { motion } from 'framer-motion';
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
} from '@hugeicons/core-free-icons';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import './Layout.css';

interface SidebarProps {
    isCollapsed: boolean;
    toggleSidebar: () => void;
}

const Sidebar = ({ isCollapsed, toggleSidebar }: SidebarProps) => {
    const { t } = useLanguage();
    const navigate = useNavigate(); // Added useNavigate hook

    const navItems = [
        { icon: Home01Icon, label: t('learn'), path: '/learn' },
        { icon: Book02Icon, label: t('guidebook'), path: '/guidebook-hub' },
        { icon: MessageMultiple02Icon, label: t('roleplay') || 'ڕۆڵگێڕان', path: '/roleplay' },
        { icon: Book04Icon, label: t('dictionary'), path: '/dictionary' },
        { icon: Award01Icon, label: t('leaderboards'), path: '/leaderboard' },
        { icon: Target02Icon, label: t('quests'), path: '/quests' },
        { icon: ShoppingBag01Icon, label: t('shop'), path: '/shop' },
        { icon: Target02Icon, label: 'Voice Test', path: '/voicetest' },
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
                                {isActive && (
                                    <motion.div
                                        layoutId="sidebar-active-pill"
                                        className="nav-item-active-bg"
                                        initial={false}
                                        transition={{
                                            type: "spring",
                                            stiffness: 400,
                                            damping: 25,
                                            mass: 0.8
                                        }}
                                    />
                                )}
                                <div className="nav-icon-hi" style={{ position: 'relative' }}>
                                    <HugeiconsIcon
                                        icon={item.icon}
                                        size={22}
                                        color={isActive ? '#1a73e8' : '#6b7280'}
                                        strokeWidth={isActive ? 2 : 1.75}
                                    />
                                </div>
                                {!isCollapsed && <span className="nav-label-hi">{item.label}</span>}
                            </>
                        )}
                    </NavLink>
                ))}

                <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingBottom: '16px' }}>
                    <div className="nav-item" onClick={() => navigate('/profile')} style={{ cursor: 'pointer' }}>
                        <div className="nav-icon-hi">
                            <HugeiconsIcon icon={UserCircle02Icon} size={22} color="#6b7280" strokeWidth={1.75} />
                        </div>
                        {!isCollapsed && <span className="nav-label-hi" style={{ marginLeft: 8 }}>{t('profile')}</span>}
                    </div>



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
