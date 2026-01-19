export interface Product {
  name: string;
  variation: string;
  quantity: number;
  price?: number;
  sku?: string;
  parentSku?: string;
}

export type OrderStatus = 'pending' | 'packed';

export interface Order {
  id: string;
  products: Product[];
  status: OrderStatus;
}

export interface Variation {
  name: string;
  quantity: number;
  sku?: string;
}

export interface ToyStockItem {
  sku: string;
  product: string;
  quantity: number;
}
