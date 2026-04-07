// @ts-nocheck
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    // UI Icons
    X, Check, Heart, Sparkles, RefreshCw, ChevronRight,
    Settings, Play, Pause, RotateCcw, Loader2, Volume2, Mic, MicOff, CheckCircle2, XCircle, SkipForward, Flag
} from 'lucide-react';
import { sendChatMessage } from '../../services/api';
import { transcribeWithGemini } from '../../utils/geminiVoice';
import {
    // Colorful Flat Icons (all verified exports)
    FcCheckmark, FcCancel, FcIdea, FcMindMap, FcClock, FcCalendar,
    FcBriefcase, FcBusiness, FcBusinessman, FcBusinesswoman,
    FcGraduationCap, FcReading, FcLibrary, FcKindle, FcGlobe,
    FcHome, FcDepartment, FcOrganization, FcShop, FcFactory,
    FcCurrencyExchange, FcMoneyTransfer, FcSalesPerformance, FcDebt,
    FcPicture, FcCamera, FcMusic, FcHeadset, FcSpeaker,
    FcSmartphoneTablet, FcElectronics, FcCalculator, FcDatabase,
    FcLandscape, FcNightLandscape, FcBinoculars, FcGallery,
    FcAutomotive, FcShipped, FcPackage, FcInTransit,
    FcComments, FcCollaboration, FcVoicePresentation, FcSupport,
    FcAbout, FcInfo, FcRules, FcDisclaimer, FcProcess,
    FcRating, FcLike, FcDislike, FcStart, FcEndCall,
    FcMultipleDevices, FcFullBattery, FcPhone
} from 'react-icons/fc';
import { useLanguage } from '../../context/LanguageContext';
import { unit1 } from '../../data/courses/unit1';
import { unit2 } from '../../data/courses/unit2';
import { unit3 } from '../../data/courses/unit3';
import { unit4 } from '../../data/courses/unit4';
import { unit5 } from '../../data/courses/unit5';
import { unit6 } from '../../data/courses/unit6';
import { intermediateUnit1 } from '../../data/courses/intermediate-unit1';
import { intermediateUnit2 } from '../../data/courses/intermediate-unit2';
import { completeLesson, isLessonUnlocked } from '../../utils/progressManager';
import Button from '../../components/Button/Button';
import { supabase } from '../../lib/supabase';
import './Lesson.css';

// Emoji to Icon Mapping
// Uses Flat Color Icons (Fc) for abstract/business/tech to give a "Duolingo" vector look.
// Concrete nouns (Apple, Cat) still use Native Emojis because icon sets lack them.
const emojiToIconComponent = {
    // Actions & UI
    '✅': FcCheckmark, '❌': FcCancel, '💡': FcIdea, '🧠': FcMindMap,
    '📅': FcCalendar, '⏰': FcClock, '⚙️': Settings, '🔄': RefreshCw,

    // Business & Work
    '💼': FcBriefcase, '🏢': FcDepartment, '🤝': FcCollaboration,
    '👨‍💼': FcBusinessman, '👩‍💼': FcBusinesswoman, '🏭': FcFactory,
    '📊': FcSalesPerformance, '💰': FcMoneyTransfer, '💵': FcCurrencyExchange,

    // Education
    '🎓': FcGraduationCap, '📚': FcLibrary, '📖': FcReading,
    '🏫': FcDepartment, '✏️': FcKindle,

    // Tech & Media
    '📷': FcCamera, '🖼️': FcPicture, '🎵': FcMusic, '🎧': FcHeadset,
    '📱': FcSmartphoneTablet, '💻': FcElectronics, '🖥️': FcMultipleDevices,
    '📡': FcStart, '🔋': FcFullBattery,

    // Travel & Places
    '🌍': FcGlobe, '🏠': FcHome, '🏪': FcShop, '🗺️': FcGallery,
    '🚗': FcAutomotive, '🚚': FcShipped, '📦': FcPackage,
    '⛰️': FcLandscape, '🌃': FcNightLandscape, '🔭': FcBinoculars,

    // Communication
    '💬': FcComments, '🗣️': FcVoicePresentation, '📞': FcPhone,
    '💁': FcSupport, 'ℹ️': FcInfo, '❓': FcAbout,

    // Ratings
    '⭐': FcRating, '👍': FcLike, '👎': FcDislike, '❤️': FcLike,
};

// Icon Renderer Component
const IconRenderer = ({ emoji, size = 40, className = '' }) => {
    const IconComponent = emojiToIconComponent[emoji];

    // If we have a mapped Colorful Icon, use it
    if (IconComponent) {
        return <IconComponent size={size} className={className} />;
    }

    // Fallback to Native Emoji with Premium Styling
    // We removed the Lucide fallbacks to ensure consistency: either a rich Vector Icon or a rich Emoji.
    return (
        <span
            className="premium-emoji"
            style={{
                fontSize: `${size}px`,
                lineHeight: 1,
                display: 'inline-block',
                filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.2))',
                transform: 'translateY(1px)'
            }}
        >
            {emoji}
        </span>
    );
};

// Shuffle utility function for randomizing options
const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

