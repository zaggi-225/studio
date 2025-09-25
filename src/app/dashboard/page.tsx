'use client';

import { StatsCards } from "@/components/dashboard/stats-cards";
import { OverviewChart } from "@/components/dashboard/overview-chart";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { useRole } from "@/hooks/use-role";
import { NotAuthorized } from "@/components/not-authorized";
import { Skeleton } from "@/components/ui/skeleton";

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
        </div>
    )
}
