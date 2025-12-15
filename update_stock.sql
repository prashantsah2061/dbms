-- Update stock quantities for existing products
-- Run this SQL script to update the stock quantities in your database

USE ecommerce_db;

UPDATE products SET stock_quantity = 700 WHERE name = 'Laptop';
UPDATE products SET stock_quantity = 600 WHERE name = 'Mouse';
UPDATE products SET stock_quantity = 500 WHERE name = 'Keyboard';

-- Verify the updates
SELECT product_id, name, price, stock_quantity FROM products;

