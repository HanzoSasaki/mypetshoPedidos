
"use client";

import { useEffect, useState } from 'react';
import { fetchAndParseOrders } from '@/lib/data';
import OrderCard from '@/components/order-card';
import { ChevronLeft, ChevronRight, ListOrdered, PackageX } from 'lucide-react';
import { type Order, type OrderStatus } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import MainLayout from '@/components/layout/main-layout';

const ORDERS_PER_PAGE = 5;

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const fetchedOrders = await fetchAndParseOrders();
      setOrders(fetchedOrders);
      setLoading(false);
    }
    loadData();
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

  const Content = () => {
    if (loading) {
        return (
          <div className="space-y-4">
             <Skeleton className="h-28 w-full" />
             <Skeleton className="h-28 w-full" />
             <Skeleton className="h-28 w-full" />
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
    <MainLayout>
      <Content />
    </MainLayout>
  )
}
