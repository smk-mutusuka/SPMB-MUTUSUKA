/**
 * ============================================================
 * utils.js
 * ------------------------------------------------------------
 * Fungsi bantu umum untuk frontend.
 * - Tahan banting: showLoading/hideLoading tidak crash
 *   walau struktur HTML berbeda-beda.
 * - Semua method punya nama (tidak ada function statement).
 * ============================================================
 */

const Utils = {

  /* ============================================================
   * STRING / HTML
   * ============================================================ */

  escapeHtml: function (s) {
    if (s === null || s === undefined) return '';
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  },

  /* ============================================================
   * FORMAT TANGGAL / UANG
   * ============================================================ */

  formatTanggal: function (iso) {
    if (!iso) return '-';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '-';
    const bulan = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    return d.getDate() + ' ' + bulan[d.getMonth()] + ' ' + d.getFullYear();
  },

  formatDateTime: function (iso) {
    if (!iso) return '-';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '-';
    const jam = String(d.getHours()).padStart(2, '0');
    const menit = String(d.getMinutes()).padStart(2, '0');
    return Utils.formatTanggal(iso) + ' ' + jam + ':' + menit;
  },

  formatRupiah: function (angka) {
    const n = Number(angka) || 0;
    return 'Rp ' + n.toLocaleString('id-ID');
  },

  /* ============================================================
   * WHATSAPP
   * ============================================================ */

  normalizeWa: function (input) {
    let s = String(input || '').replace(/\D/g, '');
    if (!s) return '';
    if (s.startsWith('0')) s = '62' + s.substring(1);
    else if (s.startsWith('8')) s = '62' + s;
    else if (!s.startsWith('62')) s = '62' + s;
    return s;
  },

  isValidWa: function (input) {
    const s = Utils.normalizeWa(input);
    return /^628\d{7,13}$/.test(s);
  },

  /* ============================================================
   * TOAST
   * ============================================================ */

  toast: function (message, type) {
    type = type || 'info';
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.style.position = 'fixed';
      container.style.top = '20px';
      container.style.right = '20px';
      container.style.zIndex = '10000';
      container.style.display = 'flex';
      container.style.flexDirection = 'column';
      container.style.gap = '8px';
      document.body.appendChild(container);
    }
    const el = document.createElement('div');
    el.className = 'toast toast-' + type;
    el.textContent = message;
    const colors = {
      success: '#065f46',
      error: '#991b1b',
      warning: '#92400e',
      info: '#1f2937'
    };
    el.style.background = colors[type] || colors.info;
    el.style.color = '#fff';
    el.style.padding = '12px 18px';
    el.style.borderRadius = '8px';
    el.style.fontSize = '0.88rem';
    el.style.minWidth = '220px';
    el.style.maxWidth = '340px';
    el.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    el.style.opacity = '0';
    el.style.transform = 'translateY(-10px)';
    el.style.transition = 'opacity 0.25s, transform 0.25s';
    container.appendChild(el);
    setTimeout(function () {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    }, 10);
    setTimeout(function () {
      el.style.opacity = '0';
      el.style.transform = 'translateY(-10px)';
      setTimeout(function () { el.remove(); }, 300);
    }, 3500);
  },

  /* ============================================================
   * LOADING OVERLAY — tahan banting
   * ============================================================ */

  showLoading: function (text) {
    let el = document.getElementById('global-loading');
    if (!el) {
      el = document.createElement('div');
      el.id = 'global-loading';
      document.body.appendChild(el);
    }
    // Selalu tulis ulang isi agar konsisten — apa pun struktur awal di HTML
    el.innerHTML =
      '<div style="text-align:center;">' +
        '<div class="spinner"></div>' +
        '<div class="loading-text" style="margin-top:8px;color:#1a5490;font-weight:500;"></div>' +
      '</div>';
    el.style.display = 'flex';
    el.style.position = 'fixed';
    el.style.inset = '0';
    el.style.background = 'rgba(255,255,255,0.85)';
    el.style.zIndex = '9999';
    el.style.alignItems = 'center';
    el.style.justifyContent = 'center';

    const txt = el.querySelector('.loading-text');
    if (txt) txt.textContent = text || 'Memuat...';
  },

  hideLoading: function () {
    const el = document.getElementById('global-loading');
    if (el) el.style.display = 'none';
  },

  /* ============================================================
   * KONFIRMASI
   * ============================================================ */

  confirm: function (message, title) {
    return new Promise(function (resolve) {
      const ok = window.confirm((title ? title + '\n\n' : '') + message);
      resolve(ok);
    });
  },

  /* ============================================================
   * QUERY PARAM
   * ============================================================ */

  getQueryParam: function (name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
  },

  /* ============================================================
   * SESSION STORAGE
   * ============================================================ */

  setSession: function (key, value) {
    try { sessionStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
  },

  getSession: function (key) {
    try {
      const raw = sessionStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  },

  removeSession: function (key) {
    try { sessionStorage.removeItem(key); } catch (e) {}
  },

  clearSession: function () {
    try { sessionStorage.clear(); } catch (e) {}
  },

  /* ============================================================
   * BASE64 URL-SAFE
   * ============================================================ */

  b64UrlEncode: function (str) {
    const utf8 = unescape(encodeURIComponent(str));
    return btoa(utf8).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

};
