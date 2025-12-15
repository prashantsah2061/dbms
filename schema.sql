-- Create Database
CREATE DATABASE IF NOT EXISTS ecommerce_db;
USE ecommerce_db;

-- Create Products Table
CREATE TABLE IF NOT EXISTS products (
    product_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    stock_quantity INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Orders Table
CREATE TABLE IF NOT EXISTS orders (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00
);

-- Create Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
    item_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT,
    product_id INT,
    quantity INT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(order_id),
    FOREIGN KEY (product_id) REFERENCES products(product_id)
);

-- Create Contacts Table
CREATE TABLE IF NOT EXISTS contacts (
    contact_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(255),
    message TEXT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Search for existing items to avoid duplicates if re-run (optional safer insert)
-- For simplicity in this demo, we'll just insert if empty or you can clear table first.
-- INSERT IGNORE INTO products (product_id, name, price, stock_quantity) VALUES
-- (1, 'Laptop', 900.00, 5),
-- (2, 'Mouse', 25.00, 20),
-- (3, 'Keyboard', 45.00, 15);

-- Seeding data (only if table is empty)
INSERT INTO products (name, price, stock_quantity)
SELECT * FROM (SELECT 'Laptop', 900.00, 700) AS tmp
WHERE NOT EXISTS (
    SELECT name FROM products WHERE name = 'Laptop'
) LIMIT 1;

INSERT INTO products (name, price, stock_quantity)
SELECT * FROM (SELECT 'Mouse', 25.00, 600) AS tmp
WHERE NOT EXISTS (
    SELECT name FROM products WHERE name = 'Mouse'
) LIMIT 1;

INSERT INTO products (name, price, stock_quantity)
SELECT * FROM (SELECT 'Keyboard', 45.00, 500) AS tmp
WHERE NOT EXISTS (
    SELECT name FROM products WHERE name = 'Keyboard'
) LIMIT 1;
