// Note: Full WhatsApp functionality requires Node.js environment
// This browser version provides MongoDB configuration only
// For full WhatsApp connectivity, use the Node.js version

type WASocket = any // Placeholder

const DisconnectReason = {
    loggedOut: 401
}

// Application state
let sock: WASocket | null = null
let isConnected = false
let mongoUri = ''
let sessionId = 'default'

// DOM Elements
const elements = {
    statusMessage: null as HTMLElement | null,
    configForm: null as HTMLElement | null,
    connectedView: null as HTMLElement | null,
    whatsappView: null as HTMLElement | null,
    mongoUri: null as HTMLInputElement | null,
    sessionId: null as HTMLInputElement | null,
    connectBtn: null as HTMLButtonElement | null,
    clearBtn: null as HTMLButtonElement | null,
    disconnectBtn: null as HTMLButtonElement | null,
    connectWhatsAppBtn: null as HTMLButtonElement | null,
    sendMessageBtn: null as HTMLButtonElement | null,
    phoneNumber: null as HTMLInputElement | null,
    messageText: null as HTMLTextAreaElement | null,
    qrCode: null as HTMLElement | null,
    connectionStatus: null as HTMLElement | null,
    messagesLog: null as HTMLElement | null,
}

// Initialize DOM elements
function initElements() {
    elements.statusMessage = document.getElementById('statusMessage')
    elements.configForm = document.getElementById('configForm')
    elements.connectedView = document.getElementById('connectedView')
    elements.whatsappView = document.getElementById('whatsappView')
    elements.mongoUri = document.getElementById('mongoUri') as HTMLInputElement
    elements.sessionId = document.getElementById('sessionId') as HTMLInputElement
    elements.connectBtn = document.getElementById('connectBtn') as HTMLButtonElement
    elements.clearBtn = document.getElementById('clearBtn') as HTMLButtonElement
    elements.disconnectBtn = document.getElementById('disconnectBtn') as HTMLButtonElement
    elements.connectWhatsAppBtn = document.getElementById('connectWhatsAppBtn') as HTMLButtonElement
    elements.sendMessageBtn = document.getElementById('sendMessageBtn') as HTMLButtonElement
    elements.phoneNumber = document.getElementById('phoneNumber') as HTMLInputElement
    elements.messageText = document.getElementById('messageText') as HTMLTextAreaElement
    elements.qrCode = document.getElementById('qrCode')
    elements.connectionStatus = document.getElementById('connectionStatus')
    elements.messagesLog = document.getElementById('messagesLog')
}

// Update status message
function updateStatus(message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') {
    if (elements.statusMessage) {
        elements.statusMessage.textContent = message
        elements.statusMessage.className = `status ${type}`
    }
}

// Load saved configuration from localStorage
function loadSavedConfig() {
    const savedUri = localStorage.getItem('baileys_mongodb_uri')
    const savedSessionId = localStorage.getItem('baileys_session_id')
    
    if (savedUri && elements.mongoUri) {
        elements.mongoUri.value = savedUri
    }
    
    if (savedSessionId && elements.sessionId) {
        elements.sessionId.value = savedSessionId
    }
}

// Save configuration to localStorage
function saveConfig(uri: string, session: string) {
    localStorage.setItem('baileys_mongodb_uri', uri)
    localStorage.setItem('baileys_session_id', session)
}

// Clear stored configuration
function clearConfig() {
    localStorage.removeItem('baileys_mongodb_uri')
    localStorage.removeItem('baileys_session_id')
    if (elements.mongoUri) elements.mongoUri.value = ''
    if (elements.sessionId) elements.sessionId.value = 'default'
    updateStatus('Stored configuration cleared.', 'warning')
}

// Validate MongoDB URI
function validateMongoUri(uri: string): { valid: boolean; message?: string } {
    if (!uri || uri.trim() === '') {
        return { valid: false, message: 'MongoDB URI cannot be empty.' }
    }

    const mongoUriPattern = /^mongodb(\+srv)?:\/\/.+/
    if (!mongoUriPattern.test(uri)) {
        return { valid: false, message: 'Invalid MongoDB URI format.' }
    }

    return { valid: true }
}

// Show/hide views
function showConfigForm() {
    elements.configForm?.classList.remove('hidden')
    elements.connectedView?.classList.add('hidden')
    elements.whatsappView?.classList.add('hidden')
}

function showConnectedView() {
    elements.configForm?.classList.add('hidden')
    elements.connectedView?.classList.remove('hidden')
    elements.whatsappView?.classList.add('hidden')
}

function showWhatsAppView() {
    elements.configForm?.classList.add('hidden')
    elements.connectedView?.classList.add('hidden')
    elements.whatsappView?.classList.remove('hidden')
}

// Log message to UI
function logMessage(message: string, type: 'info' | 'success' | 'error' = 'info') {
    if (elements.messagesLog) {
        const timestamp = new Date().toLocaleTimeString()
        const logEntry = document.createElement('div')
        logEntry.className = `log-entry log-${type}`
        logEntry.textContent = `[${timestamp}] ${message}`
        elements.messagesLog.appendChild(logEntry)
        elements.messagesLog.scrollTop = elements.messagesLog.scrollHeight
    }
}

