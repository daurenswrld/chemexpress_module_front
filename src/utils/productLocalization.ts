// Utility for standard-compliant product name translation and localization in Kazakhstan (РК)
// Law of the Republic of Kazakhstan "On Languages in the Republic of Kazakhstan", Article 21
// Accounting standard requires primary documentation in Russian or Kazakh, with international English secondary.

export function hasCyrillic(text: string): boolean {
  return /[а-яёА-ЯЁ]/i.test(text);
}

// Common dictionary for laboratory chemicals and reagents
const EXACT_REAGENT_MAP: Record<string, string> = {
  '1-ethynyl-1-cyclohexanol': '1-Этинил-1-циклогексанол',
  '3-ethyl-3-methylheptane': '3-Этил-3-метилгептан',
  '(1-ethylpropyl)benzene': '(1-Этилпропил)бензол',
  'acetone': 'Ацетон',
  'acetonitrile': 'Ацетонитрил',
  'acetic acid': 'Уксусная кислота',
  'benzoic acid': 'Бензойная кислота',
  'boric acid': 'Борная кислота',
  'citric acid': 'Лимонная кислота',
  'formic acid': 'Муравьиная кислота',
  'hydrochloric acid': 'Соляная кислота (хлороводородная)',
  'nitric acid': 'Азотная кислота',
  'phosphoric acid': 'Фосфорная (ортофосфорная) кислота',
  'sulfuric acid': 'Серная кислота',
  'sulphuric acid': 'Серная кислота',
  'hydrogen peroxide': 'Перекись водорода (водорода пероксид)',
  'sodium chloride': 'Натрия хлорид',
  'potassium chloride': 'Калия хлорид',
  'sodium hydroxide': 'Натрия гидроксид (натр едкий)',
  'potassium hydroxide': 'Калия гидроксид (калий едкий)',
  'calcium hydroxide': 'Кальция гидроксид',
  'sodium bicarbonate': 'Натрия гидрокарбонат (сода)',
  'sodium carbonate': 'Натрия карбонат',
  'potassium carbonate': 'Калия карбонат (поташ)',
  'sodium sulfate': 'Натрия сульфат',
  'potassium sulfate': 'Калия сульфат',
  'copper sulfate': 'Меди(II) сульфат (медный купорос)',
  'iron(ii) sulfate': 'Железа(II) сульфат',
  'iron(iii) chloride': 'Железа(III) хлорид',
  'ammonium chloride': 'Аммония хлорид (нашатырь)',
  'ammonium hydroxide': 'Аммония гидроксид (аммиак водный)',
  'ammonium nitrate': 'Аммония нитрат',
  'barium chloride': 'Бария хлорид',
  'zinc sulfate': 'Цинка сульфат',
  'zinc oxide': 'Цинка оксид',
  'titanium dioxide': 'Титана диоксид',
  'toluene': 'Толуол',
  'benzene': 'Бензол',
  'hexane': 'Гексан',
  'heptane': 'Гептан',
  'dichloromethane': 'Дихлорметан (метиленхлорид)',
  'chloroform': 'Хлороформ',
  'dimethyl sulfoxide': 'Диметилсульфоксид (ДМСО)',
  'dmso': 'Диметилсульфоксид (ДМСО)',
  'dimethylformamide': 'Диметилформамид (ДМФА)',
  'dmf': 'Диметилформамид (ДМФА)',
  'tetrahydrofuran': 'Тетрагидрофуран (ТГФ)',
  'thf': 'Тетрагидрофуран (ТГФ)',
  'ethanol': 'Этанол (спирт этиловый)',
  'methanol': 'Метанол (спирт метиловый)',
  'isopropanol': 'Изопропанол (спирт изопропиловый)',
  '1-propanol': '1-Пропанол',
  '1-butanol': '1-Бутанол',
  'glycerol': 'Глицерин (глицерол)',
  'glucose': 'Глюкоза (декстроза)',
  'potassium permanganate': 'Калия перманганат',
  'silver nitrate': 'Серебра нитрат (ляпис)',
};

