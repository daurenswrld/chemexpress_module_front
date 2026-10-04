import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  AlertCircle, 
  KeyRound, 
  Building2,
  Users
} from 'lucide-react';

export const StaffLoginPage: React.FC = () => {
  const { loginStaff, setCurrentView } = useStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError('Пожалуйста, введите рабочий email и пароль.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const res = loginStaff(email, password);
      setIsLoading(false);

      if (res.success) {
        const staff = useStore.getState().staffUser;
        if (staff?.role === 'admin') {
          setCurrentView('admin');
        } else {
          setCurrentView('manager');
        }
      } else {
        setError(res.error || 'Неверный логин или пароль.');
      }
    }, 250);
  };

  const handleQuickLogin = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      const res = loginStaff(demoEmail, demoPass);
      setIsLoading(false);

      if (res.success) {
        const staff = useStore.getState().staffUser;
        if (staff?.role === 'admin') {
          setCurrentView('admin');
        } else {
          setCurrentView('manager');
        }
      } else {
        setError(res.error || 'Ошибка входа.');
      }
    }, 200);
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col justify-center items-center py-10 px-4 sm:px-6">
      
      {/* Return to Catalog Button */}
      <div className="w-full max-w-md mb-5 flex justify-start">
        <button
          type="button"
          onClick={() => setCurrentView('catalog')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200/90 px-3.5 py-2 rounded-xl transition-all cursor-pointer shadow-2xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Вернуться на сайт</span>
        </button>
      </div>

      {/* Main Authentication Card */}
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-900/5 space-y-6">
        
        {/* Brand & Security Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-navy-900 text-white flex items-center justify-center mx-auto shadow-sm shadow-navy-950/20">
            <KeyRound className="w-6 h-6 text-cyan-400 stroke-[2]" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-navy-50 text-navy-900 text-[11px] font-semibold border border-navy-100">
            <ShieldCheck className="w-3.5 h-3.5 text-navy-800" />
            <span>ChemExpress • Панель управления</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Вход для сотрудников
          </h1>
          <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
            Авторизация менеджеров по снабжению и администраторов платформы
          </p>
        </div>

        {/* Error Notice */}
        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-900 rounded-xl text-xs flex items-start gap-2.5 animate-in fade-in duration-150">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="font-medium leading-relaxed">{error}</div>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Email / Login */}
          <div>
            <label className="block font-semibold text-slate-800 mb-1.5">
              Email или логин сотрудника
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="manager@chemexpress.kz"
                className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium outline-none focus:bg-white focus:border-navy-900 transition-colors"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-semibold text-slate-800">
                Пароль
              </label>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Введите пароль"
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium outline-none focus:bg-white focus:border-navy-900 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-0.5 rounded transition-colors cursor-pointer"
                title={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-bold text-xs shadow-md shadow-navy-950/15 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-70 mt-2"
          >
            {isLoading ? (
              <span className="inline-block animate-pulse">Проверка доступа...</span>
            ) : (
              <>
                <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
                <span>Войти в систему</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Login Cards */}
        <div className="pt-5 border-t border-slate-200/80 space-y-3">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-center">
            Быстрый вход для проверки:
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Manager Card */}
            <button
              type="button"
              onClick={() => handleQuickLogin('manager@chemexpress.kz', 'manager2026')}
              className="p-3 text-left rounded-xl border border-slate-200 hover:border-navy-900 bg-slate-50/70 hover:bg-navy-50/40 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-3.5 h-3.5 text-navy-800 group-hover:scale-110 transition-transform" />
                <span className="font-bold text-slate-900 text-xs">Менеджер</span>
              </div>
              <div className="text-[11px] text-slate-500 font-mono">manager@chemexpress.kz</div>
              <div className="text-[10px] text-cyan-800 font-medium mt-1">АРМ согласования счетов</div>
            </button>

            {/* Admin Card */}
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@chemexpress.kz', 'admin2026')}
              className="p-3 text-left rounded-xl border border-slate-200 hover:border-navy-900 bg-slate-50/70 hover:bg-purple-50/40 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-700 group-hover:scale-110 transition-transform" />
                <span className="font-bold text-slate-900 text-xs">Администратор</span>
              </div>
              <div className="text-[11px] text-slate-500 font-mono">admin@chemexpress.kz</div>
              <div className="text-[10px] text-purple-800 font-medium mt-1">Полный доступ и настройки</div>
            </button>
          </div>
        </div>

        {/* Security Footer Notice */}
        <div className="pt-3 text-center text-[10px] text-slate-400 leading-normal flex items-center justify-center gap-1.5">
          <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
          <span>ИП «ChemExpress» • Защищенный шлюз внутреннего реестра</span>
        </div>

      </div>

    </div>
  );
};
