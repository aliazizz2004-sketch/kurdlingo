import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
// Phosphor Icons - Modern 2025 icons with fill variants
import {
    Star, ChatCircle, Hash, Palette, Clock, UsersThree, ShoppingCart,
    MapPin, CloudSun, ForkKnife, Airplane, DeviceMobile, Briefcase,
    Stethoscope, CalendarCheck, ChatTeardrop, Bank, MusicNotes,
    GlobeHemisphereWest, Crown, Lock, CheckCircle, BookOpenText,
    Lightning, Trophy, Rocket
} from '@phosphor-icons/react';
import { unit1 } from '../../data/courses/unit1';
import { unit2 } from '../../data/courses/unit2';
import { unit3 } from '../../data/courses/unit3';
import { unit4 } from '../../data/courses/unit4';
import { unit5 } from '../../data/courses/unit5';
import { useLanguage } from '../../context/LanguageContext';
import {
    isLessonCompleted,
    isLessonUnlocked,

    isUnitCompleted
} from '../../utils/progressManager';
import './Learn.css';

import { Unit } from '../../types';

// Unit color schemes
const UNIT_THEMES = [
    { gradient: 'linear-gradient(135deg, #ff9600 0%, #cc7800 100%)', color: '#ff9600', shadow: '#cc7800' }, // Primary Orange Theme
    { gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', color: '#3b82f6', shadow: '#1d4ed8' },
    { gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: '#ef4444', shadow: '#b91c1c' },
    { gradient: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)', color: '#a855f7', shadow: '#7c3aed' },
    { gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: '#f59e0b', shadow: '#b45309' }, // Gold for Challenge
];

const Learn: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation(); // Track location changes
    const { t } = useLanguage();
    const [units, setUnits] = React.useState<Unit[]>([]);


    // Modern Phosphor Icon mapping
    const getLessonIcon = (title: string) => {
        if (!title) return Star;
        const lower = title.toLowerCase();
        if (lower.includes('basics') || lower.includes('بنەڕەت')) return Star;
        if (lower.includes('greeting') || lower.includes('سڵاو')) return ChatCircle;
        if (lower.includes('number') || lower.includes('ژمار')) return Hash;
        if (lower.includes('color') || lower.includes('ڕەنگ')) return Palette;
        if (lower.includes('time') || lower.includes('کات')) return Clock;
        if (lower.includes('family') || lower.includes('خێزان')) return UsersThree;
        if (lower.includes('shop') || lower.includes('بازاڕ')) return ShoppingCart;
        if (lower.includes('direction') || lower.includes('ئاڕاستە')) return MapPin;
        if (lower.includes('weather') || lower.includes('کەش')) return CloudSun;
        if (lower.includes('food') || lower.includes('dining') || lower.includes('خواردن')) return ForkKnife;
        if (lower.includes('travel') || lower.includes('گەشت')) return Airplane;
        if (lower.includes('tech') || lower.includes('تەکنە')) return DeviceMobile;
        if (lower.includes('business') || lower.includes('work') || lower.includes('کار')) return Briefcase;
        if (lower.includes('health') || lower.includes('تەندروست')) return Stethoscope;
        if (lower.includes('appointment') || lower.includes('مۆڵەت')) return CalendarCheck;
        if (lower.includes('opinion') || lower.includes('بۆچوون')) return ChatTeardrop;
        if (lower.includes('bank') || lower.includes('بانک')) return Bank;
        if (lower.includes('culture') || lower.includes('کەلتوور')) return GlobeHemisphereWest;
        if (lower.includes('holiday') || lower.includes('جەژن')) return MusicNotes;
        if (lower.includes('neuromatch') || lower.includes('match')) return Lightning;
        return Star;
    };

    React.useEffect(() => {
        // Load units from localStorage OR fallback to default units
        const loadUnits = () => {
            const savedUnits = localStorage.getItem('kurdlingo-units');
            if (savedUnits) {
                try {
                    const parsed = JSON.parse(savedUnits);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        setUnits(parsed);
                        console.log('✅ Loaded units from localStorage:', parsed.length, 'units');
                        return;
                    }
                } catch (e) {
                    console.error('Error parsing saved units:', e);
                }
            }
            // Fallback to default units
            setUnits([unit1, unit2, unit3, unit4, unit5]);
            console.log('📚 Using default units');
        };

        loadUnits();



        // Listen for visibility change (when user comes back to this tab)
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                loadUnits(); // Reload units when tab becomes visible

            }
        };

        // Listen for storage changes (from other tabs)
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'kurdlingo-units') {
                loadUnits();
            }
        };

        // Listen for focus (when window gains focus)
        const handleFocus = () => {
            loadUnits();

        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('focus', handleFocus);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('focus', handleFocus);
        };
    }, [location.key]); // Re-run when navigating back to this page

    return (
        <div className="learn-page">
            {/* ========== LEVEL TOGGLE ========== */}
            <div className="level-toggle-header">
                <div className="level-toggle-tabs">
                    <button className="level-toggle-tab active">
                        <Star size={18} weight="fill" />
                        Beginner
                    </button>
                    <button
                        className="level-toggle-tab"
                        onClick={() => navigate('/intermediate')}
                    >
                        <Rocket size={18} weight="fill" />
                        Intermediate
                    </button>
                </div>
            </div>

            {/* ========== MAIN CONTENT ========== */}
            <div className="learn-main">
                {units.map((unit, unitIndex) => {
                    const theme = UNIT_THEMES[unitIndex % UNIT_THEMES.length];

                    return (
                        <div className="unit-section" key={unit.id}>
                            {/* Unit Header */}
                            <div
                                className="unit-header"
                                style={{ background: theme.gradient }}
                            >
                                <div className="unit-info">
                                    <h2>{unit.title}</h2>
                                    <p>{unit.description}</p>
                                </div>
                                <button
                                    className="btn-guidebook"
                                    onClick={() => navigate(`/guidebook/${unit.id}`)}
                                >
                                    <BookOpenText size={20} weight="fill" />
                                    {t('guidebook')}
                                </button>
                            </div>

                            {/* Learning Path */}
                            <div className="learning-path">
                                {/* Lesson Nodes */}
                                {unit.lessons.map((lesson, index) => {
                                    const Icon = getLessonIcon(lesson.title);
                                    const completed = isLessonCompleted(lesson.id);
                                    const unlocked = isLessonUnlocked(lesson.id, unit.lessons);
                                    const isCurrent = unlocked && !completed;
                                    const isLocked = !unlocked;

                                    // Zigzag: 0=center, 1=right, 2=center, 3=left
                                    let positionClass = '';
                                    if (index % 4 === 1) positionClass = 'right';
                                    if (index % 4 === 3) positionClass = 'left';

                                    // Next node position for connector direction
                                    const nextIndex = index + 1;
                                    let nextPositionClass = '';
                                    if (nextIndex < unit.lessons.length) {
                                        if (nextIndex % 4 === 1) nextPositionClass = 'right';
                                        else if (nextIndex % 4 === 3) nextPositionClass = 'left';
                                        else nextPositionClass = 'center';
                                    }

                                    const handleClick = (e: React.MouseEvent) => {
                                        if (isLocked) e.preventDefault();
                                    };

                                    const lessonPath = lesson.type === 'game' && lesson.gameId === 'neuromatch'
                                        ? '/neuromatch'
                                        : `/lesson/${lesson.id}`;

                                    const isLastLesson = index === unit.lessons.length - 1;

                                    return (
                                        <React.Fragment key={lesson.id}>
                                            <Link
                                                to={isLocked ? '#' : lessonPath}
                                                className={`path-node ${positionClass} ${isCurrent ? 'current' : ''} ${isLocked ? 'locked' : ''} ${completed ? 'completed' : ''}`}
                                                onClick={handleClick}
                                                aria-disabled={isLocked}
                                            >
                                                <div
                                                    className="node-circle"
                                                    style={{
                                                        '--node-bg': isCurrent || completed ? theme.gradient : '#e5e7eb',
                                                        '--node-shadow': isCurrent || completed ? theme.shadow : '#d1d5db',
                                                        '--node-text': isCurrent || completed ? '#ffffff' : '#9ca3af',
                                                        '--node-accent': theme.color
                                                    } as React.CSSProperties}
                                                >
                                                    {isLocked ? (
                                                        <Lock size={32} weight="fill" color="var(--node-text)" />
                                                    ) : (
                                                        <Icon size={36} weight="fill" color="var(--node-text)" />
                                                    )}

                                                    {/* START Bubble for current lesson */}
                                                    {isCurrent && (
                                                        <div className="start-bubble" style={{ color: theme.shadow, borderColor: theme.shadow }}>
                                                            {t('start') || 'START'}
                                                        </div>
                                                    )}

                                                    {/* Crown sitting on top */}
                                                    {isCurrent && (
                                                        <div className="crown-badge">
                                                            <Crown size={42} weight="fill" color="#fbbf24" style={{ filter: 'drop-shadow(0 2px 0 #b45309)' }} />
                                                        </div>
                                                    )}

                                                    {/* Checkmark for completed */}
                                                    {completed && (
                                                        <div className="completed-badge">
                                                            <CheckCircle size={24} weight="fill" color={theme.color} />
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="node-tooltip">{lesson.title}</div>
                                            </Link>
                                            {/* SVG Snake-curve connector to next node */}
                                            {!isLastLesson && (() => {
                                                // Detect RTL — nodes flip via CSS [dir="rtl"] rules
                                                const isRTL = document.documentElement.dir === 'rtl' || document.body.dir === 'rtl';
                                                const flip = isRTL ? -1 : 1;

                                                // Positions relative to center (0): right=+70, left=-70 (flipped in RTL)
                                                const fromX = (positionClass === 'right' ? 70 : positionClass === 'left' ? -70 : 0) * flip;
                                                const toPos = nextPositionClass || 'center';
                                                const toX = (toPos === 'right' ? 70 : toPos === 'left' ? -70 : 0) * flip;

                                                // SVG viewBox: center at x=100, so offsets are 100+pos
                                                const x1 = 100 + fromX;
                                                const x2 = 100 + toX;
                                                const svgH = 60;
                                                // Smooth S-curve using cubic bezier
                                                const d = `M ${x1},0 C ${x1},${svgH * 0.55} ${x2},${svgH * 0.45} ${x2},${svgH}`;

                                                return (
                                                    <svg
                                                        className={`path-snake ${completed ? 'path-snake--active' : ''}`}
                                                        viewBox="0 0 200 60"
                                                        preserveAspectRatio="none"
                                                        style={{ '--snake-color': theme.color } as React.CSSProperties}
                                                    >
                                                        {/* Background track (always visible) */}
                                                        <path
                                                            d={d}
                                                            fill="none"
                                                            stroke="#d1d5db"
                                                            strokeWidth="5"
                                                            strokeLinecap="round"
                                                        />
                                                        {/* Active overlay (green when completed) */}
                                                        {completed && (
                                                            <path
                                                                d={d}
                                                                fill="none"
                                                                stroke={theme.color}
                                                                strokeWidth="5"
                                                                strokeLinecap="round"
                                                            />
                                                        )}
                                                    </svg>
                                                );
                                            })()}
                                        </React.Fragment>
                                    );
                                })}

                                {/* Trophy */}
                                <div className={`path-node trophy-node ${isUnitCompleted(unit.lessons) ? 'completed' : ''}`}>
                                    <div className="node-circle">
                                        <Trophy
                                            size={56}
                                            weight="fill"
                                            color={isUnitCompleted(unit.lessons) ? "#fbbf24" : "#d4d4d4"}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* ========== RIGHT SIDEBAR ========== */}
            <div className="sidebar-right">


                {/* Space Typing Game Card */}
                <div
                    className="glass-panel space-game-card"
                    onClick={() => navigate('/space-game')}
                    style={{ cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 8px 25px rgba(255, 150, 0, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '';
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, #1a1a3a 0%, #0a0a1a 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Rocket size={28} weight="fill" color="#ff9600" />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>🚀 Space Typing</h3>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                                {t('practice') || 'Practice'} 🌟
                            </p>
                        </div>
                    </div>
                    <p style={{
                        fontSize: '0.85rem',
                        color: 'var(--color-text-secondary)',
                        margin: 0,
                        lineHeight: 1.4
                    }}>
                        Type words to destroy falling space objects!
                    </p>
                </div>

                {/* Typing Rush Game Card */}
                <div
                    className="glass-panel space-game-card"
                    onClick={() => navigate('/typing-rush')}
                    style={{ cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 8px 25px rgba(168, 85, 247, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '';
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, #2d1a4e 0%, #1a0a2e 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Lightning size={28} weight="fill" color="#a855f7" />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Typing Rush</h3>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                                Speed Test
                            </p>
                        </div>
                    </div>
                    <p style={{
                        fontSize: '0.85rem',
                        color: 'var(--color-text-secondary)',
                        margin: 0,
                        lineHeight: 1.4
                    }}>
                        Type full paragraphs as fast as you can!
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Learn;