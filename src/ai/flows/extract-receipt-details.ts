'use server';
/**
 * @fileOverview An AI agent that extracts information from a receipt image.
 *
 * - extractReceiptDetails - A function that handles the receipt scanning process.
 * - ExtractReceiptDetailsInput - The input type for the extractReceiptDetails function.
 * - ExtractReceiptDetailsOutput - The return type for the extractReceiptDetails function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const ExtractReceiptDetailsInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a receipt, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ExtractReceiptDetailsInput = z.infer<typeof ExtractReceiptDetailsInputSchema>;

export const ExtractReceiptDetailsOutputSchema = z.object({
  description: z.string().describe("The name of the merchant or a brief description of the purchase."),
  amount: z.number().describe("The total amount of the transaction. Should be a number."),
  date: z.string().describe("The date of the transaction in YYYY-MM-DD format."),
});
export type ExtractReceiptDetailsOutput = z.infer<typeof ExtractReceiptDetailsOutputSchema>;

export async function extractReceiptDetails(input: ExtractReceiptDetailsInput): Promise<ExtractReceiptDetailsOutput> {
  return extractReceiptDetailsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractReceiptDetailsPrompt',
  input: {schema: ExtractReceiptDetailsInputSchema},
  output: {schema: ExtractReceiptDetailsOutputSchema},
  prompt: `You are an expert receipt scanner. Analyze the following receipt image and extract the following information:
- The merchant name to be used as a transaction description.
- The total transaction amount as a number.
- The transaction date in YYYY-MM-DD format.

If you cannot find a piece of information, make your best guess or use a sensible default. For example, if the date is not clear, use today's date.

Receipt Image: {{media url=photoDataUri}}`,
});

const extractReceiptDetailsFlow = ai.defineFlow(
  {
    name: 'extractReceiptDetailsFlow',
    inputSchema: ExtractReceiptDetailsInputSchema,
    outputSchema: ExtractReceiptDetailsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
