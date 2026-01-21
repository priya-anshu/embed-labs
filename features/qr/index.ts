/**
 * QR feature public API.
 * 
 * This barrel export provides a clean interface for other
 * parts of the application to interact with QR functionality.
 * 
 * SECURITY: All operations are server-side only.
 * QR codes are treated as controlled assets, not user input.
 */

export type {
  QRCode,
  QRMetadata,
  BindQRResult,
  VerifyQRResult,
} from "./types";

export {
  bindQRAction,
  verifyQRAction,
} from "./actions";

export {
  validateQRCodeFormat,
  normalizeQRCode,
} from "./services/validation";

// Token services (server-side only)
export {
  mintAccessToken,
  consumeAccessToken,
  type MintTokenResult,
  type ConsumeTokenResult,
} from "./services/tokens";

// Admin services (server-side only, service role)
export * as QRAdmin from "./services/admin";
