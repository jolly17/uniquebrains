# Deploying UniqueBrains to GitHub Pages

## Prerequisites
- GitHub account
- Git installed on your computer
- Node.js installed

## Step-by-Step Deployment

### 1. Install gh-pages
```bash
npm install --save-dev gh-pages
```

### 2. Update Configuration
Already done! The following files are configured:
- ✅ `package.json` - has deploy scripts
- ✅ `vite.config.js` - has base path

**Important**: Update these two places with YOUR GitHub username and repo name:
- In `package.json`: Change `"homepage": "https://jolly17.github.io/uniquebrains"`
- In `vite.config.js`: Change `base: '/uniquebrains/'`

### 3. Create GitHub Repository
1. Go to https://github.com/new
2. Name it `uniquebrains` (or whatever you prefer)
3. Don't initialize with README (you already have one)
4. Click "Create repository"

### 4. Push Your Code to GitHub
```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - UniqueBrains MVP"

# Add remote
git remote add origin https://github.com/jolly17/uniquebrains.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### 5. Deploy to GitHub Pages
```bash
npm run deploy
```

This will:
- Build your app
- Create a `gh-pages` branch
- Deploy to GitHub Pages

### 6. Enable GitHub Pages
1. Go to your repo on GitHub
2. Click "Settings"
3. Scroll to "Pages" in the left sidebar
4. Under "Source", select `gh-pages` branch
5. Click "Save"

### 7. Access Your Site
Your site will be live at:
```
https://jolly17.github.io/uniquebrains/
```

It may take a few minutes for the first deployment.

## Updating Your Site

Whenever you make changes:
```bash
git add .
git commit -m "Description of changes"
git push
npm run deploy
```

## Custom Domain (Optional)

Want to use `uniquebrains.com`?

1. Buy domain from Namecheap, GoDaddy, etc.
2. In your repo, create a file named `CNAME` in the `public` folder
3. Add your domain: `uniquebrains.com`
4. Configure DNS with your domain provider:
   - Add A records pointing to GitHub's IPs
   - Or add CNAME record pointing to `jolly17.github.io`
5. Redeploy: `npm run deploy`

## Troubleshooting

**Blank page after deployment?**
- Check that `base` in `vite.config.js` matches your repo name
- Check that `homepage` in `package.json` is correct

**404 errors?**
- Make sure GitHub Pages is enabled in repo settings
- Wait a few minutes for deployment to complete

**Need help?**
- Check GitHub Pages docs: https://pages.github.com/
- Check Vite deployment docs: https://vitejs.dev/guide/static-deploy.html
