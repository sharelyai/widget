import { sharelyai } from './embed';

// Ensure embed API is on window (the import's side effect does this,
// but we reference it explicitly to prevent tree-shaking)
if (typeof window !== 'undefined' && !window.sharelyai) {
  window.sharelyai = sharelyai;
}
