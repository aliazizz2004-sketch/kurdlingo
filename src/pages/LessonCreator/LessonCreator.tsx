import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCreator.css';

// Game type configurations with icons and descriptions
const gameTypes = [
  {
    id: 'multiple-choice',
    icon: '🎯',
    name: 'Multiple Choice',
    description: 'Classic quiz with 4 options',
    color: '#ff9600',
    preview: '❓ → A B C D'
  },
  {
    id: 'image-selection',
    icon: '🖼️',
    name: 'Image Selection',
    description: 'Pick the right image',
    color: '#1cb0f6',
    preview: '🖼️ 🖼️ 🖼️ 🖼️'
  },
  {
    id: 'sentence-builder',
    icon: '🧩',
    name: 'Sentence Builder',
    description: 'Arrange words in order',
    color: '#ff9600',
    preview: '📝 → 🔤🔤🔤'
  },
  {
    id: 'match-pairs',
    icon: '🔗',
    name: 'Match Pairs',
    description: 'Connect related items',
    color: '#ce82ff',
    preview: '← → ← →'
  },
  {
    id: 'fill-blank',
    icon: '✏️',
    name: 'Fill in the Blank',
    description: 'Complete the sentence',
    color: '#ff4b4b',
    preview: 'The ___ is red'
  },
  {
    id: 'vocabulary-grid',
    icon: '📚',
    name: 'Vocabulary Grid',
    description: 'Learn new words with images',
    color: '#2dd4bf',
    preview: '📖 + 🖼️'
  },
  {
    id: 'conversation',
    icon: '💬',
    name: 'Conversation',
    description: 'Interactive dialogue practice',
    color: '#f472b6',
    preview: '👤💬👤'
  },
  {
    id: 'listening',
    icon: '🎧',
    name: 'Listening Exercise',
    description: 'Listen and respond',
    color: '#a78bfa',
    preview: '🔊 → ❓'
  }
];

