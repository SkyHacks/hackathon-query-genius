# QueryGenius

A natural language query interface for e-commerce data analysis.

## Features

- **Natural Language Queries**: Ask questions about your data in plain English
- **E-commerce Dataset**: Sample data including customers, products, orders, and categories
- **Real-time Analysis**: Get instant insights from your business data
- **Modern UI**: Built with React, TypeScript, and Tailwind CSS

## Database Setup

The application includes a comprehensive e-commerce dataset with the following tables:

- **Customers**: Customer information with registration dates and locations
- **Categories**: Product categories (Electronics, Books, Clothing, etc.)
- **Products**: Product catalog with pricing and inventory
- **Orders**: Customer orders with status and totals
- **Order Items**: Individual items within orders

### Setup Steps

1. **Push Schema Changes**:
   ```bash
   npm run db:push
   ```

2. **Seed the Database**:
   ```bash
   npm run db:seed
   ```

This will populate your database with:
- 10 customers across different US cities
- 6 product categories
- 16 products with realistic pricing
- 10 orders with various statuses
- Detailed order items showing purchase history

## Sample Queries

You can ask questions like:

- "Show me the top 5 customers by total spending"
- "What are our best-selling products this quarter?"
- "Which cities generate the most revenue?"
- "Show me customers who haven't ordered in the last 30 days"
- "What's the average order value by category?"

## API Endpoints

- `POST /api/queries` - Submit a natural language query
- `GET /api/queries` - Get all previous queries
- `GET /api/customers` - Get all customers
- `GET /api/products` - Get all products with categories
- `GET /api/orders` - Get all orders with customer details

## Development

```bash
npm run dev
```

The application will be available at `http://localhost:3000` 