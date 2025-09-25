
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
import { isToday, isSameDay, startOfMonth, endOfMonth, startOfWeek, endOfWeek, subWeeks } from 'date-fns';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTableFacetedFilter } from '@/components/entries/data-table-faceted-filter';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { SalesEntry } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from '../ui/calendar';
import type { DateRange } from 'react-day-picker';
import { format } from 'date-fns';


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
      date: (entry.date as any)?.toDate ? (entry.date as any).toDate() : entry.date,
    }));

    if (date?.from && date?.to) {
        filteredEntries = filteredEntries.filter(entry => {
            const entryDate = new Date(entry.date);
            return entryDate >= date.from! && entryDate <= date.to!;
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Past Sales Entries</CardTitle>
        <CardDescription>A record of all sales submitted.</CardDescription>
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
                    'w-[300px] justify-start text-left font-normal',
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
