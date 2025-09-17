# DACV Netlify Deployment Guide

## 🚀 Quick Deployment Steps

### Option 1: Drag & Drop Deployment (Fastest)

1. **Build the project locally:**
   ```bash
   cd frontend
   npm install
   npm run build
   ```

2. **Deploy to Netlify:**
   - Go to [netlify.com](https://netlify.com) and sign up/login
   - Click "Add new site" → "Deploy manually"
   - Drag and drop the `frontend/build` folder
   - Your site will be live instantly!

### Option 2: Git-based Deployment (Recommended)

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Prepare for Netlify deployment"
   git push origin main
   ```

2. **Connect to Netlify:**
   - Go to [netlify.com](https://netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Choose GitHub and select your repository
   - Configure build settings:
     - **Base directory:** `frontend`
     - **Build command:** `npm ci && npm run build`
     - **Publish directory:** `frontend/build`
     - **OR** let Netlify auto-detect from `netlify.toml`

3. **Set Environment Variables:**
   Go to Site settings → Environment variables and add:
   ```
   REACT_APP_CONTRACT_ADDRESS=0x3753cfB00dd01D35A36284A909EcBb73a06Fcc7b
   REACT_APP_CHAIN_ID=17000
   REACT_APP_IPFS_TEST_MODE=true
   ```

## 🔧 Configuration Files Created

- **`netlify.toml`** - Netlify build configuration
- **`netlify.env`** - Environment variables template
- **`NETLIFY_DEPLOY.md`** - This deployment guide

## 🌐 What Gets Deployed

Your DACV application will include:
- ✅ University Dashboard (for issuing credentials)
- ✅ Student Dashboard (for viewing credentials)
- ✅ Employer Dashboard (for verifying credentials)
- ✅ QR Code generation and scanning
- ✅ Blockchain integration (Holesky testnet)
- ✅ IPFS storage (test mode initially)

## 🔑 Post-Deployment Setup

1. **Get your site URL** from Netlify (e.g., `amazing-app-123.netlify.app`)

2. **Test the deployment:**
   - Visit your site URL
   - Connect MetaMask to Holesky testnet
   - Test each dashboard (University, Student, Employer)

3. **Enable real IPFS storage:**
   - Get API key from [nft.storage](https://nft.storage)
   - Add `REACT_APP_NFT_STORAGE_KEY` to Netlify environment variables
   - Remove `REACT_APP_IPFS_TEST_MODE` variable
   - Trigger a new deployment

## 📱 Custom Domain (Optional)

1. Go to Site settings → Domain management
2. Add your custom domain
3. Configure DNS with your domain provider
4. Enable HTTPS (automatic with Netlify)

## 🛠️ Troubleshooting

### Build Fails
- Check Node.js version is 18+
- Ensure all dependencies are in `package.json`
- Check build logs for specific errors

### Site Not Loading
- Verify redirects are working (check `netlify.toml`)
- Check browser console for errors
- Ensure environment variables are set correctly

### MetaMask Connection Issues
- Users need to add Holesky testnet to MetaMask
- Provide testnet configuration in your site docs

## 🔄 Continuous Deployment

Once connected to Git:
- Every push to main branch triggers a new deployment
- Preview deployments for pull requests
- Easy rollbacks to previous versions

## 📊 Site Analytics

Netlify provides built-in analytics:
- Page views and unique visitors
- Top pages and referrers
- Form submissions (if you add contact forms)
- Performance insights

Your DACV app is now ready for the world! 🎉