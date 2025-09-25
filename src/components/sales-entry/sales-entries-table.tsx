'use client';

import * as React from 'react';
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { isToday, startOfDay, endOfDay, format } from 'date-fns';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTableFacetedFilter } from '@/components/entries/data-table-faceted-filter';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, query, where, getDocs, setDoc, doc, Timestamp, writeBatch } from 'firebase/firestore';
import type { SalesEntry, Transaction } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar as CalendarIcon, RefreshCw } from 'lucide-react';
import { Calendar } from '../ui/calendar';
import type { DateRange } from 'react-day-picker';
import { useToast } from '@/hooks/use-toast';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';


const columns: ColumnDef<SalesEntry>[] = [
  {
    accessorKey: 'date',
    header: '📅 Date',
    cell: ({ row }) => {
      const date = row.getValue('date') as Date;
      return <div>{date ? new Date(date).toLocaleDateString() : 'N/A'}</div>;
    },
  },
  {
    accessorKey: 'size',
    header: '📐 Size',
  },
  {
    accessorKey: 'pieces',
    header: '🔢 Pieces',
  },
  {
    accessorKey: 'amount',
    header: () => <div className="text-right">💰 Amount</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('amount'));
      const formatted = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
      }).format(amount);
      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: 'branch',
    header: '🏬 Branch',
    filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
    }
  },
];

const SIZES = [
  { value: '18x24', label: '18 x 24' },
  { value: '24x30', label: '24 x 30' },
  { value: '30x40', label: '30 x 40' },
  { value: 'other', label: 'Other' },
];

const BRANCHES = [
  { value: 'Nidagundi', label: 'Nidagundi' },
  { value: 'Basavana Bagewadi', label: 'Basavana Bagewadi' },
];