const Lesson = () => {
    const { lessonId } = useParams();
    const navigate = useNavigate();
    const { t } = useLanguage();

    const [lesson, setLesson] = useState(null);
    const [currentUnitId, setCurrentUnitId] = useState('unit-1');
    const [unitColor, setUnitColor] = useState({ primary: '#ff9600', dark: '#cc7800', light: '#fff3e0' }); // Default Orange
    const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
    const [lives, setLives] = useState(5);
    const [progress, setProgress] = useState(0);
    const [feedback, setFeedback] = useState(null);
    const [isCompleted, setIsCompleted] = useState(false);
    const [isLocked, setIsLocked] = useState(false);
    const [xpEarned, setXpEarned] = useState(0);
    const [isIntermediateLesson, setIsIntermediateLesson] = useState(false);

    useEffect(() => {
        // 1. Try to load units from localStorage (Admin edits)
        const savedUnitsStr = localStorage.getItem('kurdlingo-units');
        const defaultUnits: Unit[] = [unit1, unit2, unit3, unit4, unit5, unit6, intermediateUnit1 as any, intermediateUnit2 as any];
        
        let allUnits = defaultUnits;
        if (savedUnitsStr) {
            try {
                let saved = JSON.parse(savedUnitsStr);
                const missingUnits = defaultUnits.filter(def => !saved.find((su: any) => su.id === def.id));
                if (missingUnits.length > 0) {
                    saved = [...saved, ...missingUnits];
                }
                allUnits = saved;
            } catch (e) {
                // fallback to default
            }
        }

        // 3. Find lesson in the determined units
        let foundLesson = null;
        let foundUnitIndex = 0;
        let foundUnit = null;

        for (let i = 0; i < allUnits.length; i++) {
            const unit = allUnits[i];
            const lesson = unit.lessons.find(l => l.id === lessonId);
            if (lesson) {
                foundLesson = lesson;
                foundUnitIndex = i;
                foundUnit = unit;
                break;
            }
        }

        // 4. If still not found, check custom lessons (User created)
        if (!foundLesson && lessonId.startsWith('custom-')) {
            const customLessons = JSON.parse(localStorage.getItem('customLessons') || '[]');
            foundLesson = customLessons.find(l => l.id === lessonId);
        }

        if (foundLesson) {
            // Check if lesson is unlocked
            if (foundUnit && !isLessonUnlocked(lessonId, foundUnit.lessons)) {
                setIsLocked(true);
                return;
            }

            setLesson(foundLesson);
            setCurrentUnitId(foundUnit?.id || 'unit-1');

            // Detect intermediate lessons
            const isIntermediate = foundUnit?.id?.startsWith('int-') || lessonId?.startsWith('int-');
            setIsIntermediateLesson(isIntermediate);

            // Calculate XP based on number of exercises
            setXpEarned(foundLesson.exercises?.length ? foundLesson.exercises.length * 2 : 10);

            // Set Unit Color
            if (isIntermediate) {
                setUnitColor({ primary: '#3b82f6', dark: '#1e40af', light: '#1e293b' });
            } else {
                const colors = [
                    { primary: '#ff9600', dark: '#cc7800', light: '#262319' }, // Unit 1: Orange
                    { primary: '#3b82f6', dark: '#ff9600', light: '#1e2f3b' }, // Unit 2: Blue
                    { primary: '#ef4444', dark: '#dc2626', light: '#3d1a1a' }, // Unit 3: Red
                    { primary: '#a855f7', dark: '#9333ea', light: '#271933' }  // Unit 4: Purple
                ];
                setUnitColor(colors[foundUnitIndex % colors.length]);
            }
        }
    }, [lessonId]);

    // Handle locked lesson
    if (isLocked) {
        return (
            <div className="lesson-view">
                <div className="exercise-container" style={{ textAlign: 'center', padding: '60px 20px' }}>
                    <div style={{ fontSize: '64px', marginBottom: '20px' }}>🔒</div>
                    <h2>{t('lessonLocked') || 'Lesson Locked'}</h2>
                    <p style={{ color: 'var(--color-text-secondary)', marginBottom: '24px' }}>
                        {t('completePreviousLesson') || 'Complete the previous lesson to unlock this one.'}
                    </p>
                    <Button variant="primary" onClick={() => navigate('/learn')}>
                        {t('backToLearn') || 'Back to Learn'}
                    </Button>
                </div>
            </div>
        );
    }

    if (!lesson) {
        return (
            <div className="lesson-view" style={{ justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ textAlign: 'center', padding: '40px', background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--color-border)' }}>
                    <h2 style={{ marginBottom: '24px', fontSize: '1.5rem', fontWeight: 600 }}>
                        {t('lessonNotFound') || 'Lesson not found'}
                    </h2>
                    <Button variant="primary" onClick={() => navigate('/learn')}>
                        {t('backToLearn') || 'Back to Learn'}
                    </Button>
                </div>
            </div>
        );
    }

    const currentExercise = lesson.exercises[currentExerciseIndex];

    const handleAnswer = (isCorrect) => {
        if (isCorrect) {
            setFeedback('correct');
        } else {
            setFeedback('incorrect');
            setLives(prev => prev - 1);
        }
    };

    const handleContinue = () => {
        setFeedback(null);
        if (feedback === 'correct') {
            const nextIndex = currentExerciseIndex + 1;
            setProgress((nextIndex / lesson.exercises.length) * 100);

            if (nextIndex < lesson.exercises.length) {
                setCurrentExerciseIndex(nextIndex);
            } else {
                // Mark lesson as completed and save progress
                completeLesson(lessonId, currentUnitId, xpEarned);
                setIsCompleted(true);
            }
        }
    };

    const handleSkip = () => {
        setFeedback(null);
        const nextIndex = currentExerciseIndex + 1;
        setProgress((nextIndex / lesson.exercises.length) * 100);

        if (nextIndex < lesson.exercises.length) {
            setCurrentExerciseIndex(nextIndex);
        } else {
            completeLesson(lessonId, currentUnitId, xpEarned);
            setIsCompleted(true);
        }
    };

    const handleFeedback = async () => {
        if (!currentExercise) return;
        
        try {
            await supabase.from('feedbacks').insert([{
                lesson_id: lessonId,
                exercise_json: currentExercise,
                reported_at: new Date().toISOString()
            }]);
            alert('Feedback sent! Thanks for reporting.');
        } catch (error) {
            console.error(error);
            alert('Failed to send feedback, but we appreciate it!');
        }
    };

    if (isCompleted) {
        return (
            <div className="lesson-completed">
                <div className="completion-content">
                    <div className="completion-icon"><Sparkles size={80} color="var(--color-gold)" fill="var(--color-gold)" /></div>
                    <h1>{t('lessonComplete')}</h1>
                    <p style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-gold)' }}>+{xpEarned} XP</p>
                    <Button variant="primary" size="lg" onClick={() => navigate(isIntermediateLesson ? '/intermediate' : '/learn')}>
                        {t('continue')}
                    </Button>
                </div>
            </div>
        );
    }

    if (lives <= 0) {
        return (
            <div className="lesson-completed">
                <div className="completion-content">
                    <div className="completion-icon"><Heart size={80} color="var(--color-secondary)" fill="var(--color-secondary)" /></div>
                    <h1>{t('outOfHearts')}</h1>
                    <Button variant="secondary" size="lg" onClick={() => navigate(isIntermediateLesson ? '/intermediate' : '/learn')}>
                        {t('quit')}
                    </Button>
                    <Button variant="primary" size="lg" onClick={() => setLives(5)}>
                        {t('refillHearts')}
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div
            className={`lesson-view ${isIntermediateLesson ? 'dark-blue-mode' : ''}`}
            style={{
                '--unit-color': unitColor.primary,
                '--unit-color-dark': unitColor.dark,
                '--unit-color-light': unitColor.light
            }}
            role="main"
        >
            <header className="lesson-header" role="banner" style={{ borderBottomColor: 'var(--unit-color)' }}>
                <button
                    className="close-btn"
                    onClick={() => navigate(isIntermediateLesson ? '/intermediate' : '/learn')}
                    aria-label="Close lesson and return to learn page"
                >
                    <X size={24} aria-hidden="true" />
                </button>
                <div
                    className="progress-bar-container"
                    role="progressbar"
                    aria-valuenow={Math.round(progress)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`Lesson progress: ${Math.round(progress)}%`}
                >
                    <div className="progress-bar-fill" style={{ width: `${progress}%`, background: `linear-gradient(90deg, var(--unit-color-light, #ffb44d), var(--unit-color), var(--unit-color-dark))` }}></div>
                </div>
                <div className="lives-counter" aria-label={`${lives} lives remaining`}>
                    <Heart fill="#ff4b4b" color="#ff4b4b" size={24} aria-hidden="true" />
                    <span aria-hidden="true">{lives}</span>
                </div>
                <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
                    <button 
                        className="icon-btn" 
                        onClick={handleSkip} 
                        title="Skip Exercise"
                        style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-full)', background: 'var(--color-surface)', border: '2px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-secondary)', cursor: 'pointer' }}
                    >
                        <SkipForward size={20} />
                    </button>
                    <button 
                        className="icon-btn" 
                        onClick={handleFeedback} 
                        title="Report an Issue"
                        style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-full)', background: 'var(--color-surface)', border: '2px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-secondary)', cursor: 'pointer' }}
                    >
                        <Flag size={20} />
                    </button>
                </div>
            </header>

            <main className="lesson-content" aria-live="polite">
                {currentExercise.type === 'multiple-choice' && (
                    <MultipleChoice exercise={currentExercise} onAnswer={handleAnswer} />
                )}
                {currentExercise.type === 'sentence-builder' && (
                    <SentenceBuilder exercise={currentExercise} onAnswer={handleAnswer} />
                )}
                {currentExercise.type === 'match-pairs' && (
                    <MatchPairs exercise={currentExercise} onAnswer={handleAnswer} />
                )}
                {currentExercise.type === 'fill-blank' && (
                    <FillBlank exercise={currentExercise} onAnswer={handleAnswer} />
                )}
                {currentExercise.type === 'typing' && (
                    <TypingExercise exercise={currentExercise} onAnswer={handleAnswer} />
                )}
                {currentExercise.type === 'image-selection' && (
                    <ImageSelection exercise={currentExercise} onAnswer={handleAnswer} />
                )}
                {currentExercise.type === 'conversation' && (
                    <Conversation exercise={currentExercise} onAnswer={handleAnswer} />
                )}
                {currentExercise.type === 'cultural-note' && (
                    <CulturalNote exercise={currentExercise} onAnswer={handleAnswer} />
                )}
                {currentExercise.type === 'vocabulary-grid' && (
                    <VocabularyGrid exercise={currentExercise} onAnswer={handleAnswer} />
                )}
                {currentExercise.type === 'roleplay-chat' && (
                    <RoleplayChat exercise={currentExercise} onAnswer={handleAnswer} />
                )}
                {currentExercise.type === 'image-match' && (
                    <ImageMatch exercise={currentExercise} onAnswer={handleAnswer} />
                )}
                {currentExercise.type === 'story-completion' && (
                    <StoryCompletion exercise={currentExercise} onAnswer={handleAnswer} />
                )}
                {currentExercise.type === 'pronunciation' && (
                    <PronunciationExercise exercise={currentExercise} onAnswer={handleAnswer} />
                )}
            </main>

            {feedback && (
                <div className={`feedback-sheet ${feedback}`}>
                    <div className="feedback-content">
                        <div className="feedback-header">
                            {feedback === 'correct' ? (
                                <div className="feedback-icon correct"><Check size={40} strokeWidth={3} /></div>
                            ) : (
                                <div className="feedback-icon incorrect"><X size={40} strokeWidth={3} /></div>
                            )}
                            <div className="feedback-text">
                                <h3>{feedback === 'correct' ? (t('correct') || 'نایابە!') : (t('incorrect') || 'وەڵامی دروست:')}</h3>
                                {feedback === 'incorrect' && (
                                    <p>
                                        <strong>
                                        {currentExercise.correctSentence
                                            ? currentExercise.correctSentence.join(' ')
                                            : currentExercise.correctOption
                                            ? currentExercise.correctOption
                                            : currentExercise.correctAnswer
                                            ? currentExercise.correctAnswer
                                            : '...'}
                                        </strong>
                                    </p>
                                )}
                            </div>
                        </div>
                        <Button
                            variant={feedback === 'correct' ? "success" : "danger"}
                            size="lg"
                            onClick={handleContinue}
                        >
                            {t('continue') || 'بەردەوامبە'}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

// Exercise Components
const MultipleChoice = ({ exercise, onAnswer }) => {
    const { t } = useLanguage();
    const [selected, setSelected] = useState(null);
    const [shuffledOptions, setShuffledOptions] = useState(() => shuffleArray([...exercise.options]));

    useEffect(() => {
        setShuffledOptions(shuffleArray([...exercise.options]));
        setSelected(null);
    }, [exercise.id, exercise.question]);

    // If options have images, find the correct one's emoji to display as a visual prompt.
    // This makes the game harder — the emoji is shown as the question, not on the cards.
    const hasImages = exercise.options.some(o => o.image);
    const correctOption = exercise.options.find(o => o.correct);
    const questionEmoji = hasImages && correctOption?.image ? correctOption.image : null;

    return (
        <div className="exercise-container">
            {/* Large visual prompt — shown once above the question, not on each card */}
            {questionEmoji && (
                <div className="question-visual-prompt">
                    <IconRenderer emoji={questionEmoji} size={96} />
                </div>
            )}
            <h2 className="exercise-question" dir="auto">{exercise.question}</h2>
            <div className="options-grid">
                {shuffledOptions.map((opt, idx) => (
                    <div
                        key={idx}
                        className={`option-card text-only ${selected === opt ? 'selected' : ''}`}
                        onClick={() => setSelected(opt)}
                    >
                        {/* No emoji on individual cards — forces real knowledge */}
                        <div className="option-text" dir="auto">{opt.text}</div>
                    </div>
                ))}
            </div>
            <div className="exercise-footer">
                <Button
                    variant={selected ? "primary" : "disabled"}
                    size="lg"
                    fullWidth
                    onClick={() => selected && onAnswer(selected.correct)}
                    disabled={!selected}
                >
                    {t('check')}
                </Button>
            </div>
        </div>
    );
};



const ImageSelection = ({ exercise, onAnswer }) => {
    const { t } = useLanguage();
    const [selected, setSelected] = useState(null);
    const [shuffledOptions, setShuffledOptions] = useState(() => shuffleArray([...exercise.options]));

    useEffect(() => {
        setShuffledOptions(shuffleArray([...exercise.options]));
        setSelected(null);
    }, [exercise.id, exercise.question]);

    // Show the correct item's emoji as the visual prompt — not on each card.
    const correctOption = exercise.options.find(o => o.correct);
    const questionEmoji = correctOption?.image;

    return (
        <div className="exercise-container">
            {/* One large emoji displayed as the 'object to identify' */}
            {questionEmoji && (
                <div className="question-visual-prompt">
                    <IconRenderer emoji={questionEmoji} size={96} />
                </div>
            )}
            <h2 className="exercise-question" dir="auto">{exercise.question}</h2>
            {/* Cards show text only — no emoji clues */}
            <div className="image-grid text-only-grid">
                {shuffledOptions.map((opt, idx) => (
                    <div
                        key={idx}
                        className={`image-card text-only ${selected === opt ? 'selected' : ''}`}
                        onClick={() => setSelected(opt)}
                    >
                        <div className="image-label">{opt.text}</div>
                    </div>
                ))}
            </div>
            <div className="exercise-footer">
                <Button
                    variant={selected ? "primary" : "disabled"}
                    size="lg"
                    fullWidth
                    onClick={() => selected && onAnswer(selected.correct)}
                    disabled={!selected}
                >
                    {t('check')}
                </Button>
            </div>
        </div>
    );
};

const TypingExercise = ({ exercise, onAnswer }) => {
    const { t } = useLanguage();
    const [input, setInput] = useState('');
    const [isChecking, setIsChecking] = useState(false);

    const checkAnswer = async () => {
        if (!input.trim() || isChecking) return;

        setIsChecking(true);

        // 1. Quick Local Check first to save API calls and reduce latency
        const normalize = (str) => str ? str.trim().toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "") : "";
        const normalizedInput = normalize(input);
        const normalizedCorrect = normalize(exercise.correctAnswer);

        const isExactMatch = normalizedInput === normalizedCorrect ||
            (exercise.acceptedAnswers && exercise.acceptedAnswers.some(ans => normalize(ans) === normalizedInput));

        if (isExactMatch) {
            setIsChecking(false);
            onAnswer(true);
            return;
        }

        // 2. AI Semantic Check for near matches
        try {
            const prompt = `
            You are an English language tutor checking a student's answer.
            Question: "${exercise.question}"
            ${exercise.textToTranslate ? `Translate this text: "${exercise.textToTranslate}"` : ''}
            Expected Correct Answer: "${exercise.correctAnswer}"
            Student's Answer: "${input}"

            Is the student's answer correct in meaning and grammar? Be lenient with minor punctuation or capitalization differences.
            Return ONLY a valid JSON object with no markdown formatting:
            {
                "isCorrect": boolean,
                "feedback": "string explaining why it is correct or incorrect"
            }
            `;

            const result = await sendChatMessage(prompt, "You are a helpful language tutor. You act as a strict JSON generator.");

            let evaluation = { isCorrect: false };
            try {
                // Clean the response from markdown code blocks if present
                const cleanJson = result.response.replace(/```json/g, '').replace(/```/g, '').trim();
                evaluation = JSON.parse(cleanJson);
            } catch (e) {
                console.error("AI JSON Parse Error", e);
                // Fallback to false if AI fails to parse
            }

            onAnswer(evaluation.isCorrect);

        } catch (error) {
            console.error("AI Check Error", error);
            // Fallback to strict false if network/API fails
            onAnswer(false);
        } finally {
            setIsChecking(false);
        }
    };

    return (
        <div className="exercise-container">
            <h2 className="exercise-question" dir="auto">{exercise.question}</h2>
            <div className="typing-prompt">
                {exercise.textToTranslate}
            </div>
            <textarea
                className="typing-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t('typeAnswer')}
                rows={3}
                disabled={isChecking}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        checkAnswer();
                    }
                }}
            />
            <div className="exercise-footer">
                <Button
                    variant={input.trim().length > 0 ? "primary" : "disabled"}
                    size="lg"
                    fullWidth
                    onClick={checkAnswer}
                    disabled={input.trim().length === 0 || isChecking}
                >
                    {isChecking ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Loader2 className="animate-spin" size={20} />
                            {t('checking') || 'Checking...'}
                        </div>
                    ) : (
                        t('check')
                    )}
                </Button>
            </div>
        </div>
    );
};

