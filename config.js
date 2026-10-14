/**
 * ============================================================
 * config.js
 * ------------------------------------------------------------
 * Konfigurasi frontend SPMB.
 * WAJIB DIISI: APPS_SCRIPT_URL setelah deploy Web App.
 * ============================================================
 */

const APP_CONFIG = {
  /**
   * URL Web App Apps Script (hasil deploy).
   * Contoh: https://script.google.com/macros/s/AKfycb.../exec
   *
   * CARA DAPAT:
   * 1. Buka Apps Script Editor
   * 2. Deploy > New deployment > Web app
   * 3. Execute as: Me
   * 4. Who has access: Anyone
   * 5. Copy "Web app URL"
   * 6. Paste di sini
   */
  APPS_SCRIPT_URL: 'ISI_URL_WEB_APP_APPS_SCRIPT_ANDA_DI_SINI',

  /** Versi aplikasi (untuk cache busting). */
  APP_VERSION: '1.0.0-tahap2',

  /** Nama aplikasi. */
  APP_NAME: 'SPMB SMK Muhammadiyah 1 Surakarta',

  /** Timeout fetch (ms). */
  FETCH_TIMEOUT: 30000
};
