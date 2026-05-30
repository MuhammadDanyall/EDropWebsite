import { useState, useEffect } from 'react';

export const useAuthGate = () => {
    const [user, setUser] = useState(null);
    const [isAuthAlertOpen, setIsAuthAlertOpen] = useState(false);

    useEffect(() => {
        const checkUser = () => {
            const storedUser = sessionStorage.getItem('user');
            if (storedUser) {
                try { setUser(JSON.parse(storedUser)); } catch(e) {}
            } else {
                setUser(null);
            }
        };
        checkUser();
        window.addEventListener('storage', checkUser);
        return () => window.removeEventListener('storage', checkUser);
    }, []);

    const handleRestrictedClick = (e) => {
        if (!user) {
            if (e) e.preventDefault();
            setIsAuthAlertOpen(true);
            return false;
        }
        return true;
    };

    return {
        user,
        isAuthAlertOpen,
        setIsAuthAlertOpen,
        handleRestrictedClick
    };
};
