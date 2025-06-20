import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Landmark, CreditCard, Wallet } from "lucide-react";

const accounts = [
  { name: "Checking Account", type: "Checking", balance: 5420.78, icon: Landmark },
  { name: "Savings Account", type: "Savings", balance: 12850.21, icon: Landmark },
  { name: "Venture Card", type: "Credit Card", balance: -750.43, icon: CreditCard },
  { name: "Digital Wallet", type: "Wallet", balance: 345.67, icon: Wallet },
]

export default function AccountsPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Accounts</h1>
          <p className="text-muted-foreground">
            Manage your connected bank accounts and cards.
          </p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Account
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {accounts.map((account) => (
          <Card key={account.name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-medium">{account.name}</CardTitle>
              <account.icon className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${account.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              <p className="text-xs text-muted-foreground">{account.type}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
