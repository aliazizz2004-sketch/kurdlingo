import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
    Star, ChatCircle, Briefcase, Stethoscope, Airplane, Lock,
    CheckCircle, Crown, Trophy, BookOpenText, Lightning,
    Rocket, GlobeHemisphereWest, Buildings
} from '@phosphor-icons/react';
import { useLanguage } from '../../context/LanguageContext';
import { intermediateUnit1 } from '../../data/courses/intermediate-unit1';
import { intermediateUnit2 } from '../../data/courses/intermediate-unit2';
import {
    isLessonCompleted,
    isLessonUnlocked,
    isUnitCompleted
} from '../../utils/progressManager';
import './IntermediateLearn.css';

import { Unit } from '../../types';

// Dark premium blue theme for intermediate units
const UNIT_THEMES = [
    { gradient: 'linear-gradient(135deg, #1e40af 0%, #cc7800 100%)', color: '#3b82f6', shadow: '#cc7800' },
    { gradient: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)', color: '#8b5cf6', shadow: '#5b21b6' },
    { gradient: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)', color: '#06b6d4', shadow: '#155e75' },
    { gradient: 'linear-gradient(135deg, #9333ea 0%, #7c3aed 100%)', color: '#a855f7', shadow: '#6b21a8' },
    { gradient: 'linear-gradient(135deg, #be185d 0%, #9d174d 100%)', color: '#ec4899', shadow: '#831843' },
];

