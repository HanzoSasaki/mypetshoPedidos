
"use client";

import { useEffect, useState, useRef } from 'react';
import { fetchAndParseOrders, fetchSandPrices } from '@/lib/data';
import { Package, Copy, AlertTriangle, X } from 'lucide-react';
import { type Order, type Product, type Variation, type OrderStatus } from '@/lib/types';
import VariationsSummary from '@/components/variations-summary';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import MainLayout from '@/components/layout/main-layout';
import VariationDetailView from '@/components/variation-detail-view';
import AllVariationsView from '@/components/all-variations-view';
import SandPricesTable from '@/components/sand-prices-table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Textarea } from '@/components/ui/textarea';

export default function Home() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [sandPrices, setSandPrices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVariation, setSelectedVariation] = useState<Variation | null>(null);
  const [viewingAllVariations, setViewingAllVariations] = useState(false);
  const [summaryText, setSummaryText] = useState("");
  const [isCopyDialogOpen, setIsCopyDialogOpen] = useState(false);
  const { toast } = useToast();
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [fetchedOrders, fetchedSandPrices] = await Promise.all([
        fetchAndParseOrders(),
        fetchSandPrices(),
      ]);
      setOrders(fetchedOrders);
      setSandPrices(fetchedSandPrices);
      setLoading(false);
    }
    loadData();
  }, []);
  
  useEffect(() => {
    if (isCopyDialogOpen && textAreaRef.current) {
      textAreaRef.current.select();
    }
  }, [isCopyDialogOpen]);

  const handleBulkOrderStatusChange = (orderIds: string[], newStatus: OrderStatus) => {
    setOrders(currentOrders => {
      const updatedOrders = currentOrders.map(order => 
        orderIds.includes(order.id) ? { ...order, status: newStatus } : order
      );
      orderIds.forEach(orderId => {
        localStorage.setItem(`order_status_${orderId}`, newStatus);
      });
      return updatedOrders;
    });
  };

  const allProducts: Product[] = orders.flatMap(order => order.products);
  const variationsCount: { [key: string]: Variation } = {};

  allProducts.forEach(product => {
    const key = `${product.variation}-${product.sku || 'no-sku'}`;
    if (variationsCount[key]) {
      variationsCount[key].quantity += product.quantity;
    } else {
      variationsCount[key] = {
        name: product.variation,
        sku: product.sku,
        quantity: product.quantity,
      };
    }
  });

  const sortedVariations = Object.values(variationsCount)
    .sort((a, b) => b.quantity - a.quantity);

  const handleCopyToClipboard = () => {
    const pendingOrders = orders.filter(o => o.status === 'pending');
    const totalPendingOrders = pendingOrders.length;
    const currentDate = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

    const variationsInPendingOrders = new Map<string, { quantity: number; orderIds: Set<string> }>();

    pendingOrders.forEach(order => {
      order.products.forEach(product => {
        if (product.variation) {
          const entry = variationsInPendingOrders.get(product.variation) || { quantity: 0, orderIds: new Set() };
          entry.quantity += product.quantity;
          entry.orderIds.add(order.id);
          variationsInPendingOrders.set(product.variation, entry);
        }
      });
    });

    let totalOverallCost = 0;
    
    let text = `*Resumo de Pedidos Pendentes*\n`;
    text += `*Data:* ${currentDate}\n`;
    text += `*Total de Pedidos:* ${totalPendingOrders}\n\n`;
    text += `*Variações:*\n`;

    const sortedSummary = [...variationsInPendingOrders.entries()]
      .sort((a, b) => b[1].quantity - a[1].quantity);

    sortedSummary.forEach(([variationName, data]) => {
      const priceInfo = sandPrices.find(p => p.nome === variationName);
      const cost = priceInfo ? parseFloat(priceInfo.Custo.replace(',', '.')) * data.quantity : 0;
      totalOverallCost += cost;
      const orderCount = data.orderIds.size;

      text += `- ${variationName}: ${data.quantity} unids`;
      if (cost > 0) {
        text += ` (Custo: R$${cost.toFixed(2).replace('.', ',')})`;
      }
      text += ` - ${orderCount} ${orderCount > 1 ? 'pedidos' : 'pedido'}\n`;
    });

    text += `\n*Custo Total de Todas as Variações: R$${totalOverallCost.toFixed(2).replace('.', ',')}*`;

    setSummaryText(text);
    setIsCopyDialogOpen(true);
  };
  
  const handleDialogCopy = () => {
    if(textAreaRef.current){
      textAreaRef.current.select();
      document.execCommand('copy');
      toast({
          title: "Copiado!",
          description: "O resumo foi copiado para a área de transferência.",
      });
    }
  };

  if (selectedVariation) {
    return (
      <MainLayout>
        <VariationDetailView
          variation={selectedVariation}
          initialOrders={orders}
          onBulkStatusChange={handleBulkOrderStatusChange}
          onBack={() => setSelectedVariation(null)}
        />
      </MainLayout>
    );
  }

  if (viewingAllVariations) {
    return (
      <MainLayout>
        <AllVariationsView
          variations={sortedVariations}
          allOrders={orders}
          sandPrices={sandPrices}
          onBulkStatusChange={handleBulkOrderStatusChange}
          onViewVariationDetails={setSelectedVariation}
          onBack={() => setViewingAllVariations(false)}
        />
      </MainLayout>
    );
  }

  const Content = () => {
    if (loading) {
      return (
        <div className="space-y-4">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      );
    }

    return (
      <div className="animate-fade-in space-y-6">
        <Alert variant="destructive" className="border-2 border-red-500/80 bg-red-100/60 text-red-900 dark:border-red-700/60 dark:bg-red-900/10 dark:text-red-300">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle className="font-bold">Atenção: Limite de 20kg por Pedido</AlertTitle>
          <AlertDescription>
            Para garantir a entrega, envie apenas 1 unidade de areia por pedido.
          </AlertDescription>
        </Alert>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="animate-fade-in">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total de Pedidos Pendentes</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orders.filter(o => o.status === 'pending').length}</div>
              <p className="text-xs text-muted-foreground">
                Pedidos aguardando processamento.
              </p>
            </CardContent>
          </Card>
        </div>

        <Button onClick={handleCopyToClipboard} className="w-full shadow-lg">
          <Copy className="h-5 w-5 mr-3" />
          Copiar Resumo para WhatsApp
        </Button>

        <VariationsSummary 
          variations={sortedVariations} 
          allOrders={orders} 
          sandPrices={sandPrices}
          onBulkStatusChange={handleBulkOrderStatusChange} 
          onViewVariationDetails={setSelectedVariation}
          onViewAll={() => setViewingAllVariations(true)}
        />
        
        <Dialog open={isCopyDialogOpen} onOpenChange={setIsCopyDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Copiar Resumo</DialogTitle>
            </DialogHeader>
            <Textarea
              ref={textAreaRef}
              value={summaryText}
              readOnly
              className="h-48 text-sm"
            />
            <DialogFooter className="sm:justify-end">
               <Button type="button" onClick={handleDialogCopy} className="bg-green-600 hover:bg-green-700">
                  Copiar
                </Button>
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Fechar
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="w-full shadow-lg z-20 bg-primary text-primary-foreground hover:bg-primary/90"
              aria-label="Tabela de preços de areia"
            >
              Tabela de Preços de Areia
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px] h-auto w-[90vw]">
             <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-center mb-4">Tabela de Preços de Areia</DialogTitle>
            </DialogHeader>
            <SandPricesTable prices={sandPrices} />
          </DialogContent>
        </Dialog>
      </div>
    );
  };

  return (
    <MainLayout>
      <Content />
    </MainLayout>
  );
}
