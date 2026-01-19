
"use client"
import { type ToyStockItem } from "@/lib/types";
import { Code, Hash, Truck, ShoppingBag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "./ui/scroll-area";
import { Input } from "./ui/input";
import { useState } from "react";

interface ToyStockSummaryProps {
  stock: ToyStockItem[];
}

export default function ToyStockSummary({ stock }: ToyStockSummaryProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredStock = stock.filter(item =>
    item.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Truck className="text-primary" />
          Resumo de Estoque de Brinquedos
        </DialogTitle>
      </DialogHeader>
      <div className="py-4 flex flex-col h-full">
        <Input 
          placeholder="Buscar por nome ou SKU..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-4"
        />
        <ScrollArea className="flex-grow pr-4 -mr-4">
          <div className="space-y-3">
            {filteredStock.length > 0 ? (
              filteredStock.map((item) => (
                <div key={item.sku} className="flex items-center justify-between rounded-lg border bg-card p-4">
                  <div className="flex-grow space-y-2 overflow-hidden">
                    <div className='flex items-center gap-3'>
                      <ShoppingBag className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      <p className="font-medium text-foreground truncate">{item.product}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Code className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      <p className="text-sm text-muted-foreground truncate">SKU: {item.sku}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-primary ml-4 shrink-0">
                    <Hash className="h-4 w-4" />
                    <span>{item.quantity}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">Nenhum item encontrado.</p>
            )}
          </div>
        </ScrollArea>
      </div>
    </>
  );
}
