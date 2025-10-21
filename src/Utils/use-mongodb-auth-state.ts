import { Mutex } from 'async-mutex'
import mongoose, { Schema, Document, Model } from 'mongoose'
import { proto } from '../../WAProto/index.js'
import type { AuthenticationCreds, AuthenticationState, SignalDataTypeMap } from '../Types'
import { initAuthCreds } from './auth-utils'
import { BufferJSON } from './generics'

// Define interfaces for MongoDB documents
interface IAuthData extends Document {
	key: string
	value: string
}

// Define schema for auth data storage
const authDataSchema = new Schema<IAuthData>({
	key: {
		type: String,
		required: true,
		unique: true,
		index: true
	},
	value: {
		type: String,
		required: true
	}
})

// Create model
let AuthDataModel: Model<IAuthData>

// Connection status
let mongoConnection: typeof mongoose | null = null

// Lock for concurrent operations
const dbLock = new Mutex()

/**
 * Connect to MongoDB
 */
export const connectToMongoDB = async (uri: string): Promise<typeof mongoose> => {
	if (mongoConnection && mongoConnection.connection.readyState === 1) {
		return mongoConnection
	}

	mongoConnection = await mongoose.connect(uri, {
		serverSelectionTimeoutMS: 5000,
		socketTimeoutMS: 45000,
	})

	// Initialize model after connection
	if (!AuthDataModel) {
		AuthDataModel = mongoConnection.model<IAuthData>('AuthData', authDataSchema)
	}

	return mongoConnection
}

/**
 * Disconnect from MongoDB
 */
export const disconnectFromMongoDB = async (): Promise<void> => {
	if (mongoConnection) {
		await mongoConnection.disconnect()
		mongoConnection = null
	}
}

/**
 * Get MongoDB connection status
 */
export const isMongoDBConnected = (): boolean => {
	return mongoConnection !== null && mongoConnection.connection.readyState === 1
}

/**
 * Stores the authentication state in MongoDB.
 * This replaces the file-based useMultiFileAuthState for browser compatibility.
 * 
 * @param mongoUri - MongoDB connection URI
 * @param sessionId - Optional session identifier for multi-session support (defaults to 'default')
 */
export const useMongoDBAuthState = async (
	mongoUri: string,
	sessionId: string = 'default'
): Promise<{ state: AuthenticationState; saveCreds: () => Promise<void> }> => {
	// Connect to MongoDB
	await connectToMongoDB(mongoUri)

	// Prefix all keys with session ID for multi-session support
	const prefixKey = (key: string) => `${sessionId}:${key}`

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const writeData = async (data: any, key: string) => {
		const fullKey = prefixKey(key)
		
		return dbLock.acquire().then(async release => {
			try {
				const serialized = JSON.stringify(data, BufferJSON.replacer)
				await AuthDataModel.findOneAndUpdate(
					{ key: fullKey },
					{ key: fullKey, value: serialized },
					{ upsert: true, new: true }
				)
			} finally {
				release()
			}
		})
	}

	const readData = async (key: string) => {
		try {
			const fullKey = prefixKey(key)
			
			return await dbLock.acquire().then(async release => {
				try {
					const doc = await AuthDataModel.findOne({ key: fullKey })
					if (!doc) {
						return null
					}
					return JSON.parse(doc.value, BufferJSON.reviver)
				} finally {
					release()
				}
			})
		} catch (error) {
			return null
		}
	}

	const removeData = async (key: string) => {
		try {
			const fullKey = prefixKey(key)
			
			return dbLock.acquire().then(async release => {
				try {
					await AuthDataModel.deleteOne({ key: fullKey })
				} catch {
					// Ignore errors
				} finally {
					release()
				}
			})
		} catch {
			// Ignore errors
		}
	}

	// Load or initialize credentials
	const creds: AuthenticationCreds = (await readData('creds.json')) || initAuthCreds()

	return {
		state: {
			creds,
			keys: {
				get: async (type, ids) => {
					const data: { [_: string]: SignalDataTypeMap[typeof type] } = {}
					await Promise.all(
						ids.map(async id => {
							let value = await readData(`${type}-${id}.json`)
							if (type === 'app-state-sync-key' && value) {
								value = proto.Message.AppStateSyncKeyData.fromObject(value)
							}

							data[id] = value
						})
					)

					return data
				},
				set: async data => {
					const tasks: Promise<void>[] = []
					for (const category in data) {
						for (const id in data[category as keyof SignalDataTypeMap]) {
							const value = data[category as keyof SignalDataTypeMap]![id]
							const key = `${category}-${id}.json`
							tasks.push(value ? writeData(value, key) : removeData(key))
						}
					}

					await Promise.all(tasks)
				}
			}
		},
		saveCreds: async () => {
			return writeData(creds, 'creds.json')
		}
	}
}
