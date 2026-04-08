import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Star, Crosshair, Gauge, RotateCcw } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { gameLevels, GameLevel, SpaceWord } from '../../data/spaceGameWords';
import { SpaceshipSvg, AsteroidSvg, PlanetSaturnSvg, PlanetEarthSvg, PlanetRedSvg, PlanetIceSvg, StarSvg } from './SpaceAssets';
import './SpaceTypingGame.css';

const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
        || ('ontouchstart' in window)
        || (navigator.maxTouchPoints > 0);
};



const SHOT_SOUNDS = [
    '/spaceship%20sound/2d_game_space_ship_f_%232-1770984748376.mp3',
    '/spaceship%20sound/2d_game_space_ship_f_%233-1770984833213.mp3'
];
const ASSET_POOL = [
    { component: AsteroidSvg, scale: 0.85 },
    { component: AsteroidSvg, scale: 1.0 },
    { component: PlanetSaturnSvg, scale: 1.2 },
    { component: PlanetEarthSvg, scale: 1.05 },
    { component: PlanetRedSvg, scale: 1.0 },
    { component: PlanetIceSvg, scale: 0.9 },
    { component: StarSvg, scale: 0.7 },
];

interface FallingObject {
    id: string;
    word: SpaceWord;
    x: number;
    y: number;
    baseX: number;
    rotation: number;
    rotationSpeed: number;
    oscillationOffset: number;
    oscillationSpeed: number;
    oscillationAmp: number;
    assetIndex: number;
    speed: number;
    isDestroying: boolean;
    typedProgress: number;
}

interface Particle {
    id: string;
    x: number;
    y: number;
    color: string;
    vx: number;
    vy: number;
    life: number;
    size: number;
}

interface Laser {
    id: string;
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    createdAt: number;
}

interface ScorePopup {
    id: string;
    x: number;
    y: number;
    value: number;
    createdAt: number;
}

