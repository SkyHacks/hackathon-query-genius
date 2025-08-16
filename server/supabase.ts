import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.my_first_chatgpt_api_token,
});

// Supabase configuration
const SUPABASE_URL = 'https://sktrtqrgghaqbexbtghd.supabase.co/rest/v1';
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_KEY) {
  console.warn('SUPABASE_KEY environment variable is not set. Please add it to your .env file.');
}

export interface SupabaseQueryResult {
  success: boolean;
  data?: any[];
  error?: string;
}

export interface GeneratedQuery {
  table: string;
  select: string;
  limit?: number;
  order?: string;
}

/**
 * Generate a Supabase query using OpenAI
 */
export async function generateSupabaseQuery(userQuestion: string): Promise<GeneratedQuery | null> {
  try {
    const prompt = `You are an AI assistant that generates accurate Supabase REST API queries.

DATABASE SCHEMA:
- transactions: id, customer_id, store_id, product_id, transaction_date, quanity, total_amount, discount_amount, final_amount, loyalty_points
- customers: id, name, email, gender
- products: id, product_name, aisle, unit_price
- stores: id, store_name

RELATIONSHIPS:
- transactions.customer_id → customers.id
- transactions.product_id → products.id
- products.store_id → stores.id

QUERY RULES:
1. **Table Selection**: Choose the primary table based on the main entity being asked about
2. **Select Fields**: Use "*" to get all fields for analysis
3. **Joins**: Use "*,customers(*)" when you need customer data with transactions, "*,stores(*)" for store data
4. **Ordering**: Only use fields that exist in the selected table
   - transactions table: id, customer_id, store_id, product_id, transaction_date, quanity, total_amount, discount_amount, final_amount, loyalty_points
   - customers table: id, name, email, gender
   - products table: id, product_name, aisle, unit_price
   - stores table: id, store_name
5. **Limits**: Use 500 for analysis, 50 for specific lookups

EXACT EXAMPLES:
- "What's the total revenue?" → {"table": "transactions", "select": "*", "limit": 500}
- "Who are the top customers by spending?" → {"table": "transactions", "select": "*,customers(*)", "order": "final_amount.desc", "limit": 100}
- "Show me recent transactions" → {"table": "transactions", "select": "*", "order": "transaction_date.desc", "limit": 50}
- "Show me transactions with customer and store info" → {"table": "transactions", "select": "*,customers(*),stores(*)", "limit": 50}
- "List all customers" → {"table": "customers", "select": "*", "limit": 500}
- "What products do we have?" → {"table": "products", "select": "*", "limit": 100}

CRITICAL: Never order by fields that don't exist in the selected table.

User question: "${userQuestion}"

Return ONLY the JSON object:`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that generates Supabase REST API queries. Always respond with valid JSON only."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.1,
      max_tokens: 500
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    // Parse the JSON response
    const queryData = JSON.parse(response);
    console.log('Generated query:', JSON.stringify(queryData, null, 2));
    
    // Validate the query structure
    if (!queryData.table || !queryData.select) {
      console.error('Invalid query structure:', queryData);
      return generateFallbackQuery(userQuestion);
    }
    
    return queryData;
  } catch (error) {
    console.error('Error generating Supabase query:', error);
    console.log('Using fallback query generation');
    return generateFallbackQuery(userQuestion);
  }
}

/**
 * Fallback query generation when OpenAI is not available or fails
 */
function generateFallbackQuery(userQuestion: string): GeneratedQuery {
  const lowerQuestion = userQuestion.toLowerCase();
  
  if (lowerQuestion.includes('transaction')) {
    if (lowerQuestion.includes('customer')) {
      return {
        table: 'transactions',
        select: '*,customers(*)',
        limit: 50
      };
    }
    return {
      table: 'transactions',
      select: '*',
      limit: 50
    };
  }
  
  if (lowerQuestion.includes('customer')) {
    return {
      table: 'customers',
      select: '*',
      limit: 50
    };
  }
  
  if (lowerQuestion.includes('product')) {
    return {
      table: 'products',
      select: '*',
      limit: 50
    };
  }
  
  // Default to transactions
  return {
    table: 'transactions',
    select: '*',
    limit: 50
  };
}

/**
 * Execute a Supabase query
 */
export async function executeSupabaseQuery(query: GeneratedQuery): Promise<SupabaseQueryResult> {
  try {
    const url = new URL(`${SUPABASE_URL}/${query.table}`);
    
    // Add select parameter (required)
    url.searchParams.append('select', query.select);
    
    // Add ordering (optional)
    if (query.order) {
      url.searchParams.append('order', query.order);
    }
    
    // Add limit (optional, default to 50)
    const limit = query.limit || 50;
    url.searchParams.append('limit', limit.toString());

    console.log('Executing Supabase query:', url.toString());

    if (!SUPABASE_KEY) {
      throw new Error('SUPABASE_KEY is required for Supabase queries');
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_KEY
      }
    });

    if (!response.ok) {
      throw new Error(`Supabase API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Error executing Supabase query:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}

/**
 * Analyze data and generate insights using OpenAI
 */
export async function analyzeDataWithAI(userQuestion: string, data: any[]): Promise<string> {
  try {
    const prompt = `You are an AI assistant that answers questions using the provided data.

User's question: "${userQuestion}"

Available data:
${JSON.stringify(data, null, 2)}

INSTRUCTIONS:
- Answer the user's question directly and clearly
- Use the data to provide specific numbers and facts
- Keep it simple and concise
- Use basic formatting (bold for key numbers, simple lists if needed)
- Focus on answering what was asked, nothing more

Example: If asked "What's the total revenue?", just say "The total revenue is $X based on Y transactions."

Answer the question:`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that answers questions clearly and concisely. Use the data provided to give direct answers with relevant numbers and facts."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.2,
      max_tokens: 2000
    });

    const response = completion.choices[0]?.message?.content;
    return response || 'Unable to analyze data at this time.';
  } catch (error) {
    console.error('Error analyzing data with AI:', error);
    return 'Error analyzing data. Please try again.';
  }
}

/**
 * Main function to process a user question through the entire pipeline
 */
export async function processSupabaseQuery(userQuestion: string): Promise<{
  success: boolean;
  analysis?: string;
  rawData?: any[];
  error?: string;
}> {
  try {
    // Step 1: Generate Supabase query
    const generatedQuery = await generateSupabaseQuery(userQuestion);
    if (!generatedQuery) {
      return { success: false, error: 'Failed to generate query' };
    }

    // Step 2: Execute the query
    const queryResult = await executeSupabaseQuery(generatedQuery);
    if (!queryResult.success) {
      return { success: false, error: queryResult.error };
    }

    // Step 3: Analyze the data
    const analysis = await analyzeDataWithAI(userQuestion, queryResult.data || []);

    return {
      success: true,
      analysis,
      rawData: queryResult.data
    };
  } catch (error) {
    console.error('Error in processSupabaseQuery:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}
