# Vercel Deployment Guide

This guide provides instructions for deploying the Physical AI & Humanoid Robotics Academy Docusaurus site to Vercel.

## Prerequisites

- Node.js version locked to 18.x (configured in `package.json`)
- GitHub repository: `sanoober987/Hackathon-1_Physical-AI-Humanoid-Robotics_Textbook`
- Vercel account

## Deployment Steps

### 1. Deploy via Vercel Dashboard

1. Go to [Vercel](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository: `sanoober987/Hackathon-1_Physical-AI-Humanoid-Robotics_Textbook`
4. Select the project directory: `./docusaurus_textbook/`
5. Configure the build settings:
   - Build Command: `npm run build`
   - Output Directory: `build`
   - Install Command: `npm install`
6. Add Environment Variables (if needed):
   - `NODE_VERSION=18.x`
7. Click "Deploy"

### 2. Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to project directory
cd ./docusaurus_textbook/

# Deploy to production
vercel --prod
```

## Configuration Files

### vercel.json
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

### package.json (Node.js version)
```json
{
  "engines": {
    "node": "18.x"
  }
}
```

## Environment Variables

The following environment variables can be set in Vercel:

- `NODE_VERSION`: Set to `18.x` to ensure correct Node.js version
- `GENERATE_SOURCEMAP`: Set to `false` to reduce build size (optional)
- `CI`: Set to `false` to avoid CI-related build issues (optional)

## Build Process

1. Dependencies are installed via `npm install`
2. Docusaurus site is built via `npm run build`
3. Output is placed in the `build` directory
4. Static assets are served from the `build` directory

## Troubleshooting

### Common Issues

1. **Build fails due to Node.js version**
   - Ensure `NODE_VERSION` environment variable is set to `18.x` in Vercel

2. **Missing build directory**
   - Verify that the Output Directory in Vercel settings is set to `build`

3. **Module resolution errors**
   - Clear cache in Vercel settings and redeploy

### Verifying Deployment

After deployment, verify:
- Site loads without errors
- All pages are accessible
- Images and assets load correctly
- Search functionality works
- Links navigate correctly

## Post-Deployment

Once deployed, you can:
- Set up custom domains in Vercel
- Configure SSL certificates
- Set up automated deployments from GitHub
- Monitor performance and analytics