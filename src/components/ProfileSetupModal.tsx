import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useUser } from '../context/AuthContext';
import { Translate, CheckCircle } from '@phosphor-icons/react';
import './ProfileSetupModal.css';

const AVAILABLE_AVATARS = [
    // Local generated animal avatars
    '/avatars/avatar_bear_1773532588758.png',
    '/avatars/avatar_fox_1773532642853.png',
    '/avatars/avatar_rabbit_1773532662608.png',
    '/avatars/avatar_cat_1773532681592.png',
    '/avatars/avatar_dog_1773532693163.png',
    '/avatars/avatar_owl_1773532706329.png',
    
    // Cloud generated premium avatars
    'https://api.dicebear.com/7.x/micah/svg?seed=Kurd1&backgroundColor=ff9600',
    'https://api.dicebear.com/7.x/micah/svg?seed=Kurd2&backgroundColor=1cb0f6',
    'https://api.dicebear.com/7.x/micah/svg?seed=Kurd3&backgroundColor=ff4b4b',
    'https://api.dicebear.com/7.x/micah/svg?seed=Kurd4&backgroundColor=58cc02',
    'https://api.dicebear.com/7.x/micah/svg?seed=Kurd5&backgroundColor=ce82ff',
    'https://api.dicebear.com/7.x/micah/svg?seed=Kurd6&backgroundColor=ffc800'
];

export const openProfileModal = () => window.dispatchEvent(new Event('open-profile-modal'));

let authCheckInProgress = false;

const ProfileSetupModal: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isDismissable, setIsDismissable] = useState(false);
    
    // User data states
    const [name, setName] = useState('');
    const [selectedAvatar, setSelectedAvatar] = useState(AVAILABLE_AVATARS[0]);
    const { user, isLoaded } = useUser();

    useEffect(() => {
        const checkProfile = async () => {
            if (authCheckInProgress || !isLoaded) return;
            authCheckInProgress = true;
            
            try {
                // Wait for the context to confirm if we possess a user instead of fetching blindly
                if (!user) {
                    setLoading(false);
                    authCheckInProgress = false;
                    return;
                }

                // If logged in, fetch specific profile fields
                const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
                
                // If profile missing essential data like name or avatar, pop up!
                const safeProfile = profile as any;
                const profileName = safeProfile?.name || safeProfile?.profile?.name;
                const profileAvatar = safeProfile?.avatar_url || safeProfile?.profile?.avatar_url;
                
                if (!profileName || !profileAvatar) {
                    setIsOpen(true);
                }
            } catch (err) {
                console.error("Profile check error:", err);
            }
            authCheckInProgress = false;
            setLoading(false);
        };
        
        checkProfile();

        const handleOpen = () => {
            setIsOpen(true);
            setIsDismissable(true);
            checkProfile(); // Reload data when manually opened
        };
        window.addEventListener('open-profile-modal', handleOpen);
        return () => window.removeEventListener('open-profile-modal', handleOpen);
    }, [user, isLoaded]);

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        
        if (!name.trim()) {
            setSaving(false);
            return;
        }

        // Note: For Supabase, the actual profile update is usually an upsert on a custom profile table, not setProfile().
        // For standard auth metadata:
        const { error } = await supabase.auth.updateUser({
            data: {
                name: name,
                avatar_url: selectedAvatar
            }
        });
        
        // Also update the 'profiles' table if it exists
        if (user) {
            await supabase.from('profiles').upsert({
                id: user.id,
                name: name,
                avatar_url: selectedAvatar,
                updated_at: new Date().toISOString()
            });
        }
        
        if (!error) {
            setIsOpen(false);
            window.dispatchEvent(new Event('focus')); // Triggers profile update via existing listener
        }
        
        setSaving(false);
    };

    if (loading || !isOpen) return null;

    return (
        <div className="profile-setup-overlay" dir="rtl">
            <div className="profile-setup-modal" style={{ position: 'relative' }}>
                {isDismissable && (
                    <button 
                        onClick={() => setIsOpen(false)}
                        className="profile-close-btn"
                        style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--color-text-secondary)', zIndex: 10 }}
                    >
                        &times;
                    </button>
                )}
                <div className="profile-setup-header">
                    <div className="profile-brand-icon">
                        <Translate size={28} weight="bold" />
                    </div>
                    <h2>پڕۆفایلەکەت ڕێکبخە!</h2>
                    <p>با زانیارییەکانت نوێ بکەینەوە بۆ ئەوەی دەستپێبکەیت</p>
                </div>

                <form onSubmit={handleSaveProfile} className="profile-setup-form">
                    <div className="profile-form-group">
                        <label>ناوت بنووسە</label>
                        <input
                            type="text"
                            placeholder="نموونە: ئارام ئەحمەد"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="profile-form-group">
                        <label>کارەکتەرەکەت هەڵبژێرە</label>
                        <div className="avatar-selection-grid">
                            {AVAILABLE_AVATARS.map((avatar, idx) => (
                                <div 
                                    key={idx} 
                                    className={`avatar-choice ${selectedAvatar === avatar ? 'selected' : ''}`}
                                    onClick={() => setSelectedAvatar(avatar)}
                                >
                                    <img src={avatar} alt={`Avatar ${idx}`} />
                                    {selectedAvatar === avatar && (
                                        <div className="avatar-check">
                                            <CheckCircle size={20} weight="fill" />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        className="profile-submit-btn" 
                        disabled={saving || !name.trim()}
                    >
                        {saving ? 'خەزن دەکرێت...' : 'تەواو'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ProfileSetupModal;