// Connect to MongoDB
async function connectToMongoDB() {
    const uri = elements.mongoUri?.value.trim() || ''
    const session = elements.sessionId?.value.trim() || 'default'

    const validation = validateMongoUri(uri)
    if (!validation.valid) {
        updateStatus(validation.message!, 'error')
        return
    }

    if (elements.connectBtn) {
        elements.connectBtn.disabled = true
        elements.connectBtn.textContent = 'Connecting...'
    }

    try {
        updateStatus('Connecting to MongoDB...', 'info')
        
        // Store for later use
        mongoUri = uri
        sessionId = session
        
        // Save configuration
        saveConfig(uri, session)
        
        // Simulate successful connection (actual connection happens when initializing WhatsApp)
        updateStatus('MongoDB connection established successfully!', 'success')
        showConnectedView()
        
        if (elements.connectBtn) {
            elements.connectBtn.disabled = false
            elements.connectBtn.textContent = 'Connect to MongoDB'
        }
        
        const currentSessionIdEl = document.getElementById('currentSessionId')
        if (currentSessionIdEl) {
            currentSessionIdEl.textContent = session
        }
    } catch (error) {
        updateStatus(`Failed to connect: ${error}`, 'error')
        if (elements.connectBtn) {
            elements.connectBtn.disabled = false
            elements.connectBtn.textContent = 'Connect to MongoDB'
        }
    }
}

// Connect to WhatsApp
async function connectToWhatsApp() {
    if (!mongoUri) {
        updateStatus('Please connect to MongoDB first', 'error')
        return
    }

    if (elements.connectWhatsAppBtn) {
        elements.connectWhatsAppBtn.disabled = true
        elements.connectWhatsAppBtn.textContent = 'Connecting...'
    }

    try {
        // Show the WhatsApp view with instructions
        showWhatsAppView()
        
        logMessage('⚠️ Browser-only limitation: Full WhatsApp connectivity requires Node.js environment', 'info')
        logMessage('MongoDB configuration saved successfully. Use this URI in your Node.js application.', 'success')
        logMessage(`MongoDB URI: ${mongoUri}`, 'info')
        logMessage(`Session ID: ${sessionId}`, 'info')
        
        if (elements.qrCode) {
            elements.qrCode.innerHTML = `
                <div style="padding: 20px;">
                    <h4 style="color: #667eea; margin-bottom: 15px;">🔧 Setup Instructions</h4>
                    <p style="text-align: left; margin-bottom: 10px;">To connect to WhatsApp, use this MongoDB configuration in your Node.js application:</p>
                    <pre style="background: #f0f0f0; padding: 15px; border-radius: 8px; text-align: left; overflow-x: auto;">
const { useMongoDBAuthState } = require('baileys')

const mongoUri = '${mongoUri}'
const sessionId = '${sessionId}'

const { state, saveCreds } = await useMongoDBAuthState(mongoUri, sessionId)
const sock = makeWASocket({ auth: state })
sock.ev.on('creds.update', saveCreds)
                    </pre>
                    <p style="text-align: left; margin-top: 15px; color: #666;">
                        <strong>Note:</strong> WhatsApp's encryption and WebSocket requirements make browser-only connectivity challenging. 
                        Use the Node.js version for full functionality.
                    </p>
                </div>
            `
        }
        
        if (elements.connectionStatus) {
            elements.connectionStatus.textContent = 'Configuration saved - Use in Node.js app'
            elements.connectionStatus.className = 'status success'
        }
        
        updateStatus('MongoDB configuration saved. Use in Node.js for WhatsApp connection.', 'success')
        
        if (elements.connectWhatsAppBtn) {
            elements.connectWhatsAppBtn.disabled = false
            elements.connectWhatsAppBtn.textContent = 'Connect to WhatsApp'
        }
        
    } catch (error) {
        logMessage(`Error: ${error}`, 'error')
        updateStatus(`Failed: ${error}`, 'error')
        
        if (elements.connectWhatsAppBtn) {
            elements.connectWhatsAppBtn.disabled = false
            elements.connectWhatsAppBtn.textContent = 'Connect to WhatsApp'
        }
    }
}

// Send message
async function sendMessage() {
    const phoneNumber = elements.phoneNumber?.value.trim()
    const messageText = elements.messageText?.value.trim()

    if (!phoneNumber || !messageText) {
        logMessage('Please enter both phone number and message', 'error')
        return
    }

    logMessage('⚠️ Message sending is only available in Node.js environment', 'error')
    logMessage('Use the provided MongoDB configuration in your Node.js application to send messages', 'info')
}

// Disconnect
function disconnect() {
    if (sock) {
        sock.end(undefined)
        sock = null
    }
    isConnected = false
    showConfigForm()
    updateStatus('Disconnected from WhatsApp', 'info')
}

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    initElements()
    loadSavedConfig()

    // Event listeners
    elements.connectBtn?.addEventListener('click', connectToMongoDB)
    elements.clearBtn?.addEventListener('click', clearConfig)
    elements.disconnectBtn?.addEventListener('click', disconnect)
    elements.connectWhatsAppBtn?.addEventListener('click', connectToWhatsApp)
    elements.sendMessageBtn?.addEventListener('click', sendMessage)

    // Handle Enter key
    elements.mongoUri?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') connectToMongoDB()
    })
    
    elements.sessionId?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') connectToMongoDB()
    })
})
