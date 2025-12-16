
USE ecommerce_db;

UPDATE products SET stock_quantity = 60 WHERE sku = 'LAP-ULT-14';
UPDATE products SET stock_quantity = 400 WHERE sku = 'ACC-MS-WLS';
UPDATE products SET stock_quantity = 250 WHERE sku = 'PER-KB-MECH';

-- Verify the updates
SELECT product_id, sku, name, price, stock_quantity FROM products;