// Image upload component with drag & drop
const ImageUploader: React.FC<{
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  size?: 'small' | 'medium' | 'large';
}> = ({ value, onChange, label, size = 'medium' }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  }, []);

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    setIsLoading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      onChange(e.target?.result as string);
      setIsLoading(false);
    };
    reader.onerror = () => {
      alert('Error reading file');
      setIsLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      processFile(files[0]);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      processFile(files[0]);
    }
  };

  const handleUrlPaste = () => {
    const url = prompt('Enter image URL:');
    if (url) {
      onChange(url);
    }
  };

  const sizeClasses = {
    small: 'image-uploader-small',
    medium: 'image-uploader-medium',
    large: 'image-uploader-large'
  };

  return (
    <div className={`image-uploader ${sizeClasses[size]}`}>
      {label && <label className="image-uploader-label">{label}</label>}
      <div
        className={`image-upload-zone ${isDragging ? 'dragging' : ''} ${value ? 'has-image' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        {isLoading ? (
          <div className="upload-loading">
            <div className="spinner"></div>
            <span>Uploading...</span>
          </div>
        ) : value ? (
          <div className="image-preview">
            <img src={value} alt="Preview" />
            <div className="image-overlay">
              <button
                type="button"
                className="remove-image-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange('');
                }}
              >
                ✕
              </button>
            </div>
          </div>
        ) : (
          <div className="upload-placeholder">
            <span className="upload-icon">📷</span>
            <span className="upload-text">Drop image here or click to upload</span>
            <div className="upload-actions">
              <button
                type="button"
                className="url-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleUrlPaste();
                }}
              >
                🔗 Paste URL
              </button>
            </div>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
      </div>
    </div>
  );
};

// Option editor with text + image support
const OptionEditor: React.FC<{
  option: { text: string; image?: string };
  index: number;
  isCorrect: boolean;
  onTextChange: (text: string) => void;
  onImageChange: (image: string) => void;
  onSetCorrect: () => void;
  onRemove: () => void;
  showImage?: boolean;
}> = ({ option, index, isCorrect, onTextChange, onImageChange, onSetCorrect, onRemove, showImage = true }) => {
  return (
    <div className={`option-editor ${isCorrect ? 'correct' : ''}`}>
      <div className="option-header">
        <span className="option-number">{String.fromCharCode(65 + index)}</span>
        <button
          type="button"
          className={`correct-toggle ${isCorrect ? 'active' : ''}`}
          onClick={onSetCorrect}
          title={isCorrect ? 'Correct answer' : 'Set as correct'}
        >
          {isCorrect ? '✓ Correct' : 'Set Correct'}
        </button>
        <button type="button" className="remove-option-btn" onClick={onRemove}>
          🗑️
        </button>
      </div>
      <div className="option-content">
        <input
          type="text"
          value={option.text}
          onChange={(e) => onTextChange(e.target.value)}
          placeholder={`Option ${String.fromCharCode(65 + index)}`}
          className="option-text-input"
        />
        {showImage && (
          <ImageUploader
            value={option.image}
            onChange={onImageChange}
            size="small"
          />
        )}
      </div>
    </div>
  );
};

// Match pair editor
const MatchPairEditor: React.FC<{
  pairs: Array<{ left: string; right: string; leftImage?: string; rightImage?: string }>;
  onChange: (pairs: Array<{ left: string; right: string; leftImage?: string; rightImage?: string }>) => void;
}> = ({ pairs, onChange }) => {
  const addPair = () => {
    onChange([...pairs, { left: '', right: '', leftImage: '', rightImage: '' }]);
  };

  const updatePair = (index: number, field: string, value: string) => {
    const newPairs = [...pairs];
    newPairs[index] = { ...newPairs[index], [field]: value };
    onChange(newPairs);
  };

  const removePair = (index: number) => {
    onChange(pairs.filter((_, i) => i !== index));
  };

  return (
    <div className="match-pairs-editor">
      <div className="pairs-header">
        <span>Left Side</span>
        <span className="link-icon">🔗</span>
        <span>Right Side</span>
      </div>
      {pairs.map((pair, index) => (
        <div key={index} className="pair-row">
          <div className="pair-side left">
            <input
              type="text"
              value={pair.left}
              onChange={(e) => updatePair(index, 'left', e.target.value)}
              placeholder="Left item"
            />
            <ImageUploader
              value={pair.leftImage}
              onChange={(img) => updatePair(index, 'leftImage', img)}
              size="small"
            />
          </div>
          <div className="pair-connector">↔️</div>
          <div className="pair-side right">
            <input
              type="text"
              value={pair.right}
              onChange={(e) => updatePair(index, 'right', e.target.value)}
              placeholder="Right item"
            />
            <ImageUploader
              value={pair.rightImage}
              onChange={(img) => updatePair(index, 'rightImage', img)}
              size="small"
            />
          </div>
          <button type="button" className="remove-pair-btn" onClick={() => removePair(index)}>
            🗑️
          </button>
        </div>
      ))}
      <button type="button" className="add-pair-btn" onClick={addPair}>
        ➕ Add Pair
      </button>
    </div>
  );
};

// Word bank editor for sentence builder
const WordBankEditor: React.FC<{
  words: string[];
  correctOrder: string[];
  onChange: (words: string[], correctOrder: string[]) => void;
}> = ({ words, correctOrder, onChange }) => {
  const [newWord, setNewWord] = useState('');

  const addWord = () => {
    if (newWord.trim()) {
      onChange([...words, newWord.trim()], [...correctOrder, newWord.trim()]);
      setNewWord('');
    }
  };

  const removeWord = (index: number) => {
    const wordToRemove = words[index];
    onChange(
      words.filter((_, i) => i !== index),
      correctOrder.filter((w) => w !== wordToRemove)
    );
  };

  const moveWord = (fromIndex: number, toIndex: number) => {
    const newCorrectOrder = [...correctOrder];
    const [moved] = newCorrectOrder.splice(fromIndex, 1);
    newCorrectOrder.splice(toIndex, 0, moved);
    onChange(words, newCorrectOrder);
  };

  return (
    <div className="word-bank-editor">
      <div className="word-input-row">
        <input
          type="text"
          value={newWord}
          onChange={(e) => setNewWord(e.target.value)}
          placeholder="Add a word..."
          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addWord())}
        />
        <button type="button" onClick={addWord} className="add-word-btn">
          ➕ Add
        </button>
      </div>
      
      <div className="words-section">
        <h4>📦 Word Bank (drag to remove)</h4>
        <div className="word-chips">
          {words.map((word, index) => (
            <div key={index} className="word-chip">
              {word}
              <button type="button" onClick={() => removeWord(index)}>×</button>
            </div>
          ))}
        </div>
      </div>

      <div className="correct-order-section">
        <h4>✅ Correct Order (drag to reorder)</h4>
        <div className="correct-order-chips">
          {correctOrder.map((word, index) => (
            <div key={index} className="order-chip">
              <span className="order-number">{index + 1}</span>
              {word}
              <div className="order-controls">
                {index > 0 && (
                  <button type="button" onClick={() => moveWord(index, index - 1)}>←</button>
                )}
                {index < correctOrder.length - 1 && (
                  <button type="button" onClick={() => moveWord(index, index + 1)}>→</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Conversation editor
const ConversationEditor: React.FC<{
  dialogue: Array<{ speaker: string; text: string; translation?: string }>;
  onChange: (dialogue: Array<{ speaker: string; text: string; translation?: string }>) => void;
}> = ({ dialogue, onChange }) => {
  const addLine = () => {
    onChange([...dialogue, { speaker: 'A', text: '', translation: '' }]);
  };

  const updateLine = (index: number, field: string, value: string) => {
    const newDialogue = [...dialogue];
    newDialogue[index] = { ...newDialogue[index], [field]: value };
    onChange(newDialogue);
  };

  const removeLine = (index: number) => {
    onChange(dialogue.filter((_, i) => i !== index));
  };

  return (
    <div className="conversation-editor">
      {dialogue.map((line, index) => (
        <div key={index} className={`dialogue-line speaker-${line.speaker.toLowerCase()}`}>
          <select
            value={line.speaker}
            onChange={(e) => updateLine(index, 'speaker', e.target.value)}
            className="speaker-select"
          >
            <option value="A">👤 Person A</option>
            <option value="B">👥 Person B</option>
          </select>
          <div className="dialogue-content">
            <input
              type="text"
              value={line.text}
              onChange={(e) => updateLine(index, 'text', e.target.value)}
              placeholder="Dialogue text..."
              className="dialogue-text"
            />
            <input
              type="text"
              value={line.translation || ''}
              onChange={(e) => updateLine(index, 'translation', e.target.value)}
              placeholder="Translation (optional)"
              className="dialogue-translation"
            />
          </div>
          <button type="button" className="remove-line-btn" onClick={() => removeLine(index)}>
            🗑️
          </button>
        </div>
      ))}
      <button type="button" className="add-line-btn" onClick={addLine}>
        💬 Add Dialogue Line
      </button>
    </div>
  );
};

interface Exercise {
  type: string;
  question: string;
  questionImage?: string;
  options?: Array<{ text: string; image?: string }>;
  correctAnswer?: string | number;
  pairs?: Array<{ left: string; right: string; leftImage?: string; rightImage?: string }>;
  words?: string[];
  correctOrder?: string[];
  sentence?: string;
  blanks?: Array<{ answer: string; hint?: string }>;
  dialogue?: Array<{ speaker: string; text: string; translation?: string }>;
  explanation?: string;
  hint?: string;
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  icon: string;
  exercises: Exercise[];
}

const LessonCreator: React.FC = () => {
  const navigate = useNavigate();
  
  const [step, setStep] = useState<'select-type' | 'create-exercise' | 'preview' | 'lesson-details'>('lesson-details');
  const [lesson, setLesson] = useState<Lesson>({
    id: `custom_${Date.now()}`,
    title: '',
    description: '',
    icon: '📚',
    exercises: []
  });
  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Lesson icons
  const lessonIcons = ['📚', '🎯', '🌟', '🔥', '💡', '🎨', '🎮', '🏆', '💎', '🚀', '🌈', '🎵', '📖', '✨', '🌸'];

  // Initialize exercise based on type
  const initializeExercise = (type: string): Exercise => {
    const baseExercise: Exercise = {
      type,
      question: '',
      hint: ''
    };

    switch (type) {
      case 'multiple-choice':
      case 'image-selection':
        return {
          ...baseExercise,
          options: [
            { text: '', image: '' },
            { text: '', image: '' },
            { text: '', image: '' },
            { text: '', image: '' }
          ],
          correctAnswer: 0
        };
      case 'match-pairs':
        return {
          ...baseExercise,
          pairs: [
            { left: '', right: '', leftImage: '', rightImage: '' },
            { left: '', right: '', leftImage: '', rightImage: '' },
            { left: '', right: '', leftImage: '', rightImage: '' }
          ]
        };
      case 'sentence-builder':
        return {
          ...baseExercise,
          words: [],
          correctOrder: []
        };
      case 'fill-blank':
        return {
          ...baseExercise,
          sentence: 'The ___ is ___.',
          blanks: [
            { answer: '', hint: '' },
            { answer: '', hint: '' }
          ]
        };
      case 'conversation':
        return {
          ...baseExercise,
          dialogue: [
            { speaker: 'A', text: '', translation: '' },
            { speaker: 'B', text: '', translation: '' }
          ]
        };
      case 'vocabulary-grid':
        return {
          ...baseExercise,
          options: [
            { text: '', image: '' },
            { text: '', image: '' },
            { text: '', image: '' },
            { text: '', image: '' }
          ]
        };
      case 'listening':
        return {
          ...baseExercise,
          options: [
            { text: '', image: '' },
            { text: '', image: '' },
            { text: '', image: '' },
            { text: '', image: '' }
          ],
          correctAnswer: 0
        };
      default:
        return baseExercise;
    }
  };

  // Handle type selection
  const handleSelectType = (typeId: string) => {
    setSelectedType(typeId);
    setCurrentExercise(initializeExercise(typeId));
    setStep('create-exercise');
  };

  // Add exercise to lesson
  const handleAddExercise = () => {
    if (currentExercise) {
      setLesson(prev => ({
        ...prev,
        exercises: [...prev.exercises, currentExercise]
      }));
      setCurrentExercise(null);
      setSelectedType(null);
      setStep('select-type');
    }
  };

  // Remove exercise from lesson
  const handleRemoveExercise = (index: number) => {
    setLesson(prev => ({
      ...prev,
      exercises: prev.exercises.filter((_, i) => i !== index)
    }));
  };

  // Edit existing exercise
  const handleEditExercise = (index: number) => {
    const exercise = lesson.exercises[index];
    setCurrentExercise({ ...exercise });
    setSelectedType(exercise.type);
    setLesson(prev => ({
      ...prev,
      exercises: prev.exercises.filter((_, i) => i !== index)
    }));
    setStep('create-exercise');
  };

  // Save lesson
  const handleSaveLesson = () => {
    if (!lesson.title.trim()) {
      alert('Please enter a lesson title');
      return;
    }
    if (lesson.exercises.length === 0) {
      alert('Please add at least one exercise');
      return;
    }

    // Save to localStorage
    const customLessons = JSON.parse(localStorage.getItem('kurdlingo_custom_lessons') || '[]');
    customLessons.push(lesson);
    localStorage.setItem('kurdlingo_custom_lessons', JSON.stringify(customLessons));

    alert('🎉 Lesson saved successfully!');
    navigate('/learn');
  };

  // AI Generation
  const handleAIGenerate = async () => {
    const topic = prompt('Enter a topic for AI to generate exercises (e.g., "greetings", "numbers 1-10", "colors"):');
    if (!topic) return;

    setIsGenerating(true);
    
    try {
      const apiKey = localStorage.getItem('gemini_api_key');
      if (!apiKey) {
        alert('Please set your Gemini API key in Admin settings first');
        setIsGenerating(false);
        return;
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `Generate 5 language learning exercises about "${topic}" for learning Kurdish (Sorani dialect). 
                Return ONLY valid JSON array with this structure:
                [
                  {
                    "type": "multiple-choice",
                    "question": "What is 'hello' in Kurdish?",
                    "options": [{"text": "Silav"}, {"text": "Xwa hafiz"}, {"text": "Supas"}, {"text": "Baş"}],
                    "correctAnswer": 0,
                    "hint": "It's a common greeting"
                  },
                  {
                    "type": "fill-blank",
                    "sentence": "___ is how you say goodbye",
                    "blanks": [{"answer": "Xwa hafiz", "hint": "Farewell"}]
                  }
                ]
                Mix different types: multiple-choice, fill-blank, match-pairs, sentence-builder.
                Make it educational and fun!`
              }]
            }]
          })
        }
      );

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      // Extract JSON from response
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const exercises = JSON.parse(jsonMatch[0]);
        setLesson(prev => ({
          ...prev,
          exercises: [...prev.exercises, ...exercises]
        }));
        alert(`✨ Generated ${exercises.length} exercises!`);
      } else {
        throw new Error('Could not parse AI response');
      }
    } catch (error) {
      console.error('AI Generation error:', error);
      alert('Failed to generate exercises. Please try again.');
    }
    
    setIsGenerating(false);
  };

  // Render exercise form based on type
  const renderExerciseForm = () => {
    if (!currentExercise || !selectedType) return null;

    const typeConfig = gameTypes.find(t => t.id === selectedType);

    return (
      <div className="exercise-form">
        <div className="exercise-form-header">
          <span className="type-icon">{typeConfig?.icon}</span>
          <h3>{typeConfig?.name}</h3>
        </div>

        {/* Question */}
        <div className="form-group">
          <label>Question / Prompt</label>
          <textarea
            value={currentExercise.question}
            onChange={(e) => setCurrentExercise(prev => prev ? { ...prev, question: e.target.value } : null)}
            placeholder="Enter your question or prompt..."
            rows={2}
          />
        </div>

        {/* Question Image */}
        <div className="form-group">
          <label>Question Image (Optional)</label>
          <ImageUploader
            value={currentExercise.questionImage}
            onChange={(img) => setCurrentExercise(prev => prev ? { ...prev, questionImage: img } : null)}
            size="medium"
          />
        </div>

        {/* Type-specific fields */}
        {(selectedType === 'multiple-choice' || selectedType === 'image-selection' || selectedType === 'listening') && (
          <div className="form-group">
            <label>Answer Options</label>
            <div className="options-list">
              {currentExercise.options?.map((option, index) => (
                <OptionEditor
                  key={index}
                  option={option}
                  index={index}
                  isCorrect={currentExercise.correctAnswer === index}
                  onTextChange={(text) => {
                    const newOptions = [...(currentExercise.options || [])];
                    newOptions[index] = { ...newOptions[index], text };
                    setCurrentExercise(prev => prev ? { ...prev, options: newOptions } : null);
                  }}
                  onImageChange={(image) => {
                    const newOptions = [...(currentExercise.options || [])];
                    newOptions[index] = { ...newOptions[index], image };
                    setCurrentExercise(prev => prev ? { ...prev, options: newOptions } : null);
                  }}
                  onSetCorrect={() => setCurrentExercise(prev => prev ? { ...prev, correctAnswer: index } : null)}
                  onRemove={() => {
                    const newOptions = (currentExercise.options || []).filter((_, i) => i !== index);
                    setCurrentExercise(prev => prev ? { 
                      ...prev, 
                      options: newOptions,
                      correctAnswer: typeof prev.correctAnswer === 'number' && prev.correctAnswer >= index 
                        ? Math.max(0, (prev.correctAnswer as number) - 1) 
                        : prev.correctAnswer
                    } : null);
                  }}
                  showImage={selectedType !== 'listening'}
                />
              ))}
            </div>
            <button
              type="button"
              className="add-option-btn"
              onClick={() => {
                setCurrentExercise(prev => prev ? {
                  ...prev,
                  options: [...(prev.options || []), { text: '', image: '' }]
                } : null);
              }}
            >
              ➕ Add Option
            </button>
          </div>
        )}

        {selectedType === 'match-pairs' && (
          <div className="form-group">
            <label>Match Pairs</label>
            <MatchPairEditor
              pairs={currentExercise.pairs || []}
              onChange={(pairs) => setCurrentExercise(prev => prev ? { ...prev, pairs } : null)}
            />
          </div>
        )}

        {selectedType === 'sentence-builder' && (
          <div className="form-group">
            <label>Words & Correct Order</label>
            <WordBankEditor
              words={currentExercise.words || []}
              correctOrder={currentExercise.correctOrder || []}
              onChange={(words, correctOrder) => setCurrentExercise(prev => prev ? { ...prev, words, correctOrder } : null)}
            />
          </div>
        )}

        {selectedType === 'fill-blank' && (
          <div className="form-group">
            <label>Sentence with Blanks (use ___ for blanks)</label>
            <input
              type="text"
              value={currentExercise.sentence}
              onChange={(e) => setCurrentExercise(prev => prev ? { ...prev, sentence: e.target.value } : null)}
              placeholder="The ___ is ___."
              className="sentence-input"
            />
            <div className="blanks-list">
              {currentExercise.blanks?.map((blank, index) => (
                <div key={index} className="blank-item">
                  <span className="blank-number">Blank {index + 1}</span>
                  <input
                    type="text"
                    value={blank.answer}
                    onChange={(e) => {
                      const newBlanks = [...(currentExercise.blanks || [])];
                      newBlanks[index] = { ...newBlanks[index], answer: e.target.value };
                      setCurrentExercise(prev => prev ? { ...prev, blanks: newBlanks } : null);
                    }}
                    placeholder="Correct answer"
                  />
                  <input
                    type="text"
                    value={blank.hint || ''}
                    onChange={(e) => {
                      const newBlanks = [...(currentExercise.blanks || [])];
                      newBlanks[index] = { ...newBlanks[index], hint: e.target.value };
                      setCurrentExercise(prev => prev ? { ...prev, blanks: newBlanks } : null);
                    }}
                    placeholder="Hint (optional)"
                  />
                </div>
              ))}
            </div>
            <button
              type="button"
              className="add-blank-btn"
              onClick={() => {
                setCurrentExercise(prev => prev ? {
                  ...prev,
                  blanks: [...(prev.blanks || []), { answer: '', hint: '' }]
                } : null);
              }}
            >
              ➕ Add Blank
            </button>
          </div>
        )}

        {selectedType === 'conversation' && (
          <div className="form-group">
            <label>Dialogue</label>
            <ConversationEditor
              dialogue={currentExercise.dialogue || []}
              onChange={(dialogue) => setCurrentExercise(prev => prev ? { ...prev, dialogue } : null)}
            />
          </div>
        )}

        {selectedType === 'vocabulary-grid' && (
          <div className="form-group">
            <label>Vocabulary Items (word + image)</label>
            <div className="vocabulary-grid">
              {currentExercise.options?.map((option, index) => (
                <div key={index} className="vocab-item">
                  <ImageUploader
                    value={option.image}
                    onChange={(image) => {
                      const newOptions = [...(currentExercise.options || [])];
                      newOptions[index] = { ...newOptions[index], image };
                      setCurrentExercise(prev => prev ? { ...prev, options: newOptions } : null);
                    }}
                    size="medium"
                  />
                  <input
                    type="text"
                    value={option.text}
                    onChange={(e) => {
                      const newOptions = [...(currentExercise.options || [])];
                      newOptions[index] = { ...newOptions[index], text: e.target.value };
                      setCurrentExercise(prev => prev ? { ...prev, options: newOptions } : null);
                    }}
                    placeholder="Word / Phrase"
                    className="vocab-text-input"
                  />
                  <button
                    type="button"
                    className="remove-vocab-btn"
                    onClick={() => {
                      const newOptions = (currentExercise.options || []).filter((_, i) => i !== index);
                      setCurrentExercise(prev => prev ? { ...prev, options: newOptions } : null);
                    }}
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              className="add-vocab-btn"
              onClick={() => {
                setCurrentExercise(prev => prev ? {
                  ...prev,
                  options: [...(prev.options || []), { text: '', image: '' }]
                } : null);
              }}
            >
              ➕ Add Vocabulary Item
            </button>
          </div>
        )}

        {/* Hint */}
        <div className="form-group">
          <label>Hint (Optional)</label>
          <input
            type="text"
            value={currentExercise.hint || ''}
            onChange={(e) => setCurrentExercise(prev => prev ? { ...prev, hint: e.target.value } : null)}
            placeholder="A helpful hint for learners..."
          />
        </div>

        {/* Explanation */}
        <div className="form-group">
          <label>Explanation (Optional)</label>
          <textarea
            value={currentExercise.explanation || ''}
            onChange={(e) => setCurrentExercise(prev => prev ? { ...prev, explanation: e.target.value } : null)}
            placeholder="Explain the answer or provide additional context..."
            rows={2}
          />
        </div>

        <div className="exercise-form-actions">
          <button type="button" className="cancel-btn" onClick={() => {
            setCurrentExercise(null);
            setSelectedType(null);
            setStep('select-type');
          }}>
            Cancel
          </button>
          <button type="button" className="add-exercise-btn" onClick={handleAddExercise}>
            ✅ Add Exercise
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="lesson-creator">
      <div className="creator-header">
        <button className="back-btn" onClick={() => navigate('/learn')}>
          ← Back
        </button>
        <h1>🎮 Game Creator</h1>
        <div className="header-actions">
          <button 
            className="ai-generate-btn" 
            onClick={handleAIGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? '🔄 Generating...' : '✨ AI Generate'}
          </button>
        </div>
      </div>

      <div className="creator-content">
        {/* Lesson Details Section */}
        {step === 'lesson-details' && (
          <div className="lesson-details-section">
            <h2>📝 Lesson Details</h2>
            
            <div className="form-group">
              <label>Lesson Title</label>
              <input
                type="text"
                value={lesson.title}
                onChange={(e) => setLesson(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Basic Greetings"
                className="lesson-title-input"
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={lesson.description}
                onChange={(e) => setLesson(prev => ({ ...prev, description: e.target.value }))}
                placeholder="What will learners achieve?"
                rows={2}
              />
            </div>

            <div className="form-group">
              <label>Lesson Icon</label>
              <div className="icon-picker">
                {lessonIcons.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    className={`icon-option ${lesson.icon === icon ? 'selected' : ''}`}
                    onClick={() => setLesson(prev => ({ ...prev, icon }))}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            <button 
              type="button" 
              className="continue-btn"
              onClick={() => setStep('select-type')}
            >
              Continue to Add Exercises →
            </button>
          </div>
        )}

        {/* Game Type Selection */}
        {step === 'select-type' && (
          <div className="type-selection">
            <h2>🎯 Choose Exercise Type</h2>
            <div className="game-types-grid">
              {gameTypes.map((type) => (
                <button
                  key={type.id}
                  className="game-type-card"
                  style={{ '--type-color': type.color } as React.CSSProperties}
                  onClick={() => handleSelectType(type.id)}
                >
                  <div className="type-icon">{type.icon}</div>
                  <div className="type-name">{type.name}</div>
                  <div className="type-description">{type.description}</div>
                  <div className="type-preview">{type.preview}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Exercise Creation Form */}
        {step === 'create-exercise' && renderExerciseForm()}

        {/* Exercise List */}
        {(step === 'select-type' || step === 'lesson-details') && lesson.exercises.length > 0 && (
          <div className="exercises-list">
            <h3>📋 Exercises ({lesson.exercises.length})</h3>
            <div className="exercise-cards">
              {lesson.exercises.map((exercise, index) => {
                const typeConfig = gameTypes.find(t => t.id === exercise.type);
                return (
                  <div key={index} className="exercise-card">
                    <div className="exercise-card-header">
                      <span className="exercise-type-badge" style={{ background: typeConfig?.color }}>
                        {typeConfig?.icon} {typeConfig?.name}
                      </span>
                      <div className="exercise-card-actions">
                        <button type="button" onClick={() => handleEditExercise(index)}>✏️</button>
                        <button type="button" onClick={() => handleRemoveExercise(index)}>🗑️</button>
                      </div>
                    </div>
                    <p className="exercise-question">{exercise.question || '(No question)'}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Save Button */}
        {step === 'select-type' && lesson.exercises.length > 0 && (
          <div className="save-section">
            <button type="button" className="save-lesson-btn" onClick={handleSaveLesson}>
              💾 Save Lesson ({lesson.exercises.length} exercises)
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LessonCreator;
