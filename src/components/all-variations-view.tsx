
"use client"
import { Palette, Hash, Code, Search, CheckCheck, Undo2, ArrowLeft, Copy, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Input } from '@/components/ui/input';

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
    const orderCount = ordersForVariation.length;

    const allPacked = useMemo(() => {
        if (orderCount === 0) return false;
        return ordersForVariation.every(o => o.status === 'packed');
    }, [ordersForVariation, orderCount]);

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
                <div className="flex flex-col items-end gap-2 text-sm font-semibold text-primary ml-4 shrink-0">
                    <div className="flex items-center gap-2">
                        <Hash className="h-4 w-4" />
                        <span>{orderCount}</span>
                    </div>
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

interface AllVariationsViewProps {
    variations: Variation[];
    allOrders: Order[];
    onBulkStatusChange: (orderIds: string[], newStatus: OrderStatus) => void;
    onViewVariationDetails: (variation: Variation) => void;
    onBack: () => void;
}

export default function AllVariationsView({ variations, allOrders, onBulkStatusChange, onViewVariationDetails, onBack }: AllVariationsViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  
  const handleBulkChange = useCallback((orderIds: string[], newStatus: OrderStatus) => {
    onBulkStatusChange(orderIds, newStatus);
  }, [onBulkStatusChange]);

  const filteredVariations = useMemo(() => {
    if (!searchTerm) return variations;
    return variations.filter(v => 
      v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.sku?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [variations, searchTerm]);

 const totalUniqueOrders = useMemo(() => {
    const orderIds = new Set();
    filteredVariations.forEach(variation => {
        const ordersForVar = getOrdersForVariation(variation, allOrders);
        ordersForVar.forEach(order => orderIds.add(order.id));
    });
    return orderIds.size;
  }, [filteredVariations, allOrders]);

  const handleCopySummary = useCallback(() => {
    if (filteredVariations.length === 0) {
        toast({
            title: "Nenhuma variação para resumir",
            variant: "destructive",
        });
        return;
    }

    const summaryLines = filteredVariations.map(variation => {
        const ordersForVariation = getOrdersForVariation(variation, allOrders);
        const totalOrders = ordersForVariation.length;
        const totalUnits = variation.quantity;
        return `${variation.name} - ${totalOrders} pedidos - ${totalUnits} unidades`;
    });

    const summaryText = "Resumo de Variações:\n" + summaryLines.join('\n');
    
    navigator.clipboard.writeText(summaryText).then(() => {
        toast({
            title: "Resumo Copiado!",
            description: "O resumo das variações foi copiado para a área de transferência.",
        });
    }).catch(err => {
        console.error('Failed to copy: ', err);
        toast({
            title: "Erro ao Copiar",
            description: "Não foi possível copiar o resumo.",
            variant: "destructive",
        });
    });
}, [filteredVariations, allOrders, toast]);

  return (
    <Card className="animate-fade-in w-full mx-auto max-w-4xl">
        <CardHeader>
            <div className="flex items-center justify-between">
                <Button onClick={onBack} variant="ghost" size="icon" className="mr-2">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <CardTitle className="flex-grow text-base flex items-center gap-2">
                    <Palette className="text-primary" />
                    <span>Todas as Variações ({filteredVariations.length})</span>
                </CardTitle>
                <div className="flex items-center gap-2 text-sm font-semibold">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button onClick={handleCopySummary} variant="ghost" size="icon">
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Copiar resumo para WhatsApp</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    <Package className="h-4 w-4" />
                    <span>{totalUniqueOrders}</span>
                </div>
            </div>
             <div className="relative mt-4">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                    placeholder="Buscar por nome ou SKU..."
                    className="pl-8 w-full"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>
        </CardHeader>
        <CardContent>
            <div className="space-y-3 h-[65vh] overflow-y-auto pr-2">
            {filteredVariations.map((variation, index) => (
                <VariationItem 
                    key={`${variation.sku}-${variation.name}-${index}`} 
                    variation={variation} 
                    orders={allOrders} 
                    onBulkStatusChange={handleBulkChange} 
                    onViewDetails={onViewVariationDetails}
                />
            ))}
            </div>
        </CardContent>
    </Card>
  );
}