// Chemical building blocks for systematic transliteration
const CHEMICAL_ROOT_MAP: [RegExp, string][] = [
  [/\bmethyl\b/gi, 'метил'],
  [/\bethyl\b/gi, 'этил'],
  [/\bpropyl\b/gi, 'пропил'],
  [/\bbutyl\b/gi, 'бутил'],
  [/\bpentyl\b/gi, 'пентил'],
  [/\bhexyl\b/gi, 'гексил'],
  [/\bheptyl\b/gi, 'гептил'],
  [/\boctyl\b/gi, 'октил'],
  [/\bnonyl\b/gi, 'нонил'],
  [/\bdecyl\b/gi, 'децил'],
  [/\bphenyl\b/gi, 'фенил'],
  [/\bbenzyl\b/gi, 'бензил'],
  [/\bethynyl\b/gi, 'этинил'],
  [/\bcyclohexyl\b/gi, 'циклогексил'],
  [/\bcyclohexane\b/gi, 'циклогексан'],
  [/\bcyclohexanol\b/gi, 'циклогексанол'],
  [/\bcyclopentane\b/gi, 'циклопентан'],
  [/\bbenzene\b/gi, 'бензол'],
  [/\bheptane\b/gi, 'гептан'],
  [/\bhexane\b/gi, 'гексан'],
  [/\boctane\b/gi, 'октан'],
  [/\bchloride\b/gi, 'хлорид'],
  [/\bbromide\b/gi, 'бромид'],
  [/\biodide\b/gi, 'йодид'],
  [/\bfluoride\b/gi, 'фторид'],
  [/\bsulfate\b/gi, 'сульфат'],
  [/\bsulphate\b/gi, 'сульфат'],
  [/\bnitrate\b/gi, 'нитрат'],
  [/\bphosphate\b/gi, 'фосфат'],
  [/\bcarbonate\b/gi, 'карбонат'],
  [/\bacetate\b/gi, 'ацетат'],
  [/\boxide\b/gi, 'оксид'],
  [/\bdioxide\b/gi, 'диоксид'],
  [/\bhydroxide\b/gi, 'гидроксид'],
  [/\bacid\b/gi, 'кислота'],
  [/\banhydrous\b/gi, 'безводный'],
  [/\bmonohydrate\b/gi, 'моногидрат'],
  [/\bdihydrate\b/gi, 'дигидрат'],
  [/\btrihydrate\b/gi, 'тригидрат'],
  [/\bsolution\b/gi, 'раствор'],
];

// Labware terms
const LABWARE_MAP: [RegExp, string][] = [
  [/conical flask|erlenmeyer flask/gi, 'Колба коническая (Эрленмейера)'],
  [/volumetric flask/gi, 'Колба мерная'],
  [/round bottom flask/gi, 'Колба круглодонная'],
  [/flat bottom flask/gi, 'Колба плоскодонная'],
  [/\bflask\b/gi, 'Колба лабораторная'],
  [/\bbeaker\b/gi, 'Стакан лабораторный'],
  [/measuring cylinder|graduated cylinder/gi, 'Цилиндр мерный'],
  [/\bpipette\b/gi, 'Пипетка лабораторная'],
  [/\bburette\b/gi, 'Бюретка лабораторная'],
  [/\bfunnel\b/gi, 'Воронка лабораторная'],
  [/petri dish/gi, 'Чашка Петри'],
  [/test tube/gi, 'Пробирка лабораторная'],
  [/centrifuge tube/gi, 'Пробирка центрифужная'],
  [/\bbottle\b/gi, 'Бутыль лабораторная'],
  [/borosilicate glass/gi, 'боросиликатное стекло 3.3'],
];

// Biology terms
const BIO_MAP: [RegExp, string][] = [
  [/elisa kit/gi, 'Набор реагентов для ИФА (ELISA)'],
  [/\bantibody\b/gi, 'Антитело лабораторное'],
  [/\bantigen\b/gi, 'Антиген диагностический'],
  [/\bprotein\b/gi, 'Белок рекомбинантный'],
  [/dna polymerase/gi, 'ДНК-полимераза'],
  [/pcr master mix/gi, 'Мастер-микс для ПЦР'],
  [/cell culture medium/gi, 'Среда для культивирования клеток'],
];

