'use client';

import { StatsCards } from "@/components/dashboard/stats-cards";
import { OverviewChart } from "@/components/dashboard/overview-chart";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { useRole } from "@/hooks/use-role";
import { NotAuthorized } from "@/components/not-authorized";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function DashboardPage() {
    const { isAdmin, isLoading } = useRole();

    if (isLoading) {
        return (
            <div className="flex flex-1 flex-col gap-4 md:gap-8">
                <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
                    <Skeleton className="h-32" />
                    <Skeleton className="h-32" />
                    <Skeleton className="h-32" />
                    <Skeleton className="h-32" />
                </div>
                <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
                    <Skeleton className="h-96 xl:col-span-2" />
                    <Skeleton className="h-96" />
                </div>
            </div>
        )
    }

    if (!isAdmin) {
        return <NotAuthorized />;
    }

    return (
        <div className="flex flex-1 flex-col gap-4 md:gap-8">
            <StatsCards />
            <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
                <OverviewChart />
                <RecentTransactions />
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Download Android App</CardTitle>
                    <CardDescription>
                        Download the latest version of the Tarpaulin Manager Android app.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Alert variant="destructive" className="mb-4">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Developer Note</AlertTitle>
                        <AlertDescription>
                           The file `public/app-release.apk` is a placeholder. You must replace it with a real APK generated from Android Studio. Otherwise, users will get a "problem parsing the package" error on installation.
                        </AlertDescription>
                    </Alert>
                    <a href="/app-release.apk" download>
                        <Button className="w-full sm:w-auto">
                            <Download className="mr-2 h-4 w-4" />
                            Download APK
                        </Button>
                    </a>
                    <p className="text-xs text-muted-foreground mt-2">
                        Note: You may need to enable "Install from unknown sources" in your Android settings.
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
