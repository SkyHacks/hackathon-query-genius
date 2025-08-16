import { config } from 'dotenv';
import { db } from './db';
import { customers, categories, products, orders, orderItems } from '@shared/schema';

// Load environment variables from .env file
config();

async function seed() {
  try {
    console.log('🌱 Seeding database...');

    // Clear existing data in the right order (respecting foreign keys)
    await db.delete(orderItems);
    await db.delete(orders);
    await db.delete(products);
    await db.delete(categories);
    await db.delete(customers);

    // Seed categories
    const categoryData = [
      { name: 'Electronics', description: 'Electronic devices and gadgets' },
      { name: 'Books', description: 'Physical and digital books' },
      { name: 'Clothing', description: 'Fashion and apparel' },
      { name: 'Home & Garden', description: 'Home improvement and gardening supplies' },
      { name: 'Sports', description: 'Sports equipment and accessories' },
      { name: 'Beauty', description: 'Cosmetics and personal care' }
    ];
    
    console.log('📚 Inserting categories...');
    const insertedCategories = await db.insert(categories).values(categoryData).returning();

    // Seed customers
    const customerData = [
      { firstName: 'Alice', lastName: 'Johnson', email: 'alice.johnson@email.com', city: 'New York', state: 'NY', country: 'USA', registrationDate: '2023-01-15' },
      { firstName: 'Bob', lastName: 'Smith', email: 'bob.smith@email.com', city: 'Los Angeles', state: 'CA', country: 'USA', registrationDate: '2023-02-20' },
      { firstName: 'Carol', lastName: 'Williams', email: 'carol.williams@email.com', city: 'Chicago', state: 'IL', country: 'USA', registrationDate: '2023-03-10' },
      { firstName: 'David', lastName: 'Brown', email: 'david.brown@email.com', city: 'Houston', state: 'TX', country: 'USA', registrationDate: '2023-04-05' },
      { firstName: 'Emma', lastName: 'Davis', email: 'emma.davis@email.com', city: 'Phoenix', state: 'AZ', country: 'USA', registrationDate: '2023-05-12' },
      { firstName: 'Frank', lastName: 'Miller', email: 'frank.miller@email.com', city: 'Philadelphia', state: 'PA', country: 'USA', registrationDate: '2023-06-18' },
      { firstName: 'Grace', lastName: 'Wilson', email: 'grace.wilson@email.com', city: 'San Antonio', state: 'TX', country: 'USA', registrationDate: '2023-07-25' },
      { firstName: 'Henry', lastName: 'Moore', email: 'henry.moore@email.com', city: 'San Diego', state: 'CA', country: 'USA', registrationDate: '2023-08-30' },
      { firstName: 'Ivy', lastName: 'Taylor', email: 'ivy.taylor@email.com', city: 'Dallas', state: 'TX', country: 'USA', registrationDate: '2023-09-14' },
      { firstName: 'Jack', lastName: 'Anderson', email: 'jack.anderson@email.com', city: 'San Jose', state: 'CA', country: 'USA', registrationDate: '2023-10-22' }
    ];
    
    console.log('👥 Inserting customers...');
    const insertedCustomers = await db.insert(customers).values(customerData).returning();

    // Seed products
    const productData = [
      // Electronics
      { name: 'iPhone 15 Pro', description: 'Latest Apple smartphone with advanced features', categoryId: insertedCategories[0].id, price: '999.99', stockQuantity: 50 },
      { name: 'Samsung Galaxy S24', description: 'Premium Android smartphone', categoryId: insertedCategories[0].id, price: '899.99', stockQuantity: 45 },
      { name: 'MacBook Air M3', description: 'Ultra-thin laptop with M3 chip', categoryId: insertedCategories[0].id, price: '1199.99', stockQuantity: 30 },
      { name: 'Sony WH-1000XM5', description: 'Noise-canceling wireless headphones', categoryId: insertedCategories[0].id, price: '399.99', stockQuantity: 75 },
      
      // Books
      { name: 'The Psychology of Money', description: 'Timeless lessons on wealth, greed, and happiness', categoryId: insertedCategories[1].id, price: '16.99', stockQuantity: 200 },
      { name: 'Atomic Habits', description: 'An easy & proven way to build good habits', categoryId: insertedCategories[1].id, price: '18.99', stockQuantity: 150 },
      { name: 'The 7 Habits of Highly Effective People', description: 'Powerful lessons in personal change', categoryId: insertedCategories[1].id, price: '15.99', stockQuantity: 180 },
      
      // Clothing
      { name: 'Nike Air Max 270', description: 'Comfortable running shoes', categoryId: insertedCategories[2].id, price: '149.99', stockQuantity: 100 },
      { name: 'Levi\'s 501 Original Jeans', description: 'Classic straight-leg jeans', categoryId: insertedCategories[2].id, price: '89.99', stockQuantity: 120 },
      { name: 'Patagonia Better Sweater', description: 'Sustainable fleece pullover', categoryId: insertedCategories[2].id, price: '99.99', stockQuantity: 80 },
      
      // Home & Garden
      { name: 'Dyson V15 Detect', description: 'Cordless vacuum with laser detection', categoryId: insertedCategories[3].id, price: '749.99', stockQuantity: 25 },
      { name: 'Instant Pot Duo 7-in-1', description: 'Multi-use pressure cooker', categoryId: insertedCategories[3].id, price: '79.99', stockQuantity: 60 },
      
      // Sports
      { name: 'Peloton Bike+', description: 'Smart exercise bike with touchscreen', categoryId: insertedCategories[4].id, price: '2495.00', stockQuantity: 15 },
      { name: 'YETI Rambler 20oz', description: 'Insulated stainless steel tumbler', categoryId: insertedCategories[4].id, price: '34.99', stockQuantity: 200 },
      
      // Beauty
      { name: 'Fenty Beauty Foundation', description: 'Full-coverage foundation in 50 shades', categoryId: insertedCategories[5].id, price: '38.00', stockQuantity: 90 },
      { name: 'The Ordinary Niacinamide 10%', description: 'High-strength vitamin and zinc serum', categoryId: insertedCategories[5].id, price: '7.99', stockQuantity: 300 }
    ];
    
    console.log('📦 Inserting products...');
    const insertedProducts = await db.insert(products).values(productData).returning();

    // Seed orders
    const orderData = [
      { customerId: insertedCustomers[0].id, orderDate: '2024-01-15', status: 'completed', totalAmount: '1049.98', shippingAddress: '123 Main St, New York, NY 10001' },
      { customerId: insertedCustomers[1].id, orderDate: '2024-01-20', status: 'completed', totalAmount: '899.99', shippingAddress: '456 Oak Ave, Los Angeles, CA 90210' },
      { customerId: insertedCustomers[2].id, orderDate: '2024-02-01', status: 'completed', totalAmount: '35.98', shippingAddress: '789 Pine St, Chicago, IL 60601' },
      { customerId: insertedCustomers[0].id, orderDate: '2024-02-10', status: 'completed', totalAmount: '1199.99', shippingAddress: '123 Main St, New York, NY 10001' },
      { customerId: insertedCustomers[3].id, orderDate: '2024-02-15', status: 'shipped', totalAmount: '189.98', shippingAddress: '321 Elm St, Houston, TX 77001' },
      { customerId: insertedCustomers[4].id, orderDate: '2024-03-01', status: 'completed', totalAmount: '749.99', shippingAddress: '654 Maple Dr, Phoenix, AZ 85001' },
      { customerId: insertedCustomers[5].id, orderDate: '2024-03-05', status: 'completed', totalAmount: '2495.00', shippingAddress: '987 Cedar Ln, Philadelphia, PA 19101' },
      { customerId: insertedCustomers[1].id, orderDate: '2024-03-12', status: 'processing', totalAmount: '79.99', shippingAddress: '456 Oak Ave, Los Angeles, CA 90210' },
      { customerId: insertedCustomers[6].id, orderDate: '2024-03-20', status: 'completed', totalAmount: '149.99', shippingAddress: '147 Birch Rd, San Antonio, TX 78201' },
      { customerId: insertedCustomers[7].id, orderDate: '2024-04-01', status: 'pending', totalAmount: '45.98', shippingAddress: '258 Spruce St, San Diego, CA 92101' }
    ];
    
    console.log('🛍️ Inserting orders...');
    const insertedOrders = await db.insert(orders).values(orderData).returning();

    // Seed order items
    const orderItemsData = [
      // Order 1 (Alice)
      { orderId: insertedOrders[0].id, productId: insertedProducts[0].id, quantity: 1, unitPrice: '999.99' },
      { orderId: insertedOrders[0].id, productId: insertedProducts[4].id, quantity: 3, unitPrice: '16.99' },
      
      // Order 2 (Bob)
      { orderId: insertedOrders[1].id, productId: insertedProducts[1].id, quantity: 1, unitPrice: '899.99' },
      
      // Order 3 (Carol)
      { orderId: insertedOrders[2].id, productId: insertedProducts[4].id, quantity: 1, unitPrice: '16.99' },
      { orderId: insertedOrders[2].id, productId: insertedProducts[5].id, quantity: 1, unitPrice: '18.99' },
      
      // Order 4 (Alice again)
      { orderId: insertedOrders[3].id, productId: insertedProducts[2].id, quantity: 1, unitPrice: '1199.99' },
      
      // Order 5 (David)
      { orderId: insertedOrders[4].id, productId: insertedProducts[7].id, quantity: 1, unitPrice: '149.99' },
      { orderId: insertedOrders[4].id, productId: insertedProducts[13].id, quantity: 1, unitPrice: '34.99' },
      
      // Order 6 (Emma)
      { orderId: insertedOrders[5].id, productId: insertedProducts[10].id, quantity: 1, unitPrice: '749.99' },
      
      // Order 7 (Frank)
      { orderId: insertedOrders[6].id, productId: insertedProducts[12].id, quantity: 1, unitPrice: '2495.00' },
      
      // Order 8 (Bob again)
      { orderId: insertedOrders[7].id, productId: insertedProducts[11].id, quantity: 1, unitPrice: '79.99' },
      
      // Order 9 (Grace)
      { orderId: insertedOrders[8].id, productId: insertedProducts[7].id, quantity: 1, unitPrice: '149.99' },
      
      // Order 10 (Henry)
      { orderId: insertedOrders[9].id, productId: insertedProducts[14].id, quantity: 1, unitPrice: '38.00' },
      { orderId: insertedOrders[9].id, productId: insertedProducts[15].id, quantity: 1, unitPrice: '7.99' }
    ];
    
    console.log('📋 Inserting order items...');
    await db.insert(orderItems).values(orderItemsData);

    console.log('✅ Database seeded successfully!');
    console.log(`   📚 Categories: ${insertedCategories.length}`);
    console.log(`   👥 Customers: ${insertedCustomers.length}`);
    console.log(`   📦 Products: ${insertedProducts.length}`);
    console.log(`   🛍️ Orders: ${insertedOrders.length}`);
    console.log(`   📋 Order Items: ${orderItemsData.length}`);
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seed()
    .then(() => {
      console.log('🎉 Seeding complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seeding failed:', error);
      process.exit(1);
    });
}

export { seed }; 