const SentenceBuilder = ({ exercise, onAnswer }) => {
    const { t } = useLanguage();
    // shuffledWords: the fixed order of words in the bank (never changes)
    const [shuffledWords] = useState(() => shuffleArray([...exercise.options]));
    // selectedIndices: ordered list of bank indices that are currently selected
    const [selectedIndices, setSelectedIndices] = useState([]);

    useEffect(() => {
        setSelectedIndices([]);
    }, [exercise.id, exercise.question]);

    // Toggle a word from the bank on/off
    const toggleWord = (bankIndex) => {
        if (selectedIndices.includes(bankIndex)) {
            // Deselect — remove from selected list
            setSelectedIndices(selectedIndices.filter(i => i !== bankIndex));
        } else {
            // Select — add to end of selected list
            setSelectedIndices([...selectedIndices, bankIndex]);
        }
    };

    // Remove a word from the answer area (deselect by its position in selectedIndices)
    const removeFromSentence = (posInSentence) => {
        setSelectedIndices(selectedIndices.filter((_, i) => i !== posInSentence));
    };

    const checkAnswer = () => {
        const sentence = selectedIndices.map(i => shuffledWords[i]);
        const isCorrect = JSON.stringify(sentence) === JSON.stringify(exercise.correctSentence);
        
        // Speak the correct sentence aloud via browser TTS (male voice)
        const correctText = exercise.correctSentence.join(' ');
        if (correctText && /[a-zA-Z]/.test(correctText) && 'speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(correctText);
            utterance.lang = 'en-US';
            utterance.rate = 0.92;
            utterance.pitch = 0.9;
            const voices = window.speechSynthesis.getVoices();
            const en = voices.filter(v => v.lang.startsWith('en'));
            const maleVoice =
                en.find(v => v.name.toLowerCase().includes('male')) ||
                en.find(v => v.name.includes('Microsoft David')) ||
                en.find(v => v.name.includes('Microsoft Mark')) ||
                en.find(v => v.name.includes('Daniel')) ||
                en.find(v => v.name.includes('Google')) ||
                en[0];
            if (maleVoice) utterance.voice = maleVoice;
            window.speechSynthesis.speak(utterance);
        }
        
        onAnswer(isCorrect);
    };

    const isEnglishSentence = /[a-zA-Z]/.test(exercise.correctSentence[0]);
    const sentenceDir = isEnglishSentence ? 'ltr' : 'rtl';
    const sentence = selectedIndices.map(i => shuffledWords[i]);

    const handleSpeak = (e) => {
        // Stop it from deselecting words if clicking near them
        e.stopPropagation();
        if ('speechSynthesis' in window && sentence.length > 0) {
            // Cancel any ongoing speech
            window.speechSynthesis.cancel();
            
            const textToSpeak = sentence.join(' ');
            if (textToSpeak.trim()) {
                const utterance = new SpeechSynthesisUtterance(textToSpeak);
                utterance.lang = 'en-US';
                utterance.rate = 0.92;
                utterance.pitch = 0.9;
                const voices = window.speechSynthesis.getVoices();
                const en = voices.filter(v => v.lang.startsWith('en'));
                const maleVoice =
                    en.find(v => v.name.toLowerCase().includes('male')) ||
                    en.find(v => v.name.includes('Microsoft David')) ||
                    en.find(v => v.name.includes('Microsoft Mark')) ||
                    en.find(v => v.name.includes('Daniel')) ||
                    en.find(v => v.name.includes('Google')) ||
                    en[0];
                if (maleVoice) utterance.voice = maleVoice;
                window.speechSynthesis.speak(utterance);
            }
        }
    };

    return (
        <div className="exercise-container">
            <h2 className="exercise-question" dir="auto">{exercise.question}</h2>
            <div className="source-text-bubble">
                {exercise.sourceText}
            </div>

            {/* Answer area — shows selected words in order; click to deselect */}
            <div className="sentence-area" dir={sentenceDir} style={{ position: 'relative' }}>
                {/* Voice button in the corner to read the sentence */}
                {sentence.length > 0 && (
                    <button 
                        className="sentence-tts-btn" 
                        onClick={handleSpeak}
                        title="Speak sentence"
                        aria-label="Speak sentence in English"
                    >
                        <Volume2 size={20} color="#1cb0f6" />
                    </button>
                )}
                {sentence.map((word, pos) => (
                    <button key={pos} className="word-chip selected" onClick={() => removeFromSentence(pos)}>
                        {word}
                    </button>
                ))}
            </div>

            {/* Word bank — all words stay fixed; selected ones show as ghost placeholders */}
            <div className="word-bank" dir={sentenceDir}>
                {shuffledWords.map((word, bankIndex) => {
                    const isUsed = selectedIndices.includes(bankIndex);
                    return (
                        <button
                            key={bankIndex}
                            className={`word-chip bank ${isUsed ? 'used' : ''}`}
                            onClick={() => !isUsed && toggleWord(bankIndex)}
                            disabled={isUsed}
                            aria-hidden={isUsed}
                        >
                            {/* When used, show nothing (ghost slot). Text is invisible but width preserved */}
                            <span style={{ visibility: isUsed ? 'hidden' : 'visible' }}>{word}</span>
                        </button>
                    );
                })}
            </div>

            <div className="exercise-footer">
                <Button
                    variant={sentence.length > 0 ? "primary" : "disabled"}
                    size="lg"
                    fullWidth
                    onClick={checkAnswer}
                    disabled={sentence.length === 0}
                >
                    {t('check')}
                </Button>
            </div>
        </div>
    );
};


