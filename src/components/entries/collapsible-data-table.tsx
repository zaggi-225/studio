
'use client';
import * as React from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getFilteredRowModel,
  ColumnFiltersState,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getSortedRowModel,
  SortingState
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Transaction } from '@/lib/types';
import { format, isToday } from 'date-fns';
import { cn } from '@/lib/utils';
import { DataTableRowActions } from './data-table-row-actions';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import { Input } from '../ui/input';
import { DataTableFacetedFilter } from './data-table-faceted-filter';
import { DataTableViewOptions } from './data-table-view-options';

const typeToEmojiMap: { [key: string]: string } = {
  sale: '💰',
  purchase: '🛒',
  expense: '💸',
};

const typeToVariantMap: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
  sale: 'default',
  purchase: 'secondary',
  expense: 'destructive',
};

export function CollapsibleDataTable({ data }: { data: Transaction[] }) {
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const columns: ColumnDef<Transaction>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="translate-y-[2px]"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="translate-y-[2px]"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'workerId',
      header: 'Name',
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => {
        const type = row.getValue('type') as Transaction['type'];
        return (
          <Badge variant={typeToVariantMap[type]} className="capitalize whitespace-nowrap">
            <span className="mr-1 md:mr-2" role="img" aria-label={type}>
              {typeToEmojiMap[type]}
            </span>
            {type}
          </Badge>
        );
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: 'description',
      header: 'Description',
    },
    {
      accessorKey: 'category',
      header: 'Category',
    },
    {
      accessorKey: 'branchId',
      header: 'Branch',
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      }
    },
    {
        accessorKey: 'pieces',
        header: () => <div className="text-right">Pieces</div>,
        cell: ({ row }) => <div className="text-right">{row.getValue('pieces') || 0}</div>,
    },
    {
      accessorKey: 'amount',
      header: () => <div className="text-right">Amount</div>,
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue('amount'));
        const formatted = new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'INR',
        }).format(amount);
        const type = row.getValue('type');
        const textColor = type === 'sale' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
  
        return <div className={`text-right font-medium whitespace-nowrap ${textColor}`}>{formatted}</div>;
      },
    },
    {
        accessorKey: 'grossProfit',
        header: () => <div className="text-right">Gross Profit</div>,
        cell: ({ row }) => {
            const grossProfit = row.getValue('grossProfit') as number | undefined;
            if (grossProfit === undefined || grossProfit === null) return <div className="text-right text-muted-foreground">-</div>;
            const formatted = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(grossProfit);
            return <div className="text-right text-muted-foreground">{formatted}</div>;
        },
    },
    {
      id: 'actions',
      cell: ({ row }) => <DataTableRowActions row={row} />,
    },
  ];

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      rowSelection,
    },
    initialState: {
      pagination: {
        pageSize: 30,
      },
      columnVisibility: {
        grossProfit: false,
      }
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  const groupedData = React.useMemo(() => {
    const sortedRows = table.getRowModel().rows; // Use sorted rows
    return sortedRows.reduce((acc, row) => {
      const date = format(new Date(row.original.createdAt as Date), 'yyyy-MM-dd');
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(row); // Push the entire row object
      return acc;
    }, {} as Record<string, any[]>);
  }, [table.getRowModel().rows]);

  const totalAmount = React.useMemo(() => {
    return table.getFilteredRowModel().rows.reduce((total, row) => total + (row.original.amount || 0), 0);
  }, [table.getFilteredRowModel().rows]);

  const totalPieces = React.useMemo(() => {
    return table.getFilteredRowModel().rows.reduce((total, row) => total + (row.original.pieces || 0), 0);
  }, [table.getFilteredRowModel().rows]);
  
  const totalGrossProfit = React.useMemo(() => {
    return table.getFilteredRowModel().rows.reduce((total, row) => total + (row.original.grossProfit || 0), 0);
    }, [table.getFilteredRowModel().rows]);

  const transactionTypes = [
    { value: 'sale', label: 'Sale' },
    { value: 'purchase', label: 'Purchase' },
    { value: 'expense', label: 'Expense' },
  ];

  const branches = [
    { value: 'nidagundi', label: 'Nidagundi' },
    { value: 'basavana_bagewadi', label: 'Basavana Bagewadi' },
  ];
  const names = [
      { value: 'M.R Bijapur', label: 'M.R Bijapur' },
      { value: 'Jaggu', label: 'Jaggu' },
      { value: 'Pavitra', label: 'Pavitra' },
  ];


  return (
    <div className="space-y-4">
         <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex flex-col sm:flex-row flex-wrap items-center gap-2 flex-1">
            <Input
            placeholder="Filter description..."
            value={(table.getColumn("description")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
                table.getColumn("description")?.setFilterValue(event.target.value)
            }
            className="h-8 w-full sm:w-[150px] lg:w-[250px]"
            />
            <div className="flex gap-2 flex-wrap">
              {table.getColumn("type") && (
              <DataTableFacetedFilter
                  column={table.getColumn("type")}
                  title="Type"
                  options={transactionTypes}
              />
              )}
              {table.getColumn("branchId") && (
              <DataTableFacetedFilter
                  column={table.getColumn("branchId")}
                  title="Branch"
                  options={branches}
              />
              )}
              {table.getColumn("workerId") && (
              <DataTableFacetedFilter
                  column={table.getColumn("workerId")}
                  title="Name"
                  options={names}
              />
              )}
            </div>
        </div>
        <DataTableViewOptions table={table} />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                <TableHead className="w-10" />
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="px-2 md:px-4">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
            {Object.entries(groupedData).length > 0 ? (
              Object.entries(groupedData).map(([date, rows]) => (
                <DateGroupRow
                  key={date}
                  date={date}
                  rows={rows}
                  columns={columns}
                  table={table}
                />
              ))
            ) : (
              <TableBody>
                <TableRow>
                  <TableCell colSpan={columns.length + 1} className="h-24 text-center">
                    No results.
                  </TableCell>
                </TableRow>
              </TableBody>
            )}
           <TableFooter>
                <TableRow>
                    <TableCell colSpan={columns.findIndex(c => c.accessorKey === 'pieces') + 2} className="text-right font-bold">Total</TableCell>
                    <TableCell className="text-right font-bold">{totalPieces}</TableCell>
                    <TableCell className="text-right font-bold whitespace-nowrap">
                        {new Intl.NumberFormat('en-IN', {
                            style: 'currency',
                            currency: 'INR',
                        }).format(totalAmount)}
                    </TableCell>
                     <TableCell className="text-right font-bold whitespace-nowrap">
                        {new Intl.NumberFormat('en-IN', {
                            style: 'currency',
                            currency: 'INR',
                        }).format(totalGrossProfit)}
                    </TableCell>
                    <TableCell></TableCell>
                </TableRow>
            </TableFooter>
        </Table>
      </div>
       <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
        <div className="text-sm text-muted-foreground flex-1">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="flex items-center space-x-2">
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
    </div>
  );
}

const DateGroupRow = ({
  date,
  rows,
  columns,
  table,
}: {
  date: string;
  rows: any[];
  columns: ColumnDef<Transaction>[];
  table: any;
}) => {
  const [isOpen, setIsOpen] = React.useState(isToday(new Date(date)));
  
  const transactions = rows.map(r => r.original);
  const groupTotalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
  const groupTotalPieces = transactions.reduce((sum, t) => sum + (t.pieces || 0), 0);
  const groupGrossProfit = transactions.reduce((sum, t) => sum + (t.grossProfit || 0), 0);

  return (
    <Collapsible asChild open={isOpen} onOpenChange={setIsOpen}>
       <tbody data-state={table.getIsAllRowsSelected() ? 'selected' : 'unselected'}>
        <TableRow className={cn("border-b-2 font-semibold", isToday(new Date(date)) && "bg-green-100/50 dark:bg-green-900/10")}>
          <TableCell className="px-2 md:px-4">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-9 p-0">
                {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                <span className="sr-only">Toggle group</span>
              </Button>
            </CollapsibleTrigger>
          </TableCell>
          <TableCell colSpan={columns.findIndex(c => c.accessorKey === 'pieces')} className="px-2 md:px-4">
            {format(new Date(date), 'PPP')}
          </TableCell>
          <TableCell className="text-right px-2 md:px-4">{groupTotalPieces}</TableCell>
          <TableCell className="text-right whitespace-nowrap px-2 md:px-4">
            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(groupTotalAmount)}
          </TableCell>
          <TableCell className="text-right whitespace-nowrap px-2 md:px-4">
            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(groupGrossProfit)}
          </TableCell>
          <TableCell className="px-2 md:px-4"></TableCell>
        </TableRow>
        {rows.map((row: any) => (
          <CollapsibleContent asChild key={row.id}>
              <TableRow data-state={row.getIsSelected() && 'selected'} className="bg-muted/50">
                <TableCell className="px-2 md:px-4"></TableCell>
                {row.getVisibleCells().map((cell : any) => (
                  <TableCell key={cell.id} className="px-2 md:px-4">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
          </CollapsibleContent>
        ))}
       </tbody>
    </Collapsible>
  );
};
