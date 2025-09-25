import type { Transaction } from './types';

const descriptions = {
  sale: [
    'Sold 10x20ft tarpaulin',
    'Custom size tarpaulin sale',
    'Standard duty tarpaulin',
    'Heavy duty tarpaulin sale',
  ],
  purchase: [
    'Roll of vinyl material',
    'Grommet supply restock',
    'UV resistant thread',
    'Bulk canvas material',
  ],
  expense: ['Shop rent', 'Electricity bill', 'Employee salary', 'Delivery fuel cost'],
};

const categories = {
  sale: ['Retail', 'Wholesale', 'Custom'],
  purchase: ['Raw Materials', 'Tools', 'Supplies'],
  expense: ['Utilities', 'Rent', 'Salaries', 'Logistics'],
};

function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateTransactions(count: number): Transaction[] {
  const transactions: Transaction[] = [];
  const today = new Date();

  for (let i = 0; i < count; i++) {
    const type = getRandomElement(['sale', 'purchase', 'expense'] as const);
    const date = new Date(today.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000); // within last 30 days

    let amount: number;
    switch (type) {
      case 'sale':
        amount = Math.floor(Math.random() * 4500) + 500; // 500 - 5000
        break;
      case 'purchase':
        amount = Math.floor(Math.random() * 3000) + 200; // 200 - 3200
        break;
      case 'expense':
        amount = Math.floor(Math.random() * 1000) + 50; // 50 - 1050
        break;
    }

    transactions.push({
      id: `TRN${String(Date.now() + i).slice(-6)}`,
      type,
      date: date.toISOString(),
      amount,
      description: getRandomElement(descriptions[type]),
      category: getRandomElement(categories[type]),
    });
  }

  return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export const mockTransactions = generateTransactions(50);
