export type Lang = 'en' | 'te';

const translations: Record<Lang, Record<string, string>> = {
  en: {
    Dashboard: 'Dashboard',
    'Purchase / Inflow': 'Purchase / Inflow',
    'Sales / Dispatch': 'Sales / Dispatch',
    Payments: 'Payments',
    Inventory: 'Inventory',
    'User Management': 'User Management',
    'Activity Logs': 'Activity Logs',
    'Search batches, customers…': 'Search batches, customers…',
    'Search logs by user or description…': 'Search logs by user or description…',
    'All Users': 'All Users',
    'All Actions': 'All Actions',
    'No logs match your filters': 'No logs match your filters',
    'Clear filters': 'Clear filters',
    'Showing': 'Showing',
    'of': 'of',
  },
  te: {
    Dashboard: 'డాష్‌బోర్డ్',
    'Purchase / Inflow': 'కొనుగోలు / ప్రవాహం',
    'Sales / Dispatch': 'విక్రయాలు / డిస్పాచ్',
    Payments: 'చెల్లింపులు',
    Inventory: 'ఇన్వెంటరీ',
    'User Management': 'వినియోగదారుల నిర్వహణ',
    'Activity Logs': 'చర్యల లాగ్‌లు',
    'Search batches, customers…': 'బ్యాచ్‌లు, వినియోగదారులను శోధించండి…',
    'Search logs by user or description…': 'వినియోగదారు లేదా వివరణ ప్రకారం లాగ్‌లను శోధించండి…',
    'All Users': 'అన్ని వినియోగదారులు',
    'All Actions': 'అన్ని చర్యలు',
    'No logs match your filters': 'మీ ఫిల్టర్లకు సరిపోయే లాగ్‌లు లేవు',
    'Clear filters': 'ఫిల్టర్లను క్లియర్ చేయి',
    'Showing': 'ప్రదర్శిస్తున్నది',
    'of': 'లోనుండి',
  },
};

export function t(key: string, lang: Lang = 'en') {
  return translations[lang][key] ?? key;
}

export default translations;
