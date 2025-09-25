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

  const columns: ColumnDef<Transaction>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'name',
      header: 'Name',
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => {
        const type = row.getValue('type') as Transaction['type'];
        return (
          <Badge variant={typeToVariantMap[type]} className="capitalize">
            <span className="mr-2" role="img" aria-label={type}>
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
      accessorKey: 'branch',
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
  
        return <div className={`text-right font-medium ${textColor}`}>{formatted}</div>;
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
      columnFilters,
      rowSelection,
    },
    initialState: {
      pagination: {
        pageSize: 30,
      }
    },
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  const groupedData = React.useMemo(() => {
    const filteredRows = table.getFilteredRowModel().rows;
    return filteredRows.reduce((acc, row) => {
      const date = format(new Date(row.original.date), 'yyyy-MM-dd');
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(row.original);
      return acc;
    }, {} as Record<string, Transaction[]>);
  }, [table.getFilteredRowModel().rows]);

  const totalAmount = React.useMemo(() => {
    return table.getFilteredRowModel().rows.reduce((total, row) => total + (row.original.amount || 0), 0);
  }, [table.getFilteredRowModel().rows]);

  const totalPieces = React.useMemo(() => {
    return table.getFilteredRowModel().rows.reduce((total, row) => total + (row.original.pieces || 0), 0);
  }, [table.getFilteredRowModel().rows]);

  const transactionTypes = [
    { value: 'sale', label: 'Sale' },
    { value: 'purchase', label: 'Purchase' },
    { value: 'expense', label: 'Expense' },
  ];

  const branches = [
    { value: 'Nidagundi', label: 'Nidagundi' },
    { value: 'Basavana Bagewadi', label: 'Basavana Bagewadi' },
  ];
  const names = [
      { value: 'M.R Bijapur', label: 'M.R Bijapur' },
      { value: 'Jaggu', label: 'Jaggu' },
      { value: 'Pavitra', label: 'Pavitra' },
  ];


  return (
    <div className="space-y-4">
         <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex flex-1 items-center space-x-2">
            <Input
            placeholder="Filter by description..."
            value={(table.getColumn("description")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
                table.getColumn("description")?.setFilterValue(event.target.value)
            }
            className="h-8 w-[150px] lg:w-[250px]"
            />
            {table.getColumn("type") && (
            <DataTableFacetedFilter
                column={table.getColumn("type")}
                title="Type"
                options={transactionTypes}
            />
            )}
             {table.getColumn("branch") && (
            <DataTableFacetedFilter
                column={table.getColumn("branch")}
                title="Branch"
                options={branches}
            />
            )}
            {table.getColumn("name") && (
            <DataTableFacetedFilter
                column={table.getColumn("name")}
                title="Name"
                options={names}
            />
            )}
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
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {Object.entries(groupedData).length > 0 ? (
              Object.entries(groupedData).map(([date, transactions]) => (
                <DateGroupRow
                  key={date}
                  date={date}
                  transactions={transactions}
                  columns={columns}
                />
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length + 1} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
           <TableFooter>
                <TableRow>
                    <TableCell colSpan={columns.findIndex(c => c.accessorKey === 'pieces') + 2} className="text-right font-bold">Total</TableCell>
                    <TableCell className="text-right font-bold">{totalPieces}</TableCell>
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
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
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
    </div>
  );
}

const DateGroupRow = ({
  date,
  transactions,
  columns,
}: {
  date: string;
  transactions: Transaction[];
  columns: ColumnDef<Transaction>[];
}) => {
  const [isOpen, setIsOpen] = React.useState(isToday(new Date(date)));
  const subTable = useReactTable({
    data: transactions,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const groupTotalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
  const groupTotalPieces = transactions.reduce((sum, t) => sum + (t.pieces || 0), 0);

  return (
    <Collapsible asChild open={isOpen} onOpenChange={setIsOpen}>
      <>
        <TableRow className={cn("border-b-2 font-semibold", isToday(new Date(date)) && "bg-green-100/50 dark:bg-green-900/10")}>
          <TableCell>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-9 p-0">
                {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                <span className="sr-only">Toggle group</span>
              </Button>
            </CollapsibleTrigger>
          </TableCell>
          <TableCell colSpan={columns.findIndex(c => c.accessorKey === 'pieces')}>
            {format(new Date(date), 'PPP')}
          </TableCell>
          <TableCell className="text-right">{groupTotalPieces}</TableCell>
          <TableCell className="text-right">
            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(groupTotalAmount)}
          </TableCell>
          <TableCell></TableCell>
        </TableRow>

        <CollapsibleContent asChild>
          <>
            {subTable.getRowModel().rows.map((row) => (
              <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'} className="bg-muted/50">
                  <TableCell></TableCell>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </>
        </CollapsibleContent>
      </>
    </Collapsible>
  );
};
    
