import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface InventoryItem {
  productId: string;
  productCode: string;
  productName: string;
  unit: string | null;
  basePrice: number;
  currentStock: number;
  category?: {
    id: string;
    name: string;
  };
  imageUrl?: string | null;
}

export interface StockMovement {
  id: string;
  date: Date;
  type: 'PURCHASE' | 'SALE';
  quantity: number;
  price: number;
  referenceNumber?: string;
  partner?: string; // Provider or Client name
}

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async getInventory(params?: {
    categoryId?: string;
    lowStock?: boolean;
    search?: string;
  }): Promise<InventoryItem[]> {
    // Get all products with filters
    const products = await this.prisma.product.findMany({
      where: {
        ...(params?.categoryId && { categoryId: params.categoryId }),
        ...(params?.search && {
          OR: [
            { name: { contains: params.search, mode: 'insensitive' } },
            { code: { contains: params.search, mode: 'insensitive' } },
          ],
        }),
      },
      include: {
        category: true,
      },
    });

    // Calculate stock for each product
    const inventory: InventoryItem[] = [];

    for (const product of products) {
      const stock = await this.getProductStock(product.id);

      // Apply low stock filter if requested
      if (params?.lowStock && stock > 10) continue;

      inventory.push({
        productId: product.id,
        productCode: product.code,
        productName: product.name,
        unit: product.measurementUnit,
        basePrice: Number(product.basePrice),
        currentStock: stock,
        category: product.category
          ? {
              id: product.category.id,
              name: product.category.name,
            }
          : undefined,
        imageUrl: product.imageUrl,
      });
    }

    return inventory;
  }

  async getProductMovements(productId: string): Promise<StockMovement[]> {
    // Get purchases for this product
    const purchaseItems = await this.prisma.purchaseItem.findMany({
      where: { productId },
      include: {
        purchase: {
          include: {
            provider: true,
          },
        },
      },
      orderBy: {
        purchase: {
          date: 'desc',
        },
      },
    });

    // Get sales for this product
    const saleItems = await this.prisma.saleItem.findMany({
      where: { productId },
      include: {
        sale: {
          include: {
            client: true,
          },
        },
      },
      orderBy: {
        sale: {
          date: 'desc',
        },
      },
    });

    // Combine and sort movements
    const movements: StockMovement[] = [];

    purchaseItems.forEach((item) => {
      movements.push({
        id: item.id,
        date: item.purchase.date,
        type: 'PURCHASE',
        quantity: Number(item.quantity),
        price: Number(item.purchasePrice),
        referenceNumber: item.purchase.referenceNumber,
        partner: item.purchase.provider.name,
      });
    });

    saleItems.forEach((item) => {
      movements.push({
        id: item.id,
        date: item.sale.date,
        type: 'SALE',
        quantity: Number(item.quantity),
        price: Number(item.salePrice),
        referenceNumber: item.sale.referenceNumber || undefined,
        partner: item.sale.client.name,
      });
    });

    // Sort by date descending
    movements.sort((a, b) => b.date.getTime() - a.date.getTime());

    return movements;
  }

  async getProductStock(productId: string): Promise<number> {
    // Get total purchased
    const purchases = await this.prisma.purchaseItem.aggregate({
      where: { productId },
      _sum: { quantity: true },
    });

    // Get total sold
    const sales = await this.prisma.saleItem.aggregate({
      where: { productId },
      _sum: { quantity: true },
    });

    const totalPurchased = purchases._sum.quantity || 0;
    const totalSold = sales._sum.quantity || 0;

    return Number(totalPurchased) - Number(totalSold);
  }

  async getLowStockProducts(threshold = 10): Promise<InventoryItem[]> {
    return this.getInventory({ lowStock: true });
  }
}
