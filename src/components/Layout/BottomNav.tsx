import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { HugeiconsIcon } from '@hugeicons/react';
import {
    Home01Icon,
    Book02Icon,
    MessageMultiple02Icon,
    Book04Icon,
    Award01Icon,
    Target02Icon,
    ShoppingCart01Icon,
    UserCircle02Icon,
    Menu01Icon,
} from '@hugeicons/core-free-icons';
import { useLanguage } from '../../context/LanguageContext';
import './Layout.css';

const BottomNav = () => {
    const { t } = useLanguage();
    const [showMore, setShowMore] = useState(false);

    // Secondary items in the More popup
    const secondaryItems = [
        { icon: Book02Icon, label: t('guidebook'), path: '/guidebook-hub' },
        { icon: Award01Icon, label: t('leaderboards'), path: '/leaderboard' },
        { icon: Target02Icon, label: t('quests'), path: '/quests' },
        { icon: ShoppingCart01Icon, label: t('shop'), path: '/shop' },
    ];

    return (
        <>
            {/* More Menu Popup */}
            {showMore && (
                <div className="bottom-nav-more-menu">
                    <div className="more-menu-overlay" onClick={() => setShowMore(false)} />
                    <div className="more-menu-content">
                        {secondaryItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className="more-menu-item"
                                onClick={() => setShowMore(false)}
                            >
                                {({ isActive }) => (
                                    <>
                                        <HugeiconsIcon
                                            icon={item.icon}
                                            size={26}
                                            color={isActive ? '#e07600' : '#6b7280'}
                                            strokeWidth={isActive ? 2 : 1.75}
                                        />
                                        <span style={{ color: isActive ? '#e07600' : '#4b4b4b', fontSize: '13px', fontWeight: 600, textAlign: 'center' }}>
                                            {item.label}
                                        </span>
                                    </>
                                )}
                            </NavLink>
                        ))}
                    </div>
                </div>
            )}

            <nav className="bottom-nav">
                {/* Left Side: Dictionary, Roleplay */}
                <div className="bottom-nav-group">
                    <NavLink to="/dictionary" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`} onClick={() => setShowMore(false)}>
                        {({ isActive }) => (
                            <>
                                <HugeiconsIcon icon={Book04Icon} size={26} color={isActive ? '#e07600' : '#9ca3af'} strokeWidth={isActive ? 2 : 1.75} />
                                <span className="nav-label" style={{ color: isActive ? '#e07600' : '#9ca3af' }}>{t('dictionary')}</span>
                            </>
                        )}
                    </NavLink>
                    
                    <NavLink to="/roleplay" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`} onClick={() => setShowMore(false)}>
                        {({ isActive }) => (
                            <>
                                <HugeiconsIcon icon={MessageMultiple02Icon} size={26} color={isActive ? '#e07600' : '#9ca3af'} strokeWidth={isActive ? 2 : 1.75} />
                                <span className="nav-label" style={{ color: isActive ? '#e07600' : '#9ca3af' }}>{t('roleplay') || 'Role-Play'}</span>
                            </>
                        )}
                    </NavLink>
                </div>

                {/* Center: Floating Home */}
                <div className="bottom-nav-center-wrapper">
                    <NavLink to="/learn" className={({ isActive }) => `bottom-nav-home-btn ${isActive ? 'active' : ''}`} onClick={() => setShowMore(false)}>
                        {({ isActive }) => (
                            <HugeiconsIcon icon={Home01Icon} size={32} color={isActive ? '#ffffff' : '#9ca3af'} strokeWidth={isActive ? 2 : 1.75} />
                        )}
                    </NavLink>
                </div>

                {/* Right Side: Profile, More */}
                <div className="bottom-nav-group">
                    <NavLink to="/profile" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`} onClick={() => setShowMore(false)}>
                        {({ isActive }) => (
                            <>
                                <HugeiconsIcon icon={UserCircle02Icon} size={26} color={isActive ? '#e07600' : '#9ca3af'} strokeWidth={isActive ? 2 : 1.75} />
                                <span className="nav-label" style={{ color: isActive ? '#e07600' : '#9ca3af' }}>{t('profile')}</span>
                            </>
                        )}
                    </NavLink>

                    <button
                        className={`bottom-nav-item ${showMore ? 'active' : ''}`}
                        onClick={() => setShowMore(!showMore)}
                        style={{ background: 'none', border: 'none', outline: 'none', cursor: 'pointer', padding: '8px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}
                    >
                        <HugeiconsIcon icon={Menu01Icon} size={26} color={showMore ? '#e07600' : '#9ca3af'} strokeWidth={showMore ? 2 : 1.75} />
                        <span className="nav-label" style={{ color: showMore ? '#e07600' : '#9ca3af' }}>زیاتر</span>
                    </button>
                </div>
            </nav>
        </>
    );
};

export default BottomNav;
