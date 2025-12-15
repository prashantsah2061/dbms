USE ecommerce_db;

-- Check products (Inventory shown on Homepage)
SELECT * FROM products;

-- Check the most recent orders
SELECT * FROM orders ORDER BY order_id DESC;

-- Check the items for those orders
SELECT * FROM order_items ORDER BY order_id DESC;

-- Check contacts
SELECT * FROM contacts ORDER BY contact_id DESC;
