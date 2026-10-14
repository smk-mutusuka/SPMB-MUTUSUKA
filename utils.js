/**
 * ============================================================
 * utils.js
 * ------------------------------------------------------------
 * Fungsi bantu umum untuk frontend.
 * ============================================================
 */

const Utils = {

  /** Escape HTML untuk cegah XSS. */
  escapeHtml: function (s) {
    if (s === null || s === undefined) return '';
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  },

  /** Format tanggal Indonesia. */
  formatTanggal: function (iso) {
    if (!iso) return '-';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '-';
    const bulan = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    return d.getDate() + ' ' + bulan[d.getMonth()] + ' ' + d.getFullYear();
  },

  /** Format datetime Indonesia. */
  formatDateTime: function (iso) {
    if (!iso) return '-';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '-';
    const jam = String(d.getHours()).padStart(2, '0');
    const menit = String(d.getMinutes()).padStart(2, '0');
    return Utils.formatTanggal(iso) + ' ' + jam + ':' + menit;
  },

  /** Format Rupiah. */
  formatRupiah: function (angka) {
    const n = Number(angka) || 0;
    return 'Rp ' + n.toLocaleString('id-ID');
  },

  /** Normalisasi nomor WA ke 62xxx. */
  normalizeWa: function (input) {
    let s = String(input || '').replace(/\D/g, '');
    if (!s) return '';
    if (s.startsWith('0')) s = '62' + s.substring(1);
    else if (s.startsWith('8')) s = '62' + s;
    else if (!s.startsWith('62')) s = '62' + s;
    return s;
  },

  /** Validasi nomor WA Indonesia. */
  isValidWa: function (input) {
    const s = Utils.normalizeWa(input);
    return /^628\d{7,13}$/.test(s);
  },

  /** Tampilkan toast notifikasi. */
  toast: function (message, type) {
    type = type || 'info';
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    const el = document.createElement('div');
    el.className = 'toast toast-' + type;
    el.textContent = message;
    container.appendChild(el);
    setTimeout(function () { el.classList.add('show'); }, 10);
    setTimeout(function () {
      el.classList.remove('show');
      setTimeout(function () { el.remove(); }, 300);
    }, 3500);
  },

  /** Tampilkan loading overlay. */
  showLoading: function (text) {
    let el = document.getElementById('global-loading');
    if (!el) {
      el = document.createElement('div');
      el.id = 'global-loading';
      el.className = 'loading-overlay';
      el.innerHTML = '<div class="loading-box"><div class="spinner"></div><div class="loading-text"></div></div>';
      document.body.appendChild(el);
    }
    el.querySelector('.loading-text').textContent = text || 'Memuat...';
    el.style.display = 'flex';
  },

  /** Sembunyikan loading overlay. */
  hideLoading: function () {
    const el = document.getElementById('global-loading');
    if (el) el.style.display = 'none';
  },

  /** Konfirmasi dialog. Return Promise<boolean>. */
  confirm: function (message, title) {
    return new Promise(function (resolve) {
      const ok = window.confirm((title ? title + '\n\n' : '') + message);
      resolve(ok);
    });
  },

  /** Ambil query param dari URL. */
  getQueryParam: function (name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
  },

  /** Simpan ke sessionStorage (BUKAN localStorage, untuk keamanan). */
  setSession: function (key, value) {
    try { sessionStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
  },

  /** Ambil dari sessionStorage. */
  getSession: function (key) {
    try {
      const raw = sessionStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  },

  /** Hapus dari sessionStorage. */
  removeSession: function (key) {
    try { sessionStorage.removeItem(key); } catch (e) {}
  },

  /** Bersihkan seluruh sessionStorage. */
  clearSession: function () {
    try { sessionStorage.clear(); } catch (e) {}
  }
};
