/**
 * Browser-compatible exports for Baileys
 * This file exports only the browser-compatible parts of Baileys
 */

// Export MongoDB auth state (browser-compatible)
export { 
    useMongoDBAuthState, 
    connectToMongoDB, 
    disconnectFromMongoDB, 
    isMongoDBConnected 
} from './Utils/use-mongodb-auth-state'

// Export types
export * from './Types'

// Export socket maker
// Note: makeWASocket may have limited functionality in browser due to WebSocket and crypto dependencies
import makeWASocket from './Socket'
export { makeWASocket }
export default makeWASocket

// Export useful utilities
export { BufferJSON, generateMessageIDV2 } from './Utils/generics'
export { DisconnectReason } from './Types'

// Export proto
export * from '../WAProto'
