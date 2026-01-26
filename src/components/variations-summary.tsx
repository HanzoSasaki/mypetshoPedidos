
"use client"
import { BarChart3, Palette, Hash, Code, Eye, Search, CheckCheck, Undo2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
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
import { Button } from '@/components/ui/button';
import { type Variation, type Order, type OrderStatus } from '@/lib/types';
import { useState, useMemo, useCallback } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

const getVariationImage = (variationName: string) => {
    const imageName = variationName.trim().replace(/\s+/g, ' ');
    return `/img_areia/${imageName}.jpg`;
};

const getOrdersForVariation = (variation: Variation, orders: Order[]): Order[] => {
    return orders.filter(order => 
        order.products.some(p => p.variation === variation.name && p.sku === variation.sku)
    );
}

const VariationItem = ({ variation, orders, onBulkStatusChange, onViewDetails }: { variation: Variation, orders: Order[], onBulkStatusChange: (orderIds: string[], newStatus: OrderStatus) => void, onViewDetails: (variation: Variation) => void }) => {
    const { toast } = useToast();
    
    const ordersForVariation = useMemo(() => getOrdersForVariation(variation, orders), [variation, orders]);
    
    const allPacked = useMemo(() => {
        if (ordersForVariation.length === 0) return false;
        return ordersForVariation.every(o => o.status === 'packed');
    }, [ordersForVariation]);

    const handleMarkAll = useCallback((newStatus: 'packed' | 'pending') => {
        const ordersToUpdate = newStatus === 'packed'
            ? ordersForVariation.filter(o => o.status === 'pending')
            : ordersForVariation.filter(o => o.status === 'packed');
        
        const actionText = newStatus === 'packed' ? 'Embalado' : 'Pendente';
        const oppositeStatusText = newStatus === 'packed' ? 'pendentes' : 'embalados';
        
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

        onBulkStatusChange(ordersToUpdate.map(o => o.id), newStatus);

        toast({
            title: (
                <div className="flex items-center gap-2">
                    {newStatus === 'packed' ? <CheckCircle className="h-5 w-5 text-green-500" /> : <AlertTriangle className="h-5 w-5 text-yellow-500" />}
                    <span className="font-bold">{newStatus === 'packed' ? 'Sucesso!' : 'Status Revertido!'}</span>
                </div>
            ),
            description: `${ordersToUpdate.length} ${ordersToUpdate.length === 1 ? 'pedido foi marcado' : 'pedidos foram marcados'} como "${actionText}".`,
            duration: 3000,
        });
    }, [ordersForVariation, onBulkStatusChange, toast]);

    const cardClass = allPacked 
        ? "bg-green-100/50 border-green-200 hover:bg-green-100/80 dark:bg-green-900/10 dark:border-green-800/30 dark:hover:bg-green-900/20" 
        : "bg-yellow-100/50 border-yellow-200 hover:bg-yellow-100/80 dark:bg-yellow-900/10 dark:border-yellow-800/30 dark:hover:bg-yellow-900/20";

    return (
        <div className="flex items-center gap-2">
            <div onClick={() => onViewDetails(variation)} className={cn("flex-grow flex items-start justify-between rounded-lg border p-4 cursor-pointer transition-all duration-200", cardClass)}>
                <div className="flex-grow space-y-2 overflow-hidden">
                    <div className='flex items-center gap-3'>
                        <Image src={getVariationImage(variation.name)} alt={variation.name} width={40} height={40} className="rounded-md" />
                        <div className="flex-grow space-y-0.5 overflow-hidden">
                            <p className="font-medium text-foreground truncate">{variation.name}</p>
                            {variation.sku && (
                                <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 font-semibold">
                                    <Code className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                    <p className="truncate">SKU: {variation.sku}</p>
                                </div>
                            )}
                        </div>
                    </div>
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
                                Você deseja marcar todos os pedidos pendentes da variação <span className="font-semibold">{variation.name}</span> como embalados?
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleMarkAll('packed')}>Confirmar</AlertDialogAction>
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
                                Você deseja marcar todos os pedidos embalados da variação <span className="font-semibold">{variation.name}</span> de volta para pendente?
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleMarkAll('pending')} className="bg-destructive hover:bg-destructive/90">Confirmar</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
    );
};

interface VariationsSummaryProps {
    variations: Variation[];
    allOrders: Order[];
    onBulkStatusChange: (orderIds: string[], newStatus: OrderStatus) => void;
    onViewVariationDetails: (variation: Variation) => void;
    onViewAll: () => void;
}

export default function VariationsSummary({ variations, allOrders, onBulkStatusChange, onViewVariationDetails, onViewAll }: VariationsSummaryProps) {
  if (variations.length === 0) {
    return null;
  }

  const topVariations = variations.slice(0, 3);
  
  const handleBulkChange = useCallback((orderIds: string[], newStatus: OrderStatus) => {
    onBulkStatusChange(orderIds, newStatus);
  }, [onBulkStatusChange]);

  return (
    <Card className="animate-fade-in" style={{ animationDelay: '150ms' }}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <BarChart3 className="text-primary" />
          <span>Variações mais vendidas</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {topVariations.map((variation, index) => (
            <VariationItem key={`${variation.sku}-${variation.name}-${index}`} variation={variation} orders={allOrders} onBulkStatusChange={handleBulkChange} onViewDetails={onViewVariationDetails}/>
          ))}
        </div>
      </CardContent>
      {variations.length > 3 && (
        <CardFooter className="justify-center pt-4">
            <Button onClick={onViewAll} variant="outline">
              <Eye className="mr-2 h-4 w-4" /> 
              Ver todas as {variations.length} variações
            </Button>
        </CardFooter>
      )}
    </Card>
  );
}
