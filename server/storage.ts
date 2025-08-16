import { eq, desc, sql } from 'drizzle-orm';
import { db } from './db';
import { queries, customers, categories, products, orders, orderItems, type Query, type InsertQuery } from '@shared/schema';

export interface IStorage {
  getQuery(id: string): Promise<Query | undefined>;
  getAllQueries(): Promise<Query[]>;
  createQuery(insertQuery: InsertQuery, response: string): Promise<Query>;
  
  // New methods for querying e-commerce data
  getAllCustomers(): Promise<any[]>;
  getAllProducts(): Promise<any[]>;
  getAllOrders(): Promise<any[]>;
  executeCustomQuery(sqlQuery: string): Promise<any[]>;
}

export class DatabaseStorage implements IStorage {
  async getQuery(id: string): Promise<Query | undefined> {
    const result = await db.select().from(queries).where(eq(queries.id, id)).limit(1);
    return result[0];
  }

  async getAllQueries(): Promise<Query[]> {
    return db.select().from(queries).orderBy(desc(queries.createdAt));
  }

  async createQuery(insertQuery: InsertQuery, response: string): Promise<Query> {
    const result = await db.insert(queries).values({
      ...insertQuery,
      response
    }).returning();
    
    return result[0];
  }

  // E-commerce data methods
  async getAllCustomers(): Promise<any[]> {
    return db.select().from(customers).orderBy(desc(customers.createdAt));
  }

  async getAllProducts(): Promise<any[]> {
    return db.select({
      id: products.id,
      name: products.name,
      description: products.description,
      categoryName: categories.name,
      price: products.price,
      stockQuantity: products.stockQuantity,
      isActive: products.isActive
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .orderBy(products.name);
  }

  async getAllOrders(): Promise<any[]> {
    return db.select({
      id: orders.id,
      customerName: sql`${customers.firstName} || ' ' || ${customers.lastName}`,
      customerEmail: customers.email,
      orderDate: orders.orderDate,
      status: orders.status,
      totalAmount: orders.totalAmount,
      shippingAddress: orders.shippingAddress
    })
    .from(orders)
    .leftJoin(customers, eq(orders.customerId, customers.id))
    .orderBy(desc(orders.orderDate));
  }

  async executeCustomQuery(sqlQuery: string): Promise<any[]> {
    // Execute custom SQL queries
    // Note: In production, you'd want to sanitize and validate this heavily
    try {
      const result = await db.execute(sqlQuery);
      return result;
    } catch (error) {
      console.error('Error executing custom query:', error);
      throw error;
    }
  }
}

export const storage = new DatabaseStorage();