const SpaceTypingGame = () => {
    const navigate = useNavigate();
    const { language } = useLanguage();
    const isKu = language === 'ckb';
    const [isMobile] = useState(isMobileDevice);
    const [keyboardOpen, setKeyboardOpen] = useState(false);
    const [viewportHeight, setViewportHeight] = useState(window.innerHeight);
    const [showMobileWarning, setShowMobileWarning] = useState(isMobile);

    // Core state
    const [gameState, setGameState] = useState<'menu' | 'playing' | 'results'>('menu');
    const [selectedLevel, setSelectedLevel] = useState<GameLevel | null>(null);
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [objects, setObjects] = useState<FallingObject[]>([]);
    const [wordIndex, setWordIndex] = useState(0);
    const [wordsCleared, setWordsCleared] = useState(0);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [streak, setStreak] = useState(0);
    const [maxStreak, setMaxStreak] = useState(0);
    const [accuracy, setAccuracy] = useState({ hits: 0, misses: 0 });
    const [wpm, setWpm] = useState(0);

    // Visual
    const [particles, setParticles] = useState<Particle[]>([]);
    const [lasers, setLasers] = useState<Laser[]>([]);
    const [scorePopups, setScorePopups] = useState<ScorePopup[]>([]);
    const [screenFlash, setScreenFlash] = useState('');
    const [shipAngle, setShipAngle] = useState(0); // Ship rotation in degrees
    const [highScores, setHighScores] = useState<Record<string, number>>(() => {
        try { return JSON.parse(localStorage.getItem('stg-hs') || '{}'); } catch { return {}; }
    });

    // Stars
    const [bgStars] = useState(() =>
        Array.from({ length: 120 }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            layer: Math.floor(Math.random() * 3) + 1,
            delay: Math.random() * 8,
        }))
    );

    // Refs
    const objectsRef = useRef<FallingObject[]>([]);
    const livesRef = useRef(3);
    const inputRef = useRef<HTMLInputElement>(null);
    const gameStartTime = useRef(0);
    const totalCharsTyped = useRef(0);
    const wordIndexRef = useRef(0);
    const scoreRef = useRef(0);
    const uidRef = useRef(0);

    useEffect(() => { objectsRef.current = objects; }, [objects]);
    useEffect(() => { livesRef.current = lives; }, [lives]);
    useEffect(() => { wordIndexRef.current = wordIndex; }, [wordIndex]);
    useEffect(() => { scoreRef.current = score; }, [score]);

    // Track ship angle toward active target
    useEffect(() => {
        if (!activeId) { setShipAngle(0); return; }
        const target = objectsRef.current.find(o => o.id === activeId);
        if (!target) { setShipAngle(0); return; }

        const shipX = window.innerWidth / 2;
        const shipY = window.innerHeight - 80;
        const dx = target.x - shipX;
        const dy = target.y - shipY; // always negative (target is above)
        const angle = Math.atan2(dx, -dy) * (180 / Math.PI); // 0 = straight up
        setShipAngle(Math.max(-45, Math.min(45, angle)));
    }, [activeId, objects]);

    // ===== GAME CONTROL =====
    const startGame = useCallback((level: GameLevel) => {
        setSelectedLevel(level);
        setGameState('playing');
        setScore(0);
        scoreRef.current = 0;
        setLives(3);
        livesRef.current = 3;
        setObjects([]);
        objectsRef.current = [];
        setWordIndex(0);
        wordIndexRef.current = 0;
        setWordsCleared(0);
        setActiveId(null);
        setStreak(0);
        setMaxStreak(0);
        setAccuracy({ hits: 0, misses: 0 });
        setWpm(0);
        setParticles([]);
        setLasers([]);
        setScorePopups([]);
        setScreenFlash('');
        setShipAngle(0);
        gameStartTime.current = Date.now();
        totalCharsTyped.current = 0;
        setTimeout(() => {
            if (inputRef.current) {
                inputRef.current.focus();
                if (isMobile) {
                    inputRef.current.value = ' ';
                    inputRef.current.click();
                }
            }
        }, 300);
    }, [isMobile]);

    // ===== SPAWN =====
    const spawnObject = useCallback(() => {
        if (!selectedLevel || wordIndexRef.current >= selectedLevel.words.length) return;

        const idx = wordIndexRef.current;
        const word = selectedLevel.words[idx];
        const vw = window.innerWidth;
        const margin = Math.max(80, vw * 0.1);
        const spawnX = margin + Math.random() * (vw - margin * 2);
        const baseSpeed = 0.5 + selectedLevel.speed * 1.6;

        const obj: FallingObject = {
            id: `obj-${Date.now()}-${idx}`,
            word,
            x: spawnX,
            y: -20,
            baseX: spawnX,
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 1.5,
            oscillationOffset: Math.random() * Math.PI * 2,
            oscillationSpeed: 0.4 + Math.random() * 1.2,
            oscillationAmp: 15 + Math.random() * 30,
            assetIndex: Math.floor(Math.random() * ASSET_POOL.length),
            speed: baseSpeed + (Math.random() - 0.5) * 0.3,
            isDestroying: false,
            typedProgress: 0,
        };

        setObjects(prev => [...prev, obj]);
        setWordIndex(prev => prev + 1);
        wordIndexRef.current = idx + 1;
    }, [selectedLevel]);

    // ===== FIRE LASER =====
    const fireLaser = useCallback((obj: FallingObject) => {
        const shipX = window.innerWidth / 2;
        const shipY = window.innerHeight - 80;

        // Predict future position after 300ms travel time
        const TRAVEL_MS = 300;
        const frames = TRAVEL_MS / 16.67;
        // Target Y: obj.y + offset (80px to hit bottom of asset) + speed * frames
        const predY = (obj.y + 80) + obj.speed * frames; // move down + offset to hit asset bottom

        const futureTime = Date.now() + TRAVEL_MS;
        const osc = Math.sin((futureTime / 1000) * obj.oscillationSpeed + obj.oscillationOffset);
        const predX = obj.baseX + osc * obj.oscillationAmp; // oscillate x

        // Play random shoot sound
        const soundUrl = SHOT_SOUNDS[Math.floor(Math.random() * SHOT_SOUNDS.length)];
        const audio = new Audio(soundUrl);
        audio.volume = 0.4;
        audio.play().catch(() => { }); // catch helper for strict autoplay policies

        setLasers(prev => [...prev, {
            id: `laser-${++uidRef.current}`,
            startX: shipX,
            startY: shipY,
            endX: predX,
            endY: predY,
            createdAt: Date.now(),
        }]);
    }, []);

    // ===== DESTROY EFFECT =====
    const destroyObject = useCallback((obj: FallingObject) => {
        const diffPoints = obj.word.difficulty === 'easy' ? 10 : obj.word.difficulty === 'medium' ? 25 : 40;
        const streakBonus = Math.min(streak * 3, 30);
        const points = diffPoints + streakBonus;

        setScore(s => s + points);
        scoreRef.current += points;
        setWordsCleared(w => w + 1);
        setStreak(s => { const n = s + 1; if (n > maxStreak) setMaxStreak(n); return n; });
        setScreenFlash('hit');
        setTimeout(() => setScreenFlash(''), 200);

        const colors = ['#f59e0b', '#ef4444', '#e2e8f0', '#fff', '#22c55e'];
        const newP: Particle[] = [];
        for (let i = 0; i < 22; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 7;
            newP.push({
                id: `p-${++uidRef.current}-${i}`,
                x: obj.x, y: obj.y,
                color: colors[Math.floor(Math.random() * colors.length)],
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1,
                size: 3 + Math.random() * 5,
            });
        }
        setParticles(prev => [...prev, ...newP]);
        setScorePopups(prev => [...prev, { id: `sp-${++uidRef.current}`, x: obj.x, y: obj.y, value: points, createdAt: Date.now() }]);
    }, [streak, maxStreak]);

    // ===== INPUT HANDLER =====
    const processInput = useCallback((char: string) => {
        const current = objectsRef.current;
        const activeObj = current.find(o => o.id === activeId && !o.isDestroying);

        if (activeObj) {
            const expected = activeObj.word.text[activeObj.typedProgress];
            if (char.toLowerCase() === expected.toLowerCase()) {
                totalCharsTyped.current++;
                setAccuracy(a => ({ ...a, hits: a.hits + 1 }));
                fireLaser(activeObj);

                setObjects(prev => prev.map(o => {
                    if (o.id !== activeObj.id) return o;
                    const np = o.typedProgress + 1;
                    if (np >= o.word.text.length) {
                        destroyObject(o);
                        setActiveId(null);
                        return { ...o, typedProgress: np, isDestroying: true };
                    }
                    return { ...o, typedProgress: np };
                }));
            } else {
                setAccuracy(a => ({ ...a, misses: a.misses + 1 }));
            }
        } else {
            const candidates = current.filter(o =>
                !o.isDestroying && o.y > 0 &&
                o.word.text[0].toLowerCase() === char.toLowerCase()
            );
            if (candidates.length > 0) {
                const target = candidates.sort((a, b) => b.y - a.y)[0];
                setActiveId(target.id);
                totalCharsTyped.current++;
                setAccuracy(a => ({ ...a, hits: a.hits + 1 }));
                fireLaser(target);

                setObjects(prev => prev.map(o => {
                    if (o.id !== target.id) return o;
                    const np = 1;
                    if (np >= o.word.text.length) {
                        destroyObject(o);
                        setActiveId(null);
                        return { ...o, typedProgress: np, isDestroying: true };
                    }
                    return { ...o, typedProgress: np };
                }));
            }
        }
    }, [activeId, destroyObject, fireLaser]);

    // ===== GAME LOOP =====
    useEffect(() => {
        if (gameState !== 'playing') return;

        let animId: number;
        let lastTime = 0;

        const loop = (time: number) => {
            if (!lastTime) lastTime = time;
            const dt = Math.min((time - lastTime) / 16.67, 3);
            lastTime = time;

            const now = Date.now();
            const floorY = keyboardOpen ? viewportHeight - 80 : window.innerHeight - 140;

            setObjects(prev => {
                const updated: FallingObject[] = [];
                let lostLife = false;

                for (const obj of prev) {
                    if (obj.isDestroying) continue;

                    const newY = obj.y + obj.speed * dt;
                    const osc = Math.sin((now / 1000) * obj.oscillationSpeed + obj.oscillationOffset);
                    const newX = obj.baseX + osc * obj.oscillationAmp;
                    const newRot = obj.rotation + obj.rotationSpeed * dt;

                    if (newY > floorY) {
                        lostLife = true;
                        continue;
                    }

                    updated.push({ ...obj, x: newX, y: newY, rotation: newRot });
                }

                if (lostLife) {
                    const cl = livesRef.current;
                    if (cl > 0) {
                        setLives(cl - 1);
                        livesRef.current = cl - 1;
                        setStreak(0);
                        setScreenFlash('damage');
                        setTimeout(() => setScreenFlash(''), 300);
                        const activeStillExists = updated.find(o => o.id === activeId);
                        if (!activeStillExists) setActiveId(null);
                        if (cl - 1 <= 0) setGameState('results');
                    }
                }

                return updated;
            });

            // Particles
            setParticles(prev => prev
                .map(p => ({ ...p, x: p.x + p.vx * dt, y: p.y + p.vy * dt, vy: p.vy + 0.12 * dt, life: p.life - 0.025 * dt }))
                .filter(p => p.life > 0)
            );

            // Lasers — die after 300ms (projectile travel time)
            setLasers(prev => prev.filter(l => now - l.createdAt < 300));

            // Score popups
            setScorePopups(prev => prev.filter(sp => now - sp.createdAt < 1200));

            // WPM
            const elapsed = (now - gameStartTime.current) / 60000;
            if (elapsed > 0.05) setWpm(Math.round((totalCharsTyped.current / 5) / elapsed));

            // Victory check
            if (selectedLevel) {
                const allSpawned = wordIndexRef.current >= selectedLevel.words.length;
                const currentObj = objectsRef.current;
                const allCleared = currentObj.filter(o => !o.isDestroying).length === 0;
                if (allSpawned && allCleared && livesRef.current > 0) {
                    const key = selectedLevel.id;
                    const cs = scoreRef.current;
                    if (cs > (highScores[key] || 0)) {
                        const newHS = { ...highScores, [key]: cs };
                        setHighScores(newHS);
                        localStorage.setItem('stg-hs', JSON.stringify(newHS));
                    }
                    setGameState('results');
                    return;
                }
            }

            animId = requestAnimationFrame(loop);
        };

        animId = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(animId);
    }, [gameState, activeId, selectedLevel, highScores]);

    // ===== SPAWNER — BALANCED: 2-3 on screen =====
    useEffect(() => {
        if (gameState !== 'playing' || !selectedLevel) return;

        // Spawn first word immediately
        spawnObject();

        // Then spawn at the level's pace — rates are tuned in data
        const interval = setInterval(() => spawnObject(), selectedLevel.spawnRate * 1000);
        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gameState, selectedLevel]);

    // Keyboard (desktop)
    useEffect(() => {
        if (gameState !== 'playing') return;
        const handler = (e: KeyboardEvent) => {
            if (e.key.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey) {
                e.preventDefault();
                processInput(e.key);
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [gameState, processInput]);

    // Mobile input handler via hidden input's onInput
    const handleMobileInput = useCallback((e: React.FormEvent<HTMLInputElement>) => {
        const input = e.currentTarget;
        const val = input.value;

        // Extract what was actually typed (ignoring our leading dummy space if it exists)
        const typed = val.replace(/^ /, '');

        if (typed.length > 0) {
            for (let i = 0; i < typed.length; i++) {
                processInput(typed[i].toLowerCase());
            }
        }

        // Keep a dummy space to prevent aggressive auto-capitalize and autocorrect on mobile
        input.value = ' ';
    }, [processInput]);

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

    // ===== RENDER: MENU =====
    if (gameState === 'menu') {
        return (
            <div className="stg-root stg-menu">
                {showMobileWarning && (
                    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                        <div style={{ background: '#1e293b', padding: '24px', borderRadius: '16px', border: '1px solid #334155', textAlign: 'center', maxWidth: '320px', direction: isKu ? 'rtl' : 'ltr' }}>
                            <h3 style={{ margin: '0 0 12px', fontSize: '1.2rem', color: '#ff9600' }}>{isKu ? 'ئاگاداری' : 'Notice'}</h3>
                            <p style={{ margin: '0 0 20px', fontSize: '0.95rem', color: '#e2e8f0', lineHeight: 1.5 }}>
                                {isKu ? 'بۆ باشترین ئەزموون و بۆ ئەوەی بەجوانی یاری بکەیت، تکایە کۆمپیوتەر بەکاربهێنە بۆ ئەم یارییە.' : 'For the best experience, please use a computer for this game.'}
                            </p>
                            <button onClick={() => setShowMobileWarning(false)} style={{ background: 'linear-gradient(135deg, #ff9600, #cc7800)', border: 'none', padding: '10px 20px', borderRadius: '8px', color: 'white', fontWeight: 'bold', width: '100%', cursor: 'pointer' }}>
                                {isKu ? 'تێگەیشتم' : 'Got it'}
                            </button>
                        </div>
                    </div>
                )}
                <div className="stg-starfield">
                    {bgStars.map(s => (
                        <div key={s.id} className={`stg-star l${s.layer}`}
                            style={{ left: `${s.x}%`, top: `${s.y}%`, animationDelay: `${s.delay}s` }} />
                    ))}
                </div>

                <div className="stg-menu-content">
                    <button className="stg-back-btn" onClick={() => navigate('/learn')}>
                        <ArrowLeft size={18} /> {isKu ? 'گەڕانەوە' : 'Back'}
                    </button>

                    <div className="stg-menu-hero">
                        <div className="stg-hero-ship">
                            <SpaceshipSvg className="stg-hero-ship-svg" />
                        </div>
                        <h1 className="stg-menu-title">Space Typing</h1>
                        <p className="stg-menu-sub">
                            {isKu ? 'وشەکان بنووسە پێش ئەوەی بگەنە خوارەوە!' : 'Type the words before they reach the ground!'}
                        </p>
                    </div>

                    <div className="stg-levels-path">
                        <div className="stg-path-line" />
                        {gameLevels.map((level, i) => {
                            const hs = highScores[level.id];
                            const isCompleted = !!hs;
                            const isLocked = false;
                            const isCurrent = !isCompleted && (i === 0 || !!highScores[gameLevels[i - 1].id]);

                            return (
                                <div key={level.id} className="stg-path-node-wrapper"
                                    style={{ transform: `translateX(${i % 2 === 0 ? 25 : -25}px)` }}>
                                    <button
                                        className={`stg-level-node ${isCompleted ? 'completed' : ''} ${isLocked ? 'locked' : ''} ${isCurrent ? 'current' : ''}`}
                                        onClick={() => !isLocked && startGame(level)}
                                        disabled={isLocked}
                                    >
                                        <div className="stg-level-node-content">
                                            {isCompleted ? (
                                                <Star fill="#78350f" size={28} />
                                            ) : isLocked ? (
                                                <div style={{ opacity: 0.5 }}><SpaceshipSvg /></div>
                                            ) : (
                                                <div style={{ transform: 'scale(1.2)' }}><SpaceshipSvg /></div>
                                            )}
                                        </div>

                                        {/* Floating Info Popover */}
                                        <div className="stg-node-info">
                                            <div className="stg-node-title">{isKu ? level.nameKu : level.name}</div>
                                            <div className="stg-node-desc">
                                                {level.words.length} {isKu ? 'وشە' : 'words'} • {level.speed < 0.6 ? (isKu ? 'هێواش' : 'Slow') : level.speed < 0.8 ? (isKu ? 'ناوەندی' : 'Medium') : (isKu ? 'خێرا' : 'Fast')}
                                            </div>
                                        </div>

                                        {/* High Score Badge */}
                                        {hs ? (
                                            <div className="stg-node-stars">
                                                <Star size={8} fill="#fbbf24" strokeWidth={0} /> {hs}
                                            </div>
                                        ) : null}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    }

    // ===== RENDER: RESULTS =====
    if (gameState === 'results') {
        const isVictory = livesRef.current > 0;
        const acc = accuracy.hits + accuracy.misses > 0
            ? Math.round((accuracy.hits / (accuracy.hits + accuracy.misses)) * 100) : 0;
        const isNewHS = selectedLevel && score > (highScores[selectedLevel.id] || 0) && score > 0;

        return (
            <div className="stg-root stg-results-screen">
                <div className="stg-starfield">
                    {bgStars.map(s => (
                        <div key={s.id} className={`stg-star l${s.layer}`} style={{ left: `${s.x}%`, top: `${s.y}%` }} />
                    ))}
                </div>
                <div className="stg-results-panel">
                    {isNewHS && <div className="stg-new-record">{isKu ? 'تۆمارێکی نوێ!' : 'NEW HIGH SCORE'}</div>}
                    <h1 className={`stg-results-title ${isVictory ? 'victory' : 'defeat'}`}>
                        {isVictory ? (isKu ? 'سەرکەوتوو بوویت' : 'MISSION COMPLETE') : (isKu ? 'یاری کۆتایی هات' : 'MISSION FAILED')}
                    </h1>
                    <div className="stg-results-grid">
                        <div className="stg-rstat">
                            <Star size={18} />
                            <span className="stg-rstat-val">{score}</span>
                            <span className="stg-rstat-lbl">{isKu ? 'خاڵ' : 'Score'}</span>
                        </div>
                        <div className="stg-rstat">
                            <Crosshair size={18} />
                            <span className="stg-rstat-val">{acc}%</span>
                            <span className="stg-rstat-lbl">{isKu ? 'وردی' : 'Accuracy'}</span>
                        </div>
                        <div className="stg-rstat">
                            <Gauge size={18} />
                            <span className="stg-rstat-val">{wpm}</span>
                            <span className="stg-rstat-lbl">WPM</span>
                        </div>
                    </div>
                    <div className="stg-results-detail">
                        <div>{isKu ? 'وشە تایپکراو' : 'Words cleared'}: <strong>{wordsCleared}</strong></div>
                        <div>{isKu ? 'باشترین زنجیرە' : 'Best streak'}: <strong>{maxStreak}</strong></div>
                        <div>{isKu ? 'گیانی ماوە' : 'Lives left'}: <strong>{lives}</strong></div>
                    </div>
                    <div className="stg-results-btns">
                        <button className="stg-btn stg-btn-primary" onClick={() => selectedLevel && startGame(selectedLevel)}>
                            <RotateCcw size={16} /> {isKu ? 'دووبارە' : 'Retry'}
                        </button>
                        <button className="stg-btn stg-btn-secondary" onClick={() => setGameState('menu')}>
                            {isKu ? 'ئاستەکان' : 'Levels'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ===== RENDER: PLAYING =====
    const progress = selectedLevel ? (wordsCleared / selectedLevel.words.length) * 100 : 0;

    return (
        <div className={`stg-root stg-playing ${screenFlash === 'hit' ? 'flash-hit' : ''} ${screenFlash === 'damage' ? 'flash-dmg' : ''} ${keyboardOpen ? 'stg-keyboard-open' : ''}`}
            style={keyboardOpen ? { height: `${viewportHeight}px` } : undefined}
            onClick={() => {
                if (inputRef.current) {
                    inputRef.current.focus();
                    if (isMobile) {
                        inputRef.current.value = ' ';
                        inputRef.current.click();
                    }
                }
            }}
        >
            <div className="stg-starfield">
                {bgStars.map(s => (
                    <div key={s.id} className={`stg-star l${s.layer}`}
                        style={{ left: `${s.x}%`, top: `${s.y}%`, animationDelay: `${s.delay}s` }} />
                ))}
            </div>

            {/* HUD */}
            <header className="stg-hud">
                <button className="stg-hud-back" onClick={() => setGameState('menu')}>
                    <ArrowLeft size={18} />
                </button>
                <div className="stg-hud-center">
                    <div className="stg-progress-bar">
                        <div className="stg-progress-fill" style={{ width: `${progress}%` }} />
                    </div>
                    <span className="stg-hud-level">{selectedLevel ? (isKu ? selectedLevel.nameKu : selectedLevel.name) : ''}</span>
                </div>
                <div className="stg-hud-stats">
                    <div className="stg-hud-stat score-stat">
                        <Star size={14} fill="#f59e0b" color="#f59e0b" />
                        <span>{score}</span>
                    </div>
                    <div className="stg-hud-stat lives-stat">
                        {Array.from({ length: 3 }, (_, i) => (
                            <Heart key={i} size={14} fill={i < lives ? '#ef4444' : 'none'} color={i < lives ? '#ef4444' : '#374151'} />
                        ))}
                    </div>
                </div>
            </header>

            {streak > 2 && !keyboardOpen && <div className="stg-streak" key={streak}>{streak}x {isKu ? 'زنجیرە' : 'STREAK'}</div>}
            {wpm > 0 && !keyboardOpen && <div className="stg-wpm">{wpm} WPM</div>}

            {/* Game Canvas */}
            <div className="stg-canvas">
                {/* Falling Objects */}
                {objects.map(obj => {
                    const asset = ASSET_POOL[obj.assetIndex];
                    const AssetComp = asset.component;
                    const isLocked = obj.id === activeId;
                    const typed = obj.word.text.substring(0, obj.typedProgress);
                    const untyped = obj.word.text.substring(obj.typedProgress);

                    return (
                        <div key={obj.id}
                            className={`stg-obj ${isLocked ? 'locked' : ''} ${obj.isDestroying ? 'destroying' : ''}`}
                            style={{ left: obj.x, top: obj.y, transform: 'translateX(-50%)' }}
                        >
                            <div className={`stg-obj-label ${isLocked ? 'active' : ''}`}>
                                <span className="stg-typed">{typed}</span>
                                <span className="stg-untyped">{untyped}</span>
                                <div className="stg-obj-trans">{obj.word.translation}</div>
                            </div>
                            <div className="stg-obj-asset" style={{ transform: `rotate(${obj.rotation}deg) scale(${asset.scale})` }}>
                                <AssetComp className="stg-asset-svg" />
                            </div>
                        </div>
                    );
                })}

                {/* LASER PROJECTILES */}
                {lasers.map(l => (
                    <div key={l.id} className="stg-laser-dot" style={{
                        '--sx': `${l.startX}px`,
                        '--sy': `${l.startY}px`,
                        '--ex': `${l.endX}px`,
                        '--ey': `${l.endY}px`,
                    } as React.CSSProperties} />
                ))}

                {/* Particles */}
                {particles.map(p => (
                    <div key={p.id} className="stg-particle"
                        style={{ left: p.x, top: p.y, background: p.color, width: p.size, height: p.size, opacity: p.life }} />
                ))}

                {/* Score popups */}
                {scorePopups.map(sp => (
                    <div key={sp.id} className="stg-score-pop" style={{ left: sp.x, top: sp.y }}>+{sp.value}</div>
                ))}
            </div>

            {/* Spaceship — rotates toward target */}
            <div className={`stg-ship ${keyboardOpen ? 'stg-ship-kb' : ''}`} style={{ transform: `translateX(-50%) rotate(${shipAngle}deg)` }}>
                <div className="stg-ship-body">
                    <SpaceshipSvg className="stg-ship-svg" />
                </div>
            </div>

            {/* Mobile tap prompt */}
            {isMobile && gameState === 'playing' && !keyboardOpen && (
                <div className="stg-mobile-tap-hint" onClick={() => {
                    if (inputRef.current) {
                        inputRef.current.value = ' ';
                        inputRef.current.focus();
                        inputRef.current.click();
                    }
                }}>
                    {isKu ? 'لێرە دابگرە بۆ تایپکردن' : 'Tap here to type'}
                </div>
            )}

            {/* Hidden input — positioned properly for mobile keyboard trigger */}
            <input
                ref={inputRef}
                type="text"
                className="stg-hidden-input"
                autoComplete="off"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                enterKeyHint="go"
                inputMode="text"
                onInput={handleMobileInput}
                onBlur={() => {
                    // Re-focus on mobile to keep keyboard open during gameplay
                    if (isMobile && gameState === 'playing') {
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

export default SpaceTypingGame;