/**
 * Translates an English product title to an official Russian regulatory compliant name.
 */
export function translateToRussianName(titleEn: string, category?: string): string {
  if (!titleEn) return 'Химический реактив';
  if (hasCyrillic(titleEn)) return titleEn;

  const normalized = titleEn.trim().toLowerCase();

  // 1. Direct match in dictionary
  if (EXACT_REAGENT_MAP[normalized]) {
    return EXACT_REAGENT_MAP[normalized];
  }

  // 2. Check labware patterns
  for (const [pattern, ruTerm] of LABWARE_MAP) {
    if (pattern.test(titleEn)) {
      return titleEn.replace(pattern, ruTerm);
    }
  }

  // 3. Check biology patterns
  for (const [pattern, ruTerm] of BIO_MAP) {
    if (pattern.test(titleEn)) {
      return titleEn.replace(pattern, ruTerm);
    }
  }

  // 4. Check chemical roots transliteration
  let translated = titleEn;
  let matchesCount = 0;
  for (const [pattern, ruTerm] of CHEMICAL_ROOT_MAP) {
    if (pattern.test(translated)) {
      translated = translated.replace(pattern, ruTerm);
      matchesCount++;
    }
  }

  if (matchesCount > 0 && hasCyrillic(translated)) {
    // Capitalize first letter
    return translated.charAt(0).toUpperCase() + translated.slice(1);
  }

  // 5. Fallback with legal regulatory prefix
  const cat = (category || '').toLowerCase();
  if (cat.includes('посуд') || cat.includes('стекл') || cat.includes('dishware') || cat.includes('glass')) {
    return `Лабораторная посуда: ${titleEn}`;
  }
  if (cat.includes('биолог') || cat.includes('antibody') || cat.includes('elisa') || cat.includes('bio')) {
    return `Биологический реагент / набор: ${titleEn}`;
  }

  return `Химический реактив: ${titleEn}`;
}

/**
 * Returns the legal dual-language structure for Kazakhstan primary accounting:
 * - primary: strictly in Russian or Kazakh (required by RK law)
 * - secondary: optional international English technical specification + CAS
 */
export function getLegalDocumentItemName(
  item: {
    name?: string;
    nameRu?: string;
    nameEn?: string;
    sku?: string;
    casNumber?: string;
  },
  lang: 'ru' | 'kz' | 'en' = 'ru'
): { officialTitle: string; internationalSubtitle: string } {
  const rawName = item.name || item.nameRu || item.nameEn || '';
  const isRussian = hasCyrillic(rawName);

  let officialTitle = '';
  let internationalSubtitle = '';

  if (lang === 'en') {
    officialTitle = item.nameEn || rawName;
    if (item.casNumber && item.casNumber !== 'N/A') {
      internationalSubtitle = `CAS: ${item.casNumber}`;
    }
  } else if (lang === 'kz') {
    // Kazakh language mode
    if (isRussian) {
      officialTitle = rawName;
    } else {
      officialTitle = `Химиялық реактив: ${rawName}`;
    }
    const enName = item.nameEn || rawName;
    internationalSubtitle = enName !== officialTitle ? `Халықаралық атауы: ${enName}` : '';
    if (item.casNumber && item.casNumber !== 'N/A') {
      internationalSubtitle += internationalSubtitle ? ` • CAS: ${item.casNumber}` : `CAS: ${item.casNumber}`;
    }
  } else {
    // Russian language mode (Standard RK Accounting)
    if (isRussian) {
      officialTitle = rawName;
    } else {
      officialTitle = translateToRussianName(rawName);
    }

    const enName = item.nameEn || (!isRussian ? rawName : '');
    if (enName && enName !== officialTitle) {
      internationalSubtitle = `Международное торговое наименование: ${enName}`;
    }
    if (item.casNumber && item.casNumber !== 'N/A') {
      const casPart = item.casNumber.startsWith('Кат.') || item.casNumber.startsWith('Cat.') 
        ? item.casNumber 
        : `CAS: ${item.casNumber}`;
      internationalSubtitle = internationalSubtitle ? `${internationalSubtitle} • ${casPart}` : casPart;
    }
  }

  return { officialTitle, internationalSubtitle };
}
