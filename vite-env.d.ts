/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SOLANA_PRIVATE_KEY?: string;
  readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

