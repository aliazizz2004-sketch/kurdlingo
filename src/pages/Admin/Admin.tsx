// @ts-nocheck
// TODO: Complete TypeScript migration for Admin component
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Admin.css';
import { unit1 } from '../../data/courses/unit1';
import { unit2 } from '../../data/courses/unit2';
import { unit3 } from '../../data/courses/unit3';
import { unit4 } from '../../data/courses/unit4';
import type { Unit, Lesson, Exercise, Guidebook } from '../../types';

const Admin = () => {
    const navigate = useNavigate();
    const [units, setUnits] = useState<Unit[]>([]);
    const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
    const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
    const [editMode, setEditMode] = useState<string | null>(null); // 'unit', 'lesson', 'exercise', 'quick-create'
    const [editingItem, setEditingItem] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Quick Create Game state
    const [quickCreateUnit, setQuickCreateUnit] = useState<string>('');
    const [quickCreateLesson, setQuickCreateLesson] = useState<string>('');

    useEffect(() => {
        // Load units from localStorage or use defaults
        const savedUnits = localStorage.getItem('kurdlingo-units');
        if (savedUnits) {
            setUnits(JSON.parse(savedUnits));
        } else {
            setUnits([unit1, unit2, unit3, unit4] as Unit[]);
        }
    }, []);

    const saveUnits = (updatedUnits: Unit[]) => {
        setUnits(updatedUnits);
        localStorage.setItem('kurdlingo-units', JSON.stringify(updatedUnits));
        console.log('✅ Units saved to localStorage:', updatedUnits.map(u => ({
            id: u.id,
            title: u.title,
            lessonsCount: u.lessons.length,
            lessons: u.lessons.map(l => ({ id: l.id, title: l.title, exercisesCount: l.exercises.length }))
        })));
    };

    const handleUnitClick = (unit: Unit) => {
        setSelectedUnit(unit);
        setSelectedLesson(null);
        setEditMode(null);
    };

    const handleLessonClick = (lesson: Lesson) => {
        // Force re-render by clearing first, then setting
        setSelectedLesson(null);
        setTimeout(() => {
            setSelectedLesson(lesson);
            setEditMode(null);
        }, 0);
    };

    const handleEditUnit = (unit: Unit) => {
        setEditingItem({ ...unit });
        setEditMode('unit');
    };

    const handleAddUnit = () => {
        const maxId = units.length > 0 ? Math.max(...units.map(u => parseInt(u.id.replace('unit-', '')) || 0)) : 0;
        const newUnit: Partial<Unit> = {
            id: `unit-${maxId + 1}`,
            title: `یەکەی ${maxId + 1}`,
            description: 'وەسفی یەکەی نوێ',
            lessons: []
        };
        const updatedUnits = [...units, newUnit as Unit];
        saveUnits(updatedUnits);
        setSelectedUnit(newUnit as Unit);
        setEditMode('unit');
        setEditingItem(newUnit);
    };

    // Quick Create Game - Opens a form to create game in any unit/lesson
    const handleQuickCreateGame = () => {
        setEditMode('quick-create');
        setQuickCreateUnit(units[0]?.id || '');
        setQuickCreateLesson('');
        const newExercise = {
            id: Date.now(),
            type: 'multiple-choice',
            question: '',
            options: [
                { id: 'opt1', text: '', correct: true },
                { id: 'opt2', text: '', correct: false },
                { id: 'opt3', text: '', correct: false },
                { id: 'opt4', text: '', correct: false }
            ]
        };
        setEditingItem(newExercise);
    };

    const handleAddLesson = () => {
        if (!selectedUnit) return;
        const newLesson: Lesson = {
            id: `l${Date.now()}`,
            title: 'New Lesson',
            exercises: []
        };

        const updatedUnits = units.map(u => {
            if (u.id === selectedUnit.id) {
                return {
                    ...u,
                    lessons: [...u.lessons, newLesson]
                };
            }
            return u;
        });

        saveUnits(updatedUnits);
        setSelectedUnit(updatedUnits.find(u => u.id === selectedUnit.id) || null);
    };

    const handleEditGuidebook = () => {
        if (!selectedUnit) return;
        setEditingItem(selectedUnit.guidebook || { introduction: '', sections: [], keyPhrases: [] });
        setEditMode('guidebook');
    };

    const handleSaveGuidebook = (updatedGuidebook: Guidebook) => {
        if (!selectedUnit) return;
        const updatedUnits = units.map(u => {
            if (u.id === selectedUnit.id) {
                return { ...u, guidebook: updatedGuidebook };
            }
            return u;
        });
        saveUnits(updatedUnits);
        setSelectedUnit({ ...selectedUnit, guidebook: updatedGuidebook });
        setEditMode(null);
    };

    const handleDeleteLesson = (lessonId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('Are you sure you want to delete this lesson?')) return;
        if (!selectedUnit) return;

        const updatedUnits = units.map(u => {
            if (u.id === selectedUnit.id) {
                return {
                    ...u,
                    lessons: u.lessons.filter(l => l.id !== lessonId)
                };
            }
            return u;
        });

        saveUnits(updatedUnits);
        setSelectedUnit(updatedUnits.find(u => u.id === selectedUnit.id) || null);
        if (selectedLesson?.id === lessonId) {
            setSelectedLesson(null);
        }
    };

    const handleEditLesson = (lesson: Lesson) => {
        setEditingItem({ ...lesson });
        setEditMode('lesson');
    };

    const handleEditExercise = (exercise: Exercise) => {
        setEditingItem({ ...exercise });
        setEditMode('exercise');
    };

    const handleSaveUnit = () => {
        const updatedUnits = units.map(u =>
            u.id === editingItem.id ? editingItem : u
        );
        saveUnits(updatedUnits);
        setSelectedUnit(editingItem);
        setEditMode(null);
    };

    const handleSaveLesson = () => {
        if (!selectedUnit) return;
        const updatedUnits = units.map(u => {
            if (u.id === selectedUnit.id) {
                return {
                    ...u,
                    lessons: u.lessons.map(l =>
                        l.id === editingItem.id ? editingItem : l
                    )
                };
            }
            return u;
        });
        saveUnits(updatedUnits);
        setSelectedLesson(editingItem);
        setSelectedUnit(updatedUnits.find(u => u.id === selectedUnit.id));
        setEditMode(null);
    };

    const handleSaveExercise = () => {
        const updatedUnits = units.map(u => {
            if (u.id === selectedUnit.id) {
                return {
                    ...u,
                    lessons: u.lessons.map(l => {
                        if (l.id === selectedLesson.id) {
                            // Check if this is a new exercise or editing existing
                            const exerciseExists = l.exercises.some(e => e.id === editingItem.id);

                            if (exerciseExists) {
                                // Update existing exercise
                                return {
                                    ...l,
                                    exercises: l.exercises.map(e =>
                                        e.id === editingItem.id ? editingItem : e
                                    )
                                };
                            } else {
                                // Add new exercise
                                return {
                                    ...l,
                                    exercises: [...l.exercises, editingItem]
                                };
                            }
                        }
                        return l;
                    })
                };
            }
            return u;
        });
        saveUnits(updatedUnits);

        const updatedUnit = updatedUnits.find(u => u.id === selectedUnit.id);
        const updatedLesson = updatedUnit.lessons.find(l => l.id === selectedLesson.id);

        setSelectedUnit(updatedUnit);
        setSelectedLesson(updatedLesson);
        setEditMode(null);
    };

    const handleAddExercise = () => {
        const maxId = selectedLesson.exercises.length > 0
            ? Math.max(...selectedLesson.exercises.map(e => e.id))
            : 0;
        const newExercise = {
            id: maxId + 1,
            type: 'multiple-choice',
            question: '',
            options: [
                { id: 'opt1', text: '', correct: true },
                { id: 'opt2', text: '', correct: false },
                { id: 'opt3', text: '', correct: false },
                { id: 'opt4', text: '', correct: false }
            ]
        };
        setEditingItem(newExercise);
        setEditMode('exercise');
    };

    // Save from Quick Create mode - adds exercise to selected unit/lesson
    const handleSaveQuickCreate = () => {
        if (!quickCreateUnit || !quickCreateLesson) {
            alert('تکایە یەکە و وانەیەک هەڵبژێرە!');
            return;
        }

        const updatedUnits = units.map(u => {
            if (u.id === quickCreateUnit) {
                return {
                    ...u,
                    lessons: u.lessons.map(l => {
                        if (l.id === quickCreateLesson) {
                            return {
                                ...l,
                                exercises: [...l.exercises, editingItem]
                            };
                        }
                        return l;
                    })
                };
            }
            return u;
        });

        saveUnits(updatedUnits);

        // Navigate to the added exercise
        const updatedUnit = updatedUnits.find(u => u.id === quickCreateUnit);
        const updatedLesson = updatedUnit?.lessons.find(l => l.id === quickCreateLesson);

        if (updatedUnit && updatedLesson) {
            setSelectedUnit(updatedUnit);
            setSelectedLesson(updatedLesson);
        }

        setEditMode(null);
        setEditingItem(null);
        alert('یاری بە سەرکەوتوویی زیادکرا! ✅');
    };

    // Get lessons for selected unit in quick create
    const getQuickCreateLessons = () => {
        const unit = units.find(u => u.id === quickCreateUnit);
        return unit?.lessons || [];
    };

    const handleDeleteExercise = (exerciseId) => {
        if (!confirm('Are you sure you want to delete this exercise?')) return;

        const updatedUnits = units.map(u => {
            if (u.id === selectedUnit.id) {
                return {
                    ...u,
                    lessons: u.lessons.map(l => {
                        if (l.id === selectedLesson.id) {
                            return {
                                ...l,
                                exercises: l.exercises.filter(e => e.id !== exerciseId)
                            };
                        }
                        return l;
                    })
                };
            }
            return u;
        });

        saveUnits(updatedUnits);
        const updatedUnit = updatedUnits.find(u => u.id === selectedUnit.id);
        const updatedLesson = updatedUnit.lessons.find(l => l.id === selectedLesson.id);
        setSelectedUnit(updatedUnit);
        setSelectedLesson(updatedLesson);
    };

    // Reordering Functions
    const moveUnit = (index, direction, e) => {
        e.stopPropagation();
        const newUnits = [...units];
        if (direction === 'up' && index > 0) {
            [newUnits[index], newUnits[index - 1]] = [newUnits[index - 1], newUnits[index]];
        } else if (direction === 'down' && index < newUnits.length - 1) {
            [newUnits[index], newUnits[index + 1]] = [newUnits[index + 1], newUnits[index]];
        }
        saveUnits(newUnits);
    };

    const moveLesson = (lessonIndex, direction, e) => {
        e.stopPropagation();
        if (!selectedUnit) return;
        const newLessons = [...selectedUnit.lessons];
        if (direction === 'up' && lessonIndex > 0) {
            [newLessons[lessonIndex], newLessons[lessonIndex - 1]] = [newLessons[lessonIndex - 1], newLessons[lessonIndex]];
        } else if (direction === 'down' && lessonIndex < newLessons.length - 1) {
            [newLessons[lessonIndex], newLessons[lessonIndex + 1]] = [newLessons[lessonIndex + 1], newLessons[lessonIndex]];
        }

        const updatedUnits = units.map(u =>
            u.id === selectedUnit.id ? { ...u, lessons: newLessons } : u
        );
        saveUnits(updatedUnits);
        setSelectedUnit({ ...selectedUnit, lessons: newLessons });
    };

    const moveExercise = (exerciseIndex, direction) => {
        if (!selectedLesson || searchTerm) return;
        const newExercises = [...selectedLesson.exercises];
        if (direction === 'up' && exerciseIndex > 0) {
            [newExercises[exerciseIndex], newExercises[exerciseIndex - 1]] = [newExercises[exerciseIndex - 1], newExercises[exerciseIndex]];
        } else if (direction === 'down' && exerciseIndex < newExercises.length - 1) {
            [newExercises[exerciseIndex], newExercises[exerciseIndex + 1]] = [newExercises[exerciseIndex + 1], newExercises[exerciseIndex]];
        }

        const updatedUnits = units.map(u => {
            if (u.id === selectedUnit.id) {
                return {
                    ...u,
                    lessons: u.lessons.map(l =>
                        l.id === selectedLesson.id ? { ...l, exercises: newExercises } : l
                    )
                };
            }
            return u;
        });
        saveUnits(updatedUnits);

        const updatedUnit = updatedUnits.find(u => u.id === selectedUnit.id);
        const updatedLesson = updatedUnit.lessons.find(l => l.id === selectedLesson.id);
        setSelectedUnit(updatedUnit);
        setSelectedLesson(updatedLesson);
    };

    const exportData = () => {
        const dataStr = JSON.stringify(units, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'kurdlingo-data.json';
        link.click();
    };

    const resetToDefaults = () => {
        if (confirm('Are you sure you want to reset all data to defaults? This cannot be undone!')) {
            localStorage.removeItem('kurdlingo-units');
            setUnits([unit1, unit2, unit3, unit4]);
            setSelectedUnit(null);
            setSelectedLesson(null);
            setEditMode(null);
        }
    };

    const filteredExercises = selectedLesson?.exercises.filter(ex =>
        ex.question?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ex.type?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    return (
        <div className="admin-container">
            <div className="admin-header">
                <h1>🎮 پانێلی بەڕێوەبردن</h1>
                <div className="admin-actions">
                    <button onClick={handleQuickCreateGame} className="btn-add" style={{ background: '#ff9600' }}>
                        ➕ یاری نوێ دروست بکە
                    </button>
                    <button onClick={exportData} className="btn-export">
                        📥 هەناردەکردن
                    </button>
                    <button onClick={resetToDefaults} className="btn-reset">
                        🔄 ڕیسێت
                    </button>
                    <button onClick={() => navigate('/')} className="btn-back">
                        🏠 گەڕانەوە
                    </button>
                </div>
            </div>

            <div className="admin-content">
                {/* Units Sidebar */}
                <div className="admin-sidebar">
                    <div className="sidebar-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h2>یەکەکان</h2>
                        <button onClick={handleAddUnit} className="btn-add-small" title="یەکەی نوێ">➕</button>
                    </div>
                    <div className="units-list">
                        {units.map((unit, index) => (
                            <div
                                key={unit.id}
                                className={`unit-item ${selectedUnit?.id === unit.id ? 'active' : ''}`}
                                onClick={() => handleUnitClick(unit)}
                            >
                                <div className="unit-actions-left" style={{ display: 'flex', flexDirection: 'column', marginRight: '10px' }}>
                                    <button onClick={(e) => moveUnit(index, 'up', e)} disabled={index === 0} className="btn-move-tiny">▲</button>
                                    <button onClick={(e) => moveUnit(index, 'down', e)} disabled={index === units.length - 1} className="btn-move-tiny">▼</button>
                                </div>
                                <div className="unit-info">
                                    <h3>{unit.title}</h3>
                                    <p>{unit.description}</p>
                                    <span className="lesson-count">{unit.lessons.length} lessons</span>
                                </div>
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleEditUnit(unit); }}
                                    className="btn-edit-small"
                                >
                                    ✏️
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Lessons Panel */}
                {selectedUnit && !editMode && (
                    <div className="admin-panel">
                        <div className="panel-header">
                            <h2>{selectedUnit.title} - Lessons</h2>
                            <div className="panel-actions">
                                <button onClick={handleEditGuidebook} className="btn-manage" style={{ width: 'auto', marginTop: 0 }}>📖 Guidebook</button>
                                <button onClick={handleAddLesson} className="btn-add">➕ Add Lesson</button>
                            </div>
                        </div>
                        <div className="lessons-grid">
                            {selectedUnit.lessons.map((lesson, index) => (
                                <div
                                    key={lesson.id}
                                    className={`lesson-card ${selectedLesson?.id === lesson.id ? 'active' : ''}`}
                                    onClick={() => handleLessonClick(lesson)}
                                >
                                    <div className="lesson-card-header" style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                        <h3>{lesson.title}</h3>
                                        <div className="move-actions">
                                            <button onClick={(e) => moveLesson(index, 'up', e)} disabled={index === 0} className="btn-move-tiny">◀</button>
                                            <button onClick={(e) => moveLesson(index, 'down', e)} disabled={index === selectedUnit.lessons.length - 1} className="btn-move-tiny">▶</button>
                                        </div>
                                    </div>
                                    <p>{lesson.exercises.length} exercises</p>
                                    <div className="card-actions">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleLessonClick(lesson); }}
                                            className="btn-manage"
                                        >
                                            🎮 Manage Games
                                        </button>
                                        <button
                                            onClick={(e) => handleDeleteLesson(lesson.id, e)}
                                            className="btn-delete-small"
                                            title="Delete Lesson"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Exercises Panel */}
                {selectedLesson && !editMode && (
                    <div className="admin-panel exercises-panel">
                        <div className="panel-header">
                            <div className="header-left">
                                <h2>{selectedLesson.title}</h2>
                                <button
                                    onClick={() => {
                                        setEditingItem({ ...selectedLesson });
                                        setEditMode('lesson');
                                    }}
                                    className="btn-edit-title"
                                    title="Rename Lesson"
                                >
                                    ✏️
                                </button>
                            </div>
                            <div className="panel-actions">
                                <input
                                    type="text"
                                    placeholder="🔍 Search exercises..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="search-input"
                                />
                                <button onClick={handleAddExercise} className="btn-add">
                                    ➕ Add Game
                                </button>
                            </div>
                        </div>
                        <div className="exercises-list">
                            {filteredExercises.map((exercise, index) => (
                                <div key={exercise.id} className="exercise-item">
                                    <div className="exercise-header">
                                        <span className="exercise-type">{exercise.type}</span>
                                        {!searchTerm && (
                                            <div className="exercise-move-actions">
                                                <button onClick={() => moveExercise(index, 'up')} disabled={index === 0} className="btn-move-small">⬆️</button>
                                                <button onClick={() => moveExercise(index, 'down')} disabled={index === filteredExercises.length - 1} className="btn-move-small">⬇️</button>
                                            </div>
                                        )}
                                        <span className="exercise-id">ID: {exercise.id}</span>
                                    </div>
                                    <p className="exercise-question">{exercise.question}</p>
                                    <div className="exercise-actions">
                                        <button
                                            onClick={() => handleEditExercise(exercise)}
                                            className="btn-edit"
                                        >
                                            ✏️ Edit Game Content
                                        </button>
                                        <button
                                            onClick={() => handleDeleteExercise(exercise.id)}
                                            className="btn-delete"
                                        >
                                            🗑️ Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Edit Forms */}
                {editMode === 'unit' && (
                    <div className="admin-panel edit-panel">
                        <h2>Edit Unit</h2>
                        <div className="form-group">
                            <label>Title</label>
                            <input
                                type="text"
                                value={editingItem.title}
                                onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Description</label>
                            <input
                                type="text"
                                value={editingItem.description}
                                onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                            />
                        </div>
                        <div className="form-actions">
                            <button onClick={handleSaveUnit} className="btn-save">💾 Save</button>
                            <button onClick={() => setEditMode(null)} className="btn-cancel">❌ Cancel</button>
                        </div>
                    </div>
                )}

                {editMode === 'guidebook' && (
                    <GuidebookEditor
                        guidebook={editingItem}
                        onSave={handleSaveGuidebook}
                        onCancel={() => setEditMode(null)}
                    />
                )}

                {editMode === 'lesson' && (
                    <div className="admin-panel edit-panel">
                        <h2>Rename Lesson</h2>
                        <div className="form-group">
                            <label>Lesson Title</label>
                            <input
                                type="text"
                                value={editingItem.title}
                                onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                            />
                        </div>
                        <div className="form-actions">
                            <button onClick={handleSaveLesson} className="btn-save">💾 Save</button>
                            <button onClick={() => setEditMode(null)} className="btn-cancel">❌ Cancel</button>
                        </div>
                    </div>
                )}

                {editMode === 'exercise' && (
                    <ExerciseEditor
                        exercise={editingItem}
                        onChange={setEditingItem}
                        onSave={handleSaveExercise}
                        onCancel={() => setEditMode(null)}
                    />
                )}

                {/* Quick Create Game Panel */}
                {editMode === 'quick-create' && (
                    <div className="admin-panel edit-panel exercise-editor" style={{ width: '100%', maxWidth: '900px' }}>
                        <h2>➕ یاری نوێ دروست بکە</h2>

                        {/* Unit/Lesson Selection */}
                        <div style={{ display: 'flex', gap: '20px', marginBottom: '24px', padding: '16px', background: '#fff8eb', borderRadius: '12px', border: '2px solid #ff9600' }}>
                            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                                <label style={{ fontWeight: 700, color: '#15803d' }}>📚 یەکە هەڵبژێرە</label>
                                <select
                                    value={quickCreateUnit}
                                    onChange={(e) => {
                                        setQuickCreateUnit(e.target.value);
                                        setQuickCreateLesson(''); // Reset lesson when unit changes
                                    }}
                                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid #ff9600', fontSize: '16px' }}
                                >
                                    <option value="">-- یەکە هەڵبژێرە --</option>
                                    {units.map(u => (
                                        <option key={u.id} value={u.id}>{u.title}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                                <label style={{ fontWeight: 700, color: '#15803d' }}>📖 وانە هەڵبژێرە</label>
                                <select
                                    value={quickCreateLesson}
                                    onChange={(e) => setQuickCreateLesson(e.target.value)}
                                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid #ff9600', fontSize: '16px' }}
                                    disabled={!quickCreateUnit}
                                >
                                    <option value="">-- وانە هەڵبژێرە --</option>
                                    {getQuickCreateLessons().map(l => (
                                        <option key={l.id} value={l.id}>{l.title}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Exercise Type */}
                        <div className="form-group">
                            <label>🎮 جۆری یاری</label>
                            <select
                                value={editingItem?.type || 'multiple-choice'}
                                onChange={(e) => setEditingItem({ ...editingItem, type: e.target.value })}
                                className="type-selector"
                            >
                                <option value="multiple-choice">هەڵبژاردنی چەند</option>
                                <option value="sentence-builder">دروستکردنی ڕستە</option>
                                <option value="match-pairs">جووتکردنەوە</option>
                                <option value="fill-blank">پڕکردنەوەی بۆشایی</option>
                                <option value="typing">تایپکردن</option>
                                <option value="image-selection">هەڵبژاردنی وێنە</option>
                            </select>
                        </div>

                        {/* Question */}
                        <div className="form-group">
                            <label>❓ پرسیار</label>
                            <textarea
                                rows={2}
                                value={editingItem?.question || ''}
                                onChange={(e) => setEditingItem({ ...editingItem, question: e.target.value })}
                                placeholder="پرسیار بنووسە..."
                            />
                        </div>

                        {/* Quick options for multiple-choice */}
                        {editingItem?.type === 'multiple-choice' && (
                            <div className="form-section">
                                <h3>📝 هەڵبژاردنەکان</h3>
                                {(editingItem?.options || []).map((option, index) => (
                                    <div key={index} className="option-editor">
                                        <div className="option-number">{index + 1}</div>
                                        <input
                                            type="text"
                                            placeholder={`هەڵبژاردن ${index + 1}`}
                                            value={option.text || ''}
                                            onChange={(e) => {
                                                const newOptions = [...editingItem.options];
                                                newOptions[index] = { ...option, text: e.target.value };
                                                setEditingItem({ ...editingItem, options: newOptions });
                                            }}
                                        />
                                        <label className="correct-checkbox">
                                            <input
                                                type="checkbox"
                                                checked={option.correct || false}
                                                onChange={(e) => {
                                                    const newOptions = [...editingItem.options];
                                                    newOptions[index] = { ...option, correct: e.target.checked };
                                                    setEditingItem({ ...editingItem, options: newOptions });
                                                }}
                                            />
                                            ✓ ڕاست
                                        </label>
                                        <button
                                            onClick={() => {
                                                const newOptions = editingItem.options.filter((_, i) => i !== index);
                                                setEditingItem({ ...editingItem, options: newOptions });
                                            }}
                                            className="btn-remove"
                                        >❌</button>
                                    </div>
                                ))}
                                <button
                                    onClick={() => {
                                        const newOptions = [...(editingItem.options || []), { id: `opt${Date.now()}`, text: '', correct: false }];
                                        setEditingItem({ ...editingItem, options: newOptions });
                                    }}
                                    className="btn-add-small"
                                >➕ هەڵبژاردن زیاد بکە</button>
                            </div>
                        )}

                        <div className="form-actions" style={{ marginTop: '24px' }}>
                            <button
                                onClick={handleSaveQuickCreate}
                                className="btn-save"
                                disabled={!quickCreateUnit || !quickCreateLesson}
                                style={{ opacity: (!quickCreateUnit || !quickCreateLesson) ? 0.5 : 1 }}
                            >
                                💾 یاری زیاد بکە
                            </button>
                            <button onClick={() => setEditMode(null)} className="btn-cancel">❌ پاشگەزبوونەوە</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// Guidebook Editor Component
const GuidebookEditor = ({ guidebook, onSave, onCancel }) => {
    const [localGuidebook, setLocalGuidebook] = useState({
        content: '',
        keyPhrases: [],
        ...guidebook
    });

    const updateField = (field, value) => {
        setLocalGuidebook(prev => ({ ...prev, [field]: value }));
    };

    const addPhrase = () => {
        setLocalGuidebook(prev => ({
            ...prev,
            keyPhrases: [...(prev.keyPhrases || []), { kurdish: '', english: '' }]
        }));
    };

    const updatePhrase = (index, field, value) => {
        const newPhrases = [...(localGuidebook.keyPhrases || [])];
        newPhrases[index] = { ...newPhrases[index], [field]: value };
        setLocalGuidebook(prev => ({ ...prev, keyPhrases: newPhrases }));
    };

    const removePhrase = (index) => {
        const newPhrases = localGuidebook.keyPhrases.filter((_, i) => i !== index);
        setLocalGuidebook(prev => ({ ...prev, keyPhrases: newPhrases }));
    };

    return (
        <div className="admin-panel edit-panel exercise-editor">
            <h2>📖 Edit Guidebook</h2>

            <div className="form-group">
                <label>Learning Notes (Markdown supported)</label>
                <textarea
                    value={localGuidebook.content || ''}
                    onChange={(e) => updateField('content', e.target.value)}
                    rows={10}
                    placeholder="Enter learning notes, grammar rules, etc."
                />
            </div>

            <div className="form-section">
                <h3>🔑 Key Phrases</h3>
                {(localGuidebook.keyPhrases || []).map((phrase, index) => (
                    <div key={index} className="pair-editor">
                        <span className="pair-number">{index + 1}</span>
                        <input
                            type="text"
                            placeholder="Kurdish"
                            value={phrase.kurdish}
                            onChange={(e) => updatePhrase(index, 'kurdish', e.target.value)}
                        />
                        <span className="pair-arrow">↔</span>
                        <input
                            type="text"
                            placeholder="English"
                            value={phrase.english}
                            onChange={(e) => updatePhrase(index, 'english', e.target.value)}
                        />
                        <button className="btn-remove" onClick={() => removePhrase(index)}>×</button>
                    </div>
                ))}
                <button className="btn-add-small" onClick={addPhrase}>+ Add Phrase</button>
            </div>

            <div className="form-actions">
                <button className="btn-save" onClick={() => onSave(localGuidebook)}>Save Guidebook</button>
                <button className="btn-cancel" onClick={onCancel}>Cancel</button>
            </div>
        </div>
    );
};

// Exercise Editor Component
const ExerciseEditor = ({ exercise, onChange, onSave, onCancel }) => {
    // Ensure exercise has all necessary fields initialized
    const safeExercise = {
        type: 'multiple-choice',
        question: '',
        options: [],
        pairs: [],
        sourceText: '',
        correctSentence: [],
        sentenceParts: [],
        correctOption: '',
        textToTranslate: '',
        correctAnswer: '',
        acceptedAnswers: [],
        ...exercise
    };

    const updateField = (field, value) => {
        onChange({ ...safeExercise, [field]: value });
    };

    const updateOption = (index, field, value) => {
        const newOptions = [...(safeExercise.options || [])];
        newOptions[index] = { ...newOptions[index], [field]: value };
        onChange({ ...safeExercise, options: newOptions });
    };

    const addOption = () => {
        const currentOptions = safeExercise.options || [];
        const newOptions = [...currentOptions, {
            id: `opt${currentOptions.length + 1}`,
            text: 'New Option',
            correct: false
        }];
        onChange({ ...safeExercise, options: newOptions });
    };

    const removeOption = (index) => {
        const newOptions = (safeExercise.options || []).filter((_, i) => i !== index);
        onChange({ ...safeExercise, options: newOptions });
    };

    const updatePair = (index, field, value) => {
        const newPairs = [...(safeExercise.pairs || [])];
        newPairs[index] = { ...newPairs[index], [field]: value };
        onChange({ ...safeExercise, pairs: newPairs });
    };

    const addPair = () => {
        const currentPairs = safeExercise.pairs || [];
        const newPairs = [...currentPairs, { kurdish: '', english: '' }];
        onChange({ ...safeExercise, pairs: newPairs });
    };

    const removePair = (index) => {
        const newPairs = (safeExercise.pairs || []).filter((_, i) => i !== index);
        onChange({ ...safeExercise, pairs: newPairs });
    };

    return (
        <div className="admin-panel edit-panel exercise-editor">
            <h2>✏️ Edit Exercise #{safeExercise.id}</h2>

            <div className="form-group">
                <label>🎮 Exercise Type</label>
                <select
                    value={safeExercise.type}
                    onChange={(e) => updateField('type', e.target.value)}
                    className="type-selector"
                >
                    <option value="multiple-choice">Multiple Choice</option>
                    <option value="sentence-builder">Sentence Builder</option>
                    <option value="match-pairs">Match Pairs</option>
                    <option value="fill-blank">Fill in the Blank</option>
                    <option value="listening">Listening</option>
                    <option value="typing">Typing</option>
                    <option value="conversation">Conversation</option>
                    <option value="image-selection">Image Selection</option>
                </select>
            </div>

            <div className="form-group">
                <label>❓ Question</label>
                <textarea
                    rows="2"
                    value={safeExercise.question || ''}
                    onChange={(e) => updateField('question', e.target.value)}
                    placeholder="Enter the question text..."
                />
            </div>

            {/* Multiple Choice Options */}
            {safeExercise.type === 'multiple-choice' && (
                <div className="form-section">
                    <h3>📝 Multiple Choice Options</h3>
                    {(safeExercise.options || []).length === 0 && (
                        <p className="hint">Click "Add Option" to create answer choices</p>
                    )}
                    {(safeExercise.options || []).map((option, index) => (
                        <div key={index} className="option-editor">
                            <div className="option-number">{index + 1}</div>
                            <input
                                type="text"
                                placeholder="Option text (e.g., 'Water')"
                                value={option.text || ''}
                                onChange={(e) => updateOption(index, 'text', e.target.value)}
                            />
                            <input
                                type="text"
                                placeholder="Image (emoji like 💧 or URL)"
                                value={option.image || ''}
                                onChange={(e) => updateOption(index, 'image', e.target.value)}
                                className="image-input"
                            />
                            <label className="correct-checkbox">
                                <input
                                    type="checkbox"
                                    checked={option.correct || false}
                                    onChange={(e) => updateOption(index, 'correct', e.target.checked)}
                                />
                                ✓ Correct
                            </label>
                            <button onClick={() => removeOption(index)} className="btn-remove" title="Remove option">❌</button>
                        </div>
                    ))}
                    <button onClick={addOption} className="btn-add-small">➕ Add Option</button>
                </div>
            )}

            {/* Sentence Builder */}
            {safeExercise.type === 'sentence-builder' && (
                <div className="form-section">
                    <h3>🔤 Sentence Builder Settings</h3>
                    <div className="form-group">
                        <label>Source Text (to translate)</label>
                        <input
                            type="text"
                            value={safeExercise.sourceText || ''}
                            onChange={(e) => updateField('sourceText', e.target.value)}
                            placeholder="e.g., 'Hello, KurdLingo'"
                        />
                    </div>
                    <div className="form-group">
                        <label>Correct Sentence (comma-separated words)</label>
                        <input
                            type="text"
                            value={Array.isArray(safeExercise.correctSentence) ? safeExercise.correctSentence.join(', ') : ''}
                            onChange={(e) => updateField('correctSentence', e.target.value.split(',').map(s => s.trim()).filter(s => s))}
                            placeholder="e.g., 'سڵاو, کوردلینۆ'"
                        />
                    </div>
                    <div className="form-group">
                        <label>Available Options (word bank, comma-separated)</label>
                        <input
                            type="text"
                            value={Array.isArray(safeExercise.options) ? safeExercise.options.join(', ') : ''}
                            onChange={(e) => updateField('options', e.target.value.split(',').map(s => s.trim()).filter(s => s))}
                            placeholder="e.g., 'سڵاو, کوردلینۆ, نان, ئاو'"
                        />
                    </div>
                </div>
            )}

            {/* Match Pairs */}
            {safeExercise.type === 'match-pairs' && (
                <div className="form-section">
                    <h3>🔗 Match Pairs</h3>
                    {(safeExercise.pairs || []).length === 0 && (
                        <p className="hint">Click "Add Pair" to create matching items</p>
                    )}
                    {(safeExercise.pairs || []).map((pair, index) => (
                        <div key={index} className="pair-editor">
                            <div className="pair-number">{index + 1}</div>
                            <input
                                type="text"
                                placeholder="Kurdish (e.g., 'ئاو')"
                                value={pair.kurdish || ''}
                                onChange={(e) => updatePair(index, 'kurdish', e.target.value)}
                            />
                            <span className="pair-arrow">↔️</span>
                            <input
                                type="text"
                                placeholder="English (e.g., 'Water')"
                                value={pair.english || ''}
                                onChange={(e) => updatePair(index, 'english', e.target.value)}
                            />
                            <button onClick={() => removePair(index)} className="btn-remove" title="Remove pair">❌</button>
                        </div>
                    ))}
                    <button onClick={addPair} className="btn-add-small">➕ Add Pair</button>
                </div>
            )}

            {/* Fill Blank */}
            {safeExercise.type === 'fill-blank' && (
                <div className="form-section">
                    <h3>📝 Fill in the Blank Settings</h3>
                    <div className="form-group">
                        <label>Sentence Parts (use '___' for the blank)</label>
                        <input
                            type="text"
                            value={Array.isArray(safeExercise.sentenceParts) ? safeExercise.sentenceParts.join(', ') : ''}
                            onChange={(e) => updateField('sentenceParts', e.target.value.split(',').map(s => s.trim()))}
                            placeholder="e.g., 'Eat, ___, please' (comma separated)"
                        />
                        <p className="hint">Example: "Eat, ___, please" will show as "Eat ___ please"</p>
                    </div>
                    <div className="form-group">
                        <label>Correct Option (must match one option exactly)</label>
                        <input
                            type="text"
                            value={safeExercise.correctOption || ''}
                            onChange={(e) => updateField('correctOption', e.target.value)}
                            placeholder="e.g., 'Bread'"
                        />
                    </div>
                    <div className="form-section">
                        <h3>Options</h3>
                        {(safeExercise.options || []).map((option, index) => (
                            <div key={index} className="option-editor">
                                <div className="option-number">{index + 1}</div>
                                <input
                                    type="text"
                                    value={option || ''}
                                    onChange={(e) => {
                                        const newOptions = [...safeExercise.options];
                                        newOptions[index] = e.target.value;
                                        updateField('options', newOptions);
                                    }}
                                    placeholder={`Option ${index + 1}`}
                                />
                                <button onClick={() => {
                                    const newOptions = safeExercise.options.filter((_, i) => i !== index);
                                    updateField('options', newOptions);
                                }} className="btn-remove">❌</button>
                            </div>
                        ))}
                        <button onClick={() => {
                            const newOptions = [...(safeExercise.options || []), 'New Option'];
                            updateField('options', newOptions);
                        }} className="btn-add-small">➕ Add Option</button>
                    </div>
                </div>
            )}

            {/* Typing Exercise */}
            {safeExercise.type === 'typing' && (
                <div className="form-section">
                    <h3>⌨️ Typing Exercise Settings</h3>
                    <div className="form-group">
                        <label>Text to Translate (Prompt)</label>
                        <input
                            type="text"
                            value={safeExercise.textToTranslate || ''}
                            onChange={(e) => updateField('textToTranslate', e.target.value)}
                            placeholder="e.g., 'Water'"
                        />
                    </div>
                    <div className="form-group">
                        <label>Correct Answer (Exact match)</label>
                        <input
                            type="text"
                            value={safeExercise.correctAnswer || ''}
                            onChange={(e) => updateField('correctAnswer', e.target.value)}
                            placeholder="e.g., 'ئاو'"
                        />
                    </div>
                    <div className="form-group">
                        <label>Accepted Answers (Alternatives, comma-separated)</label>
                        <input
                            type="text"
                            value={Array.isArray(safeExercise.acceptedAnswers) ? safeExercise.acceptedAnswers.join(', ') : ''}
                            onChange={(e) => updateField('acceptedAnswers', e.target.value.split(',').map(s => s.trim()).filter(s => s))}
                            placeholder="e.g., 'Aw, av'"
                        />
                    </div>
                </div>
            )}

            {/* Image Selection */}
            {safeExercise.type === 'image-selection' && (
                <div className="form-section">
                    <h3>🖼️ Image Selection Options</h3>
                    <p className="hint">Add images and text labels. Mark the correct image.</p>
                    {(safeExercise.options || []).map((option, index) => (
                        <div key={index} className="option-editor">
                            <div className="option-number">{index + 1}</div>
                            <input
                                type="text"
                                placeholder="Label (e.g., 'Apple')"
                                value={option.text || ''}
                                onChange={(e) => updateOption(index, 'text', e.target.value)}
                            />
                            <input
                                type="text"
                                placeholder="Image (emoji 🍎 or URL)"
                                value={option.image || ''}
                                onChange={(e) => updateOption(index, 'image', e.target.value)}
                                className="image-input"
                            />
                            <label className="correct-checkbox">
                                <input
                                    type="checkbox"
                                    checked={option.correct || false}
                                    onChange={(e) => updateOption(index, 'correct', e.target.checked)}
                                />
                                ✓ Correct
                            </label>
                            <button onClick={() => removeOption(index)} className="btn-remove" title="Remove option">❌</button>
                        </div>
                    ))}
                    <button onClick={addOption} className="btn-add-small">➕ Add Option</button>
                </div>
            )}

            {/* Placeholder for other types */}
            {['listening', 'conversation'].includes(safeExercise.type) && (
                <div className="form-section">
                    <p>⚠️ This exercise type is coming soon!</p>
                </div>
            )}

            <div className="form-actions">
                <button onClick={() => onSave(safeExercise)} className="btn-save">💾 Save Exercise</button>
                <button onClick={onCancel} className="btn-cancel">❌ Cancel</button>
            </div>
        </div>
    );
};

export default Admin;
