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

// 2. Create an order
app.post('/orders', async (req, res) => {
    const { items, total_amount } = req.body; // items: [{ product_id, quantity, unit_price }]

    if (!items || items.length === 0) {
        return res.status(400).json({ error: 'No items in order' });
    }

    const connection = await db.getConnection();
    
    try {
        await connection.beginTransaction();

        // Validate stock for all items
        for (const item of items) {
            const [results] = await connection.query(
                'SELECT stock_quantity FROM products WHERE product_id = ?',
                [item.product_id]
            );
            
            if (!results || results.length === 0) {
                throw new Error(`Product ${item.product_id} not found`);
            }
            
            const currentStock = results[0].stock_quantity;
            if (currentStock < item.quantity) {
                throw new Error(`Insufficient stock for product ${item.product_id}. Available: ${currentStock}, Requested: ${item.quantity}`);
            }
        }

        // Insert Order
        const [orderResult] = await connection.query(
            'INSERT INTO orders (total_amount) VALUES (?)',
            [total_amount]
        );
        
        const orderId = orderResult.insertId;
        const orderItems = items.map(item => [orderId, item.product_id, item.quantity, item.unit_price]);

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
        res.json({ message: 'Order placed successfully', orderId });
        
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
        const sql = `
            SELECT o.*, 
                   GROUP_CONCAT(
                       CONCAT(oi.quantity, 'x ', p.name, ' ($', oi.unit_price, ')') 
                       SEPARATOR ', '
                   ) as items
            FROM orders o
            LEFT JOIN order_items oi ON o.order_id = oi.order_id
            LEFT JOIN products p ON oi.product_id = p.product_id
            GROUP BY o.order_id
            ORDER BY o.order_date DESC
        `;
        const [results] = await db.query(sql);
        res.json(results);
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
