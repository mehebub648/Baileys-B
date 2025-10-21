# Vite Setup Guide

This guide explains how to use Baileys with Vite for browser development and production bundling.

## Quick Start

### Development Mode

Start the Vite development server with hot module replacement:

```bash
npm run dev
```

or

```bash
vite run dev
```

The dev server will start at http://localhost:3000 and automatically open in your browser.

### Production Build

Build the application for production:

```bash
npm run vite:build
```

or

```bash
vite run build
```

The optimized bundle will be created in the `dist/` directory.

### Preview Production Build

Preview the production build locally:

```bash
npm run preview
```

## Features

### ✨ What's Included

- **Hot Module Replacement (HMR)**: Changes reflect instantly without page reload
- **Optimized Builds**: Minified and tree-shaken code
- **MongoDB Configuration**: Easy setup interface with localStorage persistence
- **TypeScript Support**: Full type safety
- **Browser Polyfills**: Automatic Node.js API polyfills where possible

### 🌐 Browser Compatibility

The Vite setup includes:
- Node.js polyfills for Buffer, process, crypto, and more
- Mock modules for unavailable APIs (fs, child_process, etc.)
- Browser-compatible MongoDB connection interface

## Understanding Browser Limitations

### What Works in Browser

✅ **MongoDB Configuration**
- Save MongoDB URI and session ID
- Generate setup code for Node.js
- Manage multiple sessions
- LocalStorage persistence

✅ **User Interface**
- Responsive design
- Real-time feedback
- Form validation
- Message logging

### What Requires Node.js

❌ **Full WhatsApp Functionality**
- QR code generation and scanning
- Message sending and receiving
- Media handling
- Real-time connection management

**Why?** WhatsApp uses end-to-end encryption (libsignal) and WebSocket protocols that require Node.js environment.

## Recommended Workflow

1. **Configure in Browser**
   - Open http://localhost:3000
   - Enter MongoDB URI
   - Set session ID
   - Configuration is saved to localStorage

2. **Get Setup Code**
   - Click "Connect to WhatsApp"
   - Copy the auto-generated Node.js code
   - Use in your Node.js application

3. **Run in Node.js**
   ```typescript
   const { useMongoDBAuthState } = require('baileys')
   
   const mongoUri = 'mongodb://localhost:27017/baileys'
   const sessionId = 'default'
   
   const { state, saveCreds } = await useMongoDBAuthState(mongoUri, sessionId)
   const sock = makeWASocket({ auth: state })
   sock.ev.on('creds.update', saveCreds)
   ```

## Project Structure

```
├── index.html              # Main HTML entry point
├── vite.config.ts          # Vite configuration
├── src/
│   ├── frontend/
│   │   └── main.ts         # Frontend application code
│   ├── browser.ts          # Browser-compatible exports
│   ├── mocks/
│   │   ├── fs.ts          # Filesystem mock
│   │   └── empty.ts       # Empty module exports
│   └── Utils/
│       └── use-mongodb-auth-state.ts  # MongoDB integration
└── dist/                   # Production build output (generated)
```

## Configuration

The Vite configuration (`vite.config.ts`) includes:

- **Node Polyfills**: Buffer, process, crypto, util, stream
- **Module Aliases**: Custom paths for browser-compatible modules
- **Build Options**: Sourcemaps, code splitting, optimizations
- **Dev Server**: Port 3000, HMR enabled

### Customizing Vite Config

To modify the configuration, edit `vite.config.ts`:

```typescript
export default defineConfig({
  server: {
    port: 3000,  // Change dev server port
    open: true,  // Auto-open browser
  },
  build: {
    outDir: 'dist',  // Output directory
    sourcemap: true,  // Generate sourcemaps
  },
})
```

## Troubleshooting

### Dev Server Won't Start

**Issue**: Port 3000 already in use

**Solution**: 
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill

# Or use different port in vite.config.ts
```

### Build Errors

**Issue**: Module not found errors

**Solution**: 
1. Clear node_modules: `rm -rf node_modules`
2. Clear package lock: `rm package-lock.json`
3. Reinstall: `npm install`

### Browser Console Errors

**Issue**: "Cannot find module 'fs'" or similar

**Solution**: These are expected. The mock modules throw helpful errors. Use Node.js for actual functionality.

## Environment Variables

Create a `.env` file in the root directory:

```env
# MongoDB Configuration (optional - can be set in UI)
VITE_MONGODB_URI=mongodb://localhost:27017/baileys
VITE_SESSION_ID=default

# Development
VITE_PORT=3000
```

Access in code:
```typescript
const mongoUri = import.meta.env.VITE_MONGODB_URI
```

## Deployment

### Deploy to Netlify

1. Connect your repository
2. Set build command: `npm run vite:build`
3. Set publish directory: `dist`
4. Deploy!

### Deploy to Vercel

1. Import your repository
2. Framework preset: Vite
3. Build command: `npm run vite:build`
4. Output directory: `dist`
5. Deploy!

### Deploy to GitHub Pages

1. Build: `npm run vite:build`
2. Deploy: `npx gh-pages -d dist`

## Performance Tips

### Development

- Use HMR instead of full page reloads
- Keep dev server running while coding
- Use browser DevTools for debugging

### Production

- Enable gzip compression on your server
- Use CDN for static assets
- Enable browser caching
- Consider code splitting for large apps

## Best Practices

1. **Keep MongoDB URI Secure**: Don't commit `.env` files
2. **Use Sessions**: Different session IDs for different accounts
3. **Node.js for Production**: Use Node.js for actual WhatsApp connectivity
4. **Browser for Config**: Use browser UI for easy configuration

## Additional Resources

- [Vite Documentation](https://vitejs.dev/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Baileys Documentation](https://baileys.whiskeysockets.io/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## Support

For issues or questions:
1. Check existing GitHub issues
2. Review this guide
3. Check the main MONGODB.md guide
4. Open a new issue with details
