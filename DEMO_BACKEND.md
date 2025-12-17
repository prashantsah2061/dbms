# Live demo: show backend consequences

Goal: while presenting, show that the frontend actions hit MySQL and the API.

## 1) Start services
- `npm start` (uses `PORT` + DB creds from `.env`).
- Ensure MySQL is running and `schema.sql` has been loaded.

## 2) Baseline snapshot (before adding to cart)
Run any of these in a terminal:
```bash
# Quick inventory view
mysql -u root -p ecommerce_db -e "SELECT product_id, sku, name, stock_quantity FROM products ORDER BY product_id;"

# Full grading view (orders, items, contacts)
mysql -u root -p ecommerce_db < verify_orders.sql
```
Adjust `-u/-p` for your MySQL user.

## 3) Do the UI action
- Add items in the web UI and click “Submit Order”.
- If you need to hit the API manually:  
  `curl -X POST http://localhost:3000/orders -H "Content-Type: application/json" -d '{"items":[{"product_id":1,"quantity":1}]}'`

## 4) Show the backend effect (after submit)
Re-run the snapshot commands:
```bash
mysql -u root -p ecommerce_db < verify_orders.sql
```
Look for:
- New row in `orders` with total and status.
- Matching rows in `order_items`.
- Decremented `stock_quantity` in `products`.

## 5) Optional: show via API
```bash
curl http://localhost:3000/orders | jq .
```
You’ll see the same orders/history the UI renders.

Tip: keep this file open in your terminal so you can copy/paste during the demo.
