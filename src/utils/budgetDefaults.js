export const DEFAULT_EXPENSES = [
  { id: 1, category: 'Food', amountUsd: 0, icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z', color: 'text-emerald-600', subCategories: ['Groceries', 'Eating out'] },
  { id: 2, category: 'Living Expense', amountUsd: 0, icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', color: 'text-blue-600', subCategories: ['Rent', 'Utilities', 'Maintenance'] },
  { id: 3, category: 'Transport', amountUsd: 0, icon: 'M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 100 2 1 1 0 000-2zm7 0a1 1 0 100 2 1 1 0 000-2z', color: 'text-indigo-600', subCategories: ['Public Transport', 'Fuel', 'Parking'] },
  { id: 4, category: 'Travel', amountUsd: 0, icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.065M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M9 21h6', color: 'text-cyan-600', subCategories: ['Flights', 'Hotels', 'Sightseeing'] },
  { id: 5, category: 'Gift', amountUsd: 0, icon: 'M20 12V8H4v4m16 0a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4a2 2 0 012-2m16 0h-16', color: 'text-rose-600', subCategories: ['Family', 'Friends', 'Charity'] },
  { id: 6, category: 'Education', amountUsd: 0, icon: 'M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222', color: 'text-purple-600', subCategories: ['Tuition', 'Books', 'Courses'] },
];

export const DEFAULT_INCOME = [
  { id: 101, category: 'Salary', amountUsd: 0, icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M12 16V15', color: 'text-green-600', subCategories: ['Base Salary', 'Bonus'] },
  { id: 102, category: 'Investments', amountUsd: 0, icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6', color: 'text-blue-600', subCategories: ['Dividends', 'Interest'] },
];
