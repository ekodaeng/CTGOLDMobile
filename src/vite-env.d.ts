/// <reference types="vite/client" />

interface Window {
  Buffer: typeof import('buffer').Buffer;
  global: typeof globalThis;
}
