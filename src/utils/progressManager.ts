// Progress Manager - Handles lesson completion and progression
// Production-ready with localStorage persistence

export interface LessonProgress {
    lessonId: string;
    completedAt: string;
    xpEarned: number;
    attempts: number;
}

export interface UnitProgress {
    unitId: string;
    lessonsCompleted: string[]; // Array of lesson IDs
    lastAccessedAt: string;
}

export interface UserProgress {
    units: { [unitId: string]: UnitProgress };
    totalXp: number;
    currentStreak: number;
    lastActiveDate: string;
    lessonsCompleted: { [lessonId: string]: LessonProgress };
}

const STORAGE_KEY = 'kurdlingo-user-progress';

// Default progress structure
const defaultProgress: UserProgress = {
    units: {},
    totalXp: 0,
    currentStreak: 0,
    lastActiveDate: new Date().toISOString().split('T')[0],
    lessonsCompleted: {}
};

/**
 * Get user progress from localStorage
 */
export const getUserProgress = (): UserProgress => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            return {
                ...defaultProgress,
                ...parsed,
                units: parsed.units || {},
                lessonsCompleted: parsed.lessonsCompleted || {}
            };
        }
    } catch (error) {
        console.error('Error reading progress from localStorage:', error);
    }
    return { ...defaultProgress };
};

/**
 * Save user progress to localStorage
 */
export const saveUserProgress = (progress: UserProgress): void => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (error) {
        console.error('Error saving progress to localStorage:', error);
    }
};

/**
 * Check if a specific lesson is completed
 */
export const isLessonCompleted = (lessonId: string): boolean => {
    const progress = getUserProgress();
    if (!progress || !progress.lessonsCompleted) return false;
    return !!progress.lessonsCompleted[lessonId];
};

/**
 * Check if a lesson is unlocked (previous lesson in same unit is completed OR it's the first lesson)
 */
export const isLessonUnlocked = (
    lessonId: string, 
    unitLessons: { id: string }[]
): boolean => {
    const lessonIndex = unitLessons.findIndex(l => l.id === lessonId);
    
    // First lesson is always unlocked
    if (lessonIndex === 0) return true;
    
    // Check if previous lesson is completed
    const previousLessonId = unitLessons[lessonIndex - 1]?.id;
    if (!previousLessonId) return false;
    
    return isLessonCompleted(previousLessonId);
};

/**
 * Mark a lesson as completed
 */
export const completeLesson = (
    lessonId: string, 
    unitId: string, 
    xpEarned: number = 10
): UserProgress => {
    const progress = getUserProgress();
    const today = new Date().toISOString().split('T')[0];
    
    // Check if already completed (don't add XP again, but track attempt)
    const existingProgress = progress.lessonsCompleted[lessonId];
    
    if (existingProgress) {
        // Increment attempts
        progress.lessonsCompleted[lessonId] = {
            ...existingProgress,
            attempts: existingProgress.attempts + 1
        };
    } else {
        // First time completion
        progress.lessonsCompleted[lessonId] = {
            lessonId,
            completedAt: new Date().toISOString(),
            xpEarned,
            attempts: 1
        };
        
        // Add XP only for first completion
        progress.totalXp += xpEarned;
    }
    
    // Update unit progress
    if (!progress.units[unitId]) {
        progress.units[unitId] = {
            unitId,
            lessonsCompleted: [],
            lastAccessedAt: new Date().toISOString()
        };
    }
    
    if (!progress.units[unitId].lessonsCompleted.includes(lessonId)) {
        progress.units[unitId].lessonsCompleted.push(lessonId);
    }
    progress.units[unitId].lastAccessedAt = new Date().toISOString();
    
    // Update streak
    if (progress.lastActiveDate !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
        if (progress.lastActiveDate === yesterdayStr) {
            // Consecutive day - increase streak
            progress.currentStreak += 1;
        } else {
            // Streak broken - reset to 1
            progress.currentStreak = 1;
        }
        progress.lastActiveDate = today;
    }
    
    saveUserProgress(progress);
    return progress;
};

/**
 * Get the number of completed lessons in a unit
 */
export const getUnitCompletedCount = (unitId: string): number => {
    const progress = getUserProgress();
    return progress.units[unitId]?.lessonsCompleted.length || 0;
};

/**
 * Get the next unlocked lesson in a unit
 */
export const getNextUnlockedLesson = (unitLessons: { id: string }[]): string | null => {
    for (let i = 0; i < unitLessons.length; i++) {
        const lesson = unitLessons[i];
        if (!isLessonCompleted(lesson.id)) {
            // Check if this lesson is unlocked
            if (i === 0 || isLessonCompleted(unitLessons[i - 1].id)) {
                return lesson.id;
            }
            break;
        }
    }
    return null;
};

/**
 * Check if all lessons in a unit are completed
 */
export const isUnitCompleted = (unitLessons: { id: string }[]): boolean => {
    return unitLessons.every(lesson => isLessonCompleted(lesson.id));
};

/**
 * Reset all progress (for testing/development)
 */
export const resetAllProgress = (): void => {
    localStorage.removeItem(STORAGE_KEY);
};

/**
 * Get user stats
 */
export const getUserStats = (): { totalXp: number; streak: number; lessonsCompleted: number } => {
    const progress = getUserProgress();
    return {
        totalXp: progress.totalXp,
        streak: progress.currentStreak,
        lessonsCompleted: Object.keys(progress.lessonsCompleted).length
    };
};
