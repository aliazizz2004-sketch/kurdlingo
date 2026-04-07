// @ts-nocheck
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Volume2, Star, Info, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import useTextToSpeech from '../../hooks/useTextToSpeech';
import { unit1 } from '../../data/courses/unit1';
import { unit2 } from '../../data/courses/unit2';
import { unit3 } from '../../data/courses/unit3';
import { unit4 } from '../../data/courses/unit4';
import { unit5 } from '../../data/courses/unit5';
import { unit6 } from '../../data/courses/unit6';
import { intermediateUnit1 } from '../../data/courses/intermediate-unit1';
import { intermediateUnit2 } from '../../data/courses/intermediate-unit2';
import { ColorfulIcon } from '../../components/ColorfulIcon/ColorfulIcon';
import './Guidebook.css';

const Guidebook = () => {
    const { unitId } = useParams();
    const navigate = useNavigate();
    const [unit, setUnit] = useState(null);
    const { speak } = useTextToSpeech();

    // Helper to separate emoji from text for 3D icon replacement
    const splitEmoji = (text: string) => {
        if (!text) return { emoji: '', text: '' };
        const match = text.match(/^([\s\p{Extended_Pictographic}]+)(.*)/u);
        if (match) {
            return {
                emoji: match[1].trim(),
                text: match[2].trim()
            };
        }
        return { emoji: '', text };
    };

    useEffect(() => {
        const savedUnitsStr = localStorage.getItem('kurdlingo-units');
        const defaultUnits = [unit1, unit2, unit3, unit4, unit5, unit6, intermediateUnit1 as any, intermediateUnit2 as any];

        let allUnits = defaultUnits;
        if (savedUnitsStr) {
            try {
                let savedUnits = JSON.parse(savedUnitsStr);
                const missingUnits = defaultUnits.filter(def => !savedUnits.find((su: any) => su.id === def.id));
                if (missingUnits.length > 0) {
                    savedUnits = [...savedUnits, ...missingUnits];
                }
                
                allUnits = savedUnits.map((savedUnit: any) => {
                    const defaultUnit = defaultUnits.find(du => du.id === savedUnit.id);
                    return {
                        ...defaultUnit,
                        ...savedUnit,
                        guidebook: defaultUnit ? defaultUnit.guidebook : savedUnit.guidebook
                    };
                });
            } catch (e) {
                // Ignore parse errors, fallback was set
            }
        }

        const foundUnit = allUnits.find(u => u.id == unitId);
        setUnit(foundUnit);
    }, [unitId]);

    if (!unit) return (
        <div className="guidebook-loading">
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
                <BookOpen size={48} className="text-primary" />
            </motion.div>
        </div>
    );

    // Define unit-specific color schemes
    const unitColors = {
        'unit-1': {
            primary: '#ff9600',
            primaryDark: '#FF6A00',
            gradient: 'linear-gradient(135deg, #ff9600 0%, #FF6A00 100%)',
            light: '#fff8eb',
            accent: '#ffedd5'
        },
        'unit-2': {
            primary: '#1cb0f6',
            primaryDark: '#0c8fd6',
            gradient: 'linear-gradient(135deg, #1cb0f6 0%, #0c8fd6 100%)',
            light: '#f0f9ff',
            accent: '#dbeafe'
        },
        'unit-3': {
            primary: '#ff4b4b',
            primaryDark: '#d33131',
            gradient: 'linear-gradient(135deg, #ff4b4b 0%, #d33131 100%)',
            light: '#fef2f2',
            accent: '#fee2e2'
        },
        'unit-4': {
            primary: '#ce82ff',
            primaryDark: '#a560ff',
            gradient: 'linear-gradient(135deg, #ce82ff 0%, #a560ff 100%)',
            light: '#faf5ff',
            accent: '#f3e8ff'
        },
        'unit-5': {
            primary: '#ff9600',
            primaryDark: '#e58700',
            gradient: 'linear-gradient(135deg, #ff9600 0%, #e58700 100%)',
            light: '#fffef0',
            accent: '#ffedd5'
        },
        'unit-6': {
            primary: '#2b2b2b',
            primaryDark: '#1a1a1a',
            gradient: 'linear-gradient(135deg, #444 0%, #222 100%)',
            light: '#f5f5f5',
            accent: '#e5e5e5'
        }
    };

    const currentColors = unitColors[unit.id] || unitColors['unit-1'];

    const guidebook = unit.guidebook || {
        content: "No guidebook content available yet for this unit.",
        keyPhrases: []
    };

    // Helper to render specific visual elements
    const renderVisual = (visual) => {
        if (!visual) return null;

        switch (visual.type) {
            case 'sentence-structure':
                return (
                    <div className="visual-block sentence-structure">
                        <div className="sentence-row english" onClick={() => speak(visual.data.english.map(p => p.word).join(' '), undefined, undefined, true)}>
                            {visual.data.english.map((part, i) => (
                                <div key={i} className="word-block" style={{ borderColor: part.color }}>
                                    <span className="label" style={{ color: part.color }}>{part.label}</span>
                                    <span className="word">{part.word}</span>
                                </div>
                            ))}
                            <Volume2 size={16} className="speech-hint" />
                        </div>
                        <div className="arrow-divider">
                            <ColorfulIcon emoji="⬇️" size={24} />
                            <span style={{ fontSize: '0.9rem', opacity: 0.5, margin: '0 0.5rem' }}>vs</span>
                            <ColorfulIcon emoji="⬇️" size={24} />
                        </div>
                        <div className="sentence-row kurdish">
                            {visual.data.kurdish.map((part, i) => (
                                <div key={i} className="word-block" style={{ borderColor: part.color }}>
                                    <span className="label" style={{ color: part.color }}>{part.label}</span>
                                    <span className="word">{part.word}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'pronoun-grid':
                return (
                    <div className="visual-block pronoun-grid">
                        {visual.data.map((item, i) => (
                            <div key={i} className="pronoun-card clickable" onClick={() => speak(item.english, undefined, undefined, true)}>
                                <div className="p-english">{item.english} <Volume2 size={12} className="card-voice-hint" /></div>
                                <div className="p-kurdish">{item.kurdish}</div>
                                <div className="p-icon"><ColorfulIcon emoji={item.icon} size={40} /></div>
                            </div>
                        ))}
                    </div>
                );
            case 'timeline':
                return (
                    <div className="visual-block timeline-visual">
                        <div className="timeline-line"></div>
                        <div className="timeline-points">
                            {visual.data.map((point, i) => (
                                <div key={i} className="t-point clickable" onClick={() => speak(point.label, undefined, undefined, true)}>
                                    <div className="t-dot"></div>
                                    <div className="t-label">{point.label}</div>
                                    <div className="t-sub">{point.sub}</div>
                                    <Volume2 size={10} className="t-voice-hint" />
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'comparison':
                return (
                    <div className="visual-block comparison-visual">
                        {visual.data.map((item, i) => (
                            <div key={i} className="comp-item clickable" onClick={() => speak(item.english, undefined, undefined, true)}>
                                <div
                                    className="comp-circle"
                                    style={{
                                        width: `${40 + (i * 20)}px`,
                                        height: `${40 + (i * 20)}px`,
                                        opacity: 0.5 + (i * 0.2)
                                    }}
                                >
                                    <ColorfulIcon emoji={item.icon} size={24 + (i * 12)} />
                                </div>
                                <div className="comp-text">
                                    <span className="comp-eng">{item.english} <Volume2 size={10} /></span>
                                    <span className="comp-kur">{item.kurdish}</span>
                                </div>
                                {i < visual.data.length - 1 && <div className="comp-arrow">➜</div>}
                            </div>
                        ))}
                    </div>
                );
            case 'conjugation':
                return (
                    <div className="visual-block conjugation-table">
                        <div className="conj-header">
                            <span>Subject</span>
                            <span>Verb Form</span>
                        </div>
                        {visual.data.map((row, i) => (
                            <div key={i} className="conj-row clickable" onClick={() => speak(`${row.subject} ${row.verb}`, undefined, undefined, true)}>
                                <div className="conj-subject">
                                    <span className="eng">{row.subject}</span>
                                    <span className="kur">{row.subKurdish}</span>
                                </div>
                                <div className="conj-verb">{row.verb} <Volume2 size={12} /></div>
                            </div>
                        ))}
                    </div>
                );
            case 'dialogue':
                return (
                    <div className="visual-block chat-interface">
                        {visual.data.map((msg, i) => (
                            <div key={i}
                                className={`chat-bubble ${msg.speaker === 'A' ? 'left' : 'right'} clickable`}
                                onClick={() => speak(msg.english, undefined, undefined, true)}
                            >
                                <div className="chat-avatar"><ColorfulIcon emoji={msg.avatar} size={36} /></div>
                                <div className="chat-content">
                                    <div className="chat-english">{msg.english} <Volume2 size={12} /></div>
                                    <div className="chat-kurdish">{msg.kurdish}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                );
            default:
                return null;
        }
    };

    const renderSection = (section, index) => {
        const { emoji, text: titleText } = splitEmoji(section.title);
        
        // Define fallback icons if no emoji in title
        const getIcon = () => {
             if (emoji) return emoji;
             if (section.id === 'pronunciation') return "🔊";
             if (section.id === 'grammar') return "💡";
             if (section.id === 'culture') return "🌍";
             if (section.id === 'vocabulary') return "⭐";
             return "📖";
        };

        return (
            <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`guide-card ${section.type || ''}`}
            >
                <div className="card-header">
                    <ColorfulIcon emoji={getIcon()} size={32} className="card-icon" />
                    <h2>{titleText || section.title}</h2>
                </div>

                <div className="card-content">
                    <p>{section.content}</p>

                    {/* Render Custom Visuals */}
                    {section.visual && renderVisual(section.visual)}

                    {/* Render Items (e.g. Pronunciation) */}
                    {section.items && (
                        <div className="items-grid">
                            {section.items.map((item, i) => (
                                <div key={i} className="info-item clickable" onClick={() => speak(item.term, undefined, undefined, true)}>
                                    <span className="term">{item.term} <Volume2 size={12} /></span>
                                    <span className="definition">{item.definition}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Render Subsections (e.g. Grammar) */}
                    {section.subsections && (
                        <div className="subsections">
                            {section.subsections.map((sub, i) => (
                                <div key={i} className="subsection">
                                    <h3>{sub.subtitle}</h3>
                                    <p>{sub.text}</p>

                                    {/* Subsections can also have visuals */}
                                    {sub.visual && renderVisual(sub.visual)}

                                    {sub.list && (
                                        <ul className="feature-list">
                                            {sub.list.map((li, j) => <li key={j}>{li}</li>)}
                                        </ul>
                                    )}
                                    {sub.example && (
                                        <div className="example-box clickable" onClick={() => speak(sub.example.english, undefined, undefined, true)}>
                                            <div className="target-text" dir="ltr">
                                                {sub.example.english}
                                                <Volume2 size={16} className="example-voice" />
                                            </div>
                                            <div className="native-text">{sub.example.kurdish}</div>
                                            <div className="note-text">{sub.example.transliteration}</div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </motion.div>
        );
    };

    return (
        <div
            className="guidebook-page"
            style={{
                ['--unit-primary']: currentColors.primary,
                ['--unit-primary-dark']: currentColors.primaryDark,
                ['--unit-light']: currentColors.light,
                ['--unit-accent']: currentColors.accent
            }}
        >
            <header className="guidebook-hero" style={{ background: currentColors.gradient }}>
                <div className="hero-content">
                    <button onClick={() => navigate('/learn')} className="back-btn">
                        <ArrowLeft size={24} />
                    </button>
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="title-group"
                    >
                        <h1>{unit.title} Guidebook</h1>
                        <p>{unit.description}</p>
                    </motion.div>
                    <ColorfulIcon emoji="📖" size={80} className="hero-icon" />
                </div>
                <div className="hero-wave">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
                        <path fill="#ffffff" fillOpacity="1" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,160C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                    </svg>
                </div>
            </header>

            <main className="guidebook-body" dir="rtl">
                {/* Introduction */}
                {guidebook.introduction && (
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="intro-section"
                    >
                        <p>{guidebook.introduction}</p>
                    </motion.section>
                )}

                {/* Dynamic Sections */}
                {guidebook.sections ? (
                    guidebook.sections.map((section, index) => renderSection(section, index))
                ) : (
                    // Fallback for legacy string content
                    <div className="guide-card">
                        <div className="card-content">
                            {typeof guidebook.content === 'string' && guidebook.content.split('\n').map((line, i) => (
                                <p key={i}>{line}</p>
                            ))}
                        </div>
                    </div>
                )}

                {/* Key Phrases */}
                {guidebook.keyPhrases && guidebook.keyPhrases.length > 0 && (
                    <section className="phrases-section">
                        <div className="section-header">
                            <ColorfulIcon emoji="⭐" size={40} className="section-icon" />
                            <h2>Key Phrases</h2>
                        </div>
                        <div className="phrases-grid">
                            {guidebook.keyPhrases.map((phrase, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.05 }}
                                    className="phrase-card clickable"
                                    onClick={() => speak(phrase.english, undefined, undefined, true)}
                                >
                                    <div className="phrase-main">
                                        <span className="target-lang" dir="ltr">
                                            {phrase.english}
                                            <Volume2 size={16} className="phrase-voice" />
                                        </span>
                                        <span className="native-lang">{phrase.kurdish}</span>
                                    </div>
                                    {phrase.pronunciation && (
                                        <div className="phrase-pronunciation">
                                            <span>{phrase.pronunciation}</span>
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
};

export default Guidebook;
