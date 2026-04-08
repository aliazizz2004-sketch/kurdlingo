import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

const AuthContext = createContext<{ user: User | null, isLoaded: boolean }>({ user: null, isLoaded: false });

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        // Handle OAuth callback: supabase-js v2 auto-detects the hash tokens
        // when getSession() is called, so no extra handling needed.
        const getSession = async () => {
            const { data } = await supabase.auth.getSession();
            setUser(data.session?.user || null);
            setIsLoaded(true);
        };
        getSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user || null);
            if (!isLoaded) setIsLoaded(true);
        });

        return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <AuthContext.Provider value={{ user, isLoaded }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useUser = () => useContext(AuthContext);

export const SignedIn = ({ children }: { children: React.ReactNode }) => {
    const { user } = useUser();
    return user ? <>{children}</> : null;
};

export const SignedOut = ({ children }: { children: React.ReactNode }) => {
    const { user } = useUser();
    return !user ? <>{children}</> : null;
};
