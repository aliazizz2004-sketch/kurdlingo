import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    MagnifyingGlass, ArrowLeft, BookmarkSimple, SpeakerHigh, 
    Lightbulb, CaretRight, X
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
  categoryId: string;
  categoryName: string;
}



const BookDictionary: React.FC = () => {
    const navigate = useNavigate();
    const { speak } = useTextToSpeech();

    const [view, setView] = useState<'list' | 'detail'>('list');
    const [selectedWord, setSelectedWord] = useState<MappedWord | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
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
                mnemonic: `A common phrase to use when talking about ${cat.name.english.toLowerCase()}.`,
                categoryId: cat.id,
                categoryName: cat.name.english
            }))
        );
    }, []);

    const filteredWords = useMemo(() => {
        let base = allWords;
        if (selectedCategory !== 'all') {
            base = base.filter(w => w.categoryId === selectedCategory);
        }
        
        if (!searchTerm.trim()) return selectedCategory === 'all' ? base.slice(0, 15) : base;

        const lowerSearched = searchTerm.toLowerCase();
        return base.filter(w => 
            w.word.toLowerCase().includes(lowerSearched) || 
            w.defs[0].meaning.toLowerCase().includes(lowerSearched)
        );
    }, [searchTerm, selectedCategory, allWords]);

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
                showToast("لابرا لە وشە پاشەکەوتکراوەکان");
            } else {
                next.add(id);
                showToast("زیادکرا بۆ وشە پاشەکەوتکراوەکان");
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
                    <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>فەرهەنگ</h2>
                </div>
                
                <div className="search-bar-wrapper">
                    <MagnifyingGlass size={20} className="search-icon" weight="bold" />
                    <input 
                        type="text" 
                        className="search-input" 
                        placeholder="بەدوای ئینگلیزی یان کوردی بگەڕێ..." 
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
            
            <div className="category-pills-row" style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '0 20px 16px', scrollbarWidth: 'none' }}>
                <button 
                   className={`pill-chip ${selectedCategory === 'all' ? 'pill-active' : ''}`} 
                   onClick={() => setSelectedCategory('all')}
                   style={{ background: selectedCategory === 'all' ? 'var(--color-primary)' : 'var(--color-surface-variant)', color: selectedCategory === 'all' ? '#fff' : 'inherit', whiteSpace: 'nowrap' }}
                >
                   هەموو وشەکان
                </button>
                {bookDictionaryData.map(c => (
                    <button 
                       key={c.id}
                       className={`pill-chip ${selectedCategory === c.id ? 'pill-active' : ''}`}
                       onClick={() => setSelectedCategory(c.id)}
                       style={{ background: selectedCategory === c.id ? 'var(--color-primary)' : 'var(--color-surface-variant)', color: selectedCategory === c.id ? '#fff' : 'inherit', whiteSpace: 'nowrap' }}
                    >
                       {c.name.english}
                    </button>
                ))}
            </div>

            <div className="list-scroll-area">
                <div className="list-section-label">
                    {searchTerm ? 'ئەنجامەکان' : 'نوێترین'}
                </div>
                <div className="word-list">
                    {filteredWords.map(w => (
                        <div 
                            key={w.id} 
                            className={`word-row ${selectedWord?.id === w.id ? 'selected' : ''}`} 
                            onClick={() => { setSelectedWord(w); setView('detail'); }}
                        >
                            <div className="row-content" dir="ltr" style={{ textAlign: 'left' }}>
                                <div className="row-head">
                                    <span className="row-word serif-font">{w.word}</span>
                                    <span className="row-meta">{w.pos} • {w.phonetic}</span>
                                </div>
                                <span className="row-preview" dir="rtl" style={{ textAlign: 'right', display: 'block' }}>{w.defs[0].meaning}</span>
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
                            هیچ وشەیەک نەدۆزرایەوە بۆ "{searchTerm}"
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
                    <p>وشەیەک هەڵبژێرە بۆ بینینی وردەکارییەکەی</p>
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
                            گوێبگرە
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
                                    {def.ex !== selectedWord.word && (
                                        <div className="def-ex">
                                            <p className="ex-text">{def.ex}</p>
                                            <p className="ex-trans">{def.trans}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {(selectedWord.synonyms.length > 0 || selectedWord.antonyms.length > 0) && (
                        <div className="detail-section">
                            <div className="syn-card">
                                {selectedWord.synonyms.length > 0 && (
                                    <>
                                        <div className="section-title">هاوواتا</div>
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
                                        <div className="section-title">دژواتا</div>
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
                                <div className="section-title">تێبینی بۆ لەبەرکردن</div>
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
                    <button className="btn-outline" onClick={() => {
                        toggleBookmark(selectedWord.id);
                        if (!savedWords.has(selectedWord.id)) showToast("زیادکرا بۆ کۆمەڵە!");
                    }}>
                        + زیادکردن بۆ کۆمەڵە
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="modern-dict-wrapper">
            {renderSidebar()}
            
            <div className={`modern-dict-main ${view === 'list' ? 'mobile-hidden' : ''}`}>
                {renderDetail()}

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




export default BookDictionary;
