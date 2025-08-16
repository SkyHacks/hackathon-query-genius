# QueryGenius E-commerce Database Schema

This document describes the database schema for the QueryGenius e-commerce application. This schema can be shared with AI agents to help them understand the data structure and generate appropriate queries.

## Database Overview

The database contains e-commerce data with 5 main tables:
- `queries` - Stores user queries and AI responses
- `customers` - Customer information and demographics
- `categories` - Product categories
- `products` - Product catalog with inventory
- `orders` - Customer orders
- `order_items` - Individual items within orders

## Table Schemas

### 1. queries
Stores natural language queries submitted by users and their AI-generated responses.

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| `id` | VARCHAR | Unique identifier | PRIMARY KEY, auto-generated UUID |
| `question` | TEXT | User's natural language question | NOT NULL |
| `response` | TEXT | AI-generated response | NOT NULL |
| `created_at` | TIMESTAMP | When the query was created | NOT NULL, auto-generated |

**Sample Data:**
- Questions like "What are our top selling products?" or "Who are our best customers?"
- Responses contain AI-generated insights about the e-commerce data

### 2. customers
Customer information including demographics and registration details.

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| `id` | SERIAL | Unique identifier | PRIMARY KEY, auto-increment |
| `first_name` | VARCHAR(100) | Customer's first name | NOT NULL |
| `last_name` | VARCHAR(100) | Customer's last name | NOT NULL |
| `email` | VARCHAR(255) | Customer's email address | NOT NULL, UNIQUE |
| `city` | VARCHAR(100) | Customer's city | NULL |
| `state` | VARCHAR(100) | Customer's state/province | NULL |
| `country` | VARCHAR(100) | Customer's country | NULL |
| `registration_date` | DATE | When customer registered | NOT NULL |
| `created_at` | TIMESTAMP | Record creation timestamp | NOT NULL, auto-generated |

**Sample Data:**
- 10 customers from different US cities (New York, Los Angeles, Chicago, etc.)
- Registration dates span from 2023-01-15 to 2023-10-22

### 3. categories
Product categories for organizing the product catalog.

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| `id` | SERIAL | Unique identifier | PRIMARY KEY, auto-increment |
| `name` | VARCHAR(100) | Category name | NOT NULL |
| `description` | TEXT | Category description | NULL |
| `created_at` | TIMESTAMP | Record creation timestamp | NOT NULL, auto-generated |

**Categories:**
- Electronics (Electronic devices and gadgets)
- Books (Physical and digital books)
- Clothing (Fashion and apparel)
- Home & Garden (Home improvement and gardening supplies)
- Sports (Sports equipment and accessories)
- Beauty (Cosmetics and personal care)

### 4. products
Product catalog with pricing, inventory, and category information.

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| `id` | SERIAL | Unique identifier | PRIMARY KEY, auto-increment |
| `name` | VARCHAR(255) | Product name | NOT NULL |
| `description` | TEXT | Product description | NULL |
| `category_id` | INTEGER | Reference to categories table | FOREIGN KEY to categories.id |
| `price` | DECIMAL(10,2) | Product price | NOT NULL |
| `stock_quantity` | INTEGER | Available inventory | NOT NULL, default 0 |
| `is_active` | INTEGER | Whether product is active | NOT NULL, default 1 (1=active, 0=inactive) |
| `created_at` | TIMESTAMP | Record creation timestamp | NOT NULL, auto-generated |

**Sample Products:**
- Electronics: iPhone 15 Pro ($999.99), Samsung Galaxy S24 ($899.99), MacBook Air M3 ($1199.99)
- Books: The Psychology of Money ($16.99), Atomic Habits ($18.99)
- Clothing: Nike Air Max 270 ($149.99), Levi's 501 Jeans ($89.99)
- Home & Garden: Dyson V15 Detect ($749.99), Instant Pot Duo ($79.99)
- Sports: Peloton Bike+ ($2495.00), YETI Rambler ($34.99)
- Beauty: Fenty Beauty Foundation ($38.00), The Ordinary Niacinamide ($7.99)

### 5. orders
Customer orders with status, totals, and shipping information.

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| `id` | SERIAL | Unique identifier | PRIMARY KEY, auto-increment |
| `customer_id` | INTEGER | Reference to customers table | NOT NULL, FOREIGN KEY to customers.id |
| `order_date` | DATE | When the order was placed | NOT NULL |
| `status` | VARCHAR(50) | Order status | NOT NULL, default 'pending' |
| `total_amount` | DECIMAL(10,2) | Total order value | NOT NULL |
| `shipping_address` | TEXT | Shipping address | NULL |
| `created_at` | TIMESTAMP | Record creation timestamp | NOT NULL, auto-generated |

**Order Statuses:**
- pending
- processing
- shipped
- completed

**Sample Data:**
- 10 orders with various statuses and realistic totals
- Order dates span from 2024-01-15 to 2024-04-01
- Total amounts range from $35.98 to $2495.00

### 6. order_items
Individual items within orders, linking products to orders with quantities and prices.

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| `id` | SERIAL | Unique identifier | PRIMARY KEY, auto-increment |
| `order_id` | INTEGER | Reference to orders table | NOT NULL, FOREIGN KEY to orders.id |
| `product_id` | INTEGER | Reference to products table | NOT NULL, FOREIGN KEY to products.id |
| `quantity` | INTEGER | Quantity ordered | NOT NULL |
| `unit_price` | DECIMAL(10,2) | Price per unit at time of order | NOT NULL |
| `created_at` | TIMESTAMP | Record creation timestamp | NOT NULL, auto-generated |

## Relationships

```
customers (1) ←→ (many) orders
categories (1) ←→ (many) products
orders (1) ←→ (many) order_items
products (1) ←→ (many) order_items
```

## Sample Queries for AI Agents

Here are some example natural language queries that can be asked about this data:

### Customer Analysis
- "Who are our top 5 customers by total spending?"
- "Show me customers from California"
- "Which cities generate the most revenue?"
- "How many customers registered in 2023?"

### Product Analysis
- "What are our best-selling products?"
- "Which products are low in stock?"
- "Show me products in the Electronics category"
- "What's the average product price by category?"

### Order Analysis
- "What's the average order value?"
- "Show me orders from last month"
- "Which order statuses are most common?"
- "What's our total revenue this year?"

### Inventory Analysis
- "Which products need restocking?"
- "What's our total inventory value?"
- "Show me products with less than 50 units in stock"

### Cross-Table Analysis
- "Which customers buy the most expensive products?"
- "What categories do our best customers prefer?"
- "Show me the order history for Alice Johnson"
- "What's the revenue breakdown by category?"

## Data Insights

The database contains realistic e-commerce data with:
- **10 customers** across different US cities
- **6 product categories** with diverse pricing
- **16 products** ranging from $7.99 to $2,495.00
- **10 orders** with various statuses and realistic totals
- **14 order items** showing detailed purchase history

Key patterns in the data:
- Electronics products have the highest individual prices
- Books have the highest stock quantities
- Alice Johnson is a repeat customer with multiple orders
- Order statuses include pending, processing, shipped, and completed
- Most customers are from major US cities

This schema enables comprehensive business intelligence queries and natural language analysis of the e-commerce operations. 