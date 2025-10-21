# Browser Usage Guide

This guide shows how to use Baileys in a browser environment with the new browser compatibility features.

## Prerequisites

Make sure you have installed all dependencies:

```bash
npm install
```

## Development Workflow

### 1. Start Development Server

```bash
npm run dev
```

This will start the Vite development server at `http://localhost:5173/`. The server includes:
- Hot Module Replacement (HMR) for instant updates
- Auto-reloading when files change
- Source maps for debugging

### 2. Test Your Changes

Run the browser-specific tests:

```bash
npm run test:browser
```

This runs the Vitest test suite in a jsdom environment to verify the fs-browser module works correctly.

### 3. Build for Production

```bash
npm run build:browser
```

This creates an optimized production bundle in the `dist/` directory.

### 4. Preview Production Build

```bash
npm run preview
```

This serves the production build locally for testing before deployment.

## Using Baileys in Your Browser App

### Basic Setup

```javascript
import makeWASocket from '@whiskeysockets/baileys'

// The fs module is automatically shimmed when using Vite
// No special configuration needed!

const sock = makeWASocket({
    // your config here
})

// Use Baileys as normal
await sock.sendMessage(jid, { text: 'Hello from browser!' })
```

### Handling File Operations

When your code needs to read or write files, the fs-browser module will automatically prompt the user:

```javascript
// Reading a file - user will be prompted to select a file
const data = await fs.promises.readFile('path/to/file', 'utf8')

// Writing a file - user will be prompted to save
await fs.promises.writeFile('path/to/file', data, { 
    suggestedName: 'output.txt' 
})
```

### Important Considerations

1. **User Interaction Required**: All file operations require user interaction (clicking a button, selecting a file). You cannot read/write files automatically.

2. **No Streaming**: Operations like `createReadStream()` and `createWriteStream()` are not supported. Use the promise-based API instead.

3. **No Directory Operations**: Operations like `mkdir()`, `readdir()`, and `stat()` are not supported in the browser.

4. **Handle Errors Gracefully**: Always wrap file operations in try-catch blocks:

```javascript
try {
    const data = await fs.promises.readFile('file.txt', 'utf8')
    console.log(data)
} catch (error) {
    if (error.code === 'ENOTSUP') {
        console.log('This operation is not supported in the browser')
    } else {
        console.error('File operation failed:', error)
    }
}
```

## Example: Simple Chat Interface

Here's a minimal example of using Baileys in the browser:

```html
<!DOCTYPE html>
<html>
<head>
    <title>WhatsApp Browser Client</title>
</head>
<body>
    <button id="connect">Connect</button>
    <input type="text" id="number" placeholder="Phone number">
    <input type="text" id="message" placeholder="Message">
    <button id="send">Send</button>
    
    <script type="module">
        import makeWASocket from './node_modules/@whiskeysockets/baileys/lib/index.js'
        
        let sock
        
        document.getElementById('connect').onclick = async () => {
            // Initialize connection
            sock = makeWASocket({
                // your config
            })
            
            // Handle connection events
            sock.ev.on('connection.update', (update) => {
                console.log('Connection update:', update)
            })
        }
        
        document.getElementById('send').onclick = async () => {
            const number = document.getElementById('number').value
            const message = document.getElementById('message').value
            
            await sock.sendMessage(number + '@s.whatsapp.net', {
                text: message
            })
        }
    </script>
</body>
</html>
```

## Customizing the Build

### Vite Configuration

Edit `vite.config.js` to customize the build:

```javascript
import { defineConfig } from 'vite';

export default defineConfig({
  resolve: {
    alias: {
      fs: path.resolve(__dirname, 'fs-browser/index.js'),
      // Add more aliases as needed
    }
  },
  build: {
    // Customize build options
    outDir: 'dist',
    minify: 'terser',
    sourcemap: true
  }
})
```

### Adding Custom File Operations

You can extend the fs-browser module for your specific needs:

```javascript
// custom-fs.js
import fsBrowser from './fs-browser/index.js'

const customFs = fsBrowser._create({
    adapter: {
        pickOpen: async () => {
            // Your custom file picker logic
        },
        pickSave: async (suggestedName) => {
            // Your custom save logic
        }
    }
})

export default customFs
```

## Deployment

### Static Hosting

Deploy the `dist/` folder to any static hosting service:
- Netlify
- Vercel
- GitHub Pages
- Cloudflare Pages

### Environment Variables

Use Vite's environment variables for configuration:

```javascript
// Access in your code
const apiUrl = import.meta.env.VITE_API_URL
```

Create a `.env` file:
```
VITE_API_URL=https://api.example.com
```

## Troubleshooting

### "fs is not supported" error

Make sure you're running through Vite (`npm run dev` or using the bundled output from `npm run build:browser`).

### File picker doesn't appear

1. Check browser console for errors
2. Ensure you're running in a secure context (HTTPS or localhost)
3. Verify File System Access API is available in your browser

### Build errors

1. Clear node_modules and reinstall:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. Clear Vite cache:
   ```bash
   rm -rf dist node_modules/.vite
   npm run build:browser
   ```

## Best Practices

1. **Always test in multiple browsers**: Chrome, Firefox, Safari, and Edge
2. **Handle errors gracefully**: Not all browsers support all features
3. **Provide fallbacks**: Use traditional download/upload methods when File System Access API is unavailable
4. **Keep bundles small**: Only import what you need from Baileys
5. **Use code splitting**: Break your app into chunks for faster loading

## Next Steps

- Explore the [BROWSER_COMPATIBILITY.md](BROWSER_COMPATIBILITY.md) for advanced topics
- Check out the [example.html](index.html) for a complete working example
- Read the [Baileys documentation](https://guide.whiskeysockets.io/) for API details
