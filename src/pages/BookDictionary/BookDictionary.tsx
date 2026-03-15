import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    MagnifyingGlass, ArrowLeft, BookmarkSimple, SpeakerHigh, 
    Lightbulb, CaretRight, X, CheckCircle
} from '@phosphor-icons/react';
import useTextToSpeech from '../../hooks/useTextToSpeech';
import { bookDictionaryData } from '../../data/bookDictionaryData';
import './BookDictionary.css';

interface MappedWord {
  id: string;
  word: string; // This is now English
  pos: string;
  phonetic: string;
  freq: number;
  freqLabel: string;
  level: number;
  levelLabel: string;
  defs: Array<{ meaning: string; ex: string; trans: string }>;
  synonyms: string[];
  antonyms: string[];
  mnemonic: string;
}

interface QuizQuestion {
    id: string;
    type: 'translate' | 'audio' | 'meaning' | 'fill-in-blank';
    questionText: string;
    options: string[];
    correctAnswer: string;
    audioText?: string;
    sentenceParts?: { before: string; after: string; fallback: string };
}

const BookDictionary: React.FC = () => {
    const navigate = useNavigate();
    const { speak } = useTextToSpeech();

    const [view, setView] = useState<'list' | 'detail' | 'quiz'>('list');
    const [selectedWord, setSelectedWord] = useState<MappedWord | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [savedWords, setSavedWords] = useState<Set<string>>(new Set());
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    // Audio State
    const [isPlaying, setIsPlaying] = useState(false);

    // Dynamic Data Mapping (Ensuring it's learning English now)
    const allWords: MappedWord[] = useMemo(() => {
        return bookDictionaryData.flatMap(cat => 
            cat.entries.map((entry, idx) => ({
                id: entry.id || `${cat.id}-${idx}`,
                word: entry.english, // Make the English word the main focus
                pos: 'Phrase',
                phonetic: entry.pronunciation || '/.../', // E.g. phonetic notation if available, otherwise fallback
                freq: Math.floor(Math.random() * 80) + 10,
                freqLabel: cat.name.english + ' Core',
                level: Math.floor(Math.random() * 5) + 1,
                levelLabel: `Level A1 — ${cat.name.english}`,
                defs: [{ 
                    meaning: entry.kurdish, // Meaning in Kurdish
                    ex: entry.example?.english || entry.english, // Example in English
                    trans: entry.example?.kurdish || entry.kurdish // Example translation in Kurdish
                }],
                synonyms: [], 
                antonyms: [],
                mnemonic: `A common phrase to use when talking about ${cat.name.english.toLowerCase()}.`
            }))
        );
    }, []);

    const filteredWords = useMemo(() => {
        if (!searchTerm.trim()) return allWords.slice(0, 15); // Show recent 15 when empty
        const lowerSearched = searchTerm.toLowerCase();
        return allWords.filter(w => 
            w.word.toLowerCase().includes(lowerSearched) || 
            w.defs[0].meaning.toLowerCase().includes(lowerSearched)
        );
    }, [searchTerm, allWords]);

    // Helpers
    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 2500);
    };

    const toggleBookmark = (id: string) => {
        setSavedWords(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
                showToast("Removed from saved words");
            } else {
                next.add(id);
                showToast("Added to saved words");
            }
            return next;
        });
    };

    const handlePlayAudio = (text: string) => {
        setIsPlaying(true);
        speak(text, () => setIsPlaying(false));
    };

    const navigateToWord = (wordStr: string) => {
        const found = allWords.find(w => w.word === wordStr || w.defs[0].meaning === wordStr);
        if (found) {
            setSelectedWord(found);
            setView('detail');
        }
    };

    // Components
    const renderSidebar = () => (
        <div className={`modern-dict-sidebar ${view !== 'list' ? 'mobile-hidden' : ''}`}>
            <header className="dict-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                    <button className="icon-btn" onClick={() => navigate(-1)} style={{ marginLeft: '-8px' }}>
                        <ArrowLeft size={24} weight="bold" />
                    </button>
                    <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>Dictionary</h2>
                </div>
                
                <div className="search-bar-wrapper">
                    <MagnifyingGlass size={20} className="search-icon" weight="bold" />
                    <input 
                        type="text" 
                        className="search-input" 
                        placeholder="Search English or Kurdish..." 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                        <button className="clear-icon" onClick={() => setSearchTerm('')}>
                            <X size={20} weight="bold" />
                        </button>
                    )}
                </div>
            </header>

            <div className="list-scroll-area">
                <div className="list-section-label">
                    {searchTerm ? 'Results' : 'Recent'}
                </div>
                <div className="word-list">
                    {filteredWords.map(w => (
                        <div 
                            key={w.id} 
                            className={`word-row ${selectedWord?.id === w.id ? 'selected' : ''}`} 
                            onClick={() => { setSelectedWord(w); setView('detail'); }}
                        >
                            <div className="row-content">
                                <div className="row-head">
                                    <span className="row-word serif-font">{w.word}</span>
                                    <span className="row-meta">{w.pos} • {w.phonetic}</span>
                                </div>
                                <span className="row-preview">{w.defs[0].meaning}</span>
                            </div>
                            <div className="row-right">
                                <div className="difficulty-dots">
                                    {[1,2,3,4,5].map(dot => (
                                        <div key={dot} className={`dot ${dot <= w.level ? 'filled' : ''}`} />
                                    ))}
                                </div>
                                <CaretRight size={20} className="row-arrow" weight="bold" />
                            </div>
                        </div>
                    ))}
                    {filteredWords.length === 0 && (
                        <div style={{ padding: '40px 20px', textAlign: 'center', color: '#6B7280' }}>
                            No words found for "{searchTerm}"
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    const renderDetail = () => {
        if (!selectedWord) {
            return (
                <div className="desktop-placeholder">
                    <MagnifyingGlass size={64} weight="light" color="#D1D5DB" />
                    <p>Select a word to see its details</p>
                </div>
            );
        }

        return (
            <div className="detail-screen">
                <header className="detail-header">
                    <button className="icon-btn detail-back-btn" onClick={() => setView('list')}>
                        <ArrowLeft size={24} weight="bold" />
                    </button>
                    <button 
                        className={`icon-btn ${savedWords.has(selectedWord.id) ? 'active' : ''}`} 
                        onClick={() => toggleBookmark(selectedWord.id)}
                    >
                        <BookmarkSimple size={24} weight={savedWords.has(selectedWord.id) ? "fill" : "bold"} />
                    </button>
                </header>

                <div className="list-scroll-area">
                    <div className="hero-block">
                        <span className="pos-badge">{selectedWord.pos}</span>
                        <h1 className="headword serif-font">{selectedWord.word}</h1>
                        <p className="phonetic">{selectedWord.phonetic}</p>
                        
                        <button className="listen-btn" onClick={() => handlePlayAudio(selectedWord.word)}>
                            <SpeakerHigh size={20} weight="fill" />
                            Listen
                            <div className={`waveform ${isPlaying ? 'playing' : ''}`}>
                                <div className="bar"></div>
                                <div className="bar"></div>
                                <div className="bar"></div>
                                <div className="bar"></div>
                            </div>
                        </button>
                        
                        <span className="freq-label">{selectedWord.freqLabel}</span>
                    </div>

                    <div className="detail-section">
                        <div className="def-card">
                            {selectedWord.defs.map((def, idx) => (
                                <div key={idx} className="def-item">
                                    <div className="def-meaning">
                                        <span className="def-num">{idx + 1}.</span>
                                        <span className="def-text">{def.meaning}</span>
                                    </div>
                                    <div className="def-ex">
                                        <p className="ex-text">{def.ex}</p>
                                        <p className="ex-trans">{def.trans}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {(selectedWord.synonyms.length > 0 || selectedWord.antonyms.length > 0) && (
                        <div className="detail-section">
                            <div className="syn-card">
                                {selectedWord.synonyms.length > 0 && (
                                    <>
                                        <div className="section-title">Synonyms</div>
                                        <div className="pill-group" style={{ marginBottom: 16 }}>
                                            {selectedWord.synonyms.map(syn => (
                                                <button key={syn} className="pill-chip" onClick={() => navigateToWord(syn)}>
                                                    {syn}
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}
                                {selectedWord.antonyms.length > 0 && (
                                    <>
                                        <div className="section-title">Antonyms</div>
                                        <div className="pill-group">
                                            {selectedWord.antonyms.map(ant => (
                                                <button key={ant} className="pill-chip antonym" onClick={() => navigateToWord(ant)}>
                                                    ↔ {ant}
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="detail-section">
                        <div className="tip-card">
                            <div className="tip-icon">
                                <Lightbulb size={24} weight="fill" />
                            </div>
                            <div className="tip-content">
                                <div className="section-title">Memory Tip</div>
                                <p className="tip-text">{selectedWord.mnemonic}</p>
                            </div>
                        </div>
                    </div>

                    <div className="detail-section">
                        <div className="diff-card">
                            <span className="diff-label">{selectedWord.levelLabel}</span>
                            <div className="difficulty-dots">
                                {[1,2,3,4,5].map(dot => (
                                    <div key={dot} className={`dot ${dot <= selectedWord.level ? 'filled' : ''}`} />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bottom-bar">
                    <button className="btn-primary" onClick={() => setView('quiz')}>
                        Practice this word
                    </button>
                    <button className="btn-outline" onClick={() => {
                        toggleBookmark(selectedWord.id);
                        if (!savedWords.has(selectedWord.id)) showToast("Added to deck!");
                    }}>
                        + Add to deck
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="modern-dict-wrapper">
            {renderSidebar()}
            
            <div className={`modern-dict-main ${view === 'list' ? 'mobile-hidden' : ''}`}>
                {view === 'quiz' && selectedWord ? (
                    <QuizScreen word={selectedWord} allWords={allWords} onBack={() => setView('detail')} speak={speak} />
                ) : (
                    renderDetail()
                )}

                <AnimatePresence>
                    {toastMessage && (
                        <motion.div 
                            initial={{ opacity: 0, y: 50, x: '-50%' }}
                            animate={{ opacity: 1, y: 0, x: '-50%' }}
                            exit={{ opacity: 0, y: 20, x: '-50%' }}
                            className="dict-toast"
                        >
                            {toastMessage}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};


// -----------------------------------------------------------------------------
// QUIZ SCREEN COMPONENT
// -----------------------------------------------------------------------------
const QuizScreen = ({ word, allWords, onBack, speak }: { word: MappedWord, allWords: MappedWord[], onBack: () => void, speak: (text: string, onEnd?: () => void) => void }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [score, setScore] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);

    // Generate questions once on mount
    const questions: QuizQuestion[] = useMemo(() => {
        const getWrongOptions = (correct: string, type: 'kurdish' | 'english') => {
            const others = allWords.filter(w => (type === 'kurdish' ? w.defs[0].meaning : w.word) !== correct);
            const shuffled = others.sort(() => 0.5 - Math.random());
            return shuffled.slice(0, 3).map(w => type === 'kurdish' ? w.defs[0].meaning : w.word);
        };

        // Audio Question: What do you hear?
        const q1: QuizQuestion = {
            id: 'q1',
            type: 'audio',
            questionText: 'What do you hear?',
            correctAnswer: word.defs[0].meaning,
            audioText: word.word, 
            options: [word.defs[0].meaning, ...getWrongOptions(word.defs[0].meaning, 'kurdish')].sort(() => 0.5 - Math.random())
        };

        // Usage / Fill in blank
        const rawSentence = word.defs[0].ex;
        const regex = new RegExp(`(${word.word})`, 'i');
        const parts = rawSentence.split(regex);
        let before = "", after = "", fallback = "";
        if (parts.length >= 3) {
            before = parts[0];
            after = parts.slice(2).join("");
        } else {
            fallback = rawSentence; // word not perfectly matched
        }

        const q2: QuizQuestion = {
            id: 'q2',
            type: 'fill-in-blank',
            questionText: 'Complete the sentence:',
            correctAnswer: word.word,
            sentenceParts: { before, after, fallback },
            options: [word.word, ...getWrongOptions(word.word, 'english')].sort(() => 0.5 - Math.random())
        };

        // Translation
        const q3: QuizQuestion = {
            id: 'q3',
            type: 'translate',
            questionText: `How do you say "${word.defs[0].meaning}"?`,
            correctAnswer: word.word,
            options: [word.word, ...getWrongOptions(word.word, 'english')].sort(() => 0.5 - Math.random())
        };
        
        return [q1, q2, q3];
    }, [word, allWords]);

    const currentQ = questions[currentIndex];

    const handleOptionSelect = (option: string) => {
        if (selectedOption) return; // Prevent double clicking
        setSelectedOption(option);
        if (option === currentQ.correctAnswer) {
            setScore(s => s + 1);
        }
    };

    const handleNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(i => i + 1);
            setSelectedOption(null);
        } else {
            setIsFinished(true);
        }
    };

    if (isFinished) {
        return (
            <div className="quiz-screen">
                <div className="quiz-final">
                    <div className="final-icon">
                        <CheckCircle size={48} weight="fill" />
                    </div>
                    <h2 className="final-title">Good job!</h2>
                    <p className="final-score">You scored {score} / {questions.length}</p>
                    
                    <div className="final-actions">
                        <button className="btn-primary" onClick={() => {
                            setCurrentIndex(0);
                            setScore(0);
                            setSelectedOption(null);
                            setIsFinished(false);
                        }}>Try again</button>
                        <button className="btn-outline" onClick={onBack}>Back to word</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="quiz-screen">
            <header className="quiz-header">
                <button className="icon-btn" onClick={onBack} style={{ marginLeft: '-8px' }}>
                    <X size={24} weight="bold" />
                </button>
                <div className="quiz-progress">
                    {currentIndex + 1} / {questions.length}
                </div>
                <div style={{ width: 40 }}></div> {/* placeholder for balance */}
            </header>

            <div className="quiz-content">
                <h2 className="quiz-question">
                    {currentQ.questionText}
                </h2>

                {currentQ.type === 'audio' && (
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
                        <button 
                            className="listen-btn" 
                            style={{ margin: 0, padding: '16px 32px', fontSize: '1.2rem' }}
                            onClick={() => {
                                setIsPlaying(true);
                                speak(currentQ.audioText || '', () => setIsPlaying(false));
                            }}
                        >
                            <SpeakerHigh size={28} weight={isPlaying ? "fill" : "bold"} />
                            <div className={`waveform ${isPlaying ? 'playing' : ''}`}>
                                <div className="bar"></div>
                                <div className="bar"></div>
                                <div className="bar"></div>
                                <div className="bar"></div>
                            </div>
                        </button>
                    </div>
                )}

                {currentQ.type === 'fill-in-blank' && currentQ.sentenceParts && (
                    <div style={{ textAlign: 'center', marginBottom: '32px', fontSize: '1.4rem', lineHeight: 1.6 }}>
                        {currentQ.sentenceParts.fallback ? (
                            <>
                                {currentQ.sentenceParts.fallback}
                                <br/>
                                <span style={{ color: 'var(--primary-dark)', fontWeight: 'bold' }}>(______)</span>
                            </>
                        ) : (
                            <>
                                <span>{currentQ.sentenceParts.before}</span>
                                <span style={{ display: 'inline-block', borderBottom: '3px solid var(--text-muted)', width: '80px', margin: '0 8px' }}>
                                    {selectedOption && selectedOption === currentQ.correctAnswer && (
                                        <span style={{ color: 'var(--primary-dark)', fontWeight: 'bold' }}>{selectedOption}</span>
                                    )}
                                </span>
                                <span>{currentQ.sentenceParts.after}</span>
                            </>
                        )}
                    </div>
                )}

                <div className="quiz-options">
                    {currentQ.options.map((opt, i) => {
                        let statusClass = '';
                        if (selectedOption) {
                            if (opt === currentQ.correctAnswer) statusClass = 'correct';
                            else if (opt === selectedOption) statusClass = 'incorrect';
                        }
                        
                        return (
                            <button 
                                key={i} 
                                className={`quiz-option ${statusClass}`}
                                onClick={() => handleOptionSelect(opt)}
                                disabled={selectedOption !== null}
                            >
                                {opt}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="quiz-footer">
                <button 
                    className="btn-primary" 
                    style={{ width: '100%', opacity: selectedOption ? 1 : 0.5, maxWidth: '600px', margin: '0 auto' }}
                    disabled={!selectedOption}
                    onClick={handleNext}
                >
                    {currentIndex === questions.length - 1 ? 'Finish' : 'Next'}
                </button>
            </div>
        </div>
    );
};

export default BookDictionary;