const MatchPairs = ({ exercise, onAnswer }) => {
    const { t } = useLanguage();
    const [selected, setSelected] = useState([]);
    const [matched, setMatched] = useState([]);

    // Create and shuffle items immediately
    const createShuffledItems = () => {
        const items = exercise.pairs.flatMap(p => [
            { id: p.kurdish, text: p.kurdish, pairId: p.english },
            { id: p.english, text: p.english, pairId: p.kurdish }
        ]);
        return shuffleArray(items);
    };

    const [shuffledItems, setShuffledItems] = useState(() => createShuffledItems());

    useEffect(() => {
        setShuffledItems(createShuffledItems());
        setSelected([]);
        setMatched([]);
    }, [exercise.id]);

    const handleSelect = (item) => {
        if (matched.includes(item.id)) return;

        const newSelected = [...selected, item];
        setSelected(newSelected);

        if (newSelected.length === 2) {
            const [first, second] = newSelected;
            if (first.pairId === second.id || second.pairId === first.id) {
                const newMatched = [...matched, first.id, second.id];
                setMatched(newMatched);
                setSelected([]);
                if (newMatched.length >= exercise.pairs.length * 2) {
                    setTimeout(() => onAnswer(true), 600);
                }
            } else {
                setTimeout(() => setSelected([]), 900);
            }
        }
    };

    return (
        <div className="exercise-container">
            <h2 className="exercise-question" dir="auto">{t('matchPairs')}</h2>
            <div className="pairs-grid">
                {shuffledItems.map((item, idx) => (
                    <button
                        key={idx}
                        className={`pair-card ${selected.includes(item) ? 'selected' : ''} ${matched.includes(item.id) ? 'matched' : ''} ${selected.length === 2 && selected.includes(item) && !matched.includes(item.id) ? 'wrong' : ''}`}
                        onClick={() => handleSelect(item)}
                        dir="auto"
                    >
                        <span dir="auto">{item.text}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

const FillBlank = ({ exercise, onAnswer }) => {
    const { t } = useLanguage();
    const [selected, setSelected] = useState(null);
    const [shuffledOptions, setShuffledOptions] = useState(() => shuffleArray([...exercise.options]));

    useEffect(() => {
        setShuffledOptions(shuffleArray([...exercise.options]));
        setSelected(null);
    }, [exercise.id, exercise.question]);

    return (
        <div className="exercise-container">
            <h2 className="exercise-question" dir="auto">{exercise.question}</h2>
            <div className="sentence-display" dir="auto">
                {exercise.sentenceParts.map((part, idx) => (
                    <span key={idx} className={part === "___" ? "blank-space" : ""}>
                        {part === "___" && selected ? selected : part}
                    </span>
                ))}
            </div>

            <div className="options-grid">
                {shuffledOptions.map((opt, idx) => (
                    <button
                        key={idx}
                        className={`option-card ${selected === opt ? 'selected' : ''}`}
                        onClick={() => setSelected(opt)}
                    >
                        <div className="option-text">{opt}</div>
                    </button>
                ))}
            </div>

            <div className="exercise-footer">
                <Button
                    variant={selected ? "primary" : "disabled"}
                    size="lg"
                    fullWidth
                    onClick={() => selected && onAnswer(selected.toLowerCase().trim() === exercise.correctOption.toLowerCase().trim())}
                    disabled={!selected}
                >
                    {t('check') || 'پشکنین'}
                </Button>
            </div>
        </div>
    );
};

// Conversation Exercise Component
const Conversation = ({ exercise, onAnswer }) => {
    const { t } = useLanguage();
    const [responses, setResponses] = useState({});
    const dialogue = exercise.dialogue || [];
    const correctOptions = exercise.correctOptions || [];

    // Initialize with shuffled dialogue
    const [shuffledDialogue, setShuffledDialogue] = useState(() =>
        dialogue.map(line => ({
            ...line,
            options: line.options ? shuffleArray([...line.options]) : undefined
        }))
    );

    useEffect(() => {
        // Shuffle options within each dialogue line that has options
        const shuffled = dialogue.map(line => ({
            ...line,
            options: line.options ? shuffleArray([...line.options]) : undefined
        }));
        setShuffledDialogue(shuffled);
        setResponses({});
    }, [exercise.id, exercise.question]);

    const handleSelect = (lineIndex, option) => {
        setResponses({ ...responses, [lineIndex]: option });
    };

    const checkAnswers = () => {
        const userResponses = Object.values(responses);
        const isCorrect = correctOptions.every((correct, idx) => userResponses[idx] === correct);
        onAnswer(isCorrect);
    };

    const allAnswered = Object.keys(responses).length === shuffledDialogue.filter(d => d.options).length;

    return (
        <div className="exercise-container">
            <h2 className="exercise-question" dir="auto">{exercise.question || t('completeConversation')}</h2>
            <div className="conversation-container">
                {shuffledDialogue.map((line, idx) => (
                    <div key={idx} className={`dialogue-line ${line.speaker === 'You' ? 'user' : 'other'}`}>
                        <div className="speaker-label">{line.speaker}</div>
                        {line.options ? (
                            <div className="dialogue-options">
                                {line.options.map((opt, optIdx) => (
                                    <button
                                        key={optIdx}
                                        className={`dialogue-option ${responses[idx] === opt ? 'selected' : ''}`}
                                        onClick={() => handleSelect(idx, opt)}
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="dialogue-text">{line.text}</div>
                        )}
                    </div>
                ))}
            </div>
            <div className="exercise-footer">
                <Button
                    variant={allAnswered ? "primary" : "disabled"}
                    size="lg"
                    fullWidth
                    onClick={checkAnswers}
                    disabled={!allAnswered}
                >
                    {t('check')}
                </Button>
            </div>
        </div>
    );
};

// Cultural Note Exercise Component
const CulturalNote = ({ exercise, onAnswer }) => {
    const { t } = useLanguage();
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const quiz = exercise.quiz || {};
    const [shuffledQuizOptions, setShuffledQuizOptions] = useState(() =>
        quiz.options ? shuffleArray([...quiz.options]) : []
    );

    useEffect(() => {
        if (quiz.options) {
            setShuffledQuizOptions(shuffleArray([...quiz.options]));
        }
        setSelectedAnswer(null);
    }, [exercise.id, exercise.question]);

    return (
        <div className="exercise-container">
            <h2 className="exercise-question" dir="auto">{exercise.question || t('culturalNote')}</h2>
            <div className="cultural-note-content">
                <p className="cultural-text">{exercise.content}</p>
                {quiz.question && (
                    <div className="quiz-section">
                        <h3>{quiz.question}</h3>
                        <div className="options-grid">
                            {shuffledQuizOptions.map((opt, idx) => (
                                <button
                                    key={idx}
                                    className={`option-card ${selectedAnswer === opt ? 'selected' : ''}`}
                                    onClick={() => setSelectedAnswer(opt)}
                                >
                                    <div className="option-text">{opt}</div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            <div className="exercise-footer">
                <Button
                    variant={selectedAnswer ? "primary" : "disabled"}
                    size="lg"
                    fullWidth
                    onClick={() => onAnswer(selectedAnswer === quiz.correct)}
                    disabled={!selectedAnswer}
                >
                    {t('check')}
                </Button>
            </div>
        </div>
    );
};

// Vocabulary Grid Exercise Component
const VocabularyGrid = ({ exercise, onAnswer }) => {
    const { t } = useLanguage();
    const items = exercise.items || [];

    return (
        <div className="exercise-container">
            <h2 className="exercise-question" dir="auto">{exercise.question || t('learnVocabulary')}</h2>
            <div className="vocabulary-grid">
                {items.map((item, idx) => (
                    <div key={idx} className="vocabulary-card">
                        {item.image && <div className="vocab-image"><IconRenderer emoji={item.image} size={48} /></div>}
                        <div className="vocab-kurdish">{item.kurdish}</div>
                        <div className="vocab-english">{item.english}</div>
                    </div>
                ))}
            </div>
            <div className="exercise-footer">
                <Button variant="primary" size="lg" fullWidth onClick={() => onAnswer(true)}>
                    {t('continue')}
                </Button>
            </div>
        </div>
    );
};

// Image Match Exercise Component  
const ImageMatch = ({ exercise, onAnswer }) => {
    const { t } = useLanguage();
    const [selected, setSelected] = useState([]);
    const [matched, setMatched] = useState([]);
    const pairs = exercise.pairs || [];

    // Create shuffled items in state to avoid re-shuffling on every render
    const createShuffledItems = () => {
        return shuffleArray(pairs.flatMap(p => [
            { id: `img-${p.image}`, type: 'image', value: p.image, pairId: p.kurdish },
            { id: `text-${p.kurdish}`, type: 'text', value: p.kurdish, pairId: p.image }
        ]));
    };

    const [items, setItems] = useState(() => createShuffledItems());

    useEffect(() => {
        setItems(createShuffledItems());
        setSelected([]);
        setMatched([]);
    }, [exercise.id]);

    const handleSelect = (item) => {
        if (matched.includes(item.id)) return;

        const newSelected = [...selected, item];
        setSelected(newSelected);

        if (newSelected.length === 2) {
            const [first, second] = newSelected;
            if (first.pairId === second.value || second.pairId === first.value) {
                const newMatched = [...matched, first.id, second.id];
                setMatched(newMatched);
                setSelected([]);
                if (newMatched.length === pairs.length * 2) {
                    setTimeout(() => onAnswer(true), 500);
                }
            } else {
                setTimeout(() => setSelected([]), 800);
            }
        }
    };

    return (
        <div className="exercise-container">
            <h2 className="exercise-question">{exercise.question || t('matchImages')}</h2>
            <div className="image-match-grid">
                {items.map((item, idx) => (
                    <button
                        key={idx}
                        className={`match-card ${selected.find(s => s.id === item.id) ? 'selected' : ''} ${matched.includes(item.id) ? 'matched' : ''}`}
                        onClick={() => handleSelect(item)}
                    >
                        {item.type === 'image' ? (
                            <IconRenderer emoji={item.value} size={40} />
                        ) : (
                            <span className="match-text">{item.value}</span>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
};

// Story Completion Exercise Component
const StoryCompletion = ({ exercise, onAnswer }) => {
    const { t } = useLanguage();
    const [answers, setAnswers] = useState({});
    const blanks = exercise.blanks || [];
    const options = exercise.options || [];
    const story = exercise.story || '';
    const [shuffledOptions, setShuffledOptions] = useState(() => shuffleArray([...options]));

    useEffect(() => {
        setShuffledOptions(shuffleArray([...options]));
        setAnswers({});
    }, [exercise.id, exercise.question]);

    const storyParts = story.split('_');

    const handleSelect = (blankIndex, option) => {
        setAnswers({ ...answers, [blankIndex]: option });
    };

    const checkAnswers = () => {
        const isCorrect = blanks.every((blank, idx) => answers[idx] === blank);
        onAnswer(isCorrect);
    };

    const allFilled = Object.keys(answers).length === blanks.length;

    return (
        <div className="exercise-container">
            <h2 className="exercise-question">{exercise.question || t('completeStory')}</h2>
            <div className="story-container">
                <div className="story-text">
                    {storyParts.map((part, idx) => (
                        <span key={idx}>
                            {part}
                            {idx < storyParts.length - 1 && (
                                <span className={`story-blank ${answers[idx] ? 'filled' : ''}`}>
                                    {answers[idx] || '___'}
                                </span>
                            )}
                        </span>
                    ))}
                </div>
                <div className="story-options">
                    {shuffledOptions.map((opt, idx) => (
                        <button
                            key={idx}
                            className={`story-option ${Object.values(answers).includes(opt) ? 'used' : ''}`}
                            onClick={() => {
                                const nextBlank = Object.keys(answers).length;
                                if (nextBlank < blanks.length && !Object.values(answers).includes(opt)) {
                                    handleSelect(nextBlank, opt);
                                }
                            }}
                            disabled={Object.values(answers).includes(opt)}
                        >
                            {opt}
                        </button>
                    ))}
                </div>
            </div>
            <div className="exercise-footer">
                <Button
                    variant={allFilled ? "primary" : "disabled"}
                    size="lg"
                    fullWidth
                    onClick={checkAnswers}
                    disabled={!allFilled}
                >
                    {t('check')}
                </Button>
            </div>
        </div>
    );
};

// Roleplay Chat Exercise Component - Voice-only AI-powered conversation
const RoleplayChat = ({ exercise, onAnswer }) => {
    const { t } = useLanguage();
    const [messages, setMessages] = useState(() => {
        // Only show the initial AI greeting, not the "confirm:" response
        return (exercise.chatMessages || []).filter(m => m.sender === 'ai' && !m.text.startsWith('confirm:'));
    });
    const [isChecking, setIsChecking] = useState(false);
    const [feedback, setFeedback] = useState<{ correct: boolean; message: string; correctAnswer?: string } | null>(null);
    const [hasAnswered, setHasAnswered] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Voice recording state
    const [isRecording, setIsRecording] = useState(false);
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [spokenText, setSpokenText] = useState('');
    const [isSpeakingAI, setIsSpeakingAI] = useState(false);
    const [voiceError, setVoiceError] = useState<string | null>(null);
    const recognitionRef = useRef<any>(null);

    // Use refs for state that closures need to read
    const hasAnsweredRef = useRef(false);
    const isCheckingRef = useRef(false);
    useEffect(() => { hasAnsweredRef.current = hasAnswered; }, [hasAnswered]);
    useEffect(() => { isCheckingRef.current = isChecking; }, [isChecking]);

    // Speak AI messages on mount/exercise change
    useEffect(() => {
        if (recognitionRef.current) {
            try { recognitionRef.current.abort(); } catch (e) { }
            recognitionRef.current.onend = null;
        }

        setMessages((exercise.chatMessages || []).filter(m => m.sender === 'ai' && !m.text.startsWith('confirm:')));
        setSpokenText('');
        setFeedback(null);
        setHasAnswered(false);
        setIsChecking(false);
        setIsRecording(false);
        setIsTranscribing(false);
        setVoiceError(null);
        hasAnsweredRef.current = false;
        isCheckingRef.current = false;

        // Speak the first AI greeting message aloud
        const aiGreeting = (exercise.chatMessages || []).find(m => m.sender === 'ai' && !m.text.startsWith('confirm:'));
        if (aiGreeting) {
            setIsSpeakingAI(true);
            speakText(aiGreeting.text).finally(() => {
                setTimeout(() => setIsSpeakingAI(false), 500);
            });
        }
    }, [exercise.id, exercise.question]);

    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isChecking, isTranscribing]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (recognitionRef.current) {
                try { recognitionRef.current.abort(); } catch (e) { }
            }
            window.speechSynthesis?.cancel();
        };
    }, []);

    // TTS helper - use browser Web Speech API (Gemini Voice is a Vercel-only endpoint)
    const speakText = (text: string): Promise<void> => {
        if (!('speechSynthesis' in window)) return Promise.resolve();
        return new Promise<void>((resolve) => {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-US';
            utterance.rate = 0.92;
            utterance.pitch = 0.9;

            const trySpeak = () => {
                const voices = window.speechSynthesis.getVoices();
                const en = voices.filter(v => v.lang.startsWith('en'));
                const maleVoice =
                    en.find(v => v.name.toLowerCase().includes('male')) ||
                    en.find(v => v.name.includes('Microsoft David')) ||
                    en.find(v => v.name.includes('Microsoft Mark')) ||
                    en.find(v => v.name.includes('Daniel')) ||
                    en.find(v => v.name.includes('Google')) ||
                    en[0];
                if (maleVoice) utterance.voice = maleVoice;
                utterance.onend = () => resolve();
                utterance.onerror = () => resolve();
                window.speechSynthesis.speak(utterance);
            };

            // Voices may not be loaded yet on first call
            if (window.speechSynthesis.getVoices().length > 0) {
                trySpeak();
            } else {
                window.speechSynthesis.onvoiceschanged = () => {
                    window.speechSynthesis.onvoiceschanged = null;
                    trySpeak();
                };
            }
        });
    };

    // Toggle voice recording using direct Gemini API!
    const toggleRecording = async () => {
        if (isCheckingRef.current || hasAnsweredRef.current || isTranscribing) return;
        if (isSpeakingAI) return;

        if (isRecording) {
            if (recognitionRef.current && recognitionRef.current.state === 'recording') {
                recognitionRef.current.stop();
            }
            return;
        }

        setVoiceError(null);
        window.speechSynthesis?.cancel();

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            recognitionRef.current = mediaRecorder;
            const audioChunks: Blob[] = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) audioChunks.push(event.data);
            };

            mediaRecorder.onstop = async () => {
                setIsRecording(false);
                setIsTranscribing(true);
                const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                stream.getTracks().forEach(track => track.stop());

                try {
                    const transcript = await transcribeWithGemini(audioBlob);
                    setSpokenText(transcript);
                    if (transcript.trim()) {
                        submitAnswer(transcript.trim());
                    } else {
                        setVoiceError(t('couldNotHear') || 'Could not hear you. Please try again.');
                    }
                } catch (e) {
                    console.error("Gemini Error:", e);
                    setVoiceError(t('voiceError') || 'AI transcription failed. Please try again.');
                } finally {
                    setIsTranscribing(false);
                }
            };

            mediaRecorder.start();
            setIsRecording(true);
            setSpokenText('...');
        } catch (err) {
            console.error('Mic error:', err);
            setVoiceError(t('unsupportedBrowser') || 'Microphone access denied. Ensure you are on HTTPS.');
            setIsRecording(false);
        }
    };

    // Replay the last AI message
    const replayAIMessage = () => {
        if (isSpeakingAI) return;
        const aiMessages = messages.filter(m => m.sender === 'ai');
        if (aiMessages.length > 0) {
            const lastAiMsg = aiMessages[aiMessages.length - 1].text;
            setIsSpeakingAI(true);
            speakText(lastAiMsg).finally(() => {
                setTimeout(() => setIsSpeakingAI(false), 500);
            });
        }
    };

    const submitAnswer = async (userInput: string) => {
        if (!userInput.trim() || hasAnsweredRef.current || isCheckingRef.current) return;

        setIsChecking(true);
        isCheckingRef.current = true;

        const userMessage = { sender: 'user' as const, text: userInput, avatar: '👤', name: t('you') || 'You' };
        setMessages(prev => [...prev, userMessage]);

        try {
            const historyText = messages.map(m => `${m.name || m.sender}: ${m.text}`).join('\n');

            const prompt = `
            You are a roleplay partner in a language learning app.
            Scenario: "${exercise.scenario}"
            Question: "${exercise.question}"
            
            Conversation Context:
            ${historyText}
            
            The user (You) just said: "${userInput}"

            Is this response contextually relevant to the scenario?
            CRITICAL INSTRUCTION: Be extremely lenient! The user is a beginner. AS LONG AS the user's sentence is in the same context and relation with the scenario (e.g., related to foods, kebabs, ordering), you MUST evaluate it as isCorrect: true. ANY phrase like "I wanna two kebabs", "give me food", etc. MUST be correct. Do NOT enforce strict politeness, formality, or perfect grammar. If it relates to the food/scenario context, it is mathematically correct.

            Return ONLY a valid JSON object:
            {
                "isCorrect": boolean,
                "feedback": "Short positive feedback! If there's a minor error, just point it out nicely but you MUST still set isCorrect: true as long as it's perfectly understandable.",
                "aiResponse": "Your next response as the roleplay partner (if user is correct)"
            }
            `;

            const result = await sendChatMessage(prompt, "You are a helpful language tutor. You act as a strict JSON generator.");

            let evaluation = { isCorrect: false, feedback: "Could not evaluate.", aiResponse: "" };
            try {
                const cleanJson = result.response.replace(/```json/g, '').replace(/```/g, '').trim();
                evaluation = JSON.parse(cleanJson);
            } catch (e) {
                console.error("AI JSON Parse Error", e);
                evaluation.isCorrect = userInput.length > 3;
                evaluation.feedback = evaluation.isCorrect ? "Good effort!" : "Please try to say more.";
            }

            setHasAnswered(true);
            hasAnsweredRef.current = true;

            if (evaluation.isCorrect) {
                setFeedback({
                    correct: true,
                    message: evaluation.feedback || t('greatResponse') || 'Great response!'
                });

                // AI no longer answers back when user is correct.
                // We just rely on the feedback message shown in the UI.
            } else {
                setFeedback({
                    correct: false,
                    message: evaluation.feedback || t('tryAgainHint') || 'Not quite right.',
                    correctAnswer: exercise.acceptableResponses?.[0] || 'Try again'
                });
            }

        } catch (error) {
            console.error("AI Roleplay Error", error);
            const localCheck = exercise.acceptableResponses?.some(r => r.toLowerCase().includes(userInput.toLowerCase()));
            setHasAnswered(true);
            hasAnsweredRef.current = true;
            setFeedback({
                correct: localCheck || false,
                message: localCheck ? "Good job!" : "Could not verify with AI, but good effort.",
            });
        } finally {
            setIsChecking(false);
            isCheckingRef.current = false;
        }
    };

    const handleContinue = () => {
        onAnswer(feedback?.correct || false);
    };

    return (
        <div className="exercise-container">
            <h2 className="exercise-question" dir="auto" style={{ marginBottom: '40px' }}>
                {exercise.question}
            </h2>

            <div className="conversation-container" style={{ margin: '20px auto 40px auto' }}>
                {messages.map((m, idx) => (
                    <div key={idx} className={`dialogue-wrapper ${m.sender === 'user' ? 'user' : 'other'}`} style={{ display: 'flex', flexDirection: 'column', gap: '5px', alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start', maxWidth: '100%', width: 'auto' }}>
                        <div className="speaker-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start', margin: '0 5px' }}>
                            <span>{m.name || m.sender}</span>
                            {m.sender === 'ai' && idx === messages.length - 1 && (
                                <button type="button" onClick={replayAIMessage} disabled={isSpeakingAI} style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', opacity: isSpeakingAI ? 0.5 : 1, marginLeft: '10px' }}>
                                    <Volume2 size={16} />
                                </button>
                            )}
                        </div>
                        <div className={`dialogue-line ${m.sender === 'user' ? 'user' : 'other'}`}>
                            <div className="dialogue-text" dir="auto" style={{ width: '100%' }}>{m.text}</div>
                        </div>
                    </div>
                ))}
                
                {/* Live recording preview */}
                {isRecording && spokenText && (
                    <div className="dialogue-wrapper user" style={{ display: 'flex', flexDirection: 'column', gap: '5px', alignSelf: 'flex-end', maxWidth: '100%', opacity: 0.8 }}>
                        <div className="speaker-label" style={{ alignSelf: 'flex-end', margin: '0 5px' }}>{t('you') || 'YOU'}</div>
                        <div className="dialogue-line user">
                            <div className="dialogue-text" dir="auto" style={{ width: '100%' }}>{spokenText}...</div>
                        </div>
                    </div>
                )}
            </div>

            {/* Simplified Mic Area */}
            <div className={`pronunciation-mic-area ${hasAnswered ? (feedback?.correct ? 'correct' : 'incorrect') : (isRecording ? 'listening' : (isChecking || isTranscribing ? 'processing' : 'idle'))}`}>
                
                {/* UNIFIED TEST-PAGE STYLE CONTROLS */}
                {!hasAnswered && !isChecking && !isTranscribing && (
                    <div style={{ background: 'var(--color-surface)', padding: '20px', borderRadius: '16px', border: '2px solid var(--color-border)', textAlign: 'center', width: '100%', marginTop: '20px' }}>
                        <p style={{ marginBottom: '20px', fontSize: '16px', color: 'var(--color-text)' }}>
                            {isSpeakingAI ? (t('waitForAI') || '...چاوەڕوان بە') : (t('tapToSpeak') || 'بکلیک بکە و وەڵام بدەوە')}
                        </p>
                        
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '20px' }}>
                            <button 
                                onClick={toggleRecording}
                                disabled={isRecording || isSpeakingAI}
                                style={{ padding: '10px 20px', borderRadius: '8px', background: '#1cb0f6', color: 'white', border: 'none', cursor: 'pointer', opacity: (isRecording || isSpeakingAI) ? 0.5 : 1, fontWeight: 'bold' }}
                            >
                                Start Recording
                            </button>
                            <button 
                                onClick={toggleRecording}
                                disabled={!isRecording}
                                style={{ padding: '10px 20px', borderRadius: '8px', background: 'var(--color-error, #ff4b4b)', color: 'white', border: 'none', cursor: 'pointer', opacity: !isRecording ? 0.5 : 1, fontWeight: 'bold' }}
                            >
                                Stop Recording
                            </button>
                        </div>

                        <div style={{ marginBottom: isRecording ? '20px' : '0' }}>
                            <strong>Status: </strong> 
                            <span style={{ 
                                color: isRecording ? 'red' : 'orange',
                                fontWeight: 'bold', textTransform: 'uppercase'
                            }}>
                                {isRecording ? 'recording' : 'idle'}
                            </span>
                        </div>

                        {isRecording && (
                            <div style={{ padding: '20px', background: 'rgba(255,0,0,0.1)', border: '2px dashed red', borderRadius: '8px', textAlign: 'center' }}>
                                🎙️ Speak anything now...
                                {spokenText && <p style={{marginTop: '15px', fontWeight: 'bold'}} dir="auto">"{spokenText}"</p>}
                            </div>
                        )}
                    </div>
                )}

                {/* PROCESSING */}
                {(isChecking || isTranscribing) && (
                    <div className="pronunciation-processing">
                        <div className="processing-ring">
                            <Loader2 className="animate-spin" size={48} />
                        </div>
                        <span>{t('checking') || 'پشکنین...'}</span>
                    </div>
                )}

                {/* CORRECT */}
                {hasAnswered && feedback?.correct && (
                    <div className="pronunciation-result correct" style={{paddingTop: '20px'}}>
                        <div className="result-badge correct"><CheckCircle2 size={40} /></div>
                        <h3>{t('perfect') || '🎉 نایاب!'}</h3>
                        <p>{feedback.message}</p>
                        {spokenText && (
                            <div className="you-said-card">
                                <span className="you-said-label">{t('youSaid') || 'تۆت گوت'}:</span>
                                <span className="you-said-text" dir="auto">"{spokenText}"</span>
                            </div>
                        )}
                    </div>
                )}

                {/* INCORRECT */}
                {hasAnswered && !feedback?.correct && (
                    <div className="pronunciation-result incorrect" style={{paddingTop: '20px'}}>
                        <div className="result-badge incorrect"><XCircle size={40} /></div>
                        <h3>{t('notQuiteRight') || 'دروست نییە'}</h3>
                        <p>{feedback?.message}</p>
                        {spokenText && (
                            <div className="you-said-card wrong">
                                <span className="you-said-label">{t('youSaid') || 'تۆت گوت'}:</span>
                                <span className="you-said-text" dir="auto">"{spokenText}"</span>
                            </div>
                        )}
                        {feedback?.correctAnswer && (
                            <div className="expected-card">
                                <span className="expected-label">{t('expected') || 'دەکرێت بڵێیت'}:</span>
                                <span className="expected-text" dir="auto">"{feedback.correctAnswer}"</span>
                            </div>
                        )}
                    </div>
                )}

                {voiceError && (
                    <div className="pronunciation-result error" style={{marginTop:'15px'}}>
                        <div className="result-badge error">⚠️</div>
                        <p>{voiceError}</p>
                    </div>
                )}
            </div>

            {hasAnswered && (
                <div className="exercise-footer">
                    {feedback?.correct ? (
                        <Button variant="success" size="lg" fullWidth onClick={handleContinue}>
                            {t('continue') || 'بەردەوامبە'}
                        </Button>
                    ) : (
                        <Button variant="primary" size="lg" fullWidth onClick={() => {
                            setHasAnswered(false);
                            setFeedback(null);
                            setSpokenText('');
                        }}>
                            <Mic size={18} style={{ marginRight: 8 }} />
                            {t('tryAgain') || 'دووبارە هەوڵبدە'}
                        </Button>
                    )}
                </div>
            )}
            
            {/* Hints */}
            {exercise.hints && exercise.hints.length > 0 && !hasAnswered && (
                <div className="chat-hints" style={{marginTop:'20px'}}>
                    <span className="hints-label">{t('hints') || 'Hints'}:</span>
                    {exercise.hints.map((hint, idx) => (
                        <span key={idx} className="hint-chip">{hint}</span>
                    ))}
                </div>
            )}
        </div>
    );
};

// ============================================
// PRONUNCIATION EXERCISE - Voice Game
// ============================================
const PronunciationExercise = ({ exercise, onAnswer }) => {
    const { t } = useLanguage();
    const [status, setStatus] = useState('idle'); // idle | listening | processing | correct | incorrect | error | unsupported
    const [transcript, setTranscript] = useState('');
    const [attempts, setAttempts] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const recognitionRef = useRef(null);
    const statusRef = useRef('idle');

    // Keep statusRef in sync
    useEffect(() => {
        statusRef.current = status;
    }, [status]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (recognitionRef.current) {
                try { recognitionRef.current.abort(); } catch (e) { }
            }
            window.speechSynthesis?.cancel();
        };
    }, []);

    // Reset when moving to a new exercise
    useEffect(() => {
        setStatus('idle');
        setTranscript('');
        setAttempts(0);
        setIsPlaying(false);
    }, [exercise.id, exercise.question, exercise.targetWord]);

    // Check browser support
    useEffect(() => {
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SR) {
            setStatus('unsupported');
        }
    }, []);

    // Simple string similarity (Dice coefficient)
    const similarity = (s1, s2) => {
        const a = s1.toLowerCase().trim().replace(/[^\w\s]/g, '');
        const b = s2.toLowerCase().trim().replace(/[^\w\s]/g, '');
        if (a === b) return 1;
        if (a.length < 2 || b.length < 2) return a === b ? 1 : 0;

        const bigrams = new Map();
        for (let i = 0; i < a.length - 1; i++) {
            const bigram = a.substring(i, i + 2);
            bigrams.set(bigram, (bigrams.get(bigram) || 0) + 1);
        }

        let intersect = 0;
        for (let i = 0; i < b.length - 1; i++) {
            const bigram = b.substring(i, i + 2);
            const count = bigrams.get(bigram) || 0;
            if (count > 0) {
                bigrams.set(bigram, count - 1);
                intersect++;
            }
        }

        return (2.0 * intersect) / (a.length + b.length - 2);
    };

    // Play the target word using TTS
    const speakWord = () => {
        if (!('speechSynthesis' in window)) return;
        window.speechSynthesis.cancel();
        setIsPlaying(true);

        const utterance = new SpeechSynthesisUtterance(exercise.listenText || exercise.targetTranslation || exercise.targetWord);
        utterance.lang = exercise.listenLang || 'en-US';
        utterance.rate = 0.85;
        utterance.pitch = 1;
        utterance.onend = () => setIsPlaying(false);
        utterance.onerror = () => setIsPlaying(false);
        window.speechSynthesis.speak(utterance);
    };

    // Start speech recognition using direct Gemini API!
    const startListening = async () => {
        if (isPlaying) return;

        // Toggle logic: stop recording if it's already listening
        if (status === 'listening' && recognitionRef.current && recognitionRef.current.state === 'recording') {
            recognitionRef.current.stop();
            return;
        }

        window.speechSynthesis?.cancel();

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            recognitionRef.current = mediaRecorder;
            const audioChunks: Blob[] = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) audioChunks.push(event.data);
            };

            mediaRecorder.onstop = async () => {
                setStatus('processing');
                const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                stream.getTracks().forEach(track => track.stop());

                try {
                    const text = await transcribeWithGemini(audioBlob);
                    const expected = (exercise.expectedAnswer || exercise.targetTranslation).toLowerCase().trim();
                    const accepted = (exercise.acceptedAnswers || []).map((a: string) => a.toLowerCase().trim());
                    
                    const bestMatch = text.toLowerCase().trim();
                    setTranscript(text);

                    let bestScore = similarity(bestMatch, expected);
                    const acceptedScore = Math.max(0, ...accepted.map((a: string) => similarity(bestMatch, a)));
                    const finalScore = Math.max(bestScore, acceptedScore);

                    const isCorrect = finalScore >= 0.6;
                    setTimeout(() => {
                        setStatus(isCorrect ? 'correct' : 'incorrect');
                        setAttempts((prev: number) => prev + 1);
                    }, 500);

                } catch (e) {
                    console.error("Gemini Error:", e);
                    setStatus('error');
                }
            };

            mediaRecorder.start();
            setStatus('listening');
            setTranscript('...');
        } catch (e) {
            console.error('Mic error:', e);
            setStatus('error');
        }
    };

    const handleRetry = () => {
        setStatus('idle');
        setTranscript('');
    };

    const handleContinue = () => {
        onAnswer(status === 'correct');
    };

    const handleSkip = () => {
        onAnswer(true); // Skip counts as pass for unsupported browsers
    };

    return (
        <div className="exercise-container pronunciation-exercise">
            <h2 className="exercise-question" dir="auto">{exercise.question}</h2>

            {/* Target Word Card - Premium Design */}
            <div className="pronunciation-card">
                {exercise.image && (
                    <div className="pronunciation-emoji">
                        <IconRenderer emoji={exercise.image} size={72} />
                    </div>
                )}

                {/* Kurdish source word */}
                <div className="pronunciation-target" dir="rtl">
                    {exercise.targetWord}
                </div>

                {/* English translation - big and prominent */}
                {exercise.targetTranslation && (
                    <div className="pronunciation-english-word">
                        {exercise.targetTranslation}
                    </div>
                )}

                {/* IPA Phonetic */}
                {exercise.pronunciation && (
                    <div className="pronunciation-phonetic">
                        /{exercise.pronunciation}/
                    </div>
                )}

                {/* Listen button */}
                <button
                    className={`pronunciation-listen-btn ${isPlaying ? 'playing' : ''}`}
                    onClick={speakWord}
                    type="button"
                    disabled={isPlaying}
                    aria-label="Listen to pronunciation"
                >
                    <Volume2 size={20} />
                    <span>{isPlaying ? (t('playing') || 'گوێگرتن...') : (t('listen') || '🔊 گوێبگرە')}</span>
                </button>
            </div>

            {/* Mic Area - Premium Voice UI */}
            <div className={`pronunciation-mic-area ${status}`}>

                {/* UNIFIED TEST-PAGE STYLE CONTROLS */}
                {(status === 'idle' || status === 'listening') && (
                    <div style={{ background: 'var(--color-surface)', padding: '20px', borderRadius: '16px', border: '2px solid var(--color-border)', textAlign: 'center', width: '100%', marginTop: '20px' }}>
                        <p style={{ marginBottom: '20px', fontSize: '16px', color: 'var(--color-text)' }}>
                            {t('tapToSpeak') || 'بکلیک بکە و بخوێنەرەوە'}
                        </p>
                        
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '20px' }}>
                            <button 
                                onClick={startListening}
                                disabled={status === 'listening'}
                                style={{ padding: '10px 20px', borderRadius: '8px', background: '#1cb0f6', color: 'white', border: 'none', cursor: 'pointer', opacity: status === 'listening' ? 0.5 : 1, fontWeight: 'bold' }}
                            >
                                Start Recording
                            </button>
                            <button 
                                onClick={startListening}
                                disabled={status !== 'listening'}
                                style={{ padding: '10px 20px', borderRadius: '8px', background: 'var(--color-error, #ff4b4b)', color: 'white', border: 'none', cursor: 'pointer', opacity: status !== 'listening' ? 0.5 : 1, fontWeight: 'bold' }}
                            >
                                Stop Recording
                            </button>
                        </div>

                        <div style={{ marginBottom: status === 'listening' ? '20px' : '0' }}>
                            <strong>Status: </strong> 
                            <span style={{ 
                                color: status === 'listening' ? 'red' : 'orange',
                                fontWeight: 'bold', textTransform: 'uppercase'
                            }}>
                                {status}
                            </span>
                        </div>

                        {status === 'listening' && (
                            <div style={{ padding: '20px', background: 'rgba(255,0,0,0.1)', border: '2px dashed red', borderRadius: '8px', textAlign: 'center' }}>
                                🎙️ Speak anything now...
                            </div>
                        )}
                        
                        {attempts > 0 && status === 'idle' && (
                            <div style={{ marginTop: '15px', fontSize: '14px', color: 'var(--color-text-dim)' }}>
                                {t('attemptsLeft') || 'هەوڵی ماوە'}: {3 - attempts}
                            </div>
                        )}
                    </div>
                )}

                {/* PROCESSING */}
                {status === 'processing' && (
                    <div className="pronunciation-processing">
                        <div className="processing-ring">
                            <Loader2 className="animate-spin" size={48} />
                        </div>
                        <span>{t('analyzing') || 'شیکردنەوەی دەنگ...'}</span>
                    </div>
                )}

                {/* CORRECT - Celebration */}
                {status === 'correct' && (
                    <div className="pronunciation-result correct">
                        <div className="result-badge correct">
                            <CheckCircle2 size={40} />
                        </div>
                        <h3>{t('perfect') || '🎉 نایاب!'}</h3>
                        {transcript && (
                            <div className="you-said-card">
                                <span className="you-said-label">{t('youSaid') || 'تۆت گوت'}:</span>
                                <span className="you-said-text">"{transcript}"</span>
                            </div>
                        )}
                    </div>
                )}

                {/* INCORRECT */}
                {status === 'incorrect' && (
                    <div className="pronunciation-result incorrect">
                        <div className="result-badge incorrect">
                            <XCircle size={40} />
                        </div>
                        <h3>{t('notQuiteRight') || 'دروست نییە'}</h3>
                        {transcript && (
                            <div className="you-said-card wrong">
                                <span className="you-said-label">{t('youSaid') || 'تۆت گوت'}:</span>
                                <span className="you-said-text">"{transcript}"</span>
                            </div>
                        )}
                        <div className="expected-card">
                            <span className="expected-label">{t('expected') || 'دروست'}:</span>
                            <span className="expected-text">"{exercise.expectedAnswer || exercise.targetTranslation}"</span>
                        </div>
                    </div>
                )}

                {/* ERROR - Mic permission denied */}
                {status === 'error' && (
                    <div className="pronunciation-result error">
                        <div className="result-badge error">⚠️</div>
                        <h3>{t('micBlocked') || 'مایکرۆفۆن گیرایەوە'}</h3>
                        <p>{t('allowMic') || 'تکایە مایکرۆفۆن لە ڕێکخستنەکانت ڕێگا پێبدە.'}</p>
                    </div>
                )}

                {/* UNSUPPORTED */}
                {status === 'unsupported' && (
                    <div className="pronunciation-result error">
                        <div className="result-badge error">🌐</div>
                        <h3>{t('notSupported') || 'پشتگیری نەکراوە'}</h3>
                        <p>{t('useChromeForVoice') || 'تکایە Chrome یان Edge بەکاربهێنە بۆ تایبەتمەندییەکانی دەنگ.'}</p>
                    </div>
                )}
            </div>

            {/* Footer Actions */}
            <div className="exercise-footer">
                {status === 'correct' && (
                    <Button variant="success" size="lg" fullWidth onClick={handleContinue}>
                        {t('continue') || 'بەردەوامبە'}
                    </Button>
                )}
                {status === 'incorrect' && attempts < 3 && (
                    <Button variant="primary" size="lg" fullWidth onClick={handleRetry}>
                        <Mic size={18} style={{ marginRight: 8 }} />
                        {t('tryAgain') || 'دووبارە هەوڵبدە'} ({3 - attempts} {t('left') || 'ماوە'})
                    </Button>
                )}
                {status === 'incorrect' && attempts >= 3 && (
                    <Button variant="danger" size="lg" fullWidth onClick={handleContinue}>
                        {t('continue') || 'بەردەوامبە'}
                    </Button>
                )}
                {(status === 'error' || status === 'unsupported') && (
                    <Button variant="primary" size="lg" fullWidth onClick={handleSkip}>
                        {t('skipExercise') || 'تێپەڕێنی تەمرین'}
                    </Button>
                )}
            </div>
        </div>
    );
};

export default Lesson;
