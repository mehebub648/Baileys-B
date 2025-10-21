# Browser Quick Start Guide

Get Baileys running in your browser in 5 minutes! 🚀

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Start Development Server

```bash
npm run dev
```

You should see:
```
VITE v5.4.21  ready in 206 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

## Step 3: Open in Browser

Visit **http://localhost:5173/** in your browser.

You'll see the Baileys Browser Example interface:
- Connect to WhatsApp button
- Phone number input
- Message input
- Activity log

## Step 4: Test the Connection (Demo Mode)

Click the **"Connect to WhatsApp"** button to see the demo in action.

The activity log will show:
```
✓ Browser example loaded
✓ fs-browser module is configured and ready
✓ Initializing connection to WhatsApp...
✓ Browser compatibility has been configured!
✓ fs module has been shimmed with fs-browser
✓ Ready to use (demo mode)
```

## Step 5: Build for Production

When ready to deploy:

```bash
npm run build:browser
```

Output will be in the `dist/` directory:
```
dist/
├── index.html
└── assets/
    └── index-[hash].js
```

## Testing

Run the browser compatibility tests:

```bash
npm run test:browser
```

Expected output:
```
✓ fs-browser/__tests__/fs-browser.test.js (6 tests) 8ms

Test Files  1 passed (1)
     Tests  6 passed (6)
```

## What Just Happened?

1. **Vite** served your application with hot reload
2. **fs-browser** shimmed all Node.js filesystem operations
3. Browser APIs replaced Node.js built-ins
4. Your app runs entirely in the browser!

## Common Issues

### Port Already in Use

If port 5173 is already in use:

```bash
npm run dev -- --port 3000
```

### Module Not Found

Clear cache and reinstall:

```bash
rm -rf node_modules package-lock.json
npm install
```

### Build Errors

Clear build cache:

```bash
rm -rf dist node_modules/.vite
npm run build:browser
```

## Next Steps

Now that you have Baileys running in the browser:

1. **Customize the UI**: Edit `index.html` to match your design
2. **Add Features**: Integrate Baileys functionality in the JavaScript
3. **Handle Auth**: Implement proper authentication storage
4. **Deploy**: Upload the `dist/` folder to your hosting service

## Need Help?

- 📖 Read [BROWSER_USAGE.md](BROWSER_USAGE.md) for detailed usage
- 🔧 Check [BROWSER_COMPATIBILITY.md](BROWSER_COMPATIBILITY.md) for technical details
- 💬 Join the [Discord](https://discord.gg/WeJM5FP9GG) for support

## Key Commands Reference

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build:browser` | Build for production |
| `npm run preview` | Preview production build |
| `npm run test:browser` | Run browser tests |

## Browser Support

| Browser | Version | Support |
|---------|---------|---------|
| Chrome | 86+ | ✅ Full |
| Edge | 86+ | ✅ Full |
| Opera | 72+ | ✅ Full |
| Firefox | Latest | ⚠️ Fallback |
| Safari | Latest | ⚠️ Fallback |

**Full Support**: File System Access API  
**Fallback**: Traditional file input/download

---

Happy coding! 🎉
