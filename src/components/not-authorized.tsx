'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

export function NotAuthorized() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
            <div className="mx-auto bg-destructive/10 p-3 rounded-full w-fit">
                <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
          <CardTitle className="mt-4 text-2xl">Access Denied</CardTitle>
          <CardDescription>You do not have the necessary permissions to view this page.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <p className="text-sm text-center text-muted-foreground">
            This section is restricted to administrators. Please contact your manager if you believe this is an error.
          </p>
          <Button asChild className='bg-accent text-accent-foreground hover:bg-accent/90'>
            <Link href="/dashboard">Return to Dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
