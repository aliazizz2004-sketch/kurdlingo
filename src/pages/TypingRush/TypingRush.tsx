import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RotateCcw, Gauge, Crosshair, Timer, Trophy, ChevronRight, Keyboard } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import './TypingRush.css';

const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
        || ('ontouchstart' in window)
        || (navigator.maxTouchPoints > 0);
};

// ===== PASSAGE DATA =====
interface Passage {
    id: string;
    title: string;
    titleKu: string;
    text: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    wordCount: number;
}

const PASSAGES: Passage[] = [
    {
        id: 'p1',
        title: 'Daily Greetings',
        titleKu: 'سڵاوی ڕۆژانە',
        text: 'Hello my friend. How are you today? I am doing very well thank you. The weather is nice today. I love the morning sun. It makes me happy. Have a great day. See you later. Take care of yourself.',
        difficulty: 'beginner',
        wordCount: 38,
    },
    {
        id: 'p2',
        title: 'At the Market',
        titleKu: 'لە بازاڕدا',
        text: 'I go to the market every morning. I need to buy some fresh bread and milk. The fruits look very good today. How much are the apples? They are two dollars for one bag. I also want some tea and rice. Thank you for your help. Goodbye.',
        difficulty: 'beginner',
        wordCount: 47,
    },
    {
        id: 'p3',
        title: 'My Family',
        titleKu: 'خێزانەکەم',
        text: 'My family is very big. I have two brothers and three sisters. My mother is a teacher at the school. My father works at the hospital. We live in a beautiful house near the mountain. Every evening we eat dinner together. My grandmother makes the best soup. I love my family very much.',
        difficulty: 'beginner',
        wordCount: 52,
    },
    {
        id: 'p4',
        title: 'A Journey to Erbil',
        titleKu: 'گەشتێک بۆ هەولێر',
        text: 'Last summer I traveled to Erbil with my friend. The city is very beautiful and full of history. We visited the old citadel in the center of the city. The market was busy with people selling food and clothing. We tried many traditional dishes at the restaurant. The weather was hot but we had a wonderful time. I want to go back again next year. Traveling is the best way to learn about new places and cultures.',
        difficulty: 'intermediate',
        wordCount: 74,
    },
    {
        id: 'p5',
        title: 'Learning Languages',
        titleKu: 'فێربوونی زمان',
        text: 'Learning a new language takes time and practice. You need to read books and listen to music in that language. Speaking with other people is very important. I study Kurdish every day for one hour. I write new words in my notebook and review them every evening. My teacher says I am making good progress. Language connects people from different countries and helps them understand each other. Never stop learning because knowledge is the key to a better future.',
        difficulty: 'intermediate',
        wordCount: 76,
    },
    {
        id: 'p6',
        title: 'The Four Seasons',
        titleKu: 'چوار وەرز',
        text: 'Kurdistan has four beautiful seasons throughout the year. In spring the mountains turn green and flowers bloom everywhere. Summer brings warm sunshine and long days perfect for outdoor activities. Autumn paints the trees in golden and red colors while the air becomes cool and crisp. Winter covers the high mountains with white snow and families gather around warm fires telling stories. Each season brings its own special beauty and traditions that the Kurdish people celebrate with joy and togetherness.',
        difficulty: 'advanced',
        wordCount: 79,
    },
    {
        id: 'p7',
        title: 'Technology and Education',
        titleKu: 'تەکنەلۆژیا و پەروەردە',
        text: 'Technology has changed the way we learn and communicate with each other. Students can now access information from anywhere in the world using their computers and phones. Online classes make education available to people in remote villages and small towns. Teachers use digital tools to create interactive lessons that make learning more interesting and fun. However we must remember that technology is only a tool and the most important thing is the desire to learn and grow. The future belongs to those who combine traditional knowledge with modern skills and never stop asking questions about the world around them.',
        difficulty: 'advanced',
        wordCount: 99,
    },
];

