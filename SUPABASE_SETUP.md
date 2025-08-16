# Supabase Integration Setup

This application now includes Supabase integration for querying external data. Here's how to set it up:

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# OpenAI API Key (already configured)
my_first_chatgpt_api_token='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'

# Supabase Configuration
SUPABASE_KEY=your_supabase_anon_key_here

# Server Configuration
PORT=3000
NODE_ENV=development
```

## Getting Your Supabase Key

1. Go to your Supabase project dashboard
2. Navigate to Settings > API
3. Copy the "anon public" key (not the service_role key)
4. Replace `your_supabase_anon_key_here` with your actual key

## How It Works

The Supabase integration provides:

1. **Natural Language to Query**: Uses OpenAI to convert your questions into Supabase REST API queries
2. **Data Fetching**: Executes the generated queries against your Supabase database
3. **AI Analysis**: Analyzes the fetched data and provides insights in markdown format

## Available Tables

The system is configured to work with these tables:
- `transactions`: id, amount, date, customer_id, product_id, status
- `customers`: id, name, email, city, country, created_at
- `products`: id, name, price, category, stock_quantity
- `categories`: id, name, description

## Example Queries

- "Show me all transactions"
- "Get customers with their transactions"
- "Top 10 transactions by amount"
- "Transactions from last month"

## Usage

1. Start the development server: `npm run dev`
2. Open the application in your browser
3. Click on the "Supabase Data" tab
4. Ask questions about your data in natural language
5. The system will generate queries, fetch data, and provide analysis

## API Endpoints

- `POST /api/supabase-query`: Process Supabase queries
- `GET /api/queries`: Get all stored queries (including Supabase ones)