export function SalesEntriesTable() {
  const { firestore } = useFirebase();
  const { toast } = useToast();
  const [isSyncing, setIsSyncing] = React.useState(false);

  const salesEntriesRef = useMemoFirebase(() => firestore ? collection(firestore, 'sales_entries') : null, [firestore]);
  const { data: salesEntries, isLoading } = useCollection<SalesEntry>(salesEntriesRef);

  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: 'date', desc: true },
  ]);
  const [date, setDate] = React.useState<DateRange | undefined>();

  const tableData = React.useMemo(() => {
    if (!salesEntries) return [];
    
    let filteredEntries = salesEntries.map(entry => ({
      ...entry,
      date: (entry.date as any)?.toDate ? (entry.date as any).toDate() : new Date(entry.date),
    }));

    if (date?.from) {
      if (!date.to) date.to = date.from;
      const from = startOfDay(date.from);
      const to = endOfDay(date.to);
      filteredEntries = filteredEntries.filter(entry => {
          const entryDate = new Date(entry.date);
          return entryDate >= from && entryDate <= to;
      });
    }

    return filteredEntries;
  }, [salesEntries, date]);

  const table = useReactTable({
    data: tableData,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    initialState: {
        pagination: {
            pageSize: 30,
        }
    },
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  const totalPieces = React.useMemo(() => {
    return table.getFilteredRowModel().rows.reduce((total, row) => total + (row.original.pieces || 0), 0);
  }, [table.getFilteredRowModel().rows]);

  const totalAmount = React.useMemo(() => {
    return table.getFilteredRowModel().rows.reduce((total, row) => total + (row.original.amount || 0), 0);
  }, [table.getFilteredRowModel().rows]);
  
  const handleManualSync = async () => {
    if (!firestore) return;
    setIsSyncing(true);

    const today = new Date();
    const startOfToday = startOfDay(today);
    const endOfToday = endOfDay(today);

    try {
        const q = query(
            collection(firestore, 'sales_entries'),
            where('date', '>=', startOfToday),
            where('date', '<=', endOfToday)
        );
        const querySnapshot = await getDocs(q);
        const todaysEntries = querySnapshot.docs.map(doc => ({...doc.data(), id: doc.id} as SalesEntry));

        if (todaysEntries.length === 0) {
            toast({ title: 'No sales today to sync.', variant: 'default' });
            setIsSyncing(false);
            return;
        }

        // Group by date, branch, and name
        const groupedSales = todaysEntries.reduce((acc, entry) => {
            const dateStr = format( (entry.date as any).toDate(), 'yyyy-MM-dd');
            const key = `${dateStr}|${entry.branch}|${entry.name}`;
            if (!acc[key]) {
                acc[key] = [];
            }
            acc[key].push(entry);
            return acc;
        }, {} as Record<string, SalesEntry[]>);


        const batch = writeBatch(firestore);

        for (const key in groupedSales) {
            const entries = groupedSales[key];
            const [dateStr, branch, name] = key.split('|');
            
            const totalAmount = entries.reduce((sum, entry) => sum + entry.amount, 0);
            const totalPieces = entries.reduce((sum, entry) => sum + entry.pieces, 0);
            const sizeCounts = entries.reduce((acc, entry) => {
                const size = entry.size || 'N/A';
                acc[size] = (acc[size] || 0) + entry.pieces;
                return acc;
            }, {} as { [key: string]: number });

            const description = Object.entries(sizeCounts)
                .map(([size, count]) => `${size}=${count}`)
                .join(', ');

            const dailySummary: Omit<Transaction, 'id'> = {
                date: Timestamp.fromDate(new Date(dateStr)).toDate().toISOString(),
                type: 'sale',
                description: description,
                category: 'Customer',
                amount: totalAmount,
                name: name,
                branch: branch,
                pieces: totalPieces,
            };
            
            const docId = `${dateStr}-${branch.replace(/\s+/g, '_')}-${name.replace(/\s+/g, '_')}`;
            const docRef = doc(firestore, 'transactions', docId);

            batch.set(docRef, dailySummary, { merge: true });
        }

        await batch.commit();
      
        toast({
            title: '✅ Sales Synced',
            description: 'Today\'s sales data synced to All Entries successfully.',
        });

    } catch (error) {
      console.error("Error during manual sync:", error);
      toast({
        title: 'Sync Failed',
        description: 'Could not sync sales data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSyncing(false);
    }
  };


  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
            <div>
                <CardTitle>Past Sales Entries</CardTitle>
                <CardDescription>A record of all sales submitted.</CardDescription>
            </div>
            <Button onClick={handleManualSync} disabled={isSyncing}>
                <RefreshCw className={cn("mr-2 h-4 w-4", isSyncing && "animate-spin")} />
                {isSyncing ? 'Syncing...' : 'Sync Today\'s Sales'}
            </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 flex-wrap">
            {table.getColumn("branch") && (
                <DataTableFacetedFilter
                    column={table.getColumn("branch")}
                    title="Branch"
                    options={BRANCHES}
                />
            )}
             {table.getColumn("size") && (
                <DataTableFacetedFilter
                    column={table.getColumn("size")}
                    title="Size"
                    options={SIZES}
                />
            )}
             <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant={'outline'}
                  className={cn(
                    'w-full md:w-[300px] justify-start text-left font-normal',
                    !date && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date?.from ? (
                    date.to ? (
                      <>
                        {format(date.from, 'LLL dd, y')} - {format(date.to, 'LLL dd, y')}
                      </>
                    ) : (
                      format(date.from, 'LLL dd, y')
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={date?.from}
                  selected={date}
                  onSelect={setDate}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
            {(date || columnFilters.length > 0) && (
              <Button variant="ghost" onClick={() => {
                setDate(undefined);
                table.resetColumnFilters();
              }}>
                Clear Filters
              </Button>
            )}
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                        <TableCell colSpan={columns.length}>
                            <Skeleton className="h-8 w-full" />
                        </TableCell>
                    </TableRow>
                ))
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow 
                    key={row.id} 
                    data-state={row.getIsSelected() && 'selected'}
                    className={cn(
                        isToday(new Date(row.original.date)) && "bg-green-100 dark:bg-green-900/20"
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
            <TableFooter>
                <TableRow>
                    <TableCell colSpan={2} className="font-bold">Totals</TableCell>
                    <TableCell className="font-bold">{totalPieces}</TableCell>
                    <TableCell className="text-right font-bold">
                        {new Intl.NumberFormat('en-IN', {
                            style: 'currency',
                            currency: 'INR',
                        }).format(totalAmount)}
                    </TableCell>
                    <TableCell></TableCell>
                </TableRow>
            </TableFooter>
          </Table>
        </div>
        <div className="flex items-center justify-end space-x-2 py-4">
          <div className="flex-1 text-sm text-muted-foreground">
            {table.getFilteredRowModel().rows.length} row(s).
          </div>
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

    