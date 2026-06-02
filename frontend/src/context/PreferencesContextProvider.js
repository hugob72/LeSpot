import React, { createContext, useState, useEffect } from 'react';

export const PreferencesContext = createContext();

function PreferencesContextProvider({ children }) {
    // Initialisation avec le localStorage ou valeurs par défaut
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
    const [language, setLanguage] = useState(() => localStorage.getItem('language') || 'fr');
    const [currency, setCurrency] = useState(() => localStorage.getItem('currency') || 'EUR');

    // 1. Sauvegarde et application du THÈME
    useEffect(() => {
        localStorage.setItem('theme', theme);
        if (theme === 'dark') {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    }, [theme]);

    // 2. Sauvegarde de la LANGUE
    useEffect(() => {
        localStorage.setItem('language', language);
    }, [language]);

    // 3. Sauvegarde de la DEVISE
    useEffect(() => {
        localStorage.setItem('currency', currency);
    }, [currency]);

    return (
        <PreferencesContext.Provider value={{ theme, setTheme, language, setLanguage, currency, setCurrency }}>
            {children}
        </PreferencesContext.Provider>
    );
}
export default PreferencesContextProvider;