import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Repeat } from "lucide-react";

export default function RecurringPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Recurring Transactions</h1>
        <p className="text-muted-foreground">
          Manage your recurring bills and subscriptions.
        </p>
      </div>
      <Card className="flex flex-col items-center justify-center text-center p-8 min-h-[400px]">
        <CardHeader>
          <div className="mx-auto bg-primary/10 p-4 rounded-full mb-4">
            <Repeat className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl">Coming Soon!</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Automate your finances by managing recurring transactions here.
            <br />
            This feature is currently in development.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
