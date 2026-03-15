import { useEffect, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { insforge } from '../../lib/insforge';
import { useUser } from '@insforge/react';

const Leaderboard = () => {
    const { t } = useLanguage();
    const { user } = useUser();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        insforge.database
            .from('profiles')
            .select('*')
            .order('xp', { ascending: false })
            .limit(50)
            .then(({ data }) => {
                if (data) {
                    const loadedUsers = data.map((p: any, index: number) => ({
                        id: p.id,
                        name: p.username || 'KurdLearner',
                        xp: p.xp || 0,
                        rank: index + 1,
                        avatar: p.avatar_url ? <img src={p.avatar_url} style={{width: '100%', borderRadius: '50%'}}/> : "👤"
                    }));
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
                        background: u.id === user?.id ? '#f0fdf4' : 'white'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <span style={{ fontWeight: 'bold', color: u.rank <= 3 ? 'var(--color-gold)' : 'var(--color-text-light)', width: '20px' }}>{u.rank}</span>
                            <div style={{ width: '40px', height: '40px', background: '#e5e7eb', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                                {u.avatar}
                            </div>
                            <span style={{ fontWeight: 'bold', color: u.id === user?.id ? 'var(--color-primary)' : 'var(--color-text)' }}>{u.name}</span>
                        </div>
                        <span style={{ fontWeight: 'bold', color: 'var(--color-text-secondary)' }}>{u.xp} XP</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Leaderboard;
