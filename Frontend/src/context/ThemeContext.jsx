import React, { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

const darkTheme = {
  name: 'dark',
  colors: {
    'bg-primary': '#0A0F1E',
    'bg-secondary': '#111827',
    'text-primary': '#F8F9FA',
    'text-secondary': '#9CA3AF',
    'border-color': '#1F2937',
    'primary': '#00B4D8',
    'secondary': '#0077B6',
    'success': '#06D6A0',
    'danger': '#EF233C',
    'warning': '#FFB703',
    'bg-primary-rgb': '10 15 30',
    'bg-secondary-rgb': '17 24 39',
    'text-primary-rgb': '248 249 250',
    'text-secondary-rgb': '156 163 175',
    'border-color-rgb': '31 41 55',
    'primary-rgb': '0 180 216',
    'secondary-rgb': '0 119 182',
    'success-rgb': '6 214 160',
    'danger-rgb': '239 35 60',
    'warning-rgb': '255 183 3',
  }
};

const lightTheme = {
  name: 'light',
  colors: {
    'bg-primary': '#F0F4F8',
    'bg-secondary': '#FFFFFF',
    'text-primary': '#0A0F1E',
    'text-secondary': '#4B5563',
    'border-color': '#E5E7EB',
    'primary': '#0077B6',
    'secondary': '#0055A4',
    'success': '#059669',
    'danger': '#DC2626',
    'warning': '#F59E0B',
    'bg-primary-rgb': '240 244 248',
    'bg-secondary-rgb': '255 255 255',
    'text-primary-rgb': '10 15 30',
    'text-secondary-rgb': '75 85 99',
    'border-color-rgb': '229 231 235',
    'primary-rgb': '0 119 182',
    'secondary-rgb': '0 85 164',
    'success-rgb': '5 150 105',
    'danger-rgb': '220 38 38',
    'warning-rgb': '245 158 11',
  }
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('mediguard-theme');
    return saved === 'light' ? lightTheme : darkTheme;
  });

  useEffect(() => {
    // Set CSS variables on root element
    const root = document.documentElement;
    root.setAttribute('data-theme', theme.name);

    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
    });

    // Save to localStorage
    localStorage.setItem('mediguard-theme', theme.name);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) =>
      prevTheme.name === 'dark' ? lightTheme : darkTheme
    );
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

