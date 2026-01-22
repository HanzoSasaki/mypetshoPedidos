
"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SandPricesTableProps {
  prices: any[];
}

const formatCurrency = (value: string | number) => {
  const numericValue = typeof value === 'string' ? parseFloat(value.replace(',', '.')) : value;
  if (isNaN(numericValue)) {
    return value;
  }
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(numericValue);
};

export default function SandPricesTable({ prices }: SandPricesTableProps) {
  if (!prices || prices.length === 0) {
    return <p className="text-center text-muted-foreground py-8">Nenhum preço encontrado.</p>;
  }

  const headers = Object.keys(prices[0] || {});

  return (
    <ScrollArea className="h-full rounded-md border">
      <Table className="w-full caption-bottom text-sm">
        <TableHeader>
          <TableRow className="bg-primary hover:bg-primary/90">
            {headers.map(header => (
              <TableHead key={header} className="font-bold text-primary-foreground text-center h-12">
                {header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {prices.map((price, index) => (
            <TableRow key={index} className="odd:bg-muted/50">
              {headers.map(header => (
                <TableCell key={header} className="text-center p-4">
                  {header.toLowerCase() === 'custo' ? formatCurrency(price[header]) : price[header]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
  );
}
