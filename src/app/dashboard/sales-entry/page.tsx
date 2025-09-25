
import { SalesEntryForm } from '@/components/sales-entry/sales-entry-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SalesEntryPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-center">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-headline flex items-center justify-center gap-2">
              <span>💰</span>
              <span>Daily Sales Entry</span>
            </CardTitle>
            <CardDescription>
              Enter the details for each tarpaulin sale.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SalesEntryForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
