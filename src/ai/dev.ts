'use client';
import { config } from 'dotenv';
config();

import '@/ai/flows/summarize-daily-transactions.ts';
import '@/ai/flows/suggest-transaction-category.ts';
