import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { expenses, users } from '@/lib/data';

const user = users[0];

export function RecentSales() {
  const recentExpenses = expenses.slice(0, 5);

  return (
    <div className="space-y-8">
      {recentExpenses.map((expense) => (
        <div className="flex items-center" key={expense.id}>
          <Avatar className="h-9 w-9">
            <AvatarImage src={user.avatarUrl} alt="Avatar" data-ai-hint="person avatar" />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{expense.description}</p>
            <p className="text-sm text-muted-foreground">{expense.category}</p>
          </div>
          <div className="ml-auto font-medium">
            -${expense.amount.toFixed(2)}
          </div>
        </div>
      ))}
    </div>
  );
}
