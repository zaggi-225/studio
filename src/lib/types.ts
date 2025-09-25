export type Transaction = {
  id: string;
  type: 'sale' | 'purchase' | 'expense';
  date: string;
  amount: number;
  description: string;
  category: string;
  name?: string;
  branch?: string;
  pieces?: number;
};

export type SalesEntry = {
  id: string;
  date: string | Date;
  size: string;
  pieces: number;
  amount: number;
  branch: string;
  name: string;
  createdBy: string;
  createdAt: any; // Firestore ServerTimestamp
}

    