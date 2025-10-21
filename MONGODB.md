# MongoDB Integration Guide

This guide explains how to use Baileys with MongoDB for authentication state storage, making it suitable for browser-based applications and environments where file system access is limited.

## Table of Contents

- [Overview](#overview)
- [Installation](#installation)
- [Basic Usage](#basic-usage)
- [Web Demo](#web-demo)
- [Advanced Usage](#advanced-usage)
- [API Reference](#api-reference)
- [Migration Guide](#migration-guide)
- [Troubleshooting](#troubleshooting)

## Overview

The MongoDB integration provides an alternative to file-based authentication state storage. It offers:

- **Browser Compatibility**: No file system dependencies
- **Scalability**: Efficient handling of concurrent sessions
- **Multi-Session Support**: Manage multiple WhatsApp accounts
- **Production Ready**: Built-in error handling and connection management
- **Easy Migration**: Same interface as `useMultiFileAuthState`

## Installation

The MongoDB integration uses Mongoose, which is already included as a dependency:

```bash
npm install @whiskeysockets/baileys
# or
yarn add @whiskeysockets/baileys
```

Make sure you have MongoDB running. You can use:
- Local MongoDB installation
- MongoDB Atlas (cloud)
- Docker: `docker run -d -p 27017:27017 mongo`

## Basic Usage

### Simple Connection

```typescript
import makeWASocket, { useMongoDBAuthState } from '@whiskeysockets/baileys'

async function connectToWhatsApp() {
    // Connect to MongoDB and initialize auth state
    const { state, saveCreds } = await useMongoDBAuthState(
        'mongodb://localhost:27017/baileys',
        'default' // optional session ID
    )

    // Create WhatsApp socket
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true
    })

    // Save credentials when updated
    sock.ev.on('creds.update', saveCreds)

    return sock
}

connectToWhatsApp()
```

### With Connection Handling

```typescript
import makeWASocket, { 
    useMongoDBAuthState, 
    DisconnectReason 
} from '@whiskeysockets/baileys'
import { Boom } from '@hapi/boom'

async function connectToWhatsApp() {
    const { state, saveCreds } = await useMongoDBAuthState(
        process.env.MONGODB_URI || 'mongodb://localhost:27017/baileys',
        process.env.SESSION_ID || 'default'
    )

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true
    })

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update

        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode 
                !== DisconnectReason.loggedOut
            
            if (shouldReconnect) {
                connectToWhatsApp()
            }
        } else if (connection === 'open') {
            console.log('Connected to WhatsApp!')
        }
    })

    sock.ev.on('creds.update', saveCreds)

    return sock
}

connectToWhatsApp()
```

## Web Demo

A web-based demo is included in `index.html`. To use it:

1. Start a local web server:
   ```bash
   python3 -m http.server 8080
   # or
   npx serve .
   ```

2. Open `http://localhost:8080/index.html` in your browser

3. Enter your MongoDB URI and click "Connect to MongoDB"

4. Your MongoDB URI will be saved in browser's local storage for convenience

## Advanced Usage

### Multi-Session Support

Manage multiple WhatsApp accounts using different session IDs:

```typescript
// Account 1
const { state: state1, saveCreds: saveCreds1 } = await useMongoDBAuthState(
    'mongodb://localhost:27017/baileys',
    'account-1'
)

// Account 2
const { state: state2, saveCreds: saveCreds2 } = await useMongoDBAuthState(
    'mongodb://localhost:27017/baileys',
    'account-2'
)

const sock1 = makeWASocket({ auth: state1 })
const sock2 = makeWASocket({ auth: state2 })

sock1.ev.on('creds.update', saveCreds1)
sock2.ev.on('creds.update', saveCreds2)
```

### Connection Management

```typescript
import { 
    connectToMongoDB, 
    disconnectFromMongoDB, 
    isMongoDBConnected 
} from '@whiskeysockets/baileys'

// Manual connection
await connectToMongoDB('mongodb://localhost:27017/baileys')

// Check connection status
if (isMongoDBConnected()) {
    console.log('MongoDB is connected')
}

// Graceful shutdown
process.on('SIGINT', async () => {
    await disconnectFromMongoDB()
    process.exit(0)
})
```

### Using Environment Variables

Create a `.env` file:

```env
MONGODB_URI=mongodb://localhost:27017/baileys
SESSION_ID=default
```

Then in your code:

```typescript
import 'dotenv/config'

const { state, saveCreds } = await useMongoDBAuthState(
    process.env.MONGODB_URI!,
    process.env.SESSION_ID
)
```

### MongoDB Atlas (Cloud)

```typescript
const mongoUri = 'mongodb+srv://username:password@cluster.mongodb.net/baileys?retryWrites=true&w=majority'

const { state, saveCreds } = await useMongoDBAuthState(mongoUri, 'production')
```

## API Reference

### `useMongoDBAuthState(mongoUri, sessionId?)`

Creates or loads authentication state from MongoDB.

**Parameters:**
- `mongoUri` (string, required): MongoDB connection URI
- `sessionId` (string, optional): Session identifier for multi-account support (default: 'default')

**Returns:** Promise resolving to an object with:
- `state`: Authentication state object
- `saveCreds`: Function to save credentials

**Example:**
```typescript
const { state, saveCreds } = await useMongoDBAuthState(
    'mongodb://localhost:27017/baileys',
    'my-session'
)
```

### `connectToMongoDB(uri)`

Manually connects to MongoDB.

**Parameters:**
- `uri` (string, required): MongoDB connection URI

**Returns:** Promise resolving to mongoose instance

**Example:**
```typescript
await connectToMongoDB('mongodb://localhost:27017/baileys')
```

### `disconnectFromMongoDB()`

Disconnects from MongoDB.

**Returns:** Promise<void>

**Example:**
```typescript
await disconnectFromMongoDB()
```

### `isMongoDBConnected()`

Checks if MongoDB is connected.

**Returns:** boolean

**Example:**
```typescript
if (isMongoDBConnected()) {
    console.log('MongoDB is ready')
}
```

## Migration Guide

### From File System to MongoDB

**Before (File System):**
```typescript
import { useMultiFileAuthState } from '@whiskeysockets/baileys'

const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys')
```

**After (MongoDB):**
```typescript
import { useMongoDBAuthState } from '@whiskeysockets/baileys'

const { state, saveCreds } = await useMongoDBAuthState(
    'mongodb://localhost:27017/baileys',
    'default'
)
```

### Data Migration

To migrate existing file-based auth data to MongoDB:

1. Load your existing auth state using `useMultiFileAuthState`
2. Create a new MongoDB auth state with `useMongoDBAuthState`
3. Copy the credentials manually:

```typescript
// Load from files
const { state: fileState } = await useMultiFileAuthState('auth_info_baileys')

// Create MongoDB state
const { state: mongoState, saveCreds } = await useMongoDBAuthState(
    'mongodb://localhost:27017/baileys'
)

// Update MongoDB state with file data
mongoState.creds = fileState.creds

// Save to MongoDB
await saveCreds()
```

## Troubleshooting

### Connection Errors

**Problem:** `MongooseServerSelectionError: connect ECONNREFUSED`

**Solution:** Make sure MongoDB is running:
```bash
# Check if MongoDB is running
mongosh
# or
mongo

# Start MongoDB (if using systemd)
sudo systemctl start mongod
```

### Authentication Errors

**Problem:** `MongooseError: Authentication failed`

**Solution:** Check your MongoDB URI credentials:
```typescript
// Correct format
mongodb://username:password@localhost:27017/baileys
// or for Atlas
mongodb+srv://username:password@cluster.mongodb.net/baileys
```

### Multiple Sessions Conflict

**Problem:** Multiple sessions interfering with each other

**Solution:** Use unique session IDs:
```typescript
const { state } = await useMongoDBAuthState(mongoUri, 'unique-session-id-1')
```

### Browser CORS Issues

**Problem:** CORS errors when connecting from browser

**Solution:** MongoDB connections from browsers require a proxy or use MongoDB Realm/Atlas App Services for browser-compatible access. The web demo in `index.html` is meant for demonstration and requires server-side implementation for production use.

### Memory Leaks

**Problem:** High memory usage over time

**Solution:** Ensure proper cleanup:
```typescript
process.on('SIGINT', async () => {
    await disconnectFromMongoDB()
    process.exit(0)
})
```

## Best Practices

1. **Use Environment Variables**: Store MongoDB URI in environment variables, not in code
2. **Unique Session IDs**: Use descriptive, unique session IDs for different accounts
3. **Error Handling**: Always wrap MongoDB operations in try-catch blocks
4. **Connection Pooling**: Mongoose handles connection pooling automatically
5. **Indexes**: The implementation creates indexes automatically for performance
6. **Backup**: Regularly backup your MongoDB database
7. **Security**: Use strong passwords and restrict network access to MongoDB

## Example Projects

See the `Example/example-mongodb.ts` file for a complete working example.

To run it:
```bash
npm run example:mongodb
```

## Support

For issues, questions, or contributions, please visit the GitHub repository.
