const express = require('express');
const mysql = require('mysql2/promise'); // Use promise-based API
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config(); // Load environment variables

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('.')); // Serve static files from current directory

// Database Connection Pool - Uses environment variables for production
const db = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'ecommerce_db',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    // For online databases (like PlanetScale), you may need SSL
    ssl: process.env.DB_SSL === 'true' ? {
        rejectUnauthorized: false
    } : false
});

// Test connection
db.getConnection()
    .then(connection => {
        console.log('Connected to MySQL database');
        connection.release();
    })
    .catch(err => {
        console.error('Error connecting to MySQL:', err);
    });

// API Endpoints

// 1. Get all products
app.get('/products', async (req, res) => {
    try {
        const [results] = await db.query('SELECT * FROM products');
        res.json(results);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// 2. Create an order (server-side price and stock validation)
app.post('/orders', async (req, res) => {
    const { items = [], customer_id = null, shipping_address_id = null } = req.body; // items: [{ product_id, quantity }]

    if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'No items in order' });
    }

    const connection = await db.getConnection();
    
    try {
        await connection.beginTransaction();

        // Pull all products referenced in the order in one query
        const productIds = items.map(item => item.product_id);
        const [productRows] = await connection.query(
            'SELECT product_id, price, stock_quantity FROM products WHERE product_id IN (?)',
            [productIds]
        );
        const productMap = new Map(productRows.map(p => [p.product_id, p]));

        let total = 0;

        for (const item of items) {
            const product = productMap.get(item.product_id);
            if (!product) {
                throw new Error(`Product ${item.product_id} not found`);
            }

            const quantity = Number(item.quantity);
            if (!Number.isInteger(quantity) || quantity <= 0) {
                throw new Error(`Invalid quantity for product ${item.product_id}`);
            }

            if (product.stock_quantity < quantity) {
                throw new Error(`Insufficient stock for product ${item.product_id}. Available: ${product.stock_quantity}, Requested: ${quantity}`);
            }

            total += quantity * Number(product.price);
        }

        // Insert Order with computed total
        const [orderResult] = await connection.query(
            'INSERT INTO orders (customer_id, shipping_address_id, status, payment_status, total_amount) VALUES (?, ?, ?, ?, ?)',
            [customer_id, shipping_address_id, 'PENDING', 'PENDING', total]
        );
        
        const orderId = orderResult.insertId;
        const orderItems = items.map(item => {
            const product = productMap.get(item.product_id);
            return [orderId, item.product_id, item.quantity, product.price];
        });

        // Insert Order Items
        await connection.query(
            'INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES ?',
            [orderItems]
        );

        // Update Inventory - decrement stock for each product
        for (const item of items) {
            await connection.query(
                'UPDATE products SET stock_quantity = stock_quantity - ? WHERE product_id = ?',
                [item.quantity, item.product_id]
            );
        }

        await connection.commit();
        res.json({ message: 'Order placed successfully', orderId, total_amount: total });
        
    } catch (err) {
        await connection.rollback();
        console.error('Order error:', err);
        res.status(400).json({ error: err.message });
    } finally {
        connection.release();
    }
});

// 2b. Get all orders (History) with order items
app.get('/orders', async (req, res) => {
    try {
        const [orders] = await db.query(`
            SELECT o.order_id,
                   o.order_date,
                   o.total_amount,
                   o.status,
                   o.payment_status,
                   c.first_name,
                   c.last_name
            FROM orders o
            LEFT JOIN customers c ON o.customer_id = c.customer_id
            ORDER BY o.order_date DESC
        `);

        const [items] = await db.query(`
            SELECT oi.order_id,
                   oi.product_id,
                   oi.quantity,
                   oi.unit_price,
                   p.name
            FROM order_items oi
            JOIN products p ON oi.product_id = p.product_id
        `);

        const itemsByOrder = items.reduce((acc, item) => {
            if (!acc[item.order_id]) acc[item.order_id] = [];
            acc[item.order_id].push(item);
            return acc;
        }, {});

        const response = orders.map(order => ({
            ...order,
            customer: order.first_name ? `${order.first_name} ${order.last_name}` : 'Guest',
            items: itemsByOrder[order.order_id] || []
        }));

        res.json(response);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});


// 3. Submit Contact Form
app.post('/contact', async (req, res) => {
    const { name, email, subject, message } = req.body;
    try {
        await db.query(
            'INSERT INTO contacts (name, email, subject, message) VALUES (?, ?, ?, ?)',
            [name, email, subject, message]
        );
        res.json({ message: 'Contact message saved successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
