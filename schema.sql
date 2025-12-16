CREATE DATABASE IF NOT EXISTS ecommerce_db;
USE ecommerce_db;

-- Reference data: customers
CREATE TABLE IF NOT EXISTS customers (
    customer_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(30),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reference data: addresses
CREATE TABLE IF NOT EXISTS addresses (
    address_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    line1 VARCHAR(255) NOT NULL,
    line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) NOT NULL DEFAULT 'USA',
    is_default TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE
);

-- Reference data: product categories
CREATE TABLE IF NOT EXISTS categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255)
);

-- Catalog: products
CREATE TABLE IF NOT EXISTS products (
    product_id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT,
    sku VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    stock_quantity INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(category_id)
);

-- Fact: orders
CREATE TABLE IF NOT EXISTS orders (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT,
    shipping_address_id INT,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('PENDING', 'PAID', 'SHIPPED', 'CANCELLED') DEFAULT 'PENDING',
    payment_status ENUM('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED') DEFAULT 'PENDING',
    total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
    FOREIGN KEY (shipping_address_id) REFERENCES addresses(address_id)
);

-- Fact: order line items
CREATE TABLE IF NOT EXISTS order_items (
    item_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10, 2) NOT NULL CHECK (unit_price >= 0),
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id)
);

-- Payment audit
CREATE TABLE IF NOT EXISTS payments (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    method ENUM('CARD', 'CASH', 'PAYPAL', 'BANK') DEFAULT 'CARD',
    status ENUM('INITIATED', 'COMPLETED', 'FAILED', 'REFUNDED') DEFAULT 'INITIATED',
    transaction_ref VARCHAR(100),
    paid_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE
);

-- Contact form submissions
CREATE TABLE IF NOT EXISTS contacts (
    contact_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(255),
    message TEXT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed categories
INSERT INTO categories (name, description)
SELECT * FROM (SELECT 'Laptops', 'Portable computing') AS tmp
WHERE NOT EXISTS (SELECT name FROM categories WHERE name = 'Laptops') LIMIT 1;

INSERT INTO categories (name, description)
SELECT * FROM (SELECT 'Accessories', 'Add-ons and essentials') AS tmp
WHERE NOT EXISTS (SELECT name FROM categories WHERE name = 'Accessories') LIMIT 1;

INSERT INTO categories (name, description)
SELECT * FROM (SELECT 'Peripherals', 'Keyboards, mice, monitors') AS tmp
WHERE NOT EXISTS (SELECT name FROM categories WHERE name = 'Peripherals') LIMIT 1;

-- Seed customers
INSERT INTO customers (first_name, last_name, email, phone)
SELECT * FROM (SELECT 'Ava', 'Chen', 'ava.chen@example.com', '555-111-2222') AS tmp
WHERE NOT EXISTS (SELECT email FROM customers WHERE email = 'ava.chen@example.com') LIMIT 1;

INSERT INTO customers (first_name, last_name, email, phone)
SELECT * FROM (SELECT 'Liam', 'Patel', 'liam.patel@example.com', '555-333-4444') AS tmp
WHERE NOT EXISTS (SELECT email FROM customers WHERE email = 'liam.patel@example.com') LIMIT 1;

-- Seed addresses
INSERT INTO addresses (customer_id, line1, city, state, postal_code, country, is_default)
SELECT c.customer_id, '100 Market Street', 'San Francisco', 'CA', '94103', 'USA', 1
FROM customers c
WHERE c.email = 'ava.chen@example.com'
  AND NOT EXISTS (
      SELECT 1 FROM addresses a WHERE a.customer_id = c.customer_id AND a.is_default = 1
  )
LIMIT 1;

INSERT INTO addresses (customer_id, line1, city, state, postal_code, country, is_default)
SELECT c.customer_id, '200 King Street', 'Seattle', 'WA', '98101', 'USA', 1
FROM customers c
WHERE c.email = 'liam.patel@example.com'
  AND NOT EXISTS (
      SELECT 1 FROM addresses a WHERE a.customer_id = c.customer_id AND a.is_default = 1
  )
LIMIT 1;

-- Seed products (with category linkage)
INSERT INTO products (category_id, sku, name, description, price, stock_quantity)
SELECT
    (SELECT category_id FROM categories WHERE name = 'Laptops'),
    'LAP-ULT-14',
    'Ultrabook 14"',
    'Lightweight 14-inch laptop with 16GB RAM and 512GB SSD.',
    1199.00,
    45
WHERE NOT EXISTS (SELECT sku FROM products WHERE sku = 'LAP-ULT-14') LIMIT 1;

INSERT INTO products (category_id, sku, name, description, price, stock_quantity)
SELECT
    (SELECT category_id FROM categories WHERE name = 'Accessories'),
    'ACC-MS-WLS',
    'Wireless Mouse',
    'Low-latency wireless mouse with ergonomic design.',
    39.00,
    320
WHERE NOT EXISTS (SELECT sku FROM products WHERE sku = 'ACC-MS-WLS') LIMIT 1;

INSERT INTO products (category_id, sku, name, description, price, stock_quantity)
SELECT
    (SELECT category_id FROM categories WHERE name = 'Peripherals'),
    'PER-KB-MECH',
    'Mechanical Keyboard',
    'Hot-swappable mechanical keyboard with RGB.',
    129.00,
    210
WHERE NOT EXISTS (SELECT sku FROM products WHERE sku = 'PER-KB-MECH') LIMIT 1;
