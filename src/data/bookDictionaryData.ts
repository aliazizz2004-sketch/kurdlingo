/**
 * Book Dictionary Data - 10 Categories of Everyday Words & Sentences
 * Kurdish (Sorani) on the right, English on the left
 */

import { greetingsEntries } from './dictionary/greetings';
import { foodEntries } from './dictionary/food';
import { shoppingEntries } from './dictionary/shopping';
import { transportEntries } from './dictionary/transport';
import { familyEntries } from './dictionary/family';
import { workEntries } from './dictionary/work';
import { healthEntries } from './dictionary/health';
import { homeEntries } from './dictionary/home';
import { emotionsEntries } from './dictionary/emotions';
import { timeEntries } from './dictionary/time';

export interface DictionaryEntry {
    id: string;
    english: string;
    kurdish: string;
    pronunciation?: string;
    example?: {
        english: string;
        kurdish: string;
    };
}

export interface DictionaryCategory {
    id: string;
    name: {
        english: string;
        kurdish: string;
    };
    icon: string;
    color: string;
    gradient: string;
    entries: DictionaryEntry[];
}

export const bookDictionaryData: DictionaryCategory[] = [
    {
        id: 'greetings',
        name: { english: 'Greetings & Introductions', kurdish: 'سڵاو و ناساندن' },
        icon: 'Hand',
        color: '#ff9600',
        gradient: 'linear-gradient(135deg, #ff9600 0%, #cc7800 100%)',
        entries: greetingsEntries
    },
    {
        id: 'food',
        name: { english: 'Food & Dining', kurdish: 'خواردن و خواردنگە' },
        icon: 'UtensilsCrossed',
        color: '#ff9600',
        gradient: 'linear-gradient(135deg, #ff9600 0%, #e08600 100%)',
        entries: foodEntries
    },
    {
        id: 'shopping',
        name: { english: 'Shopping & Money', kurdish: 'کڕین و پارە' },
        icon: 'ShoppingCart',
        color: '#ce82ff',
        gradient: 'linear-gradient(135deg, #ce82ff 0%, #a562cc 100%)',
        entries: shoppingEntries
    },
    {
        id: 'transport',
        name: { english: 'Transportation & Directions', kurdish: 'گواستنەوە و ئاراستە' },
        icon: 'Car',
        color: '#1cb0f6',
        gradient: 'linear-gradient(135deg, #1cb0f6 0%, #118cc0 100%)',
        entries: transportEntries
    },
    {
        id: 'family',
        name: { english: 'Family & Relationships', kurdish: 'خێزان و پەیوەندی' },
        icon: 'Users',
        color: '#ff4b4b',
        gradient: 'linear-gradient(135deg, #ff4b4b 0%, #d52222 100%)',
        entries: familyEntries
    },
    {
        id: 'work',
        name: { english: 'Work & Professions', kurdish: 'کار و پیشە' },
        icon: 'Briefcase',
        color: '#4a5568',
        gradient: 'linear-gradient(135deg, #4a5568 0%, #2d3748 100%)',
        entries: workEntries
    },
    {
        id: 'health',
        name: { english: 'Health & Emergencies', kurdish: 'تەندروستی و فریاکەوتن' },
        icon: 'Heart',
        color: '#e53e3e',
        gradient: 'linear-gradient(135deg, #e53e3e 0%, #c53030 100%)',
        entries: healthEntries
    },
    {
        id: 'home',
        name: { english: 'Home & Daily Life', kurdish: 'ماڵ و ژیانی ڕۆژانە' },
        icon: 'Home',
        color: '#38b2ac',
        gradient: 'linear-gradient(135deg, #38b2ac 0%, #2c7a7b 100%)',
        entries: homeEntries
    },
    {
        id: 'emotions',
        name: { english: 'Emotions & Feelings', kurdish: 'هەست و سۆز' },
        icon: 'Smile',
        color: '#ed8936',
        gradient: 'linear-gradient(135deg, #ed8936 0%, #dd6b20 100%)',
        entries: emotionsEntries
    },
    {
        id: 'time',
        name: { english: 'Time & Weather', kurdish: 'کات و کەشوهەوا' },
        icon: 'Clock',
        color: '#667eea',
        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        entries: timeEntries
    }
];

export default bookDictionaryData;
