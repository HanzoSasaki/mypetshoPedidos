
"use client";

import { useEffect, useState } from 'react';
import { fetchAndParseOrders, fetchToyStock } from '@/lib/data';
import { Package, Truck } from 'lucide-react';
import { type Order, type Product, type Variation, type OrderStatus, type ToyStockItem } from '@/lib/types';
import VariationsSummary from '@/components/variations-summary';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import MainLayout from '@/components/layout/main-layout';
import VariationDetailView from '@/components/variation-detail-view';
import AllVariationsView from '@/components/all-variations-view';
import ToyStockSummary from '@/components/toy-stock-summary';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';


export default function SummaryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [toyStock, setToyStock] = useState<ToyStockItem[]>([]);
  const [selectedVariation, setSelectedVariation] = useState<Variation | null>(null);
  const [viewingAllVariations, setViewingAllVariations] = useState(false);


  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [fetchedOrders, fetchedToyStock] = await Promise.all([
        fetchAndParseOrders(),
        fetchToyStock()
      ]);
      setOrders(fetchedOrders);
      setToyStock(fetchedToyStock);
      setLoading(false);
    }
    loadData();
  }, []);

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
        )
    }

    return (
        <div className="animate-fade-in space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Card className="animate-fade-in">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">Total de Pedidos</CardTitle>
                      <Package className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                      <div className="text-2xl font-bold">{orders.length}</div>
                      <p className="text-xs text-muted-foreground">
                          Pedidos recebidos até o momento.
                      </p>
                  </CardContent>
              </Card>
            </div>
            <VariationsSummary 
              variations={sortedVariations} 
              allOrders={orders} 
              onBulkStatusChange={handleBulkOrderStatusChange} 
              onViewVariationDetails={setSelectedVariation}
              onViewAll={() => setViewingAllVariations(true)}
            />
            
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full shadow-lg z-20 bg-primary text-primary-foreground hover:bg-primary/90"
                  aria-label="Resumo de estoque brinquedos"
                >
                  <Truck className="h-6 w-6 mr-4" />
                  Resumo de estoque brinquedos
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[700px] h-[80vh] w-[90vw]">
                  <ToyStockSummary stock={toyStock} />
              </DialogContent>
            </Dialog>
        </div>
      )
  };

  return (
    <MainLayout>
      <Content />
    </MainLayout>
  )
}
