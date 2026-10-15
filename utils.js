/**
 * ============================================================
 * utils.js
 * ------------------------------------------------------------
 * Fungsi bantu umum untuk frontend.
 * ============================================================
 */

const Utils = {

  escapeHtml: function (s) {
    if (s === null || s === undefined) return '';
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  },

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

  toast: function (message, type) {
    type = type || 'info';
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.style.cssText = 'position:fixed;top:20px;right:20px;z-index:10000;display:flex;flex-direction:column;gap:8px;';
      document.body.appendChild(container);
    }
    const el = document.createElement('div');
    const colors = { success: '#065f46', error: '#991b1b', warning: '#92400e', info: '#1f2937' };
    el.style.cssText = 'background:' + (colors[type] || colors.info) +
      ';color:#fff;padding:12px 18px;border-radius:8px;font-size:0.88rem;min-width:220px;max-width:340px;' +
      'box-shadow:0 4px 12px rgba(0,0,0,0.15);opacity:0;transform:translateY(-10px);' +
      'transition:opacity 0.25s,transform 0.25s;';
    el.textContent = message;
    container.appendChild(el);
    setTimeout(function () { el.style.opacity = '1'; el.style.transform = 'translateY(0)'; }, 10);
    setTimeout(function () {
      el.style.opacity = '0'; el.style.transform = 'translateY(-10px)';
      setTimeout(function () { el.remove(); }, 300);
    }, 3500);
  },

  showLoading: function (text) {
    let el = document.getElementById('global-loading');
    if (!el) {
      el = document.createElement('div');
      el.id = 'global-loading';
      document.body.appendChild(el);
    }
    el.innerHTML = '<div style="text-align:center;">' +
      '<div style="width:42px;height:42px;border:4px solid #e5e7eb;border-top-color:#1a5490;' +
      'border-radius:50%;animation:spmb-spin 0.8s linear infinite;margin:0 auto 12px;"></div>' +
      '<div class="loading-text" style="color:#1a5490;font-weight:500;"></div></div>' +
      '<style>@keyframes spmb-spin{to{transform:rotate(360deg)}}</style>';
    el.style.cssText = 'display:flex;position:fixed;inset:0;background:rgba(255,255,255,0.85);z-index:9999;align-items:center;justify-content:center;';
    const txt = el.querySelector('.loading-text');
    if (txt) txt.textContent = text || 'Memuat...';
  },

  hideLoading: function () {
    const el = document.getElementById('global-loading');
    if (el) el.style.display = 'none';
  },

  confirm: function (message, title) {
    return new Promise(function (resolve) {
      const ok = window.confirm((title ? title + '\n\n' : '') + message);
      resolve(ok);
    });
  },

  getQueryParam: function (name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
  },

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

  b64UrlEncode: function (str) {
    const utf8 = unescape(encodeURIComponent(str));
    return btoa(utf8).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
};
