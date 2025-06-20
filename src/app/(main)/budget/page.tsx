import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { categories } from "@/lib/data";
import { PlusCircle } from "lucide-react";

const budgets = [
  { category: "Food", spent: 350.75, budget: 500 },
  { category: "Shopping", spent: 210.50, budget: 400 },
  { category: "Transport", spent: 80.00, budget: 100 },
  { category: "Entertainment", spent: 150.00, budget: 150 },
];

export default function BudgetPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Budget</h1>
          <p className="text-muted-foreground">
            Set and track your spending goals for this month.
          </p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> New Budget
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {budgets.map((item) => {
          const categoryDetails = categories.find(c => c.name === item.category);
          const progress = (item.spent / item.budget) * 100;

          return (
            <Card key={item.category}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {categoryDetails && <categoryDetails.icon className="h-6 w-6 text-primary" />}
                    <CardTitle>{item.category}</CardTitle>
                  </div>
                   <span className={`font-semibold ${progress > 100 ? 'text-destructive' : ''}`}>
                    ${item.spent.toFixed(2)}
                  </span>
                </div>
                <CardDescription>
                  of ${item.budget.toFixed(2)} budget
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Progress value={progress} className="h-3" />
                 <p className="text-xs text-muted-foreground mt-2">
                  {progress > 100 
                    ? `$${(item.spent - item.budget).toFixed(2)} over budget`
                    : `$${(item.budget - item.spent).toFixed(2)} left`
                  }
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
