import makeWASocket, { DisconnectReason, useMongoDBAuthState } from '../src/index.js'
import { Boom } from '@hapi/boom'
import P from 'pino'

/**
 * Example of using Baileys with MongoDB for authentication state storage.
 * This is suitable for browser-based applications and deployments where file system access is limited.
 * 
 * To run this example:
 * 1. Make sure MongoDB is running (local or cloud instance)
 * 2. Update the MONGODB_URI constant below with your connection string
 * 3. Run: npm run example-mongodb (add this script to package.json)
 */

// MongoDB connection URI - Update this with your actual MongoDB URI
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/baileys'

// Optional: Session ID for multi-account support
const SESSION_ID = process.env.SESSION_ID || 'default'

async function connectToWhatsApp() {
	try {
		// Initialize MongoDB authentication state
		const { state, saveCreds } = await useMongoDBAuthState(MONGODB_URI, SESSION_ID)
		
		// Create WhatsApp socket with MongoDB auth state
		const sock = makeWASocket({
			auth: state,
			printQRInTerminal: true,
			logger: P({ level: 'info' }),
			// Browser info
			browser: ['Baileys MongoDB', 'Chrome', '1.0.0']
		})

		// Handle connection updates
		sock.ev.on('connection.update', (update) => {
			const { connection, lastDisconnect, qr } = update
			
			if (qr) {
				console.log('QR Code:', qr)
				console.log('Scan the QR code above with WhatsApp')
			}

			if (connection === 'close') {
				const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut
				console.log('Connection closed due to:', lastDisconnect?.error, ', reconnecting:', shouldReconnect)
				
				// Reconnect if not logged out
				if (shouldReconnect) {
					connectToWhatsApp()
				}
			} else if (connection === 'open') {
				console.log('✅ Connected to WhatsApp!')
				console.log('Session ID:', SESSION_ID)
				console.log('MongoDB URI:', MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')) // Hide credentials in log
			}
		})

		// Handle messages
		sock.ev.on('messages.upsert', async ({ messages, type }) => {
			console.log('Received messages:', type)
			
			for (const message of messages) {
				if (!message.message) continue
				
				console.log('Message from:', message.key.remoteJid)
				
				// Example: Reply to messages (uncomment to enable)
				/*
				if (!message.key.fromMe) {
					await sock.sendMessage(message.key.remoteJid!, {
						text: 'Hello! I am a bot using Baileys with MongoDB storage.'
					})
				}
				*/
			}
		})

		// Save credentials whenever they are updated
		sock.ev.on('creds.update', saveCreds)

		// Handle messaging history
		sock.ev.on('messaging-history.set', ({ chats, contacts, messages, isLatest }) => {
			console.log(`Received messaging history. Chats: ${chats.length}, Contacts: ${contacts.length}, Messages: ${messages.length}, Latest: ${isLatest}`)
		})

		// Handle group updates
		sock.ev.on('groups.update', (updates) => {
			console.log('Group updates:', updates)
		})

		return sock
	} catch (error) {
		console.error('Error connecting to WhatsApp:', error)
		throw error
	}
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
	console.log('\n🛑 Shutting down gracefully...')
	// Disconnect from MongoDB if needed
	const { disconnectFromMongoDB } = await import('../src/index.js')
	await disconnectFromMongoDB()
	process.exit(0)
})

// Start the bot
connectToWhatsApp().catch(console.error)
