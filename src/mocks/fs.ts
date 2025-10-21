/**
 * Mock fs module for browser
 * These functions throw errors indicating they're not available in browser
 */

const notAvailable = (funcName: string) => {
    throw new Error(`${funcName} is not available in browser. Use MongoDB storage instead.`)
}

export const readFile = (...args: any[]) => notAvailable('fs.readFile')
export const writeFile = (...args: any[]) => notAvailable('fs.writeFile')
export const mkdir = (...args: any[]) => notAvailable('fs.mkdir')
export const stat = (...args: any[]) => notAvailable('fs.stat')
export const unlink = (...args: any[]) => notAvailable('fs.unlink')
export const createReadStream = (...args: any[]) => notAvailable('fs.createReadStream')
export const createWriteStream = (...args: any[]) => notAvailable('fs.createWriteStream')

export const promises = {
    readFile: (...args: any[]) => notAvailable('fs.promises.readFile'),
    writeFile: (...args: any[]) => notAvailable('fs.promises.writeFile'),
    mkdir: (...args: any[]) => notAvailable('fs.promises.mkdir'),
    stat: (...args: any[]) => notAvailable('fs.promises.stat'),
    unlink: (...args: any[]) => notAvailable('fs.promises.unlink'),
}

export default {
    readFile,
    writeFile,
    mkdir,
    stat,
    unlink,
    createReadStream,
    createWriteStream,
    promises,
}
