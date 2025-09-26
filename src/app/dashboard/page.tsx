'use client';

import { StatsCards } from "@/components/dashboard/stats-cards";
import { OverviewChart } from "@/components/dashboard/overview-chart";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { useRole } from "@/hooks/use-role";
import { NotAuthorized } from "@/components/not-authorized";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export default function DashboardPage() {
    const { isAdmin, isLoading } = useRole();

    if (isLoading) {
        return (
            <div className="flex flex-1 flex-col gap-4 md:gap-8">
                <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
                    <Skeleton className="h-28" />
                    <Skeleton className="h-28" />
                    <Skeleton className="h-28" />
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
