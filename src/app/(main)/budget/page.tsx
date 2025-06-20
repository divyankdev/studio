import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Goal } from "lucide-react";

export default function BudgetPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Budget</h1>
        <p className="text-muted-foreground">
          Set and track your spending goals.
        </p>
      </div>
       <Card className="flex flex-col items-center justify-center text-center p-8 min-h-[400px]">
        <CardHeader>
          <div className="mx-auto bg-primary/10 p-4 rounded-full mb-4">
            <Goal className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl">Coming Soon!</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            We are working hard to bring you a powerful budgeting feature.
            <br />
            Stay tuned for updates!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
