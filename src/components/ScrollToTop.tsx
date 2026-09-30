import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export const ScrollToTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 350);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!isVisible) return null;

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Прокрутить страницу наверх"
      className="fixed bottom-6 right-6 z-40 p-3 sm:p-3.5 rounded-2xl bg-white/95 hover:bg-white text-navy-950 border border-slate-200/90 shadow-elevated hover:shadow-2xl backdrop-blur-md transition-all duration-200 cursor-pointer select-none active:scale-95 group animate-in fade-in zoom-in-95 slide-in-from-bottom-3"
      title="Прокрутить наверх"
    >
      <ArrowUp className="w-5 h-5 text-navy-900 transition-transform duration-200 group-hover:-translate-y-0.5" />
    </button>
  );
};
