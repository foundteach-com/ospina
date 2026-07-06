import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

export interface InventoryItem {
  productId: string;
  productCode: string;
  productName: string;
  unit: string | null;
  measurementQuantity: number | null;
  basePrice: number;
  salesIvaPercent: number;
  purchasePrice: number;
  purchaseIvaPercent: number;
  brand: string | null;
  providerName: string | null;
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
  type: 'PURCHASE' | 'SALE' | 'INTERNAL_USE' | 'OWNER_WITHDRAWAL' | 'INITIAL_BALANCE';
  quantity: number;
  price: number;
  referenceNumber?: string;
  partner?: string; // Provider, Client name, or Internal description
}

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async getInventory(params?: {
    categoryId?: string;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: InventoryItem[]; total: number; page: number; totalPages: number }> {
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const offset = (page - 1) * limit;

    const filters: Prisma.Sql[] = [];
    if (params?.categoryId) {
      filters.push(Prisma.sql`p."categoryId" = ${params.categoryId}`);
    }
    if (params?.search) {
      filters.push(Prisma.sql`(p.name ILIKE ${'%' + params.search + '%'} OR p.code ILIKE ${'%' + params.search + '%'})`);
    }

    const whereClause = filters.length > 0 ? Prisma.sql`WHERE ${Prisma.join(filters, ' AND ')}` : Prisma.empty;
    
    let havingClause = Prisma.empty;
    if (params?.status) {
      if (params.status === 'AGOTADO') {
        havingClause = Prisma.sql`WHERE "currentStock" <= 0`;
      } else if (params.status === 'BAJO') {
        havingClause = Prisma.sql`WHERE "currentStock" > 0 AND "currentStock" <= 10`;
      } else if (params.status === 'MEDIO') {
        havingClause = Prisma.sql`WHERE "currentStock" > 10 AND "currentStock" < 50`;
      } else if (params.status === 'ALTO') {
        havingClause = Prisma.sql`WHERE "currentStock" >= 50`;
      }
    }

    const countQuery = Prisma.sql`
      WITH StockCalculated AS (
        SELECT 
          p.id,
          COALESCE((SELECT SUM(quantity) FROM "PurchaseItem" WHERE "productId" = p.id), 0) -
          COALESCE((SELECT SUM(quantity) FROM "SaleItem" WHERE "productId" = p.id), 0) +
          COALESCE((SELECT SUM(CASE WHEN m.type = 'INITIAL_BALANCE' THEN i.quantity ELSE -i.quantity END) FROM "InternalMovementItem" i JOIN "InternalMovement" m ON i."internalMovementId" = m.id WHERE i."productId" = p.id), 0) as "currentStock"
        FROM "Product" p
        ${whereClause}
      )
      SELECT COUNT(*) as total FROM StockCalculated
      ${havingClause}
    `;

    const dataQuery = Prisma.sql`
      WITH StockCalculated AS (
        SELECT 
          p.id as "productId",
          p.code as "productCode",
          p.name as "productName",
          p."measurementUnit" as unit,
          p."measurementQuantity",
          p."basePrice",
          p."salesIvaPercent",
          p."purchasePrice",
          p."purchaseIvaPercent",
          p.brand,
          p."imageUrl",
          c.id as "categoryId",
          c.name as "categoryName",
          prov.name as "providerName",
          COALESCE((SELECT SUM(quantity) FROM "PurchaseItem" WHERE "productId" = p.id), 0) -
          COALESCE((SELECT SUM(quantity) FROM "SaleItem" WHERE "productId" = p.id), 0) +
          COALESCE((SELECT SUM(CASE WHEN m.type = 'INITIAL_BALANCE' THEN i.quantity ELSE -i.quantity END) FROM "InternalMovementItem" i JOIN "InternalMovement" m ON i."internalMovementId" = m.id WHERE i."productId" = p.id), 0) as "currentStock"
        FROM "Product" p
        LEFT JOIN "Category" c ON p."categoryId" = c.id
        LEFT JOIN "Provider" prov ON p."providerId" = prov.id
        ${whereClause}
      )
      SELECT * FROM StockCalculated
      ${havingClause}
      ORDER BY "productName" ASC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const [countResult, dataResult] = await Promise.all([
      this.prisma.$queryRaw<any[]>(countQuery),
      this.prisma.$queryRaw<any[]>(dataQuery),
    ]);

    const total = Number(countResult[0]?.total || 0);

    const data: InventoryItem[] = dataResult.map(row => ({
      productId: row.productId,
      productCode: row.productCode,
      productName: row.productName,
      unit: row.unit,
      measurementQuantity: row.measurementQuantity ? Number(row.measurementQuantity) : null,
      basePrice: Number(row.basePrice),
      salesIvaPercent: Number(row.salesIvaPercent),
      purchasePrice: Number(row.purchasePrice),
      purchaseIvaPercent: Number(row.purchaseIvaPercent),
      brand: row.brand,
      providerName: row.providerName,
      currentStock: Number(row.currentStock),
      imageUrl: row.imageUrl,
      category: row.categoryId ? {
        id: row.categoryId,
        name: row.categoryName,
      } : undefined,
    }));

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getInventoryStats(): Promise<{ high: number; medium: number; low: number; outOfStock: number }> {
    const query = Prisma.sql`
      WITH StockCalculated AS (
        SELECT 
          COALESCE((SELECT SUM(quantity) FROM "PurchaseItem" WHERE "productId" = p.id), 0) -
          COALESCE((SELECT SUM(quantity) FROM "SaleItem" WHERE "productId" = p.id), 0) +
          COALESCE((SELECT SUM(CASE WHEN m.type = 'INITIAL_BALANCE' THEN i.quantity ELSE -i.quantity END) FROM "InternalMovementItem" i JOIN "InternalMovement" m ON i."internalMovementId" = m.id WHERE i."productId" = p.id), 0) as "currentStock"
        FROM "Product" p
      )
      SELECT 
        CAST(SUM(CASE WHEN "currentStock" >= 50 THEN 1 ELSE 0 END) AS INTEGER) as high,
        CAST(SUM(CASE WHEN "currentStock" >= 10 AND "currentStock" < 50 THEN 1 ELSE 0 END) AS INTEGER) as medium,
        CAST(SUM(CASE WHEN "currentStock" > 0 AND "currentStock" < 10 THEN 1 ELSE 0 END) AS INTEGER) as low,
        CAST(SUM(CASE WHEN "currentStock" <= 0 THEN 1 ELSE 0 END) AS INTEGER) as "outOfStock"
      FROM StockCalculated
    `;
    const result = await this.prisma.$queryRaw<any[]>(query);
    
    if (!result || result.length === 0) {
      return { high: 0, medium: 0, low: 0, outOfStock: 0 };
    }
    
    return {
      high: Number(result[0].high || 0),
      medium: Number(result[0].medium || 0),
      low: Number(result[0].low || 0),
      outOfStock: Number(result[0].outofstock || result[0].outOfStock || 0),
    };
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

    // Get internal movements for this product
    const internalMovementItems = await this.prisma.internalMovementItem.findMany({
      where: { productId },
      include: {
        internalMovement: true,
      },
      orderBy: {
        internalMovement: {
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

    internalMovementItems.forEach((item) => {
      movements.push({
        id: item.id,
        date: item.internalMovement.date,
        type: item.internalMovement.type as 'INTERNAL_USE' | 'OWNER_WITHDRAWAL',
        quantity: Number(item.quantity),
        price: Number(item.unitPrice) || 0,
        referenceNumber: undefined,
        partner: item.internalMovement.description || undefined,
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

    // Get total internal movements
    const internalMovements = await this.prisma.internalMovementItem.aggregate({
      where: { productId },
      _sum: { quantity: true },
    });

    const totalPurchased = purchases._sum.quantity || 0;
    const totalSold = sales._sum.quantity || 0;
    const totalInternal = internalMovements._sum.quantity || 0;

    return Number(totalPurchased) - Number(totalSold) - Number(totalInternal);
  }

  async getLowStockProducts(limit: number = 10) {
    return this.getInventory({ status: 'BAJO', limit });
  }
}
