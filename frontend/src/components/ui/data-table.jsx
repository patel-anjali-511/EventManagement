import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function DataTable({
  columns,
  data,
  searchKey,
  placeholder = "Search...",
  pageCount = 1,
  paginationState = { pageIndex: 0, pageSize: 10 },
  onPaginationChange,
  manualPagination = false,
  totalItems = 0,
}) {
  const [sorting, setSorting] = React.useState([]);
  const [columnFilters, setColumnFilters] = React.useState([]);

  const table = useReactTable({
    data,
    columns,
    pageCount: manualPagination ? pageCount : undefined,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: manualPagination
      ? undefined
      : getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onPaginationChange: onPaginationChange,
    manualPagination: manualPagination,
    state: {
      sorting,
      columnFilters,
      pagination: paginationState,
    },
  });

  return (
    <div className="space-y-4 w-full">
      <div className="flex items-center justify-between gap-4">
        <Input
          placeholder={placeholder}
          value={table.getColumn(searchKey)?.getFilterValue() ?? ""}
          onChange={(event) =>
            table.getColumn(searchKey)?.setFilterValue(event.target.value)
          }
          className="max-w-sm bg-white rounded-lg border-neutral-100 shadow-none focus-visible:ring-1 focus-visible:ring-neutral-200 focus-visible:border-neutral-200"
        />
      </div>
      <div className="rounded-lg border border-neutral-100 bg-white overflow-hidden shadow-none">
        <div className="overflow-x-auto relative">
          <Table>
            <TableHeader className="bg-neutral-50/30">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="hover:bg-transparent border-b border-neutral-100"
                >
                  {headerGroup.headers.map((header, index) => {
                    return (
                      <TableHead
                        key={header.id}
                        className={`text-neutral-400 text-[10px] uppercase tracking-[0.2em] font-bold px-6 py-4 ${
                          index === 0
                            ? "sticky left-0 z-20 bg-neutral-50/30"
                            : ""
                        }`}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody className="divide-y divide-neutral-50">
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="hover:bg-neutral-50/20 group"
                  >
                    {row.getVisibleCells().map((cell, index) => (
                      <TableCell
                        key={cell.id}
                        className={`px-6 py-4 ${
                          index === 0
                            ? "sticky left-0 z-10 bg-white group-hover:bg-neutral-50/20"
                            : ""
                        }`}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center text-neutral-400 italic"
                  >
                    No results found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      <div className="flex items-center justify-between px-2">
        <div className="text-xs text-neutral-400 font-medium font-sans">
          Showing {paginationState.pageIndex * paginationState.pageSize + 1} to{" "}
          {Math.min(
            (paginationState.pageIndex + 1) * paginationState.pageSize,
            manualPagination ? totalItems : data.length,
          )}{" "}
          of {manualPagination ? totalItems : data.length} results
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="h-8 w-8 p-0 rounded-lg border-neutral-100 hover:bg-neutral-50 shadow-none"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-xs font-semibold text-neutral-900 border border-neutral-100 px-3 py-1 rounded-lg">
            {paginationState.pageIndex + 1}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="h-8 w-8 p-0 rounded-lg border-neutral-100 hover:bg-neutral-50 shadow-none"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