const IntermediateLearn: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useLanguage();
    const [units, setUnits] = React.useState<Unit[]>([]);
    const activeNodeRef = React.useRef<HTMLAnchorElement>(null);

    React.useEffect(() => {
        if (activeNodeRef.current) {
            setTimeout(() => {
                activeNodeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
        }
    }, [units]);


    // Icon mapping for intermediate lessons
    const getLessonIcon = (title: string) => {
        if (!title) return Star;
        const lower = title.toLowerCase();
        if (lower.includes('hotel')) return Buildings;
        if (lower.includes('restaurant') || lower.includes('food') || lower.includes('dining')) return Star;
        if (lower.includes('doctor') || lower.includes('health')) return Stethoscope;
        if (lower.includes('interview') || lower.includes('job') || lower.includes('business')) return Briefcase;
        if (lower.includes('airport') || lower.includes('travel') || lower.includes('flight')) return Airplane;
        if (lower.includes('conversation') || lower.includes('chat')) return ChatCircle;
        if (lower.includes('culture')) return GlobeHemisphereWest;
        return Star;
    };

    React.useEffect(() => {
        const loadUnits = () => {
            // Load intermediate units
            const savedUnits = localStorage.getItem('kurdlingo-intermediate-units');
            if (savedUnits) {
                try {
                    const parsed = JSON.parse(savedUnits);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        setUnits(parsed);
                        return;
                    }
                } catch (e) {
                    console.error('Error parsing saved intermediate units:', e);
                }
            }
            // Fallback to default intermediate units
            setUnits([intermediateUnit1, intermediateUnit2]);
        };

        loadUnits();


        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                loadUnits();

            }
        };

        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'kurdlingo-intermediate-units') {
                loadUnits();
            }
        };

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
    }, [location.key]);

    return (
        <div className="int-learn-page">
            {/* Level Toggle Header */}
            <div className="int-level-header">
                <div className="int-level-tabs">
                    <button
                        className="int-level-tab"
                        onClick={() => navigate('/learn')}
                    >
                        <Star size={18} weight="fill" />
                        Beginner
                    </button>
                    <button
                        className="int-level-tab active"
                    >
                        <Rocket size={18} weight="fill" />
                        Intermediate
                    </button>
                </div>
                <div className="int-level-badge">
                    <Lightning size={16} weight="fill" />
                    <span>Conversation Level</span>
                </div>
            </div>

            {/* ========== MAIN CONTENT ========== */}
            <div className="int-learn-main">
                {units.map((unit, unitIndex) => {
                    const theme = UNIT_THEMES[unitIndex % UNIT_THEMES.length];

                    return (
                        <div className="int-unit-section" key={unit.id}>
                            {/* Unit Header */}
                            <div
                                className="int-unit-header"
                                style={{ background: theme.gradient }}
                            >
                                <div className="int-unit-info">
                                    <h2>{unit.title}</h2>
                                    <p>{unit.description}</p>
                                </div>
                                <button
                                    className="int-btn-guidebook"
                                    onClick={() => navigate(`/guidebook/${unit.id}`)}
                                >
                                    <BookOpenText size={20} weight="fill" />
                                    {t('guidebook') || 'GUIDEBOOK'}
                                </button>
                            </div>

                            {/* Learning Path */}
                            <div className="int-learning-path">
                                {unit.lessons.map((lesson, index) => {
                                    const Icon = getLessonIcon(lesson.title);
                                    const completed = isLessonCompleted(lesson.id);
                                    const unlocked = isLessonUnlocked(lesson.id, unit.lessons);
                                    const isCurrent = unlocked && !completed;
                                    const isLocked = !unlocked;

                                    let positionClass = '';
                                    if (index % 4 === 1) positionClass = 'right';
                                    if (index % 4 === 3) positionClass = 'left';

                                    const handleClick = (e: React.MouseEvent) => {
                                        if (isLocked) e.preventDefault();
                                    };

                                    const lessonPath = `/lesson/${lesson.id}`;

                                    return (
                                        <Link
                                            ref={isCurrent ? activeNodeRef : null}
                                            to={isLocked ? '#' : lessonPath}
                                            key={lesson.id}
                                            className={`int-path-node ${positionClass} ${isCurrent ? 'current' : ''} ${isLocked ? 'locked' : ''} ${completed ? 'completed' : ''}`}
                                            onClick={handleClick}
                                            aria-disabled={isLocked}
                                        >
                                            <div
                                                className="int-node-circle"
                                                style={{
                                                    '--node-bg': isCurrent || completed ? theme.gradient : 'rgba(255,255,255,0.05)',
                                                    '--node-shadow': isCurrent || completed ? theme.shadow : '#2a2a4a',
                                                    '--node-text': isCurrent || completed ? '#ffffff' : '#6b7280',
                                                    '--node-accent': theme.color
                                                } as React.CSSProperties}
                                            >
                                                {isLocked ? (
                                                    <Lock size={32} weight="fill" color="var(--node-text)" />
                                                ) : (
                                                    <Icon size={36} weight="fill" color="var(--node-text)" />
                                                )}

                                                {/* START Bubble */}
                                                {isCurrent && (
                                                    <div className="int-start-bubble" style={{ color: theme.color, borderColor: theme.color }}>
                                                        {t('start') || 'START'}
                                                    </div>
                                                )}

                                                {/* Crown */}
                                                {isCurrent && (
                                                    <div className="int-crown-badge">
                                                        <Crown size={42} weight="fill" color="#fbbf24" style={{ filter: 'drop-shadow(0 2px 0 #b45309)' }} />
                                                    </div>
                                                )}

                                                {/* Checkmark */}
                                                {completed && (
                                                    <div className="int-completed-badge">
                                                        <CheckCircle size={24} weight="fill" color={theme.color} />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="int-node-tooltip">{lesson.title}</div>
                                        </Link>
                                    );
                                })}

                                {/* Trophy */}
                                <div className={`int-path-node trophy-node ${isUnitCompleted(unit.lessons) ? 'completed' : ''}`}>
                                    <div className="int-node-circle">
                                        <Trophy
                                            size={56}
                                            weight="fill"
                                            color={isUnitCompleted(unit.lessons) ? "#fbbf24" : "#4a4a6a"}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* ========== RIGHT SIDEBAR ========== */}
            <div className="int-sidebar-right">
                {/* Challenge Info */}
                <div className="int-glass-panel int-info-card">
                    <div className="int-info-icon">🎯</div>
                    <h3>Conversation Challenges</h3>
                    <p>
                        Each lesson simulates a real-life situation. Practice hotel check-ins,
                        restaurant orders, doctor visits, job interviews, and airport navigation!
                    </p>
                    <div className="int-difficulty-badge">
                        <span>⚡ Advanced Difficulty</span>
                    </div>
                </div>

                {/* Back to Beginner */}
                <div
                    className="int-glass-panel int-back-card"
                    onClick={() => navigate('/learn')}
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 8px 25px rgba(59, 130, 246, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '';
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, #ff9600 0%, #cc7800 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Star size={28} weight="fill" color="#fff" />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#e2e8f0' }}>
                                Beginner Level
                            </h3>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px' }}>
                                Go back to basics
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IntermediateLearn;
