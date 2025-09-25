'use server';
/**
 * @fileOverview Summarizes daily transactions (sales, expenses, purchases) into a brief summary.
 *
 * - summarizeDailyTransactions - A function that generates a summary of the day's transactions.
 * - SummarizeDailyTransactionsInput - The input type for the summarizeDailyTransactions function.
 * - SummarizeDailyTransactionsOutput - The return type for the summarizeDailyTransactions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeDailyTransactionsInputSchema = z.object({
  sales: z.number().describe('Total sales for the day.'),
  expenses: z.number().describe('Total expenses for the day.'),
  purchases: z.number().describe('Total purchases for the day.'),
});
export type SummarizeDailyTransactionsInput = z.infer<
  typeof SummarizeDailyTransactionsInputSchema
>;

const SummarizeDailyTransactionsOutputSchema = z.object({
  summary: z.string().describe('A brief summary of the day\'s transactions.'),
});
export type SummarizeDailyTransactionsOutput = z.infer<
  typeof SummarizeDailyTransactionsOutputSchema
>;

export async function summarizeDailyTransactions(
  input: SummarizeDailyTransactionsInput
): Promise<SummarizeDailyTransactionsOutput> {
  return summarizeDailyTransactionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeDailyTransactionsPrompt',
  input: {schema: SummarizeDailyTransactionsInputSchema},
  output: {schema: SummarizeDailyTransactionsOutputSchema},
  prompt: `You are an expert business analyst. Summarize the following daily transactions into a brief, easy-to-understand summary. Focus on key financial activities.

Sales: {{sales}}
Expenses: {{expenses}}
Purchases: {{purchases}}
`,
});

const summarizeDailyTransactionsFlow = ai.defineFlow(
  {
    name: 'summarizeDailyTransactionsFlow',
    inputSchema: SummarizeDailyTransactionsInputSchema,
    outputSchema: SummarizeDailyTransactionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
