
"use client";

import { useMemo } from 'react';
import { type Order } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Calendar, Wallet, TrendingUp } from 'lucide-react';

interface ReportsViewProps {
  orders: Order[];
  sandPrices: any[];
}

export default function ReportsView({ orders, sandPrices }: ReportsViewProps) {

  const analysisData = useMemo(() => {
    const variationsMap = new Map<string, { orderCount: number; totalQuantity: number }>();

    orders.forEach(order => {
      order.products.forEach(product => {
        if (product.variation) {
          const entry = variationsMap.get(product.variation) || { orderCount: 0, totalQuantity: 0 };
          entry.orderCount += 1; // Increment order count for each product instance found
          entry.totalQuantity += product.quantity;
          variationsMap.set(product.variation, entry);
        }
      });
    });

    const detailedData = Array.from(variationsMap.entries()).map(([variationName, data]) => {
      const priceInfo = sandPrices.find(p => p.nome === variationName);
      if (!priceInfo) return null;

      const sellPrice = parseFloat(priceInfo.venda.replace(',', '.'));
      const costPrice = parseFloat(priceInfo.Custo.replace(',', '.'));

      const shopeeFeePercentage = 0.20;
      const shopeeFixedFee = 4.00;
      
      const totalRevenue = sellPrice * data.orderCount;
      const totalShopeeFee = (totalRevenue * shopeeFeePercentage) + (shopeeFixedFee * data.orderCount);
      const walletValue = totalRevenue - totalShopeeFee;
      const totalCost = costPrice * data.orderCount;
      const finalNetValue = walletValue - totalCost;

      return {
        variationName,
        orderCount: data.orderCount,
        totalQuantity: data.totalQuantity,
        sellPrice,
        walletValue,
        costPrice,
        finalNetValue,
      };
    }).filter(Boolean);

    return detailedData.sort((a, b) => b.orderCount - a.orderCount);
  }, [orders, sandPrices]);

  const totals = useMemo(() => {
    return analysisData.reduce((acc, item) => {
      acc.totalWalletValue += item.walletValue;
      acc.totalFinalNetValue += item.finalNetValue;
      return acc;
    }, { totalWalletValue: 0, totalFinalNetValue: 0 });
  }, [analysisData]);

  const chartData = analysisData.map(d => ({ name: d.variationName, Pedidos: d.orderCount }));
  const currentDate = new Date().toLocaleDateString('pt-BR');

  return (
    <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Valor Total em Carteira</CardTitle>
                    <Wallet className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">R$ {totals.totalWalletValue.toFixed(2).replace('.', ',')}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Valor Total Líquido</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">R$ {totals.totalFinalNetValue.toFixed(2).replace('.', ',')}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Data do Relatório</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{currentDate}</div>
                </CardContent>
            </Card>
        </div>

      <Card>
        <CardHeader>
          <CardTitle>Visão Geral de Vendas por Variação</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={chartData}
              margin={{
                top: 5, right: 30, left: 20, bottom: 150,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" interval={0} />
              <YAxis />
              <Tooltip />
              <Legend verticalAlign="top" />
              <Bar dataKey="Pedidos" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Análise Financeira Detalhada por Variação</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Variação</TableHead>
                <TableHead className="text-right">Pedidos</TableHead>
                <TableHead className="text-right">Preço Venda</TableHead>
                <TableHead className="text-right">Valor Carteira</TableHead>
                <TableHead className="text-right">Custo</TableHead>
                <TableHead className="text-right">Líquido Final</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {analysisData.map((item) => (
                <TableRow key={item.variationName}>
                  <TableCell>{item.variationName}</TableCell>
                  <TableCell className="text-right">{item.orderCount}</TableCell>
                  <TableCell className="text-right">R$ {item.sellPrice.toFixed(2).replace('.', ',')}</TableCell>
                  <TableCell className="text-right">R$ {item.walletValue.toFixed(2).replace('.', ',')}</TableCell>
                  <TableCell className="text-right">R$ {item.costPrice.toFixed(2).replace('.', ',')}</TableCell>
                  <TableCell className="text-right font-bold text-green-600">R$ {item.finalNetValue.toFixed(2).replace('.', ',')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
