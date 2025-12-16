-- Sample queries that demonstrate functionality and design choices
-- Run with: mysql -u root -p ecommerce_db < sample_queries.sql

USE ecommerce_db;

-- 1) List products with category and stock status
SELECT p.product_id,
       p.sku,
       p.name,
       c.name AS category,
       p.price,
       p.stock_quantity,
       CASE WHEN p.stock_quantity < 10 THEN 'LOW' ELSE 'OK' END AS stock_flag
FROM products p
LEFT JOIN categories c ON p.category_id = c.category_id
ORDER BY c.name, p.name;

-- 2) Top products by revenue (needs orders in the system)
SELECT p.sku,
       p.name,
       SUM(oi.quantity) AS units_sold,
       SUM(oi.quantity * oi.unit_price) AS revenue
FROM order_items oi
JOIN products p ON oi.product_id = p.product_id
GROUP BY p.sku, p.name
ORDER BY revenue DESC
LIMIT 5;

-- 3) Customer order history with shipping addresses
SELECT o.order_id,
       CONCAT(c.first_name, ' ', c.last_name) AS customer,
       o.status,
       o.payment_status,
       o.total_amount,
       a.city,
       a.state,
       o.order_date
FROM orders o
LEFT JOIN customers c ON o.customer_id = c.customer_id
LEFT JOIN addresses a ON o.shipping_address_id = a.address_id
ORDER BY o.order_date DESC;

-- 4) Order detail drilldown (items)
SELECT oi.order_id,
       p.sku,
       p.name,
       oi.quantity,
       oi.unit_price,
       (oi.quantity * oi.unit_price) AS line_total
FROM order_items oi
JOIN products p ON oi.product_id = p.product_id
ORDER BY oi.order_id, p.name;

-- 5) Payment audit trail
SELECT pmt.order_id,
       pmt.method,
       pmt.status,
       pmt.amount,
       pmt.paid_at
FROM payments pmt
ORDER BY pmt.paid_at DESC;

