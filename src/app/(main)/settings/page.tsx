import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and application settings.
        </p>
      </div>
      <Card className="flex flex-col items-center justify-center text-center p-8 min-h-[400px]">
        <CardHeader>
          <div className="mx-auto bg-primary/10 p-4 rounded-full mb-4">
            <Settings className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl">Coming Soon!</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            The settings page is under construction.
            <br />
            You'll soon be able to customize your experience here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