// ===== COMPONENT =====
const TypingRush = () => {
    const navigate = useNavigate();
    const { language } = useLanguage();
    const isKu = language === 'ckb';
    const [isMobile] = useState(isMobileDevice);
    const [keyboardOpen, setKeyboardOpen] = useState(false);
    const [viewportHeight, setViewportHeight] = useState(window.innerHeight);
    const [showMobileWarning, setShowMobileWarning] = useState(isMobile);

    // Screens
    const [screen, setScreen] = useState<'menu' | 'playing' | 'results'>('menu');
    const [selectedPassage, setSelectedPassage] = useState<Passage | null>(null);

    // Typing state
    const [charIndex, setCharIndex] = useState(0);
    const [errors, setErrors] = useState<Set<number>>(new Set());
    const [isStarted, setIsStarted] = useState(false);
    const [isFinished, setIsFinished] = useState(false);

    // Stats
    const [wpm, setWpm] = useState(0);
    const [accuracy, setAccuracy] = useState(100);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [totalKeystrokes, setTotalKeystrokes] = useState(0);
    const [correctKeystrokes, setCorrectKeystrokes] = useState(0);

    // High scores per passage
    const [highScores, setHighScores] = useState<Record<string, { wpm: number; accuracy: number }>>(() => {
        try { return JSON.parse(localStorage.getItem('tr-hs') || '{}'); } catch { return {}; }
    });

    // Refs
    const startTimeRef = useRef(0);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const textDisplayRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Start game
    const startGame = useCallback((passage: Passage) => {
        setSelectedPassage(passage);
        setScreen('playing');
        setCharIndex(0);
        setErrors(new Set());
        setIsStarted(false);
        setIsFinished(false);
        setWpm(0);
        setAccuracy(100);
        setElapsedTime(0);
        setTotalKeystrokes(0);
        setCorrectKeystrokes(0);
        startTimeRef.current = 0;
        if (timerRef.current) clearInterval(timerRef.current);
        setTimeout(() => {
            if (inputRef.current) {
                inputRef.current.value = ' ';
                inputRef.current.focus();
                if (isMobile) inputRef.current.click();
            }
            containerRef.current?.focus();
        }, 300);
    }, [isMobile]);

    // Timer
    useEffect(() => {
        if (isStarted && !isFinished) {
            timerRef.current = setInterval(() => {
                const now = Date.now();
                const elapsed = (now - startTimeRef.current) / 1000;
                setElapsedTime(elapsed);
            }, 100);
            return () => { if (timerRef.current) clearInterval(timerRef.current); };
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [isStarted, isFinished]);

    // Scroll active letter into view
    useEffect(() => {
        if (!textDisplayRef.current) return;
        const activeChar = textDisplayRef.current.querySelector('.tr-char.current');
        if (activeChar) {
            activeChar.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [charIndex]);

    // Process a single character input (shared by desktop keydown + mobile onInput)
    const processChar = useCallback((key: string) => {
        if (screen !== 'playing' || isFinished || !selectedPassage) return;

        // Start timer on first keystroke
        if (!isStarted) {
            setIsStarted(true);
            startTimeRef.current = Date.now();
        }

        const expected = selectedPassage.text[charIndex].toLowerCase();
        const total = totalKeystrokes + 1;
        setTotalKeystrokes(total);

        if (key === expected) {
            // Correct
            const correct = correctKeystrokes + 1;
            setCorrectKeystrokes(correct);
            const nextIndex = charIndex + 1;
            setCharIndex(nextIndex);

            // Update WPM
            const elapsed = (Date.now() - startTimeRef.current) / 60000;
            if (elapsed > 0.02) setWpm(Math.round((correct / 5) / elapsed));

            // Update accuracy
            setAccuracy(Math.round((correct / total) * 100));

            // Check if finished
            if (nextIndex >= selectedPassage.text.length) {
                setIsFinished(true);
                const finalElapsed = (Date.now() - startTimeRef.current) / 60000;
                const finalWpm = Math.round((correct / 5) / finalElapsed);
                const finalAcc = Math.round((correct / total) * 100);
                setWpm(finalWpm);
                setAccuracy(finalAcc);

                // Save high score
                const prev = highScores[selectedPassage.id];
                if (!prev || finalWpm > prev.wpm) {
                    const newHS = { ...highScores, [selectedPassage.id]: { wpm: finalWpm, accuracy: finalAcc } };
                    setHighScores(newHS);
                    localStorage.setItem('tr-hs', JSON.stringify(newHS));
                }

                setTimeout(() => setScreen('results'), 800);
            }
        } else {
            // Incorrect
            setErrors(prev => new Set(prev).add(charIndex));
            setAccuracy(Math.round((correctKeystrokes / total) * 100));
        }
    }, [screen, isFinished, selectedPassage, charIndex, isStarted, totalKeystrokes, correctKeystrokes, highScores]);

    // Mobile input handler via hidden input's onInput
    const handleMobileInput = useCallback((e: React.FormEvent<HTMLInputElement>) => {
        const input = e.currentTarget;
        const val = input.value;
        const typed = val.replace(/^ /, '');
        if (typed.length > 0) {
            for (let i = 0; i < typed.length; i++) {
                processChar(typed[i].toLowerCase());
            }
        }
        input.value = ' ';
    }, [processChar]);

    // Desktop keyboard handler
    useEffect(() => {
        if (screen !== 'playing' || isFinished) return;

        const handler = (e: KeyboardEvent) => {
            if (e.metaKey || e.ctrlKey || e.altKey) return;
            if (e.key === 'Escape') { setScreen('menu'); return; }
            if (e.key.length !== 1) return;
            e.preventDefault();
            processChar(e.key.toLowerCase());
        };

        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [screen, isFinished, processChar]);

    useEffect(() => {
        if (screen === 'playing') {
            containerRef.current?.focus();
            if (isMobile && inputRef.current) {
                inputRef.current.value = ' ';
                inputRef.current.focus();
            }
        }
    }, [screen, isMobile]);

    // Track mobile keyboard visibility via visualViewport
    useEffect(() => {
        if (!isMobile) return;
        const vv = window.visualViewport;
        if (!vv) return;

        const onResize = () => {
            const currentHeight = vv.height;
            const fullHeight = window.innerHeight;
            const kbOpen = fullHeight - currentHeight > 100;
            setKeyboardOpen(kbOpen);
            setViewportHeight(currentHeight);
        };

        vv.addEventListener('resize', onResize);
        vv.addEventListener('scroll', onResize);
        onResize();
        return () => {
            vv.removeEventListener('resize', onResize);
            vv.removeEventListener('scroll', onResize);
        };
    }, [isMobile]);

    // Format time
    const formatTime = (s: number) => {
        const mins = Math.floor(s / 60);
        const secs = Math.floor(s % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // ===== MENU =====
    if (screen === 'menu') {
        const grouped = {
            beginner: PASSAGES.filter(p => p.difficulty === 'beginner'),
            intermediate: PASSAGES.filter(p => p.difficulty === 'intermediate'),
            advanced: PASSAGES.filter(p => p.difficulty === 'advanced'),
        };

        const diffLabels = {
            beginner: { en: 'Beginner', ku: 'دەستپێکەر', color: '#4ade80' },
            intermediate: { en: 'Intermediate', ku: 'ناوەندی', color: '#f59e0b' },
            advanced: { en: 'Advanced', ku: 'پێشکەوتوو', color: '#ef4444' },
        };

        return (
            <div className="tr-root tr-menu-screen">
                {showMobileWarning && (
                    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                        <div style={{ background: '#1e293b', padding: '24px', borderRadius: '16px', border: '1px solid #334155', textAlign: 'center', maxWidth: '320px', direction: isKu ? 'rtl' : 'ltr' }}>
                            <h3 style={{ margin: '0 0 12px', fontSize: '1.2rem', color: '#ff9600' }}>{isKu ? 'ئاگاداری' : 'Notice'}</h3>
                            <p style={{ margin: '0 0 20px', fontSize: '0.95rem', color: '#e2e8f0', lineHeight: 1.5 }}>
                                {isKu ? 'بۆ باشترین ئەزموون و تایپکردن، تکایە کۆمپیوتەر بەکاربهێنە بۆ ئەم یارییە.' : 'For the best typing experience, please use a computer for this game.'}
                            </p>
                            <button onClick={() => setShowMobileWarning(false)} style={{ background: 'linear-gradient(135deg, #ff9600, #cc7800)', border: 'none', padding: '10px 20px', borderRadius: '8px', color: 'white', fontWeight: 'bold', width: '100%', cursor: 'pointer' }}>
                                {isKu ? 'تێگەیشتم' : 'Got it'}
                            </button>
                        </div>
                    </div>
                )}
                <div className="tr-menu-content">
                    <button className="tr-back-btn" onClick={() => navigate('/learn')}>
                        <ArrowLeft size={18} /> {isKu ? 'گەڕانەوە' : 'Back'}
                    </button>

                    <div className="tr-menu-hero">
                        <div className="tr-hero-icon"><Keyboard size={36} /></div>
                        <h1 className="tr-menu-title">Typing Rush</h1>
                        <p className="tr-menu-sub">
                            {isKu ? 'پاراگرافەکە بنووسە بە خێرایی و وردی!' : 'Type the passage as fast and accurately as you can!'}
                        </p>
                    </div>

                    {(Object.keys(grouped) as Array<keyof typeof grouped>).map(diff => (
                        <div key={diff} className="tr-diff-section">
                            <h2 className="tr-diff-title" style={{ color: diffLabels[diff].color }}>
                                {isKu ? diffLabels[diff].ku : diffLabels[diff].en}
                            </h2>
                            <div className="tr-passage-list">
                                {grouped[diff].map(p => {
                                    const hs = highScores[p.id];
                                    return (
                                        <button key={p.id} className="tr-passage-card" onClick={() => startGame(p)}>
                                            <div className="tr-passage-info">
                                                <div className="tr-passage-name">{isKu ? p.titleKu : p.title}</div>
                                                <div className="tr-passage-meta">
                                                    <span>{p.wordCount} {isKu ? 'وشە' : 'words'}</span>
                                                    {hs && <span className="tr-hs-tag"><Trophy size={10} /> {hs.wpm} WPM</span>}
                                                </div>
                                            </div>
                                            <ChevronRight size={16} className="tr-passage-arrow" />
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // ===== RESULTS =====
    if (screen === 'results' && selectedPassage) {
        const grade = wpm >= 80 ? 'S' : wpm >= 60 ? 'A' : wpm >= 40 ? 'B' : wpm >= 25 ? 'C' : 'D';
        const gradeColors: Record<string, string> = { S: '#a78bfa', A: '#4ade80', B: '#38bdf8', C: '#f59e0b', D: '#ef4444' };
        const isNewHS = (() => {
            const prev = highScores[selectedPassage.id];
            return prev && prev.wpm === wpm;
        })();

        return (
            <div className="tr-root tr-results-screen">
                <div className="tr-results-panel">
                    {isNewHS && <div className="tr-new-record">{isKu ? 'تۆمارێکی نوێ!' : 'NEW BEST'}</div>}

                    <div className="tr-grade" style={{ color: gradeColors[grade], borderColor: gradeColors[grade] }}>{grade}</div>

                    <h1 className="tr-results-title">
                        {isKu ? 'تەواو بوو!' : 'PASSAGE COMPLETE'}
                    </h1>
                    <p className="tr-results-passage-name">{isKu ? selectedPassage.titleKu : selectedPassage.title}</p>

                    <div className="tr-results-grid">
                        <div className="tr-rstat">
                            <Gauge size={18} />
                            <span className="tr-rstat-val">{wpm}</span>
                            <span className="tr-rstat-lbl">WPM</span>
                        </div>
                        <div className="tr-rstat">
                            <Crosshair size={18} />
                            <span className="tr-rstat-val">{accuracy}%</span>
                            <span className="tr-rstat-lbl">{isKu ? 'وردی' : 'Accuracy'}</span>
                        </div>
                        <div className="tr-rstat">
                            <Timer size={18} />
                            <span className="tr-rstat-val">{formatTime(elapsedTime)}</span>
                            <span className="tr-rstat-lbl">{isKu ? 'کات' : 'Time'}</span>
                        </div>
                    </div>

                    <div className="tr-results-btns">
                        <button className="tr-btn tr-btn-primary" onClick={() => startGame(selectedPassage)}>
                            <RotateCcw size={16} /> {isKu ? 'دووبارە' : 'Retry'}
                        </button>
                        <button className="tr-btn tr-btn-secondary" onClick={() => setScreen('menu')}>
                            {isKu ? 'پاساژەکان' : 'Passages'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ===== PLAYING =====
    if (!selectedPassage) return null;

    const text = selectedPassage.text.toLowerCase();
    const progress = (charIndex / text.length) * 100;

    return (
        <div className={`tr-root tr-playing ${keyboardOpen ? 'tr-keyboard-open' : ''}`}
            ref={containerRef}
            tabIndex={0}
            style={keyboardOpen ? { height: `${viewportHeight}px` } : undefined}
            onClick={() => {
                if (inputRef.current) {
                    inputRef.current.value = ' ';
                    inputRef.current.focus();
                    if (isMobile) inputRef.current.click();
                }
            }}
        >
            {/* HUD */}
            <header className="tr-hud">
                <button className="tr-hud-back" onClick={() => setScreen('menu')}>
                    <ArrowLeft size={18} />
                </button>

                <div className="tr-hud-center">
                    <div className="tr-progress-bar">
                        <div className="tr-progress-fill" style={{ width: `${progress}%` }} />
                    </div>
                    <span className="tr-hud-passage-name">{isKu ? selectedPassage.titleKu : selectedPassage.title}</span>
                </div>

                <div className="tr-hud-stats">
                    <div className="tr-hud-stat wpm-stat">
                        <Gauge size={14} />
                        <span>{wpm}</span>
                    </div>
                    <div className="tr-hud-stat acc-stat">
                        <Crosshair size={14} />
                        <span>{accuracy}%</span>
                    </div>
                    <div className="tr-hud-stat time-stat">
                        <Timer size={14} />
                        <span>{formatTime(elapsedTime)}</span>
                    </div>
                </div>
            </header>

            {/* Text display */}
            <div className="tr-text-area">
                {!isStarted && (
                    <div className="tr-start-hint">
                        {isKu ? 'دەستبکە بە تایپکردن...' : 'Start typing to begin...'}
                    </div>
                )}
                <div className="tr-text-display" ref={textDisplayRef}>
                    {text.split('').map((char, i) => {
                        let cls = 'tr-char';
                        if (i < charIndex) {
                            cls += errors.has(i) ? ' typed error' : ' typed correct';
                        } else if (i === charIndex) {
                            cls += ' current';
                            if (errors.has(i)) cls += ' tr-error-active';
                        } else {
                            cls += ' pending';
                        }
                        // Word boundary highlight
                        if (char === ' ') cls += ' space-char';

                        return (
                            <span key={i} className={cls}>
                                {char === ' ' ? '\u00A0' : char}
                            </span>
                        );
                    })}
                </div>
            </div>

            {/* Live keyboard hint */}
            {charIndex < text.length && !keyboardOpen && (
                <div className="tr-next-key">
                    <span className="tr-next-label">{isKu ? 'دوای:' : 'Next:'}</span>
                    <span className="tr-next-char">
                        {text[charIndex] === ' ' ? '⎋' : text[charIndex]}
                    </span>
                </div>
            )}

            {/* Mobile tap prompt */}
            {isMobile && screen === 'playing' && !keyboardOpen && (
                <div className="tr-mobile-tap-hint" onClick={() => {
                    if (inputRef.current) {
                        inputRef.current.value = ' ';
                        inputRef.current.focus();
                        inputRef.current.click();
                    }
                }}>
                    {isKu ? 'لێرە دابگرە بۆ تایپکردن' : 'Tap here to type'}
                </div>
            )}

            {/* Hidden input for mobile keyboard */}
            <input
                ref={inputRef}
                type="text"
                className="tr-hidden-input"
                autoComplete="off"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                enterKeyHint="go"
                inputMode="text"
                onInput={handleMobileInput}
                onBlur={() => {
                    if (isMobile && screen === 'playing' && !isFinished) {
                        setTimeout(() => {
                            if (inputRef.current) {
                                inputRef.current.value = ' ';
                                inputRef.current.focus();
                            }
                        }, 100);
                    }
                }}
            />
        </div>
    );
};

export default TypingRush;
