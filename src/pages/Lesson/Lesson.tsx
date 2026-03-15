// @ts-nocheck
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    // UI Icons
    X, Check, Heart, Sparkles, RefreshCw, MessageCircle, MessageSquare, ChevronRight, // Lucide for UI
    Settings, Play, Pause, RotateCcw, Loader2
} from 'lucide-react';
import { sendChatMessage } from '../../services/api';
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
import { intermediateUnit1 } from '../../data/courses/intermediate-unit1';
import { completeLesson, isLessonUnlocked } from '../../utils/progressManager';
import Button from '../../components/Button/Button';
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
        const savedUnits = JSON.parse(localStorage.getItem('kurdlingo-units') || 'null');

        // 2. Use saved units or fallback to default imports
        const allUnits = savedUnits || [unit1, unit2, unit3, unit4, unit5, intermediateUnit1];

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
                    { primary: '#ff9600', dark: '#cc7800', light: '#fff3e0' }, // Unit 1: Orange
                    { primary: '#3b82f6', dark: '#2563eb', light: '#dbeafe' }, // Unit 2: Blue
                    { primary: '#a855f7', dark: '#9333ea', light: '#f3e8ff' }, // Unit 3: Purple
                    { primary: '#ef4444', dark: '#dc2626', light: '#fee2e2' }  // Unit 4: Red
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

    if (!lesson) return <div className="lesson-view"><div className="exercise-container"><h2>{t('lessonNotFound')}</h2><Button onClick={() => navigate('/learn')}>{t('backToLearn')}</Button></div></div>;

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
            <header className="lesson-header" role="banner">
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
                    <div className="progress-bar-fill" style={{ width: `${progress}%`, background: 'var(--unit-color)' }}></div>
                </div>
                <div className="lives-counter" aria-label={`${lives} lives remaining`}>
                    <Heart fill="#ff4b4b" color="#ff4b4b" size={24} aria-hidden="true" />
                    <span aria-hidden="true">{lives}</span>
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
                                <div className="feedback-icon correct"><Check size={24} /></div>
                            ) : (
                                <div className="feedback-icon incorrect"><X size={24} /></div>
                            )}
                            <div className="feedback-text">
                                <h3>{feedback === 'correct' ? t('correct') : t('incorrect')}</h3>
                                {feedback === 'incorrect' && (
                                    <p>{t('correctSolution')} {
                                        currentExercise.correctSentence ? JSON.stringify(currentExercise.correctSentence) :
                                            currentExercise.correctOption ? currentExercise.correctOption :
                                                currentExercise.correctAnswer ? currentExercise.correctAnswer : // For typing
                                                    "..."
                                    }</p>
                                )}
                            </div>
                        </div>
                        <Button
                            variant={feedback === 'correct' ? "success" : "danger"}
                            size="lg"
                            onClick={handleContinue}
                        >
                            {t('continue')}
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

    return (
        <div className="exercise-container">
            <h2 className="exercise-question" dir="auto">{exercise.question}</h2>
            <div className="options-grid">
                {shuffledOptions.map((opt, idx) => (
                    <div
                        key={idx}
                        className={`option-card ${selected === opt ? 'selected' : ''}`}
                        onClick={() => setSelected(opt)}
                    >
                        {opt.image && <div className="option-image"><IconRenderer emoji={opt.image} size={48} /></div>}
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

    return (
        <div className="exercise-container">
            <h2 className="exercise-question" dir="auto">{exercise.question}</h2>
            <div className="image-grid">
                {shuffledOptions.map((opt, idx) => (
                    <div
                        key={idx}
                        className={`image-card ${selected === opt ? 'selected' : ''}`}
                        onClick={() => setSelected(opt)}
                    >
                        <div className="image-content"><IconRenderer emoji={opt.image} size={64} /></div>
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
    const [sentence, setSentence] = useState([]);
    const [availableWords, setAvailableWords] = useState(() => shuffleArray([...exercise.options]));

    useEffect(() => {
        setAvailableWords(shuffleArray([...exercise.options]));
        setSentence([]);
    }, [exercise.id, exercise.question]);

    const addToSentence = (word) => {
        setSentence([...sentence, word]);
        setAvailableWords(availableWords.filter((w, i) => i !== availableWords.indexOf(word)));
    };

    const removeFromSentence = (word) => {
        setSentence(sentence.filter((w, i) => i !== sentence.indexOf(word)));
        setAvailableWords([...availableWords, word]);
    };

    const checkAnswer = () => {
        const isCorrect = JSON.stringify(sentence) === JSON.stringify(exercise.correctSentence);
        onAnswer(isCorrect);
    };

    // Detect if the target sentence is English (LTR) or Kurdish (RTL)
    const isEnglishSentence = /[a-zA-Z]/.test(exercise.correctSentence[0]);
    const sentenceDir = isEnglishSentence ? 'ltr' : 'rtl';

    return (
        <div className="exercise-container">
            <h2 className="exercise-question" dir="auto">{exercise.question}</h2>
            <div className="source-text-bubble">
                {exercise.sourceText}
            </div>

            <div className="sentence-area" dir={sentenceDir}>
                {sentence.map((word, idx) => (
                    <button key={idx} className="word-chip" onClick={() => removeFromSentence(word)}>
                        {word}
                    </button>
                ))}
            </div>

            <div className="word-bank" dir={sentenceDir}>
                {availableWords.map((word, idx) => (
                    <button key={idx} className="word-chip bank" onClick={() => addToSentence(word)}>
                        {word}
                    </button>
                ))}
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
            if (first.pairId === second.id) {
                setMatched([...matched, first.id, second.id]);
                setSelected([]);
                if (matched.length + 2 === exercise.pairs.length * 2) {
                    setTimeout(() => onAnswer(true), 500);
                }
            } else {
                setTimeout(() => setSelected([]), 1000);
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
                    onClick={() => selected && onAnswer(selected === exercise.correctOption)}
                    disabled={!selected}
                >
                    {t('check')}
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

// Roleplay Chat Exercise Component - AI-powered chat simulation
const RoleplayChat = ({ exercise, onAnswer }) => {
    const { t } = useLanguage();
    const [messages, setMessages] = useState(() => {
        // Initialize with AI messages from the exercise
        return exercise.chatMessages?.filter(m => m.sender === 'ai') || [];
    });
    const [userInput, setUserInput] = useState('');
    const [isChecking, setIsChecking] = useState(false);
    const [feedback, setFeedback] = useState<{ correct: boolean; message: string; correctAnswer?: string } | null>(null);
    const [hasAnswered, setHasAnswered] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Reset state when exercise changes
        setMessages(exercise.chatMessages?.filter(m => m.sender === 'ai') || []);
        setUserInput('');
        setFeedback(null);
        setHasAnswered(false);
        setIsChecking(false);
    }, [exercise.id, exercise.question]);

    useEffect(() => {
        // Scroll to bottom when messages change
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isChecking]);

    const checkAnswer = async () => {
        if (!userInput.trim() || hasAnswered || isChecking) return;

        setIsChecking(true);

        // Add user message to chat
        const userMessage = { sender: 'user' as const, text: userInput, avatar: '👤', name: t('you') || 'You' };
        setMessages(prev => [...prev, userMessage]);

        try {
            // Build conversation history for context
            const historyText = messages.map(m => `${m.name || m.sender}: ${m.text}`).join('\n');

            const prompt = `
            You are a roleplay partner in a language learning app.
            Scenario: "${exercise.scenario}"
            Question: "${exercise.question}"
            
            Conversation Context:
            ${historyText}
            
            The user (You) just said: "${userInput}"

            Is this a valid, intelligible, and appropriate response in English for this context?
            Return ONLY a valid JSON object:
            {
                "isCorrect": boolean,
                "feedback": "constructive feedback on grammar/politeness (keep it short)",
                "aiResponse": "Your next response as the roleplay partner (only if user is correct)"
            }
            `;

            const result = await sendChatMessage(prompt, "You are a helpful language tutor. You act as a strict JSON generator.");

            let evaluation = { isCorrect: false, feedback: "Could not evaluate.", aiResponse: "" };
            try {
                const cleanJson = result.response.replace(/```json/g, '').replace(/```/g, '').trim();
                evaluation = JSON.parse(cleanJson);
            } catch (e) {
                console.error("AI JSON Parse Error", e);
                // Fallback: assume correct if it's long enough, else false
                evaluation.isCorrect = userInput.length > 3;
                evaluation.feedback = evaluation.isCorrect ? "Good effort!" : "Please try to say more.";
            }

            setHasAnswered(true);

            if (evaluation.isCorrect) {
                setFeedback({
                    correct: true,
                    message: evaluation.feedback || t('greatResponse') || 'Great response! 🎉'
                });

                // Add AI response if provided
                if (evaluation.aiResponse) {
                    const aiMessage = {
                        sender: 'ai' as const,
                        text: evaluation.aiResponse,
                        avatar: exercise.chatMessages?.[0]?.avatar || '🤖',
                        name: exercise.chatMessages?.[0]?.name || 'AI'
                    };
                    setTimeout(() => {
                        setMessages(prev => [...prev, aiMessage]);
                    }, 600);
                }
            } else {
                setFeedback({
                    correct: false,
                    message: evaluation.feedback || t('tryAgainHint') || 'Not quite right.',
                    correctAnswer: exercise.acceptableResponses?.[0] || 'Try again'
                });
            }

        } catch (error) {
            console.error("AI Roleplay Error", error);
            // Fallback to local check if API fails
            const localCheck = exercise.acceptableResponses?.some(r => r.toLowerCase().includes(userInput.toLowerCase()));
            setHasAnswered(true);
            setFeedback({
                correct: localCheck || false,
                message: localCheck ? "Good job!" : "Could not verify with AI, but good effort.",
            });
        } finally {
            setIsChecking(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            checkAnswer();
        }
    };

    const handleContinue = () => {
        onAnswer(feedback?.correct || false);
    };

    return (
        <div className="exercise-container roleplay-chat-container" style={{ display: 'flex', flexDirection: 'column', height: '100%', maxHeight: '600px' }}>
            <h2 className="exercise-question">{exercise.question}</h2>

            {/* Scenario description */}
            {exercise.scenario && (
                <div className="roleplay-scenario">
                    <span className="scenario-icon">🎭</span>
                    <p>{exercise.scenario}</p>
                </div>
            )}

            {/* Chat interface */}
            <div className="chat-interface" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                <div className="chat-messages" style={{ flex: 1, overflowY: 'auto' }}>
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`chat-message ${msg.sender}`}>
                            <div className="message-avatar">
                                {msg.avatar || (msg.sender === 'ai' ? '🤖' : '👤')}
                            </div>
                            <div className="message-content">
                                {msg.name && <span className="message-name">{msg.name}</span>}
                                <div className="message-bubble">
                                    {msg.text}
                                </div>
                            </div>
                        </div>
                    ))}

                    {isChecking && (
                        <div className="chat-message ai">
                            <div className="message-avatar">🤖</div>
                            <div className="message-content">
                                <div className="message-bubble typing">
                                    <span className="typing-dot"></span>
                                    <span className="typing-dot"></span>
                                    <span className="typing-dot"></span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>

                {/* Feedback display */}
                {feedback && (
                    <div className={`chat-feedback ${feedback.correct ? 'correct' : 'incorrect'}`}>
                        <div className="feedback-icon">
                            {feedback.correct ? <Check size={20} /> : <X size={20} />}
                        </div>
                        <div className="feedback-text">
                            <p>{feedback.message}</p>
                            {!feedback.correct && feedback.correctAnswer && (
                                <p className="correct-answer">
                                    <strong>{t('correctAnswer') || 'Correct answer'}:</strong> {feedback.correctAnswer}
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* Input area */}
                {!hasAnswered ? (
                    <div className="chat-input-area">
                        <textarea
                            className="chat-input"
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder={t('typeYourResponse') || 'Type your response here...'}
                            rows={2}
                            disabled={isChecking}
                        />
                        <button
                            className={`chat-send-btn ${userInput.trim() && !isChecking ? 'active' : ''}`}
                            onClick={checkAnswer}
                            disabled={!userInput.trim() || isChecking}
                        >
                            {isChecking ? <Loader2 className="animate-spin" size={20} /> : <MessageCircle size={20} />}
                        </button>
                    </div>
                ) : (
                    <div className="exercise-footer" style={{ position: 'sticky', bottom: 0 }}>
                        <Button
                            variant={feedback?.correct ? "success" : "danger"}
                            size="lg"
                            fullWidth
                            onClick={handleContinue}
                        >
                            {t('continue')}
                        </Button>
                    </div>
                )}
            </div>

            {/* Hints */}
            {exercise.hints && exercise.hints.length > 0 && !hasAnswered && (
                <div className="chat-hints">
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

        const utterance = new SpeechSynthesisUtterance(exercise.listenText || exercise.targetTranslation);
        utterance.lang = exercise.listenLang || 'en-US';
        utterance.rate = 0.85;
        utterance.pitch = 1;
        utterance.onend = () => setIsPlaying(false);
        utterance.onerror = () => setIsPlaying(false);
        window.speechSynthesis.speak(utterance);
    };

    // Start speech recognition
    const startListening = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setStatus('unsupported');
            return;
        }

        if (recognitionRef.current) {
            try { recognitionRef.current.abort(); } catch (e) { }
        }

        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;
        recognition.lang = exercise.speechLang || 'en-US';
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.maxAlternatives = 5;

        recognition.onstart = () => {
            setStatus('listening');
            setTranscript('');
        };

        recognition.onresult = (event) => {
            const results = event.results[0];
            const expected = (exercise.expectedAnswer || exercise.targetTranslation).toLowerCase().trim();
            const accepted = (exercise.acceptedAnswers || []).map(a => a.toLowerCase().trim());

            let bestMatch = '';
            let bestScore = 0;

            // Check all alternative transcriptions for best match
            for (let i = 0; i < results.length; i++) {
                const alt = results[i].transcript.toLowerCase().trim();

                // Exact match
                if (alt === expected || accepted.includes(alt)) {
                    bestMatch = alt;
                    bestScore = 1;
                    break;
                }

                // Fuzzy match
                const score = similarity(alt, expected);
                // Also check against accepted answers
                const acceptedScore = Math.max(0, ...accepted.map(a => similarity(alt, a)));
                const finalScore = Math.max(score, acceptedScore);

                if (finalScore > bestScore) {
                    bestScore = finalScore;
                    bestMatch = alt;
                }
            }

            setTranscript(bestMatch || results[0].transcript);
            setStatus('processing');

            const isCorrect = bestScore >= 0.6;

            setTimeout(() => {
                setStatus(isCorrect ? 'correct' : 'incorrect');
                setAttempts(prev => prev + 1);
            }, 800);
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            if (event.error === 'no-speech') {
                setStatus('idle');
            } else if (event.error === 'not-allowed') {
                setStatus('error');
            } else {
                setStatus('idle');
            }
        };

        recognition.onend = () => {
            if (statusRef.current === 'listening') {
                setStatus('idle');
            }
        };

        try {
            recognition.start();
        } catch (e) {
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

            {/* Target Word Card */}
            <div className="pronunciation-card">
                {exercise.image && (
                    <div className="pronunciation-emoji">
                        <IconRenderer emoji={exercise.image} size={64} />
                    </div>
                )}

                <div className="pronunciation-target" dir="auto">
                    {exercise.targetWord}
                </div>

                {exercise.pronunciation && (
                    <div className="pronunciation-phonetic">
                        /{exercise.pronunciation}/
                    </div>
                )}

                <div className="pronunciation-meaning">
                    {exercise.targetTranslation}
                </div>

                <button
                    className={`pronunciation-listen-btn ${isPlaying ? 'playing' : ''}`}
                    onClick={speakWord}
                    type="button"
                    disabled={isPlaying}
                >
                    {isPlaying ? (
                        <>
                            <span className="listen-icon">🔊</span>
                            <span>Playing...</span>
                        </>
                    ) : (
                        <>
                            <span className="listen-icon">🔊</span>
                            <span>Listen</span>
                        </>
                    )}
                </button>
            </div>

            {/* Mic Area */}
            <div className={`pronunciation-mic-area ${status}`}>
                {/* IDLE - Show mic button */}
                {status === 'idle' && (
                    <button className="pronunciation-mic-btn" onClick={startListening} type="button">
                        <div className="mic-circle">
                            <span className="mic-emoji">🎤</span>
                        </div>
                        <span className="mic-label">Tap to Speak</span>
                    </button>
                )}

                {/* LISTENING - Animated pulse */}
                {status === 'listening' && (
                    <div className="pronunciation-listening">
                        <div className="pulse-container">
                            <div className="pulse-wave"></div>
                            <div className="pulse-wave delay-1"></div>
                            <div className="pulse-wave delay-2"></div>
                            <div className="mic-circle active">
                                <span className="mic-emoji">🎤</span>
                            </div>
                        </div>
                        <span className="listening-label">Listening...</span>
                        <div className="sound-bars">
                            <div className="bar"></div>
                            <div className="bar"></div>
                            <div className="bar"></div>
                            <div className="bar"></div>
                            <div className="bar"></div>
                            <div className="bar"></div>
                            <div className="bar"></div>
                        </div>
                    </div>
                )}

                {/* PROCESSING */}
                {status === 'processing' && (
                    <div className="pronunciation-processing">
                        <Loader2 className="animate-spin" size={40} color="#1cb0f6" />
                        <span>Analyzing pronunciation...</span>
                    </div>
                )}

                {/* CORRECT */}
                {status === 'correct' && (
                    <div className="pronunciation-result correct">
                        <div className="result-badge correct">
                            <Check size={32} />
                        </div>
                        <h3>Perfect! 🎉</h3>
                        <p className="you-said">You said: <strong>"{transcript}"</strong></p>
                    </div>
                )}

                {/* INCORRECT */}
                {status === 'incorrect' && (
                    <div className="pronunciation-result incorrect">
                        <div className="result-badge incorrect">
                            <X size={32} />
                        </div>
                        <h3>Not quite right</h3>
                        <p className="you-said">You said: <strong>"{transcript}"</strong></p>
                        <p className="expected-answer">
                            Expected: <strong>"{exercise.expectedAnswer || exercise.targetTranslation}"</strong>
                        </p>
                    </div>
                )}

                {/* ERROR - Mic permission denied */}
                {status === 'error' && (
                    <div className="pronunciation-result error">
                        <div className="result-badge error">⚠️</div>
                        <h3>Microphone Blocked</h3>
                        <p>Please allow microphone access in your browser settings and try again.</p>
                    </div>
                )}

                {/* UNSUPPORTED - Browser doesn't support speech */}
                {status === 'unsupported' && (
                    <div className="pronunciation-result error">
                        <div className="result-badge error">🌐</div>
                        <h3>Not Supported</h3>
                        <p>Speech recognition is not available in this browser. Try Chrome or Edge for voice features.</p>
                    </div>
                )}
            </div>

            {/* Footer Actions */}
            <div className="exercise-footer">
                {status === 'correct' && (
                    <Button variant="success" size="lg" fullWidth onClick={handleContinue}>
                        {t('continue')}
                    </Button>
                )}
                {status === 'incorrect' && attempts < 3 && (
                    <Button variant="primary" size="lg" fullWidth onClick={handleRetry}>
                        🎤 Try Again ({3 - attempts} left)
                    </Button>
                )}
                {status === 'incorrect' && attempts >= 3 && (
                    <Button variant="danger" size="lg" fullWidth onClick={handleContinue}>
                        {t('continue')}
                    </Button>
                )}
                {(status === 'error' || status === 'unsupported') && (
                    <Button variant="primary" size="lg" fullWidth onClick={handleSkip}>
                        Skip Exercise
                    </Button>
                )}
            </div>
        </div>
    );
};

export default Lesson;
