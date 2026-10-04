import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { 
  X, 
  Building2, 
  User, 
  Mail, 
  Phone, 
  CheckCircle2, 
  ArrowRight,
  CreditCard,
  ChevronDown,
  ChevronUp,
  Sparkles
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { 
    isAuthModalOpen, 
    closeAuthModal, 
    authModalMode, 
    login, 
    register, 
    users,
    organizations
  } = useStore();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>(authModalMode);

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');

  // Register form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+7 ');
  const [bin, setBin] = useState('');
  const [companyName, setCompanyName] = useState('');
  
  // Optional banking section toggle
  const [showBankingDetails, setShowBankingDetails] = useState(false);
  const [iik, setIik] = useState('');
  const [bik] = useState('HSBKKZKX');
  const [bankName, setBankName] = useState('АО "Народный Банк Казахстана"');
  const [deliveryAddress, setDeliveryAddress] = useState('');

  // Auto-detect existing organization when BIN is entered
  const existingOrg = bin.trim().length >= 10 
    ? organizations.find(o => o.bin === bin.trim()) 
    : null;

  useEffect(() => {
    setActiveTab(authModalMode);
  }, [authModalMode]);

  useEffect(() => {
    if (existingOrg && !companyName) {
      setCompanyName(existingOrg.companyName);
      if (existingOrg.iik) setIik(existingOrg.iik);
      if (existingOrg.bankName) setBankName(existingOrg.bankName);
      if (existingOrg.deliveryAddress) setDeliveryAddress(existingOrg.deliveryAddress);
    }
  }, [existingOrg, companyName]);

  // Lock body scroll and handle Escape key
  useEffect(() => {
    if (!isAuthModalOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeAuthModal();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isAuthModalOpen, closeAuthModal]);

  if (!isAuthModalOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginIdentifier.trim()) return;
    login(loginIdentifier.trim());
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !bin.trim() || !companyName.trim()) return;

    register({
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      roleInOrg: 'procurement',
      bin: bin.trim(),
      companyName: companyName.trim(),
      iik: iik.trim(),
      bik: bik.trim(),
      bankName: bankName.trim(),
      deliveryAddress: deliveryAddress.trim(),
    });
  };

  const handleQuickDemoLogin = (userEmail: string) => {
    login(userEmail);
  };

  return (
    <div className="fixed inset-0 !m-0 z-50 overflow-hidden no-print flex items-center justify-center p-3 sm:p-5 md:p-6 animate-in fade-in duration-200">
      {/* Blurred Backdrop */}
      <div 
        onClick={closeAuthModal}
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity" 
      />

      {/* Main Centered Card */}
      <div className="relative w-full max-w-xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] z-10 my-auto">
        
        {/* Header Bar */}
        <div className="p-5 sm:p-6 pb-3 border-b border-slate-100 flex items-center justify-between gap-4 shrink-0">
            <div className="flex-1 min-w-0">
              {/* Segmented Control Switcher */}
              <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200/80">
                <button
                  type="button"
                  onClick={() => setActiveTab('login')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'login'
                      ? 'bg-white text-navy-950 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Вход в аккаунт
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('register')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'register'
                      ? 'bg-white text-navy-950 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Регистрация компании
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={closeAuthModal}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
              aria-label="Закрыть"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Form Body */}
          <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
            {activeTab === 'login' ? (
              /* LOGIN TAB */
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Добро пожаловать в ChemExpress
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Укажите рабочий email или телефон для доступа к счетам и заказам вашей организации
                  </p>
                </div>

                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                      <span>Рабочий Email или Телефон</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        required
                        autoFocus
                        placeholder="a.berezhnoy@kazchimsynthez.kz или +7 (701) ..."
                        value={loginIdentifier}
                        onChange={(e) => setLoginIdentifier(e.target.value)}
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-navy-900 focus:ring-2 focus:ring-navy-900/10 transition-all font-medium"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 rounded-xl bg-navy-900 hover:bg-navy-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2 active:scale-[0.99]"
                  >
                    <span>Войти в кабинет</span>
                    <ArrowRight className="w-4 h-4 text-cyan-300" />
                  </button>
                </form>

                {/* No account link */}
                <div className="text-center pt-2 text-xs text-slate-500">
                  <span>Компания ещё не зарегистрирована? </span>
                  <button
                    type="button"
                    onClick={() => setActiveTab('register')}
                    className="text-navy-900 font-bold hover:underline cursor-pointer"
                  >
                    Создать профиль организации
                  </button>
                </div>

                {/* Quick Demo Test Accounts (Clean Minimal Accordion/Pills) */}
                <div className="pt-4 border-t border-slate-100 space-y-2.5">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="font-semibold uppercase tracking-wider">Тестовые B2B-профили:</span>
                    <span>клик для мгновенного входа</span>
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    {users.map(u => {
                      const org = organizations.find(o => o.bin === u.organizationBin);
                      return (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => handleQuickDemoLogin(u.email)}
                          className="w-full p-2.5 rounded-xl border border-slate-200/90 hover:border-navy-400 hover:bg-navy-50/40 transition-all cursor-pointer flex items-center justify-between text-left group"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-navy-100 text-slate-700 group-hover:text-navy-900 font-bold text-xs flex items-center justify-center shrink-0 transition-colors">
                              {u.fullName.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-slate-800 truncate group-hover:text-navy-950">
                                {u.fullName}
                              </div>
                              <div className="text-[10px] text-slate-500 truncate">
                                {org?.companyName}
                              </div>
                            </div>
                          </div>

                          <div className="shrink-0 text-right font-mono text-[10px] text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200/80">
                            БИН {u.organizationBin}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              /* REGISTRATION TAB */
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Регистрация организации и представителя
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Укажите БИН компании. Если организация уже есть в реестре, вы будете подключены к её корпоративному профилю.
                  </p>
                </div>

                {/* 1. Smart BIN verification */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                    <span>БИН организации (12 цифр) *</span>
                    <span className="text-[10px] font-normal text-slate-400">Только цифры</span>
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      maxLength={12}
                      placeholder="Например: 080140012345"
                      value={bin}
                      onChange={(e) => setBin(e.target.value.replace(/\D/g, ''))}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-navy-900 focus:ring-2 focus:ring-navy-900/10 transition-all tracking-wider"
                    />
                  </div>

                  {/* Verification Status Card */}
                  {existingOrg ? (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200/90 text-xs space-y-1 animate-in fade-in duration-150">
                      <div className="flex items-center gap-1.5 font-bold text-emerald-900 text-xs">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Организация найдена: {existingOrg.companyName}</span>
                      </div>
                      <p className="text-[11px] text-emerald-800 leading-relaxed">
                        Компания уже зарегистрирована в системе. Вы будете подключены как официальный представитель этой компании.
                      </p>
                    </div>
                  ) : bin.length === 12 ? (
                    <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>Новая организация. Введите наименование компании ниже.</span>
                    </div>
                  ) : null}
                </div>

                {/* Company Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Наименование компании *</label>
                  <input
                    type="text"
                    required
                    placeholder="ТОО «КазХимСинтез» или ИП ..."
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-navy-900 focus:ring-2 focus:ring-navy-900/10 transition-all font-medium"
                  />
                </div>

                {/* 2. Representative Profile */}
                <div className="pt-2 border-t border-slate-100">
                  <div className="text-xs font-bold text-slate-800 mb-2.5">
                    Данные сотрудника (представителя)
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Full Name */}
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-xs font-medium text-slate-600">ФИО представителя *</label>
                      <div className="relative">
                        <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          required
                          placeholder="Иванов Алексей Владимирович"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-navy-900 focus:ring-1 focus:ring-navy-900/20"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-600">Рабочий Email *</label>
                      <div className="relative">
                        <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="email"
                          required
                          placeholder="a.ivanov@company.kz"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-navy-900 focus:ring-1 focus:ring-navy-900/20"
                        />
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-600">Номер телефона *</label>
                      <div className="relative">
                        <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="tel"
                          required
                          placeholder="+7 (701) 000-00-00"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-navy-900 focus:ring-1 focus:ring-navy-900/20"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Optional Banking & Delivery Details Accordion */}
                <div className="border border-slate-200/90 rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setShowBankingDetails(!showBankingDetails)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100/80 transition-colors flex items-center justify-between text-xs font-semibold text-slate-700 cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <CreditCard className="w-3.5 h-3.5 text-slate-500" />
                      <span>Банковские реквизиты и адрес (необязательно)</span>
                    </span>
                    {showBankingDetails ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </button>

                  {showBankingDetails && (
                    <div className="p-3.5 bg-white space-y-3 border-t border-slate-200/70 text-xs">
                      <div className="space-y-1">
                        <label className="text-[11px] font-medium text-slate-600">ИИК (IBAN счёт)</label>
                        <input
                          type="text"
                          placeholder="KZ..."
                          value={iik}
                          onChange={(e) => setIik(e.target.value.toUpperCase())}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-mono uppercase"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-medium text-slate-600">Адрес доставки / филиала</label>
                        <input
                          type="text"
                          placeholder="г. Алматы, пр. Райымбека, 120"
                          value={deliveryAddress}
                          onChange={(e) => setDeliveryAddress(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl bg-navy-900 hover:bg-navy-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2 active:scale-[0.99]"
                >
                  <span>Завершить регистрацию компании</span>
                  <ArrowRight className="w-4 h-4 text-cyan-300" />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  };
