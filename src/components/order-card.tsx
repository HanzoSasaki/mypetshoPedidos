"use client";

import type { Order, OrderStatus } from "@/lib/types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import ProductItem from "./product-item";
import { Package, CheckCircle, Clock } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { Badge } from "./ui/badge";

interface OrderCardProps {
  order: Order;
  onStatusChange: (orderId: string, newStatus: OrderStatus) => void;
}

export default function OrderCard({ order, onStatusChange }: OrderCardProps) {
  const totalItems = order.products.reduce((acc, p) => acc + p.quantity, 0);

  const handleToggleStatus = () => {
    const newStatus = order.status === 'pending' ? 'packed' : 'pending';
    onStatusChange(order.id, newStatus);
  };

  const statusConfig = {
    pending: {
      label: "Pendente",
      icon: <Clock className="h-3 w-3" />,
      badgeClass: "bg-yellow-400/80 border-yellow-500/80 text-yellow-900 hover:bg-yellow-400/90 dark:bg-yellow-900/50 dark:border-yellow-700/60 dark:text-yellow-300",
      cardClass: "bg-yellow-100/40 border-yellow-200/80 dark:bg-yellow-900/10 dark:border-yellow-800/30",
      buttonText: "Marcar como Embalado",
    },
    packed: {
      label: "Embalado",
      icon: <CheckCircle className="h-3 w-3" />,
      badgeClass: "bg-green-400/80 border-green-500/80 text-green-900 hover:bg-green-400/90 dark:bg-green-900/50 dark:border-green-700/60 dark:text-green-300",
      cardClass: "bg-green-100/40 border-green-200/80 dark:bg-green-900/10 dark:border-green-800/30",
      buttonText: "Marcar como Pendente",
    },
  };

  const currentStatus = statusConfig[order.status];

  return (
    <Card className={cn("transform-gpu transition-all duration-300 hover:shadow-lg overflow-hidden", currentStatus.cardClass)}>
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value={`order-${order.id}`} className="border-b-0">
          <AccordionTrigger className="flex flex-col sm:flex-row w-full items-start sm:items-center justify-between p-4 md:p-6 text-lg font-semibold hover:no-underline hover:bg-black/5 dark:hover:bg-white/5 data-[state=open]:bg-black/5 data-[state=open]:dark:bg-white/5 [&>svg]:text-primary">
            <div className="flex items-center gap-3 w-full mb-2 sm:mb-0">
              <span className="font-headline text-primary truncate">Pedido #{order.id}</span>
              <Badge className={cn("text-xs font-semibold", currentStatus.badgeClass)}>
                {currentStatus.icon}
                {currentStatus.label}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground self-start sm:self-center shrink-0">
                <Package className="h-4 w-4" />
                <span>{totalItems} {totalItems === 1 ? 'item' : 'itens'}</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="px-6 pb-6 pt-0 space-y-4">
              {order.products.length > 0 ? (
                <div className="space-y-4">
                  {order.products.map((product, index) => (
                    <ProductItem key={index} product={product} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhum produto encontrado para este pedido.
                </p>
              )}
               <Button onClick={handleToggleStatus} variant="outline" className="w-full mt-4">
                {order.status === 'pending' ? <CheckCircle className="mr-2 h-4 w-4" /> : <Clock className="mr-2 h-4 w-4" />}
                {currentStatus.buttonText}
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
}
