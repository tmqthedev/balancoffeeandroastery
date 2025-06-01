import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
    const { i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);

    const languages = [
        { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
        { code: 'en', name: 'English', flag: '🇺🇸' }
    ];

    const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

    const changeLanguage = (languageCode) => {
        i18n.changeLanguage(languageCode);
        setIsOpen(false);
    };

    return (
        <div className="fixed top-20 right-4 z-50">
            <div className="relative">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center space-x-2 bg-white shadow-lg rounded-lg px-3 py-2 hover:shadow-xl transition-shadow duration-200 border border-cream-200"
                >
                    <span className="text-lg">{currentLanguage.flag}</span>
                    <span className="text-sm font-medium text-coffee-700 hidden sm:block">
                        {currentLanguage.name}
                    </span>
                    <svg 
                        className={`w-4 h-4 text-coffee-600 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>

                {isOpen && (
                    <div className="absolute top-full right-0 mt-2 bg-white shadow-xl rounded-lg border border-cream-200 overflow-hidden min-w-[150px]">
                        {languages.map((language) => (
                            <button
                                key={language.code}
                                onClick={() => changeLanguage(language.code)}
                                className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-cream-50 transition-colors duration-150 ${
                                    i18n.language === language.code 
                                        ? 'bg-coffee-50 text-coffee-800 font-medium' 
                                        : 'text-coffee-600'
                                }`}
                            >
                                <span className="text-lg">{language.flag}</span>
                                <span className="text-sm">{language.name}</span>
                                {i18n.language === language.code && (
                                    <svg className="w-4 h-4 text-coffee-600 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                )}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Overlay to close dropdown when clicking outside */}
            {isOpen && (
                <div 
                    className="fixed inset-0 z-[-1]" 
                    onClick={() => setIsOpen(false)}
                />
            )}
        </div>
    );
};

export default LanguageSwitcher;
