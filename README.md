# E-Commerce Database Management System

A full-stack e-commerce application built with Node.js, Express, MySQL, and vanilla JavaScript.

## Features

- 🛍️ Product catalog with inventory management
- 🛒 Shopping cart with persistent storage
- 📦 Order management system
- 📊 Order history tracking
- 📧 Contact form integration
- 💾 MySQL database integration
- 🎨 Modern, responsive UI

## Tech Stack

- **Frontend:** HTML, CSS, JavaScript (Vanilla)
- **Backend:** Node.js, Express.js
- **Database:** MySQL (mysql2)
- **Deployment Ready:** Railway, Render, Heroku compatible

## Project Structure

```
dbms/
├── index.html          # Home page
├── products.html       # Products catalog
├── orders.html         # Cart and order history
├── about.html          # About page
├── contact.html        # Contact form
├── style.css           # Stylesheet
├── script.js           # Frontend JavaScript
├── server.js           # Express backend server
├── schema.sql          # Database schema
├── update_stock.sql    # Stock update script
└── package.json        # Dependencies

```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MySQL Server
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/prashantsah2061/dbms.git
cd dbms
```

2. Install dependencies:
```bash
npm install
```

3. Set up the database:
```bash
mysql -u root -p < schema.sql
mysql -u root -p < update_stock.sql
```

4. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your database credentials
```

5. Start the server:
```bash
npm start
```

6. Open your browser:
```
http://localhost:3000
```

## Environment Variables

Create a `.env` file in the root directory:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=ecommerce_db
DB_PORT=3306
DB_SSL=false
PORT=3000
NODE_ENV=development
```

## Database Schema

The application uses the following tables:
- `customers` - Shopper profile with contact info
- `addresses` - Customer shipping addresses
- `categories` - Product categories
- `products` - Product inventory and stock
- `orders` - Order header with status and totals
- `order_items` - Order line items
- `payments` - Payment audit trail per order
- `contacts` - Contact form submissions

### System Design (ERD narrative)
- A `customer` can have many `addresses`; one is flagged as `is_default`.
- A `category` groups many `products`; each product tracks `sku`, `price`, and `stock_quantity`.
- An `order` belongs to a `customer` and optionally a `shipping_address`; it has a `status`, `payment_status`, and a computed `total_amount`.
- `order_items` link each `order` to the `products` purchased, recording `quantity` and `unit_price` at time of sale.
- `payments` record method/status for each `order`, enabling auditability.
- `contacts` store inbound messages from the public contact form.

### Implementation evidence (queries)
- `sample_queries.sql` shows joins/aggregates (catalog + category, top products by revenue, customer order history, payment trail).
- `verify_orders.sql` lists recent orders with line items and inventory for quick grading checks.
- `update_stock.sql` refreshes stock levels for seeded products.

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

Quick deploy options:
- **Railway:** Connect GitHub repo → Add MySQL → Deploy
- **Render:** Web Service → Connect repo → Set environment variables
- **Heroku:** Use Procfile included

## Features in Detail

### Shopping Cart
- Add/remove items
- Update quantities
- Persistent cart using localStorage
- Real-time stock validation

### Order Management
- Transaction-based order processing
- Automatic inventory updates
- Order history tracking
- Stock validation before checkout

### Product Management
- Dynamic product display
- Stock quantity tracking
- Price management

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the MIT License.

## Author

Pranish Uprety and Prashant Sah

## Support

For support, please open an issue on GitHub.

