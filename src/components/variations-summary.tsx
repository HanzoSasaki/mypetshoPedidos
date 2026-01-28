
"use client";

import { BarChart3, Eye, Hash } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { type Variation, type Order } from '@/lib/types';
import { useMemo } from 'react';
import Image from 'next/image';

const getVariationImage = (variationName: string) => {
    const imageName = variationName.trim().replace(/\s+/g, ' ');
    return `/img_areia/${imageName}.jpg`;
};

interface VariationsSummaryProps {
    variations: Variation[];
    allOrders: Order[];
    onViewVariationDetails: (variation: Variation) => void;
    onViewAll: () => void;
}

export default function VariationsSummary({ variations, allOrders, onViewVariationDetails, onViewAll }: VariationsSummaryProps) {
    if (variations.length === 0) {
        return null;
    }

    const topVariations = useMemo(() => {
        const pendingOrders = allOrders.filter(o => o.status === 'pending');
        const variationOrderCounts = new Map<string, number>();

        pendingOrders.forEach(order => {
            const orderVariations = new Set(order.products.map(p => p.variation));
            orderVariations.forEach(variationName => {
                if(variationName) {
                    variationOrderCounts.set(variationName, (variationOrderCounts.get(variationName) || 0) + 1);
                }
            });
        });

        return Array.from(variationOrderCounts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([name, orderCount]) => {
                const originalVariation = variations.find(v => v.name === name);
                return { ...originalVariation, name, orderCount };
            });

    }, [allOrders, variations]);

    return (
        <Card className="animate-fade-in" style={{ animationDelay: '150ms' }}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                    <BarChart3 className="text-primary" />
                    <span>Variações mais vendidas (Pedidos Pendentes)</span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {topVariations.map((variation) => (
                        <div key={variation.name} onClick={() => onViewVariationDetails(variation as Variation)} className="flex items-center gap-3 cursor-pointer group">
                            <Image src={getVariationImage(variation.name)} alt={variation.name} width={40} height={40} className="rounded-md" />
                            <div className="flex-grow overflow-hidden">
                                <p className="font-medium text-foreground truncate group-hover:text-primary transition-colors">{variation.name}</p>
                            </div>
                            <div className="flex items-center gap-2 text-sm font-semibold text-primary ml-4 shrink-0">
                                <Hash className="h-4 w-4 text-muted-foreground" />
                                <span>{variation.orderCount}</span>
                            </div>
                        </div>
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
