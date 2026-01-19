
import { type Order, type Product, type ToyStockItem, type OrderStatus } from './types';

const ORDERS_DATA_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vR_7hctp57fVdF-zKrG2HHbp6TXIqmC8vIQmIemlc5G1iljwIYgNPdxcQHxhejyI-45zLAaUVw0nCHE/pub?gid=0&single=true&output=tsv';

const TOY_STOCK_DATA_URL = 
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vRlxOIKTpuVPoSbKUrAXoMWUxDMAbVfxWvCvdV93ZSlG3wk-NMhWHqHZbvV37RSYGrdek9GnVoz9i3p/pub?output=tsv';

function parseProducts(productString: string): Product[] {
  if (!productString || !productString.trim() || productString.trim() === '[0]') return [];

  // Normalize string: remove quotes, standardize whitespace, and handle line breaks within the cell.
  const cleanedString = productString.replace(/"/g, '').replace(/(\r\n|\n|\r)/gm, " ").replace(/\s+/g, ' ').trim();
  const products: Product[] = [];
  
  // Split by product indicators like "[1]", "[2]", etc.
  const productItems = cleanedString.split(/\[\d+\]/).filter(item => item.trim() !== '');

  productItems.forEach(item => {
    const productFields = item.split(';').map(s => s.trim());
    
    const product: Partial<Product> = {};

    productFields.forEach(field => {
      const separatorIndex = field.indexOf(':');
      if (separatorIndex === -1) return;

      const key = field.substring(0, separatorIndex).trim();
      const value = field.substring(separatorIndex + 1).trim();

      if (key.includes('Product Name')) {
        product.name = value;
      } else if (key.includes('Variation Name')) {
        // If variation is empty, we assign a default value to ensure it's processed.
        product.variation = value || '-';
      } else if (key.includes('Price')) {
        // Price is ignored
      } else if (key.includes('Quantity')) {
        product.quantity = parseInt(value, 10);
      } else if (key.includes('SKU Reference No.')) {
        product.sku = value;
      } else if (key.includes('Parent SKU Reference No.')) {
        product.parentSku = value;
      }
    });

    // A product only needs a name and quantity to be considered valid.
    // The variation now has a default value if it was empty.
    if (product.name && product.quantity) {
      products.push(product as Product);
    }
  });

  return products;
}


export async function fetchAndParseOrders(): Promise<Order[]> {
  try {
    const response = await fetch(ORDERS_DATA_URL, { next: { revalidate: 60 } }); // Revalidate every 60 seconds
    if (!response.ok) {
      console.error(`Failed to fetch data: ${response.statusText}`);
      return [];
    }
    const tsvData = await response.text();
    const rows = tsvData.trim().split('\n');

    if (rows.length <= 1) {
      return [];
    }
    
    const header = rows[0].split('\t').map(h => h.trim());
    const orderSnIndex = header.indexOf('order_sn');
    const productInfoIndex = header.indexOf('product_info');

    if (orderSnIndex === -1 || productInfoIndex === -1) {
        console.error('Required columns (order_sn, product_info) not found in sheet.');
        return [];
    }

    const orderRows = rows.slice(1);

    const orders: Order[] = orderRows
      .map((row, index) => {
        const columns = row.split('\t');
        if (columns.length <= Math.max(orderSnIndex, productInfoIndex)) return null;

        const id = columns[orderSnIndex].trim();
        const productInfo = columns[productInfoIndex].trim();
        
        if (!id) return null;

        const products = parseProducts(productInfo);
        
        // This part runs on the server, so we can't access localStorage here.
        // We'll set the initial status to 'pending' and handle localStorage on the client.
        const status: OrderStatus = typeof window !== 'undefined' 
          ? (localStorage.getItem(`order_status_${id}`) as OrderStatus) || 'pending'
          : 'pending';

        return {
          id: id || `generated-id-${index}`,
          products,
          status,
        };
      })
      .filter((order): order is Order => order !== null && order.products.length > 0)
      // We set the status on the client, so we need to process it after fetching
      .map(order => {
         const clientStatus = typeof window !== 'undefined'
          ? (localStorage.getItem(`order_status_${order.id}`) as OrderStatus) || 'pending'
          : 'pending';
        return { ...order, status: clientStatus };
      });

    return orders.reverse(); // Show most recent orders first
  } catch (error) {
    console.error('Error fetching or parsing orders:', error);
    return [];
  }
}

export async function fetchToyStock(): Promise<ToyStockItem[]> {
  try {
    const response = await fetch(TOY_STOCK_DATA_URL, { next: { revalidate: 60 } });
    if (!response.ok) {
      console.error(`Failed to fetch toy stock data: ${response.statusText}`);
      return [];
    }
    const tsvData = await response.text();
    const rows = tsvData.trim().split('\n');

    if (rows.length <= 1) {
      return [];
    }

    const header = rows[0].split('\t').map(h => h.trim());
    const skuIndex = header.indexOf('SKU');
    const productIndex = header.indexOf('Produto');
    const quantityIndex = header.indexOf('Quantidade (und)');
    
    if (skuIndex === -1 || productIndex === -1 || quantityIndex === -1) {
      console.error('Required columns (SKU, Produto, Quantidade (und)) not found in toy stock sheet.');
      return [];
    }

    const stockRows = rows.slice(1);

    const stockItems: ToyStockItem[] = stockRows
      .map(row => {
        const columns = row.split('\t');
        
        if (columns.length <= Math.max(skuIndex, productIndex, quantityIndex)) return null;

        const sku = columns[skuIndex].trim();
        const product = columns[productIndex].trim();
        const quantityStr = columns[quantityIndex].trim();
        const quantity = parseInt(quantityStr, 10);

        if (!sku || !product || isNaN(quantity)) return null;
        
        return { sku, product, quantity };
      })
      .filter((item): item is ToyStockItem => item !== null);

    return stockItems;
  } catch (error) {
    console.error('Error fetching or parsing toy stock:', error);
    return [];
  }
}
