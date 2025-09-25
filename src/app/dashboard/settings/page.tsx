'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRole } from "@/hooks/use-role";
import { NotAuthorized } from "@/components/not-authorized";
import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsPage() {
    const { isAdmin, isLoading } = useRole();

    if (isLoading) {
        return (
            <div className="container mx-auto py-10">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <Skeleton className="h-9 w-48 mb-2" />
                        <Skeleton className="h-5 w-72" />
                    </div>
                </div>
                <Skeleton className="h-48 w-full" />
            </div>
        )
    }

    if (!isAdmin) {
        return <NotAuthorized />;
    }

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
