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

export type Purchase = {
    id: string;
    date: Date;
    vendor: string;
    totalKg: number;
    totalCost: number;
    transportCost: number;
    gst: number;
    sheetWeights: {
        '18x24': number;
        '24x30': number;
        '30x40': number;
    };
    avgCostPerKg: number;
    billPhoto: string;
    createdAt: any; // Firestore ServerTimestamp
    createdBy: string;
}

export type UserProfile = {
    id: string;
    email: string;
    roleId: string;
};

export type Role = {
    id: string;
    name: string;
    permissions: string[];
};
