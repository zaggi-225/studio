// This file is machine-generated - edit at your own risk!

'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting a transaction category (purchase, sale, or expense)
 * based on the supplier or transaction description. This helps speed up data entry and reduce errors.
 *
 * @exports suggestTransactionCategory - The main function to call the flow.
 * @exports SuggestTransactionCategoryInput - The input type for the suggestTransactionCategory function.
 * @exports SuggestTransactionCategoryOutput - The return type for the suggestTransactionCategory function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestTransactionCategoryInputSchema = z.object({
  transactionDetails: z
    .string()
    .describe(
      'A description of the transaction, including the supplier and items purchased.'
    ),
});
export type SuggestTransactionCategoryInput = z.infer<
  typeof SuggestTransactionCategoryInputSchema
>;

const SuggestTransactionCategoryOutputSchema = z.object({
  category:
    z.enum(['purchase', 'sale', 'expense'])
      .describe('The suggested category for the transaction.'),
  confidence: z
    .number()
    .min(0)
    .max(1)
    .describe(
      'A number between 0 and 1 indicating the confidence level of the suggestion.'
    ),
});
export type SuggestTransactionCategoryOutput = z.infer<
  typeof SuggestTransactionCategoryOutputSchema
>;

export async function suggestTransactionCategory(
  input: SuggestTransactionCategoryInput
): Promise<SuggestTransactionCategoryOutput> {
  return suggestTransactionCategoryFlow(input);
}

const suggestTransactionCategoryPrompt = ai.definePrompt({
  name: 'suggestTransactionCategoryPrompt',
  input: {schema: SuggestTransactionCategoryInputSchema},
  output: {schema: SuggestTransactionCategoryOutputSchema},
  prompt: `Based on the following transaction details, suggest a category (purchase, sale, or expense) and a confidence level between 0 and 1.

Transaction Details: {{{transactionDetails}}}

Your response should be in JSON format:
{
  "category": "<purchase | sale | expense>",
  "confidence": <number between 0 and 1>
}
`,
});

const suggestTransactionCategoryFlow = ai.defineFlow(
  {
    name: 'suggestTransactionCategoryFlow',
    inputSchema: SuggestTransactionCategoryInputSchema,
    outputSchema: SuggestTransactionCategoryOutputSchema,
  },
  async input => {
    const {output} = await suggestTransactionCategoryPrompt(input);
    return output!;
  }
);
