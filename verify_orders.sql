USE ecommerce_db;

-- Check products (Inventory shown on Homepage)
SELECT product_id, sku, name, price, stock_quantity FROM products ORDER BY product_id;

-- Check the most recent orders with customer and totals
SELECT o.order_id,
       CONCAT(c.first_name, ' ', c.last_name) AS customer,
       o.status,
       o.payment_status,
       o.total_amount,
       o.order_date
FROM orders o
LEFT JOIN customers c ON o.customer_id = c.customer_id
ORDER BY o.order_id DESC;

-- Check the items for those orders
SELECT oi.order_id,
       p.sku,
       p.name,
       oi.quantity,
       oi.unit_price,
       (oi.quantity * oi.unit_price) AS line_total
FROM order_items oi
JOIN products p ON oi.product_id = p.product_id
ORDER BY oi.order_id DESC;

-- Check contacts
SELECT * FROM contacts ORDER BY contact_id DESC;
