
"use client";

import { useState, useMemo, useCallback } from "react";
import { type Variation, type Order, type OrderStatus } from "@/lib/types";
import {
  ChevronLeft,
  Search,
  Palette,
  Hash,
  Code,
  CheckCheck,
  Undo2,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CheckCircle, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

const getOrdersForVariation = (variation: Variation, orders: Order[]): Order[] => {
  return orders.filter((order) =>
    order.products.some(
      (p) => p.variation === variation.name && p.sku === variation.sku
    )
  );
};

const VariationItem = ({
  variation,
  orders,
  onBulkStatusChange,
  onViewDetails,
}: {
  variation: Variation;
  orders: Order[];
  onBulkStatusChange: (orderIds: string[], newStatus: OrderStatus) => void;
  onViewDetails: (variation: Variation) => void;
}) => {
  const { toast } = useToast();

  const ordersForVariation = useMemo(
    () => getOrdersForVariation(variation, orders),
    [variation, orders]
  );

  const allPacked = useMemo(() => {
    if (ordersForVariation.length === 0) return false;
    return ordersForVariation.every((o) => o.status === "packed");
  }, [ordersForVariation]);

  const handleMarkAll = useCallback((newStatus: "packed" | "pending") => {
    const ordersToUpdate =
      newStatus === "packed"
        ? ordersForVariation.filter((o) => o.status === "pending")
        : ordersForVariation.filter((o) => o.status === "packed");

    const actionText = newStatus === "packed" ? "Embalado" : "Pendente";
    const oppositeStatusText =
      newStatus === "packed" ? "pendentes" : "embalados";

    if (ordersToUpdate.length === 0) {
      toast({
        title: (
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            <span className="font-bold">Nenhuma alteração</span>
          </div>
        ),
        description: `Não há pedidos ${oppositeStatusText} para marcar como "${actionText}".`,
        duration: 3000,
      });
      return;
    }

    onBulkStatusChange(
      ordersToUpdate.map((o) => o.id),
      newStatus
    );

    toast({
      title: (
        <div className="flex items-center gap-2">
          {newStatus === "packed" ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
          )}
          <span className="font-bold">
            {newStatus === "packed" ? "Sucesso!" : "Status Revertido!"}
          </span>
        </div>
      ),
      description: `${ordersToUpdate.length} ${
        ordersToUpdate.length === 1
          ? "pedido foi marcado"
          : "pedidos foram marcados"
      } como "${actionText}".`,
      duration: 3000,
    });
  }, [ordersForVariation, onBulkStatusChange, toast]);

  const cardClass = allPacked 
    ? "bg-green-100/50 border-green-200 hover:bg-green-100/80 dark:bg-green-900/10 dark:border-green-800/30 dark:hover:bg-green-900/20" 
    : "bg-yellow-100/50 border-yellow-200 hover:bg-yellow-100/80 dark:bg-yellow-900/10 dark:border-yellow-800/30 dark:hover:bg-yellow-900/20";


  return (
    <div className="flex items-center gap-2">
      <div
        onClick={() => onViewDetails(variation)}
        className={cn(
          "flex-grow flex items-start justify-between rounded-lg border p-4 cursor-pointer transition-all duration-200",
          cardClass
        )}
      >
        <div className="flex-grow space-y-2 overflow-hidden">
          <div className="flex items-center gap-3">
            <Palette className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            <p className="font-medium text-foreground truncate">{variation.name}</p>
          </div>
          {variation.sku && (
            <div className="flex items-center gap-3">
              <Code className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              <p className="text-sm text-blue-600 dark:text-blue-400 font-semibold truncate">
                SKU: {variation.sku}
              </p>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm font-semibold text-primary ml-4 shrink-0">
          <Hash className="h-4 w-4" />
          <span>{variation.quantity}</span>
        </div>
      </div>
      <div className="flex flex-col">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <CheckCheck className="text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Marcar todos como embalados</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Ação</AlertDialogTitle>
              <AlertDialogDescription>
                Você deseja marcar todos os pedidos pendentes da variação{" "}
                <span className="font-semibold">{variation.name}</span> como
                embalados?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={() => handleMarkAll("packed")}>
                Confirmar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Undo2 className="text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Marcar todos como pendentes</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Ação</AlertDialogTitle>
              <AlertDialogDescription>
                Você deseja marcar todos os pedidos embalados da variação{" "}
                <span className="font-semibold">{variation.name}</span> de volta
                para pendente?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => handleMarkAll("pending")}
                className="bg-destructive hover:bg-destructive/90"
              >
                Confirmar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

interface AllVariationsViewProps {
  variations: Variation[];
  allOrders: Order[];
  onBack: () => void;
  onBulkStatusChange: (orderIds: string[], newStatus: OrderStatus) => void;
  onViewVariationDetails: (variation: Variation) => void;
}

export default function AllVariationsView({
  variations,
  allOrders,
  onBack,
  onBulkStatusChange,
  onViewVariationDetails,
}: AllVariationsViewProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredVariations = useMemo(
    () =>
      variations.filter(
        (v) =>
          v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (v.sku && v.sku.toLowerCase().includes(searchTerm.toLowerCase()))
      ),
    [variations, searchTerm]
  );
  
  const handleBulkChange = useCallback((orderIds: string[], newStatus: OrderStatus) => {
    onBulkStatusChange(orderIds, newStatus);
  }, [onBulkStatusChange]);

  return (
    <div className="h-screen w-full bg-background flex flex-col animate-fade-in">
      <header className="py-4 px-4 sm:px-6 lg:px-8 border-b border-border sticky top-0 bg-background/80 backdrop-blur-sm z-10">
        <div className="flex items-center gap-2 sm:gap-4">
          <Button onClick={onBack} variant="ghost" size="icon">
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <h1 className="font-semibold text-lg">Todas as Variações</h1>
        </div>
      </header>

      <div className="flex-grow flex flex-col min-h-0">
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por variação ou SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <ScrollArea className="flex-grow">
          <div className="space-y-3 p-4">
            {filteredVariations.length > 0 ? (
              filteredVariations.map((variation, index) => (
                <div
                  key={`${variation.sku}-${variation.name}-${index}`}
                  className="animate-slide-up"
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <VariationItem
                    variation={variation}
                    orders={allOrders}
                    onBulkStatusChange={handleBulkChange}
                    onViewDetails={onViewVariationDetails}
                  />
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-12">
                Nenhuma variação encontrada.
              </p>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
