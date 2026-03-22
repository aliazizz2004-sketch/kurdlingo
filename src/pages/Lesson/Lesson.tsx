// @ts-nocheck
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    // UI Icons
    X, Check, Heart, Sparkles, RefreshCw, ChevronRight,
    Settings, Play, Pause, RotateCcw, Loader2, Volume2, Mic, MicOff, CheckCircle2, XCircle
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
import { unit6 } from '../../data/courses/unit6';
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
        const allUnits = savedUnits || [unit1, unit2, unit3, unit4, unit5, unit6, intermediateUnit1];

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
                    { primary: '#3b82f6', dark: '#2563eb', light: '#1e2f3b' }, // Unit 2: Blue
                    { primary: '#a855f7', dark: '#9333ea', light: '#271933' }, // Unit 3: Purple
                    { primary: '#ef4444', dark: '#dc2626', light: '#3d1a1a' }  // Unit 4: Red
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
                                <h3>{feedback === 'correct' ? (t('correct') || '✓ دروستە!') : (t('incorrect') || '✗ هەڵەیە!')}</h3>
                                {feedback === 'incorrect' && (
                                    <p>{t('correctSolution') || 'وەڵامی دروست:'} {' '}
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
            speakText(aiGreeting.text).finally(() => setIsSpeakingAI(false));
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

    // TTS helper - speak text using Gemini or fallback to browser Web Speech API
    const speakText = async (text: string) => {
        try {
            const { requestGeminiVoice, playBase64Audio } = await import('../../services/api');
            const result = await requestGeminiVoice(text);
            if (result.success && result.audioContent) {
                await playBase64Audio(result.audioContent, result.mimeType || 'audio/wav');
                return;
            }
            // Gemini failed silently — fall through to browser TTS below
        } catch (_e) {
            // Gemini TTS unavailable (404 in local dev, CORS, etc.) — use browser TTS
        }
        // Fallback: Web Speech API (male voice)
        if ('speechSynthesis' in window) {
            return new Promise<void>((resolve) => {
                window.speechSynthesis.cancel();
                const utterance = new SpeechSynthesisUtterance(text);
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
                utterance.onend = () => resolve();
                utterance.onerror = () => resolve();
                window.speechSynthesis.speak(utterance);
            });
        }
    };

    // Toggle voice recording (click to start, click again to stop)
    const toggleRecording = () => {
        if (isCheckingRef.current || hasAnsweredRef.current || isTranscribing) return;

        if (isRecording) {
            // Stop recording manually
            setIsRecording(false);
            if (recognitionRef.current) {
                try { recognitionRef.current.stop(); } catch (e) { }
            }
            return;
        }

        // Start recording
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setVoiceError(t('unsupportedBrowser') || 'Speech recognition is not available in this browser.');
            return;
        }

        setVoiceError(null);

        if (recognitionRef.current) {
            try { recognitionRef.current.abort(); } catch (e) { }
        }

        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;
        recognition.lang = exercise.speechLang || 'en-US';
        recognition.continuous = true; // MUST be true so it doesn't stop on pause
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;

        let accumulatedTranscript = '';
        let latestSpoken = '';

        setIsRecording(true); // Set synchronously to avoid double clicks
        setSpokenText('');

        recognition.onstart = () => {
             // State is already set
        };

        recognition.onresult = (event: any) => {
            let interim = '';
            let finalStr = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalStr += event.results[i][0].transcript + ' ';
                } else {
                    interim += event.results[i][0].transcript;
                }
            }
            accumulatedTranscript += finalStr;
            latestSpoken = accumulatedTranscript + interim;
            setSpokenText(latestSpoken);
        };

        recognition.onerror = (event: any) => {
            // 'no-speech' on continuous mode just means a brief silence — ignore it and keep going
            if (event.error === 'no-speech') {
                // Don't stop — browser will auto-restart on continuous=true
                return;
            }
            if (event.error === 'aborted') {
                // Manual abort (user stopped), don't show error
                return;
            }
            if (event.error === 'network') {
                // Google's STT servers unreachable (common on localhost or restricted networks).
                // Silently stop — the onend handler will submit whatever was captured.
                setIsRecording(false);
                setIsTranscribing(false);
                return;
            }
            // Real error — stop and show message
            setIsRecording(false);
            setIsTranscribing(false);
            setVoiceError(t('couldNotHear') || 'Could not hear you. Please try again.');
        };

        recognition.onend = () => {
            const wasRecording = isRecording;
            setIsRecording(false);
            setIsTranscribing(false);
            
            // If we have text gathered, submit it
            if (latestSpoken.trim()) {
                submitAnswer(latestSpoken.trim());
            } else if (accumulatedTranscript.trim()) {
                submitAnswer(accumulatedTranscript.trim());
            }
            // If continuous mode ended unexpectedly with no text AND we haven't stopped manually,
            // do NOT auto-restart (avoid infinite loops). User taps again if needed.
        };

        try {
            recognition.start();
        } catch (err) {
            console.error('Recognition start error:', err);
            setIsRecording(false);
            setVoiceError(t('voiceError') || 'Voice processing failed. Please try again.');
        }
    };

    // Replay the last AI message
    const replayAIMessage = () => {
        if (isSpeakingAI) return;
        const aiMessages = messages.filter(m => m.sender === 'ai');
        if (aiMessages.length > 0) {
            const lastAiMsg = aiMessages[aiMessages.length - 1].text;
            setIsSpeakingAI(true);
            speakText(lastAiMsg).finally(() => setIsSpeakingAI(false));
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

            Is this a valid, intelligible, and appropriate response for this context?
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

                // Show the confirm message from exercise data, or fallback to AI response
                const confirmMsg = (exercise.chatMessages || []).find(m => m.sender === 'ai' && m.text.startsWith('confirm:'));
                const responseText = confirmMsg 
                    ? confirmMsg.text.replace('confirm:', '').trim() 
                    : evaluation.aiResponse;
                
                if (responseText) {
                    const aiMessage = {
                        sender: 'ai' as const,
                        text: responseText,
                        avatar: exercise.chatMessages?.[0]?.avatar || '🤖',
                        name: exercise.chatMessages?.[0]?.name || 'AI'
                    };
                    setTimeout(() => {
                        setMessages(prev => [...prev, aiMessage]);
                        speakText(responseText);
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
        <div className="exercise-container roleplay-chat-container">
            <h2 className="exercise-question" dir="auto">{exercise.question}</h2>

            {/* Scenario description */}
            {exercise.scenario && (
                <div className="roleplay-scenario" style={{ marginBottom: '20px' }}>
                    <span className="scenario-icon">🎭</span>
                    <p>{exercise.scenario}</p>
                </div>
            )}

            {/* Simplified UI - AI Character & Question */}
            <div className="pronunciation-card" style={{ marginBottom: '30px' }}>
                <div className="pronunciation-emoji" style={{ fontSize: '64px', marginBottom: '10px' }}>
                    {messages[0]?.avatar || '🤖'}
                </div>
                <div className="pronunciation-target" dir="rtl" style={{ fontSize: '24px', fontWeight: 'bold' }}>
                    {messages[0]?.text}
                </div>
                <button
                    className={`pronunciation-listen-btn ${isSpeakingAI ? 'playing' : ''}`}
                    onClick={replayAIMessage}
                    type="button"
                    disabled={isSpeakingAI}
                    style={{ marginTop: '15px' }}
                >
                    <Volume2 size={20} />
                    <span>{isSpeakingAI ? (t('playing') || 'گوێگرتن...') : (t('listen') || '🔊 گوێبگرە')}</span>
                </button>
            </div>

            {/* Simplified Mic Area */}
            <div className={`pronunciation-mic-area ${hasAnswered ? (feedback?.correct ? 'correct' : 'incorrect') : (isRecording ? 'listening' : (isChecking || isTranscribing ? 'processing' : 'idle'))}`}>
                
                {/* IDLE / NOT RECORDING YET */}
                {!isRecording && !isChecking && !isTranscribing && !hasAnswered && (
                    <div className="pron-idle-state">
                        <button className="pronunciation-mic-btn" onClick={toggleRecording} type="button">
                            <div className="mic-circle">
                                <Mic size={40} strokeWidth={1.5} color="white" />
                            </div>
                            <span className="mic-label">{t('tapToSpeak') || 'بکلیک بکە و وەڵام بدەوە'}</span>
                        </button>
                    </div>
                )}

                {/* RECORDING / LISTENING */}
                {isRecording && (
                    <div className="pronunciation-listening" onClick={toggleRecording} style={{cursor: 'pointer'}}>
                        <div className="pulse-container">
                            <div className="pulse-wave"></div>
                            <div className="pulse-wave delay-1"></div>
                            <div className="pulse-wave delay-2"></div>
                            <div className="mic-circle active">
                                <Mic size={40} strokeWidth={1.5} color="white" />
                            </div>
                        </div>
                        <span className="listening-label">{t('tapToStop') || 'تکلیک بکە بۆ وەستان 🛑'}</span>
                        {spokenText && <p style={{marginTop: '15px', fontWeight: 'bold'}} dir="auto">"{spokenText}"</p>}
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
                    <Button
                        variant={feedback?.correct ? "success" : "danger"}
                        size="lg"
                        fullWidth
                        onClick={handleContinue}
                    >
                        {t('continue') || 'بەردەوامبە'}
                    </Button>
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

                {/* IDLE - Beautiful mic button */}
                {status === 'idle' && (
                    <div className="pron-idle-state">
                        <button className="pronunciation-mic-btn" onClick={startListening} type="button" aria-label="Start speaking">
                            <div className="mic-circle">
                                <Mic size={40} strokeWidth={1.5} color="white" />
                            </div>
                            <span className="mic-label">{t('tapToSpeak') || 'بکلیک بکە و بخوێنەرەوە'}</span>
                        </button>
                        {attempts > 0 && (
                            <div className="pron-attempts-badge">
                                {t('attemptsLeft') || 'هەوڵی ماوە'}: {3 - attempts}
                            </div>
                        )}
                    </div>
                )}

                {/* LISTENING - Professional animated state */}
                {status === 'listening' && (
                    <div className="pronunciation-listening">
                        <div className="pulse-container">
                            <div className="pulse-wave"></div>
                            <div className="pulse-wave delay-1"></div>
                            <div className="pulse-wave delay-2"></div>
                            <div className="mic-circle active">
                                <Mic size={40} strokeWidth={1.5} color="white" />
                            </div>
                        </div>
                        <span className="listening-label">{t('listening') || '🎤 گوێگرتن...'}</span>
                        <div className="sound-bars">
                            <div className="bar"></div>
                            <div className="bar"></div>
                            <div className="bar"></div>
                            <div className="bar"></div>
                            <div className="bar"></div>
                            <div className="bar"></div>
                            <div className="bar"></div>
                        </div>
                        <p className="pron-instruction">{t('speakClearly') || 'ئاشکرا بخوێنەرەوە...'}</p>
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
