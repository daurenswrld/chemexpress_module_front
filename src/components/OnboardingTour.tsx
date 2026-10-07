import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, X, Check } from 'lucide-react';

export interface TourStep {
  targetId: string;
  title: string;
  description: string;
  placement?: 'bottom' | 'top' | 'left' | 'right';
}

interface OnboardingTourProps {
  steps: TourStep[];
  tourKey?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const OnboardingTour: React.FC<OnboardingTourProps> = ({
  steps,
  tourKey = 'chemexpress_manager_tour_completed',
  isOpen,
  onClose
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [coords, setCoords] = useState<{ top: number; left: number; width: number; height: number } | null>(null);

  const step = steps[currentStepIndex];

  const updatePosition = () => {
    if (!step) return;
    const el = document.getElementById(step.targetId);
    if (el) {
      const rect = el.getBoundingClientRect();
      setCoords({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height
      });
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else {
      setCoords(null);
    }
  };

  useEffect(() => {
    if (isOpen) {
      updatePosition();
      const handleResize = () => updatePosition();
      window.addEventListener('resize', handleResize);
      window.addEventListener('scroll', handleResize, true);
      return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('scroll', handleResize, true);
      };
    }
  }, [isOpen, currentStepIndex]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleComplete();
      } else if (e.key === 'ArrowRight' && currentStepIndex < steps.length - 1) {
        setCurrentStepIndex(prev => prev + 1);
      } else if (e.key === 'ArrowLeft' && currentStepIndex > 0) {
        setCurrentStepIndex(prev => prev - 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStepIndex, steps.length]);

  const handleComplete = () => {
    try {
      localStorage.setItem(tourKey, 'true');
    } catch {
      // ignore
    }
    onClose();
    setCurrentStepIndex(0);
  };

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  if (!isOpen || !step) return null;

  return (
    <div style={{margin:0}} className="fixed inset-0 m-0 p-0 z-50 pointer-events-none">
      <div 
        className="absolute inset-0 m-0 bg-slate-950/45 transition-opacity duration-200 pointer-events-auto"
        onClick={handleComplete} 
      />

      {coords && (
        <div
          className="absolute rounded-xl transition-all duration-300 pointer-events-none ring-4 ring-cyan-500/80 shadow-2xl"
          style={{
            top: `${Math.max(0, coords.top - 4)}px`,
            left: `${Math.max(0, coords.left - 4)}px`,
            width: `${coords.width + 8}px`,
            height: `${coords.height + 8}px`,
            boxShadow: '0 0 0 9999px rgba(15, 23, 42, 0.45)'
          }}
        />
      )}

      <div
        className="absolute pointer-events-auto z-10 transition-all duration-200 w-80 sm:w-96"
        style={{
          top: coords ? `${Math.min(window.innerHeight - 240, coords.top + coords.height + 14)}px` : '50%',
          left: coords ? `${Math.max(16, Math.min(window.innerWidth - 380, coords.left))}px` : '50%',
          transform: coords ? 'none' : 'translate(-50%, -50%)'
        }}
      >
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-2xl border border-slate-200/90 text-slate-900">
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-800">
                Шаг {currentStepIndex + 1} из {steps.length}
              </span>
            </div>

            <button
              type="button"
              onClick={handleComplete}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors cursor-pointer"
              title="Закрыть подсказки (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <h4 className="text-sm font-bold text-slate-900 mb-1 leading-snug">
            {step.title}
          </h4>
          <p className="text-xs text-slate-600 leading-relaxed mb-4">
            {step.description}
          </p>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={handleComplete}
              className="text-xs text-slate-400 hover:text-slate-700 font-semibold cursor-pointer transition-colors"
            >
              Пропустить
            </button>

            <div className="flex items-center gap-2">
              {currentStepIndex > 0 && (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Назад</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer shadow-sm"
              >
                <span>{currentStepIndex === steps.length - 1 ? 'Понятно' : 'Далее'}</span>
                {currentStepIndex === steps.length - 1 ? (
                  <Check className="w-3.5 h-3.5" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
