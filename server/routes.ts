import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertQuerySchema } from "@shared/schema";
import { z } from "zod";

/**
 * Helper function to retrieve content from a Google Sheets public URL
 * @param sheetId - The Google Sheets ID (extracted from the URL)
 * @returns Promise<{ success: boolean; data?: any[][]; error?: string }>
 */
async function getGoogleSheetContent(sheetId: string): Promise<{ success: boolean; data?: any[][]; error?: string }> {
  try {
    // Validate sheet ID format
    if (!sheetId || !/^[a-zA-Z0-9-_]+$/.test(sheetId)) {
      return { success: false, error: "Invalid Google Sheets ID format" };
    }
    
    // Convert to CSV format for easier parsing
    const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv`;
    
    const response = await fetch(csvUrl);
    
    if (!response.ok) {
      return { 
        success: false, 
        error: `Failed to fetch sheet: ${response.status} ${response.statusText}` 
      };
    }
    
    const csvText = await response.text();
    
    // Parse CSV content
    const rows = csvText
      .split('\n')
      .filter(row => row.trim() !== '')
      .map(row => {
        // Simple CSV parsing - handles basic cases
        const cells = [];
        let currentCell = '';
        let inQuotes = false;
        
        for (let i = 0; i < row.length; i++) {
          const char = row[i];
          
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            cells.push(currentCell.trim());
            currentCell = '';
          } else {
            currentCell += char;
          }
        }
        
        // Add the last cell
        cells.push(currentCell.trim());
        return cells;
      });
    
    return { success: true, data: rows };
    
  } catch (error) {
    console.error('Error fetching Google Sheet:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  const MAKE_WEBHOOK_URL = 'https://hook.us1.make.celonis.com/kpvro5no8bro2r7u6supwusbqg5y71hl';

  // Process BI query with Make webhook
  app.post("/api/queries", async (req, res) => {
    try {
      const { question } = insertQuerySchema.parse(req.body);
      
      if (!question.trim()) {
        return res.status(400).json({ message: "Question cannot be empty" });
      }

      if (question.trim().length < 10) {
        return res.status(400).json({ message: "Please enter a more detailed question (at least 10 characters)" });
      }

      // First, check if this is a Netflix stock query
      const netflixCheckResponse = await fetch(MAKE_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: `You are an AI assistant that determines if a user question is about Netflix stock price.

Analyze the following question and determine if it's asking about Netflix stock price, Netflix stock data, Netflix share price, or any Netflix stock market information.

Examples of Netflix stock queries:
- "What is Netflix stock price?"
- "How is Netflix performing in the stock market?"
- "Show me Netflix stock data"
- "What's the current Netflix share price?"
- "Netflix stock performance"
- "Netflix stock price today"

Examples of non-Netflix stock queries:
- "What are our top selling products?"
- "Who are our best customers?"
- "Show me customer data"
- "What's the revenue breakdown?"

Respond ONLY with a JSON object in this exact format:
{"isNetflixQuery": boolean}

Here is the user's question: ${question}`,
          timestamp: new Date().toISOString(),
          source: 'querygenius'
        })
      });

      if (!netflixCheckResponse.ok) {
        console.error('Netflix check error:', netflixCheckResponse.status, netflixCheckResponse.statusText);
        return res.status(500).json({ 
          message: "Error checking query type",
          error: `Netflix check returned ${netflixCheckResponse.status}`
        });
      }

      let isNetflixQuery = false;
      try {
        const netflixCheckData = await netflixCheckResponse.json();
        isNetflixQuery = netflixCheckData.isNetflixQuery === true;
      } catch (error) {
        console.error('Error parsing Netflix check response:', error);
        // Continue with regular flow if parsing fails
      }

      // If it's a Netflix query, use Google Sheets data
      if (isNetflixQuery) {
        const netflixData = await getGoogleSheetContent('1R3WZmdV9jHVuHaAWSgMgo2oCSeyGcHIIkioqDqWWf-g');
        
        if (!netflixData.success) {
          return res.status(500).json({ 
            message: "Error fetching Netflix stock data",
            error: netflixData.error 
          });
        }

        // Format the Netflix data response
        const formatResponse = await fetch(MAKE_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: `You are an AI assistant that converts Netflix stock data into beautiful markdown reports.

Example responses:
${JSON.stringify([
  {"response":"Based on the sales data analysis, the top selling products last quarter were:\n\n1. **Premium Widget Pro** - 1,247 units sold ($62,350 revenue)\n2. **Standard Widget** - 982 units sold ($29,460 revenue)\n3. **Widget Accessories Kit** - 756 units sold ($15,120 revenue)\n\nThe Premium Widget Pro showed a 23% increase compared to the previous quarter, indicating strong market demand for premium features."},
  {"response":"The customer satisfaction metrics show:\n\n• **Overall satisfaction score:** 4.2/5.0\n• **Net Promoter Score:** 68\n• **Customer retention rate:** 87%\n\nKey insights: Customer satisfaction improved by 12% this quarter, primarily driven by faster response times and enhanced product quality. The main areas for improvement are shipping speed and product documentation."},
  {"response":"Revenue analysis reveals:\n\n• **Total revenue:** $2.4M (↑18% YoY)\n• **Monthly recurring revenue:** $450K\n• **Average deal size:** $3,200\n\nGrowth drivers include expansion in the enterprise segment and successful launch of the premium tier. The subscription model continues to show strong momentum with 95% renewal rates."},
  {"response":"The conversion funnel analysis shows:\n\n• **Website visitors:** 45,200\n• **Lead generation:** 3,840 (8.5% conversion)\n• **Qualified leads:** 1,920 (50% of leads)\n• **Closed deals:** 384 (20% close rate)\n\nRecommendations: Focus on improving lead qualification process and consider A/B testing the pricing page to increase conversion rates."},
  {"response":"Employee productivity metrics indicate:\n\n• **Average tasks completed per day:** 12.3\n• **Project completion rate:** 94%\n• **Team collaboration score:** 4.1/5.0\n• **Time to resolution:** 2.4 hours average\n\nProductivity has increased 15% since implementing the new project management system. Remote workers show 8% higher efficiency than in-office workers."}
])}

Original question: ${question}
Stock data: ${JSON.stringify(netflixData.data)}

Please format this into a beautiful markdown report similar to the examples above. The response should be a JSON objet with a key of 'response' and a value of the markdown report.`,
            timestamp: new Date().toISOString(),
            source: 'querygenius'
          })
        });

        if (formatResponse.ok) {
          const formatData = await formatResponse.json();
          const finalResponse = formatData.response || formatData.message || JSON.stringify(formatData);
          const query = await storage.createQuery({ question }, finalResponse);
          return res.json(query);
        } else {
          // Fallback response if formatting fails
          const fallbackResponse = `Netflix Stock Data Analysis\n\nBased on the available data:\n\n${netflixData.data?.map(row => row.join(' | ')).join('\n')}`;
          const query = await storage.createQuery({ question }, fallbackResponse);
          return res.json(query);
        }
      }

      // Regular e-commerce database query flow
      const makeResponse = await fetch(MAKE_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: `You are an AI assistant that converts user requests into structured API queries.  

# QueryGenius E-commerce Database Schema

This document describes the database schema for the QueryGenius e-commerce application. This schema can be shared with AI agents to help them understand the data structure and generate appropriate queries.

## Database Overview

The database contains e-commerce data with 5 main tables:
- \`queries\` - Stores user queries and AI responses
- \`customers\` - Customer information and demographics
- \`categories\` - Product categories
- \`products\` - Product catalog with inventory
- \`orders\` - Customer orders
- \`order_items\` - Individual items within orders

## Table Schemas

### 1. queries
Stores natural language queries submitted by users and their AI-generated responses.

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| \`id\` | VARCHAR | Unique identifier | PRIMARY KEY, auto-generated UUID |
| \`question\` | TEXT | User's natural language question | NOT NULL |
| \`response\` | TEXT | AI-generated response | NOT NULL |
| \`created_at\` | TIMESTAMP | When the query was created | NOT NULL, auto-generated |

**Sample Data:**
- Questions like "What are our top selling products?" or "Who are our best customers?"
- Responses contain AI-generated insights about the e-commerce data

### 2. customers
Customer information including demographics and registration details.

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| \`id\` | SERIAL | Unique identifier | PRIMARY KEY, auto-increment |
| \`first_name\` | VARCHAR(100) | Customer's first name | NOT NULL |
| \`last_name\` | VARCHAR(100) | Customer's last name | NOT NULL |
| \`email\` | VARCHAR(255) | Customer's email address | NOT NULL, UNIQUE |
| \`city\` | VARCHAR(100) | Customer's city | NULL |
| \`state\` | VARCHAR(100) | Customer's state/province | NULL |
| \`country\` | VARCHAR(100) | Customer's country | NULL |
| \`registration_date\` | DATE | When customer registered | NOT NULL |
| \`created_at\` | TIMESTAMP | Record creation timestamp | NOT NULL, auto-generated |

**Sample Data:**
- 10 customers from different US cities (New York, Los Angeles, Chicago, etc.)
- Registration dates span from 2023-01-15 to 2023-10-22

### 3. categories
Product categories for organizing the product catalog.

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| \`id\` | SERIAL | Unique identifier | PRIMARY KEY, auto-increment |
| \`name\` | VARCHAR(100) | Category name | NOT NULL |
| \`description\` | TEXT | Category description | NULL |
| \`created_at\` | TIMESTAMP | Record creation timestamp | NOT NULL, auto-generated |

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
| \`id\` | SERIAL | Unique identifier | PRIMARY KEY, auto-increment |
| \`name\` | VARCHAR(255) | Product name | NOT NULL |
| \`description\` | TEXT | Product description | NULL |
| \`category_id\` | INTEGER | Reference to categories table | FOREIGN KEY to categories.id |
| \`price\` | DECIMAL(10,2) | Product price | NOT NULL |
| \`stock_quantity\` | INTEGER | Available inventory | NOT NULL, default 0 |
| \`is_active\` | INTEGER | Whether product is active | NOT NULL, default 1 (1=active, 0=inactive) |
| \`created_at\` | TIMESTAMP | Record creation timestamp | NOT NULL, auto-generated |

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
| \`id\` | SERIAL | Unique identifier | PRIMARY KEY, auto-increment |
| \`customer_id\` | INTEGER | Reference to customers table | NOT NULL, FOREIGN KEY to customers.id |
| \`order_date\` | DATE | When the order was placed | NOT NULL |
| \`status\` | VARCHAR(50) | Order status | NOT NULL, default 'pending' |
| \`total_amount\` | DECIMAL(10,2) | Total order value | NOT NULL |
| \`shipping_address\` | TEXT | Shipping address | NULL |
| \`created_at\` | TIMESTAMP | Record creation timestamp | NOT NULL, auto-generated |

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
| \`id\` | SERIAL | Unique identifier | PRIMARY KEY, auto-increment |
| \`order_id\` | INTEGER | Reference to orders table | NOT NULL, FOREIGN KEY to orders.id |
| \`product_id\` | INTEGER | Reference to products table | NOT NULL, FOREIGN KEY to products.id |
| \`quantity\` | INTEGER | Quantity ordered | NOT NULL |
| \`unit_price\` | DECIMAL(10,2) | Price per unit at time of order | NOT NULL |
| \`created_at\` | TIMESTAMP | Record creation timestamp | NOT NULL, auto-generated |

## Relationships

\`\`\`
customers (1) ←→ (many) orders
categories (1) ←→ (many) products
orders (1) ←→ (many) order_items
products (1) ←→ (many) order_items
\`\`\`

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
Rules:
1. I want actual SQL quereies. Do not give me anything else.

2. Only include parameters that are relevant to the user request.  
3. Do NOT add extra fields.  
4. Do NOT provide natural language in the response—only JSON.  
5. If the request cannot be fulfilled, return:
{
  "error": "Cannot generate query for this request"
}
Here is the user's question: ${question}`,
          timestamp: new Date().toISOString(),
          source: 'querygenius'
        })
      });

      if (!makeResponse.ok) {
        console.error('Make webhook error:', makeResponse.status, makeResponse.statusText);
        return res.status(500).json({ 
          message: "Error calling external service",
          error: `Make webhook returned ${makeResponse.status}`
        });
      }

      // Get the response from Make - handle both JSON and plain text
      let response;
      const contentType = makeResponse.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        const makeData = await makeResponse.json();
        response = makeData.response || makeData.message || JSON.stringify(makeData);
      } else {
        // Handle plain text response (like "Accepted")
        response = await makeResponse.text();
      }

      // Try to parse SQL query from the response
      let sqlQuery = null;
      let queryResults = null;
      
      try {
        const parsedResponse = JSON.parse(response);
        if (parsedResponse.query) {
          sqlQuery = parsedResponse.query;
          // Execute the SQL query
          queryResults = await storage.executeCustomQuery(sqlQuery);
        }
      } catch (parseError) {
        // Response is not JSON or doesn't contain a query, use as-is
        console.log('Response is not a JSON query, using as-is:', response);
      }
      
      // Create the final response text
      let finalResponse = response;
      if (sqlQuery && queryResults) {
        // Make second webhook call to format results
        const formatResponse = await fetch(MAKE_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: `You are an AI assistant that converts database query results into beautiful markdown reports.

Example responses:
${JSON.stringify([
  {"response":"Based on the sales data analysis, the top selling products last quarter were:\n\n1. **Premium Widget Pro** - 1,247 units sold ($62,350 revenue)\n2. **Standard Widget** - 982 units sold ($29,460 revenue)\n3. **Widget Accessories Kit** - 756 units sold ($15,120 revenue)\n\nThe Premium Widget Pro showed a 23% increase compared to the previous quarter, indicating strong market demand for premium features."},
  {"response":"The customer satisfaction metrics show:\n\n• **Overall satisfaction score:** 4.2/5.0\n• **Net Promoter Score:** 68\n• **Customer retention rate:** 87%\n\nKey insights: Customer satisfaction improved by 12% this quarter, primarily driven by faster response times and enhanced product quality. The main areas for improvement are shipping speed and product documentation."},
  {"response":"Revenue analysis reveals:\n\n• **Total revenue:** $2.4M (↑18% YoY)\n• **Monthly recurring revenue:** $450K\n• **Average deal size:** $3,200\n\nGrowth drivers include expansion in the enterprise segment and successful launch of the premium tier. The subscription model continues to show strong momentum with 95% renewal rates."},
  {"response":"The conversion funnel analysis shows:\n\n• **Website visitors:** 45,200\n• **Lead generation:** 3,840 (8.5% conversion)\n• **Qualified leads:** 1,920 (50% of leads)\n• **Closed deals:** 384 (20% close rate)\n\nRecommendations: Focus on improving lead qualification process and consider A/B testing the pricing page to increase conversion rates."},
  {"response":"Employee productivity metrics indicate:\n\n• **Average tasks completed per day:** 12.3\n• **Project completion rate:** 94%\n• **Team collaboration score:** 4.1/5.0\n• **Time to resolution:** 2.4 hours average\n\nProductivity has increased 15% since implementing the new project management system. Remote workers show 8% higher efficiency than in-office workers."}
])}

Original question: ${question}
Database results: ${JSON.stringify(queryResults)}

Please format this into a beautiful markdown report similar to the examples above. The response should be a JSON objet with a key of 'response' and a value of the markdown report.`,
            timestamp: new Date().toISOString(),
            source: 'querygenius'
          })
        });

        if (formatResponse.ok) {
          const formatData = await formatResponse.json();
          finalResponse = formatData.response || formatData.message || JSON.stringify(formatData);
        } else {
          finalResponse = `SQL Query: ${sqlQuery}\n\nResults:\n${JSON.stringify(queryResults, null, 2)}`;
        }
      }
      
      const query = await storage.createQuery({ question }, finalResponse);
      
      res.json(query);
    } catch (error) {
      console.error('Error processing query:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get all queries
  app.get("/api/queries", async (req, res) => {
    try {
      const queries = await storage.getAllQueries();
      res.json(queries);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // New e-commerce data endpoints
  app.get("/api/customers", async (req, res) => {
    try {
      const customers = await storage.getAllCustomers();
      res.json(customers);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getAllProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/orders", async (req, res) => {
    try {
      const orders = await storage.getAllOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
