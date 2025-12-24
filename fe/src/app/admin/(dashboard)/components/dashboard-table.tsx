import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type Column<T> = {
  key: keyof T;
  header: string;
  render?: (value: T[keyof T], item: T) => React.ReactNode;
};

type DataTableProps<T> = {
  data: T[];
  columns: Column<T & { actions: string }>[];
};

export function DashboardTable<T>({ data, columns }: DataTableProps<T>) {
  return (
    <div className="overflow-hidden rounded-md border">
      {/* <CardContent> */}
      <Table>
        {/* <TableCaption>A list of your recent invoices.</TableCaption> */}
        <TableHeader className="text-background bg-foreground">
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.key} className="text-background">
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, index) => (
            <TableRow key={index}>
              {columns.map((column) => (
                <TableCell key={column.key}>
                  {column.render
                    ? column.render(item[column.key], item)
                    : item[column.key]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {/* </CardContent> */}
    </div>
  );
}
