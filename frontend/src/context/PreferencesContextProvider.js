// PreferencesContextProvider.js
import React, { createContext, useState, useEffect } from 'react';

export const PreferencesContext = createContext();

function PreferencesContextProvider({ children }) {
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
    const [language, setLanguage] = useState(() => localStorage.getItem('language') || 'fr');
    const [currency, setCurrency] = useState(() => localStorage.getItem('currency') || 'EUR');

    useEffect(() => {
        localStorage.setItem('theme', theme);
        if (theme === 'dark') {
            document.body.classList.add('dark-mode');
            document.body.classList.remove('light-mode', 'water-mode');
        } else if (theme === 'light') {
            document.body.classList.add('light-mode');
            document.body.classList.remove('dark-mode', 'water-mode');
        } else if (theme === 'water') {
            document.body.classList.add('water-mode');
            document.body.classList.remove('light-mode', 'dark-mode');
        }
    }, [theme]);

    useEffect(() => {
        localStorage.setItem('language', language);
    }, [language]);

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