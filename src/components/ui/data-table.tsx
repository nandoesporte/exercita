
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface DataTableProps<TData> {
  columns: {
    accessorKey: string;
    header: string;
    cell?: ({ row }: { row: { original: TData } }) => React.ReactNode;
  }[];
  data: TData[];
  isLoading?: boolean;
}

export function DataTable<TData>({
  columns,
  data,
  isLoading = false,
}: DataTableProps<TData>) {
  const isMobile = useIsMobile();
  
  if (isLoading) {
    return (
      <div className="w-full h-48 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="w-full py-8 sm:py-12 text-center border rounded-md">
        <p className="text-muted-foreground text-sm sm:text-base">Nenhum dado disponível</p>
      </div>
    );
  }

  return (
    <div className={`rounded-md border overflow-x-auto ${isMobile ? "max-w-[100vw] -mx-2" : ""}`}>
      <Table className={isMobile ? "w-full table-auto min-w-[600px]" : ""}>
        <TableHeader>
          <TableRow>
            {columns.map((column, i) => (
              <TableHead key={i} className={isMobile ? "px-1 py-2 text-xs whitespace-nowrap font-medium" : "px-4 py-3"}>
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, rowIndex) => (
            <TableRow key={rowIndex} className={isMobile ? "border-b" : ""}>
              {columns.map((column, colIndex) => (
                <TableCell 
                  key={`${rowIndex}-${colIndex}`}
                  className={isMobile ? "px-1 py-2 text-xs" : "px-4 py-3"}
                >
                  {column.cell
                    ? column.cell({ row: { original: row } })
                    : (row as any)[column.accessorKey]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
