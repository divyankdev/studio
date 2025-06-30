'use server';

import { suggestExpenseCategory } from '@/ai/flows/suggest-expense-category';
import { extractReceiptDetails } from '@/ai/flows/extract-receipt-details';

export async function suggestCategoryAction(description: string) {
  if (!description) {
    return { error: 'Description cannot be empty.' };
  }
  try {
    const result = await suggestExpenseCategory({ description });
    return { category: result.category };
  } catch (e) {
    console.error(e);
    return { error: 'Failed to suggest category.' };
  }
}

// Helper function to convert a file to a data URI
async function fileToDataURI(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  return `data:${file.type};base64,${buffer.toString('base64')}`;
}

export async function scanReceiptAction(formData: FormData) {
  const file = formData.get('receipt') as File;
  if (!file) {
    return { error: 'No receipt file found.' };
  }

  try {
    const photoDataUri = await fileToDataURI(file);
    const result = await extractReceiptDetails({ photoDataUri });
    return { data: result };
  } catch (e) {
    console.error(e);
    return { error: 'Failed to scan receipt.' };
  }
}
