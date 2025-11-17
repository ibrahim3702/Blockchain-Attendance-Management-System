import React, { useEffect, useState } from 'react';
import './ThemeToggle.css';

const STORAGE_KEY = 'bams-theme';

export default function ThemeToggle() {
    const [theme, setTheme] = useState(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved === 'light' || saved === 'dark') return saved;
        return '';
    });

    useEffect(() => {
        const root = document.documentElement;
        if (!theme) {
            root.removeAttribute('data-theme');
            localStorage.removeItem(STORAGE_KEY);
            return;
        }
        root.setAttribute('data-theme', theme);
        localStorage.setItem(STORAGE_KEY, theme);
    }, [theme]);

    const isDark = (theme || '').toLowerCase() === 'dark';

    return (
        <button
            className={`theme-toggle ${isDark ? 'dark' : 'light'}`}
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
        >
            <span className="icon" aria-hidden>
                {isDark ? '☀️' : '🌙'}
            </span>
            <span className="label">{isDark ? 'Light' : 'Dark'}</span>
        </button>
    );
}
