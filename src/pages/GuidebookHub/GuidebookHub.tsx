import { useNavigate } from 'react-router-dom';
import { ChevronLeft, BookOpen } from 'lucide-react';
import { unit1 } from '../../data/courses/unit1';
import { unit2 } from '../../data/courses/unit2';
import { unit3 } from '../../data/courses/unit3';
import { unit4 } from '../../data/courses/unit4';
import { unit5 } from '../../data/courses/unit5';
import { unit6 } from '../../data/courses/unit6';
import { ColorfulIcon } from '../../components/ColorfulIcon/ColorfulIcon';

import './GuidebookHub.css';

const GuidebookHub = () => {
    const navigate = useNavigate();
    const units = [unit1, unit2, unit3, unit4, unit5, unit6];

    // Helper map to assign the exact bright sleek colors used in your project theme
    const getUnitColors = (unitId: string) => {
        const colors: Record<string, { color: string; dark: string }> = {
            'unit-1': { color: '#2563eb', dark: '#FF6A00' }, // Full Orange
            'unit-2': { color: '#1cb0f6', dark: '#0c8fd6' }, // Blue
            'unit-3': { color: '#ff4b4b', dark: '#d33131' }, // Red
            'unit-4': { color: '#ce82ff', dark: '#a560ff' }, // Purple
            'unit-5': { color: '#f59e0b', dark: '#b45309' }, // Gold
            'unit-6': { color: '#2dd4bf', dark: '#0f766e' }  // Teal
        };
        return colors[unitId] || { color: '#2563eb', dark: '#FF6A00' };
    };

    const getUnitEmoji = (unitId: string) => {
        const emojis: Record<string, string> = {
            'unit-1': '🏁',
            'unit-2': '🗣️',
            'unit-3': '💼',
            'unit-4': '🏦',
            'unit-5': '⚡',
            'unit-6': '🎤'
        };
        return emojis[unitId] || '📖';
    };

    return (
        <div className="guidebook-hub">
            <div className="hub-header">
                <div className="hub-icon-wrapper">
                    <BookOpen size={40} color="#FF6A00" />
                </div>
                <h1>ڕێبەری وانەکان</h1>
                <p>پێداچوونەوە بە وشەکان، ڕێزمان، و ئەو تێبینیانەی کە لە هەر بەشێکدا هەیە بۆ بەهێزکردنی فێربوونەکەت.</p>
            </div>

            <div className="hub-grid">
                {units.map((unit) => {
                    const { color, dark } = getUnitColors(unit.id);
                    
                    return (
                        <div
                            key={unit.id}
                            className="hub-card"
                            onClick={() => navigate(`/guidebook/${unit.id}`)}
                            style={{
                                '--unit-color': color,
                                '--unit-color-dark': dark
                            } as React.CSSProperties}
                        >
                            <div className="hub-card-left">
                                <div className="hub-card-icon" style={{ background: 'transparent', width: 'auto' }}>
                                    <ColorfulIcon emoji={getUnitEmoji(unit.id)} size={48} />
                                </div>
                                <div className="hub-card-content">
                                    <h2>{unit.title}</h2>
                                    <p>{unit.description}</p>
                                </div>
                            </div>
                            <div className="hub-card-arrow">
                                <ChevronLeft size={24} strokeWidth={2.5} />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default GuidebookHub;
