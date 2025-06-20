'use server';

import { suggestExpenseCategory } from '@/ai/flows/suggest-expense-category';

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
