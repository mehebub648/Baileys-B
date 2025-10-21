export type ReadFileOptions = { encoding?: 'utf8' | string, suggestedName?: string } | string | undefined;
export type WriteFileOptions = { suggestedName?: string } | undefined;
export interface FsBrowser {
  readFile(path: string, options: ReadFileOptions, cb: (err: any, data?: string|Uint8Array) => void): void;
  readFile(path: string, cb: (err: any, data?: string|Uint8Array) => void): void;
  writeFile(path: string, data: string|Uint8Array|Blob, options: WriteFileOptions, cb: (err?: any) => void): void;
  writeFile(path: string, data: string|Uint8Array|Blob, cb: (err?: any) => void): void;
  promises: {
    readFile(path: string, options?: ReadFileOptions): Promise<string|Uint8Array>;
    writeFile(path: string, data: string|Uint8Array|Blob, options?: WriteFileOptions): Promise<void>;
  };
  existsSync(): boolean;
}
declare const fsBrowser: FsBrowser & { _create: any };
export = fsBrowser;
