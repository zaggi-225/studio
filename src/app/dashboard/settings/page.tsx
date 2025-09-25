import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
    return (
        <div className="container mx-auto py-10">
            <div className="flex justify-between items-center mb-6">
                <div>
                <h1 className="text-3xl font-bold font-headline">Settings</h1>
                <p className="text-muted-foreground">
                    Manage your account and application settings.
                </p>
                </div>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Under Construction</CardTitle>
                    <CardDescription>This page is currently under development.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>Come back later to manage your settings!</p>
                </CardContent>
            </Card>
        </div>
    );
}
