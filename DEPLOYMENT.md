# Deployment Guide - E-Commerce Application

This guide will help you deploy your e-commerce application online.

## Prerequisites

1. A GitHub account (for version control)
2. An account on a hosting platform (Railway, Render, or Heroku)
3. An online MySQL database (PlanetScale, Railway, or AWS RDS)

## Step 1: Set Up Online MySQL Database

### Option A: PlanetScale (Recommended - Free Tier Available)

1. Go to [PlanetScale.com](https://planetscale.com) and sign up
2. Create a new database
3. Copy the connection credentials (host, username, password, database name)
4. Run your `schema.sql` file in the PlanetScale SQL editor

### Option B: Railway MySQL

1. Go to [Railway.app](https://railway.app) and sign up
2. Create a new project → Add MySQL service
3. Copy the connection details from the Variables tab

### Option C: Render MySQL

1. Go to [Render.com](https://render.com) and sign up
2. Create a new PostgreSQL/MySQL database
3. Copy connection details

## Step 2: Update Environment Variables

Create a `.env` file in your project root (copy from `.env.example`):

```env
DB_HOST=your_database_host
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=your_database_name
DB_PORT=3306
DB_SSL=true
PORT=3000
NODE_ENV=production
```

**Important:** Never commit `.env` to Git! It's already in `.gitignore`.

## Step 3: Deploy Backend Server

### Option A: Railway (Easiest)

1. Go to [Railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Connect your GitHub account and select this repository
4. Add environment variables in the Variables tab:
   - `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT`, `DB_SSL`, `PORT`
5. Railway will automatically deploy your app
6. Your app will be available at `https://your-app-name.railway.app`

### Option B: Render

1. Go to [Render.com](https://render.com)
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Settings:
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Environment:** Node
5. Add environment variables in the Environment tab
6. Deploy!

### Option C: Heroku

1. Install Heroku CLI: `brew install heroku/brew/heroku` (Mac) or download from [heroku.com](https://heroku.com)
2. Login: `heroku login`
3. Create app: `heroku create your-app-name`
4. Add MySQL addon: `heroku addons:create cleardb:ignite` (or use JawsDB)
5. Set environment variables:
   ```bash
   heroku config:set DB_HOST=your_host
   heroku config:set DB_USER=your_user
   heroku config:set DB_PASSWORD=your_password
   heroku config:set DB_NAME=your_database
   heroku config:set DB_SSL=true
   ```
6. Deploy: `git push heroku main`

## Step 4: Update Frontend API URLs

The frontend (`script.js`) automatically detects if it's running locally or online. However, if you're hosting the frontend separately:

1. If frontend is on the same domain as backend: No changes needed!
2. If frontend is on a different domain: Update `API_BASE_URL` in `script.js` to your backend URL

## Step 5: Deploy Frontend (Optional - if separate hosting)

### Option A: Netlify

1. Go to [Netlify.com](https://netlify.com)
2. Drag and drop your project folder, OR
3. Connect GitHub repository
4. Build settings: Leave blank (static site)
5. Deploy!

### Option B: Vercel

1. Go to [Vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Framework preset: Other
4. Deploy!

### Option C: GitHub Pages

1. Push your code to GitHub
2. Go to repository Settings → Pages
3. Select source branch (usually `main`)
4. Your site will be at `https://yourusername.github.io/repo-name`

**Note:** For GitHub Pages, you'll need to update API URLs to your backend URL.

## Step 6: Run Database Migrations

After deployment, run your SQL schema:

1. Connect to your online database
2. Run `schema.sql` to create tables
3. Run `update_stock.sql` to set initial stock quantities

## Step 7: Test Your Deployment

1. Visit your deployed backend URL
2. Test adding products to cart
3. Test placing orders
4. Check database to verify data is being saved

## Troubleshooting

### Database Connection Issues

- Check environment variables are set correctly
- Verify database allows connections from your hosting IP
- For PlanetScale, ensure SSL is enabled (`DB_SSL=true`)

### CORS Errors

- The server already has CORS enabled
- If issues persist, update CORS settings in `server.js`

### Port Issues

- Most platforms set `PORT` automatically
- Don't hardcode port numbers

### Static Files Not Loading

- Ensure `app.use(express.static('.'))` is in server.js
- Check file paths are correct

## Quick Deploy Checklist

- [ ] Set up online MySQL database
- [ ] Create `.env` file with database credentials
- [ ] Push code to GitHub
- [ ] Deploy backend to Railway/Render/Heroku
- [ ] Set environment variables on hosting platform
- [ ] Run database migrations
- [ ] Test the application
- [ ] Update frontend API URLs if needed

## Support

If you encounter issues:
1. Check server logs on your hosting platform
2. Verify environment variables are set
3. Test database connection separately
4. Check browser console for frontend errors

