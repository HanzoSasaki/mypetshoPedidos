
"use client";

import { useEffect, useState } from 'react';
import { fetchAndParseOrders, fetchSandPrices } from '@/lib/data';
import { type Order } from '@/lib/types';
import MainLayout from '@/components/layout/main-layout';
import { Skeleton } from '@/components/ui/skeleton';
import ReportsView from '@/components/reports-view';

export default function ReportsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [sandPrices, setSandPrices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  const Content = () => {
    if (loading) {
      return (
        <div className="space-y-4">
          <Skeleton className="h-80 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      );
    }
    
    const pendingOrders = orders.filter(o => o.status === 'pending');

    return (
      <ReportsView orders={pendingOrders} sandPrices={sandPrices} />
    );
  };

  return (
    <MainLayout>
      <Content />
    </MainLayout>
  );
}
