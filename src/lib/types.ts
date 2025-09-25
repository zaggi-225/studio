export type Transaction = {
  id: string;
  type: 'sale' | 'purchase' | 'expense';
  date: string;
  amount: number;
  description: string;
  category: string;
};
