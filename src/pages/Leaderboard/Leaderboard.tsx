import { useEffect, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { supabase } from '../../lib/supabase';
import { useUser } from '../../context/AuthContext';
import { HugeiconsIcon } from '@hugeicons/react';
import { UserCircle02Icon } from '@hugeicons/core-free-icons';

const Leaderboard = () => {
    const { t } = useLanguage();
    const { user } = useUser();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        supabase
            .from('profiles')
            .select('*')
            .order('xp', { ascending: false })
            .limit(50)
            .then(({ data }) => {
                if (data) {
                    const loadedUsers = data.map((p: any, index: number) => {
                        let nameVal = 'KurdLearner';
                        if (p.username) {
                            // Strip @domain
                            nameVal = p.username.includes('@') ? p.username.split('@')[0] : p.username;
                            // Remove common number suffixes if derived from email for cleaner look
                            nameVal = nameVal.replace(/[0-9]+$/, '');
                            // Capitalize first letter
                            nameVal = nameVal.charAt(0).toUpperCase() + nameVal.slice(1);
                        }
                        
                        // Fallback if empty after strip
                        if (!nameVal) nameVal = 'KurdLearner';
                        
                        return {
                            id: p.id,
                            name: nameVal,
                            xp: p.xp || 0,
                            rank: index + 1,
                            avatar: p.avatar_url ? (
                                <img src={p.avatar_url} style={{width: '100%', borderRadius: '50%'}}/>
                            ) : (
                                <HugeiconsIcon icon={UserCircle02Icon} size={28} color="#9ca3af" />
                            )
                        };
                    });
                    setUsers(loadedUsers);
                }
                setLoading(false);
            });
    }, []);

    return (
        <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
            <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>{t('leaderboards')}</h1>
            <div style={{ background: 'white', border: '2px solid var(--color-border)', borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
                {loading && <div style={{ padding: '2rem', textAlign: 'center' }}>Loading top players...</div>}
                {!loading && users.length === 0 && <div style={{ padding: '2rem', textAlign: 'center' }}>No players found yet!</div>}
                {users.map((u, index) => (
                    <div key={u.id || index} style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '1rem 1.5rem',
                        borderBottom: index < users.length - 1 ? '2px solid var(--color-border)' : 'none',
                        background: u.id === user?.id ? '#fff4e6' : 'white' /* subtle orange background for self */
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <span style={{ fontWeight: 'bold', color: u.rank <= 3 ? '#ff9600' : 'var(--color-text-light)', width: '20px' }}>{u.rank}</span>
                            <div style={{ width: '40px', height: '40px', background: '#f3f4f6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {u.avatar}
                            </div>
                            <span style={{ fontWeight: 'bold', color: u.id === user?.id ? '#e07600' : 'var(--color-text)' }}>{u.name}</span>
                        </div>
                        <span dir="ltr" style={{ fontWeight: 'bold', color: 'var(--color-text-secondary)' }}>{u.xp} XP</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Leaderboard;
