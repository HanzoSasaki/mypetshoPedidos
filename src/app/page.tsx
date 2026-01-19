
"use client"

import { useEffect, useState } from 'react';
import { fetchAndParseOrders, fetchToyStock } from '@/lib/data';
import OrderCard from '@/components/order-card';
import { PackageX, CalendarDays, ChevronLeft, ChevronRight, Package, BarChart3, ListOrdered, Truck, Clock, Box } from 'lucide-react';
import { type Order, type Product, type Variation, type ToyStockItem, type OrderStatus } from '@/lib/types';
import VariationsSummary from '@/components/variations-summary';
import ToyStockSummary from '@/components/toy-stock-summary';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import VariationDetailView from '@/components/variation-detail-view';
import AllVariationsView from '@/components/all-variations-view';

const ORDERS_PER_PAGE = 5;

type ActiveTab = 'orders' | 'summary';

const CUTOFF_HOUR = 11;
const CUTOFF_MINUTE = 2;

export default function Home() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [toyStock, setToyStock] = useState<ToyStockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [today, setToday] = useState('');
  const [collectionDate, setCollectionDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState<ActiveTab>('summary');
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

    const now = new Date();
    setToday(now.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }));
    
    const getNextBusinessDay = (date: Date): Date => {
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      const dayOfWeek = nextDay.getDay();
      if (dayOfWeek === 6) { // Saturday
        nextDay.setDate(nextDay.getDate() + 2);
      } else if (dayOfWeek === 0) { // Sunday
        nextDay.setDate(nextDay.getDate() + 1);
      }
      return nextDay;
    };

    let collectionDateTime = new Date();
    const currentDayOfWeek = collectionDateTime.getDay();
    const pastCutoff = now.getHours() > CUTOFF_HOUR || (now.getHours() === CUTOFF_HOUR && now.getMinutes() > CUTOFF_MINUTE);

    if (currentDayOfWeek === 6) { // Saturday
      collectionDateTime.setDate(collectionDateTime.getDate() + 2);
    } else if (currentDayOfWeek === 0) { // Sunday
      collectionDateTime.setDate(collectionDateTime.getDate() + 1);
    } else if (pastCutoff) {
      if (currentDayOfWeek === 5) { // Friday past cutoff
        collectionDateTime.setDate(collectionDateTime.getDate() + 3);
      } else {
        collectionDateTime = getNextBusinessDay(collectionDateTime);
      }
    }
    
    setCollectionDate(collectionDateTime.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit' }));
  }, []);

  const handleOrderStatusChange = (orderId: string, newStatus: OrderStatus) => {
    setOrders(currentOrders => {
      const updatedOrders = currentOrders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      );
      localStorage.setItem(`order_status_${orderId}`, newStatus);
      return updatedOrders;
    });
  };

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

  let totalAreia = 0;
  let totalPacotes = 0;
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
    if (product.name.toLowerCase().includes('areia')) {
      totalAreia += product.quantity;
    } else {
      totalPacotes += product.quantity;
    }
  });

  const sortedVariations = Object.values(variationsCount)
    .sort((a, b) => b.quantity - a.quantity);
  
  const totalPages = Math.ceil(orders.length / ORDERS_PER_PAGE);
  const paginatedOrders = orders.slice(
    (currentPage - 1) * ORDERS_PER_PAGE,
    currentPage * ORDERS_PER_PAGE
  );

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  if (selectedVariation) {
    return (
      <VariationDetailView
        variation={selectedVariation}
        initialOrders={orders}
        onBulkStatusChange={handleBulkOrderStatusChange}
        onBack={() => setSelectedVariation(null)}
      />
    );
  }

  if (viewingAllVariations) {
    return (
      <AllVariationsView
        variations={sortedVariations}
        allOrders={orders}
        onBulkStatusChange={handleBulkOrderStatusChange}
        onViewVariationDetails={setSelectedVariation}
        onBack={() => setViewingAllVariations(false)}
      />
    );
  }

  const TabContent = () => {
    if (loading) {
        return (
          <div className="space-y-4">
             <Skeleton className="h-28 w-full" />
             <Skeleton className="h-64 w-full" />
          </div>
        )
    }

    if (activeTab === 'summary') {
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
              <Card className="animate-fade-in" style={{animationDelay: '50ms'}}>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">Total de Areia</CardTitle>
                      <div className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                      <div className="text-2xl font-bold">{totalAreia}</div>
                      <p className="text-xs text-muted-foreground">
                          Soma de todos os produtos de areia.
                      </p>
                  </CardContent>
              </Card>
              <Card className="animate-fade-in sm:col-span-2 lg:col-span-1" style={{animationDelay: '100ms'}}>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">Total de pacotes a embalar</CardTitle>
                      <Box className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                      <div className="text-2xl font-bold">{totalPacotes}</div>
                      <p className="text-xs text-muted-foreground">
                          Soma de todos os outros produtos.
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
        </div>
      )
    }

    return (
      <div className="animate-fade-in">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground mb-4 flex items-center gap-2">
          <ListOrdered />
          Detalhes dos Pedidos
        </h2>
        {orders.length > 0 ? (
          <>
            <div className="grid grid-cols-1 gap-6">
              {paginatedOrders.map((order, index) => (
                <div key={order.id} className="animate-slide-up" style={{ animationDelay: `${index * 100}ms`}}>
                  <OrderCard order={order} onStatusChange={handleOrderStatusChange} />
                </div>
              ))}
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-8">
                <Button onClick={handlePrevPage} disabled={currentPage === 1} variant="outline" size="sm">
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Anterior
                </Button>
                <span className="text-sm font-medium text-muted-foreground">
                  Página {currentPage} de {totalPages}
                </span>
                <Button onClick={handleNextPage} disabled={currentPage === totalPages} variant="outline" size="sm">
                  Próximo
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-card p-12 text-center mt-8 animate-fade-in">
            <PackageX className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-xl font-medium">Nenhum pedido encontrado</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Não foi possível carregar os pedidos. Verifique a planilha ou tente novamente mais tarde.
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen w-full bg-background flex flex-col">
      <header className="py-6 px-4 sm:px-6 lg:px-8 border-b border-border sticky top-0 bg-background/80 backdrop-blur-sm z-10">
        <div className="mx-auto max-w-4xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-y-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-primary font-headline">
                Pedidos Socliquei
              </h1>
              <p className="mt-1 text-base text-muted-foreground">
                Gestão de pedidos e variações
              </p>
            </div>
            <div className="flex flex-col items-start sm:items-end gap-y-2">
               {today && (
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground border rounded-lg px-3 py-1.5 bg-card/80">
                  <CalendarDays className="h-4 w-4" />
                  <span>{today}</span>
                </div>
              )}
               {collectionDate && (
                <div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-2 text-sm font-medium text-muted-foreground border rounded-lg px-3 py-1.5 bg-card/80">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    <span>Corte: {String(CUTOFF_HOUR).padStart(2, '0')}:{String(CUTOFF_MINUTE).padStart(2, '0')}</span>
                  </div>
                  <div className='hidden sm:block w-[1px] h-4 bg-border'/>
                  <div className="flex items-center gap-1.5">
                     <Truck className="h-4 w-4" />
                     <span>Coleta: {collectionDate}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      
      <main className="flex-grow pb-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
            <TabContent />
        </div>
      </main>

      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="fixed bottom-24 right-4 h-14 w-14 rounded-full shadow-lg z-20 bg-primary text-primary-foreground hover:bg-primary/90"
            aria-label="Resumo de estoque brinquedos"
          >
            <Truck className="h-6 w-6" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[700px] h-[80vh] w-[90vw]">
            <ToyStockSummary stock={toyStock} />
        </DialogContent>
      </Dialog>


      <nav className="fixed bottom-0 left-0 right-0 border-t bg-background/80 backdrop-blur-sm p-2 z-20">
        <div className="mx-auto max-w-md flex justify-around">
            <button
              onClick={() => setActiveTab('summary')}
              className={cn(
                "flex flex-col items-center gap-1 p-2 rounded-lg transition-colors w-24",
                activeTab === 'summary' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent'
              )}
            >
              <BarChart3 className="h-6 w-6" />
              <span className="text-xs font-medium">Resumo</span>
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={cn(
                "flex flex-col items-center gap-1 p-2 rounded-lg transition-colors w-24",
                activeTab === 'orders' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent'
              )}
            >
              <Package className="h-6 w-6" />
              <span className="text-xs font-medium">Pedidos</span>
            </button>
        </div>
      </nav>
    </div>
  );
}
    

    
