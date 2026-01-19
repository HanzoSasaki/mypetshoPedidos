
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { type Variation, type Order, type OrderStatus } from "@/lib/types";
import {
  ChevronLeft,
  ShoppingBag,
  CheckCheck,
  Undo2,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { ScrollArea } from "./ui/scroll-area";
import OrderCard from "./order-card";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

const getOrdersForVariation = (variation: Variation, orders: Order[]): Order[] => {
  return orders
    .filter((order) =>
      order.products.some(
        (p) => p.variation === variation.name && p.sku === variation.sku
      )
    )
    .sort((a, b) => {
      if (a.status === 'pending' && b.status === 'packed') return -1;
      if (a.status === 'packed' && b.status === 'pending') return 1;
      return 0;
    });
};

interface VariationDetailViewProps {
  variation: Variation;
  initialOrders: Order[];
  onBack: () => void;
  onBulkStatusChange: (orderIds: string[], newStatus: OrderStatus) => void;
}

export default function VariationDetailView({
  variation,
  initialOrders,
  onBack,
  onBulkStatusChange,
}: VariationDetailViewProps) {
  const { toast } = useToast();

  const [orders, setOrders] = useState(() => getOrdersForVariation(variation, initialOrders));
  const [selectedOrderIds, setSelectedOrderIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setOrders(getOrdersForVariation(variation, initialOrders));
  }, [initialOrders, variation]);

  const handleLocalStatusChange = useCallback((orderId: string, newStatus: OrderStatus) => {
      setOrders((currentOrders) =>
        currentOrders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      onBulkStatusChange([orderId], newStatus);
    }, [onBulkStatusChange]
  );
  
  const handleSelectionChange = (orderId: string, checked: boolean) => {
    setSelectedOrderIds((prev) => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(orderId);
      } else {
        newSet.delete(orderId);
      }
      return newSet;
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedOrderIds(new Set(orders.map((o) => o.id)));
    } else {
      setSelectedOrderIds(new Set());
    }
  };

  const handleBulkUpdate = (newStatus: OrderStatus) => {
    if (selectedOrderIds.size === 0) {
      toast({
        title: (
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            <span className="font-bold">Nenhum pedido selecionado</span>
          </div>
        ),
        description: `Selecione um ou mais pedidos para alterar o status.`,
        duration: 3000,
      });
      return;
    }
    const orderIdsToUpdate = Array.from(selectedOrderIds);
    onBulkStatusChange(orderIdsToUpdate, newStatus);

    setOrders((currentOrders) =>
      currentOrders.map((o) =>
        orderIdsToUpdate.includes(o.id) ? { ...o, status: newStatus } : o
      )
    );

    toast({
      title: (
        <div className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-500" />
          <span className="font-bold">Sucesso!</span>
        </div>
      ),
      description: `${
        orderIdsToUpdate.length
      } ${
        orderIdsToUpdate.length === 1 ? "pedido foi atualizado" : "pedidos foram atualizados"
      } para "${newStatus === "packed" ? "Embalado" : "Pendente"}".`,
      duration: 3000,
    });
    setSelectedOrderIds(new Set());
  };

  const allSelected = orders.length > 0 && selectedOrderIds.size === orders.length;

  return (
    <div className="h-screen w-full bg-background flex flex-col animate-fade-in">
      <header className="py-4 px-4 sm:px-6 lg:px-8 border-b border-border sticky top-0 bg-background/80 backdrop-blur-sm z-10">
        <div className="flex items-center gap-2 sm:gap-4">
          <Button onClick={onBack} variant="ghost" size="icon">
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <div className="flex items-center gap-3 overflow-hidden">
            <ShoppingBag className="h-6 w-6 text-primary flex-shrink-0" />
            <div className="flex flex-col overflow-hidden">
              <span className="font-medium text-sm text-muted-foreground -mb-1">
                Pedidos com a Variação
              </span>
              <h1 className="font-semibold text-lg leading-tight truncate">
                {variation.name}
              </h1>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-grow flex flex-col min-h-0">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between space-x-2">
            <div className="flex items-center space-x-3">
              <Checkbox
                id="select-all"
                checked={allSelected}
                onCheckedChange={(checked) => handleSelectAll(!!checked)}
              />
              <Label htmlFor="select-all" className="font-medium text-sm">
                Selecionar Todos ({selectedOrderIds.size}/{orders.length})
              </Label>
            </div>
          </div>
        </div>

        <ScrollArea className="flex-grow">
          <div className="space-y-4 p-4">
            {orders.length > 0 ? (
              orders.map((order, index) => (
                <div
                  key={order.id}
                  className="flex items-center gap-4 animate-slide-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <Checkbox
                    id={`order-select-${order.id}`}
                    onCheckedChange={(checked) =>
                      handleSelectionChange(order.id, !!checked)
                    }
                    checked={selectedOrderIds.has(order.id)}
                    aria-label={`Selecionar pedido ${order.id}`}
                    className="flex-shrink-0"
                  />
                  <div className="flex-grow">
                    <OrderCard
                      order={order}
                      onStatusChange={handleLocalStatusChange}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-12">
                Nenhum pedido encontrado para esta variação.
              </p>
            )}
          </div>
        </ScrollArea>

        {selectedOrderIds.size > 0 && (
          <footer className="border-t p-4 flex flex-col sm:flex-row justify-end gap-2 animate-fade-in bg-background/80 backdrop-blur-sm">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline">
                  <Undo2 className="mr-2 h-4 w-4" />
                  Marcar Pendente
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirmar Ação</AlertDialogTitle>
                  <AlertDialogDescription>
                    Deseja marcar os {selectedOrderIds.size} pedidos
                    selecionados como "Pendente"?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleBulkUpdate("pending")}>
                    Confirmar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button>
                  <CheckCheck className="mr-2 h-4 w-4" />
                  Marcar Embalado
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirmar Ação</AlertDialogTitle>
                  <AlertDialogDescription>
                    Deseja marcar os {selectedOrderIds.size} pedidos
                    selecionados como "Embalado"?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleBulkUpdate("packed")}>
                    Confirmar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </footer>
        )}
      </div>
    </div>
  );
}
