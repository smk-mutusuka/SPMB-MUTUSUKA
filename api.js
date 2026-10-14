/**
 * ============================================================
 * api.js
 * ------------------------------------------------------------
 * Wrapper fetch() ke Apps Script Web App.
 *
 * PENTING:
 * - Apps Script redirect POST → CORS hilang → error.
 * - Solusi: kirim request via GET, payload di query string (base64).
 * - Apps Script TIDAK redirect GET → CORS aman.
 *
 * Ada dua jenis token:
 * - Token PETUGAS → disimpan di sessionStorage 'spmb_token',
 *   otomatis ditempel oleh Api.call() (useToken default true).
 * - Token PENDAFTAR → dikirim manual via payload,
 *   panggil dengan { useToken: false }.
 * ============================================================
 */

const Api = {

  /**
   * Encode string ke base64 URL-safe.
   */
  _b64encode: function (str) {
    const utf8 = unescape(encodeURIComponent(str));
    return btoa(utf8)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  },

  /**
   * Panggil API Apps Script via GET.
   * @param {string} action
   * @param {object} payload
   * @param {object} opts - { useToken: bool (default true), timeout: ms }
   * @return {Promise<object>}
   */
  call: function (action, payload, opts) {
    opts = opts || {};
    const useToken = opts.useToken !== false;
    const timeout = opts.timeout || APP_CONFIG.FETCH_TIMEOUT;

    if (!APP_CONFIG.APPS_SCRIPT_URL || APP_CONFIG.APPS_SCRIPT_URL.indexOf('ISI_URL') === 0) {
      return Promise.reject(new Error('APPS_SCRIPT_URL belum diisi di config.js'));
    }

    const token = useToken ? Utils.getSession('spmb_token') : null;

    const body = {
      action: action,
      token: token,
      payload: payload || {}
    };

    const b64 = Api._b64encode(JSON.stringify(body));
    const url = APP_CONFIG.APPS_SCRIPT_URL + '?data=' + encodeURIComponent(b64);

    const controller = new AbortController();
    const timer = setTimeout(function () { controller.abort(); }, timeout);

    return fetch(url, {
      method: 'GET',
      signal: controller.signal,
      redirect: 'follow'
    })
      .then(function (res) {
        clearTimeout(timer);
        if (!res.ok) {
          throw new Error('HTTP ' + res.status);
        }
        return res.text();
      })
      .then(function (text) {
        let json;
        try {
          json = JSON.parse(text);
        } catch (e) {
          throw new Error('Respons server bukan JSON valid');
        }
        // Auto-handle sesi petugas kedaluwarsa
        // (hanya untuk request yang pakai token petugas)
        if (useToken && !json.success && json.code === 'SESSION_EXPIRED') {
          Utils.clearSession();
          Utils.toast('Sesi telah berakhir. Silakan login ulang.', 'warning');
          setTimeout(function () { window.location.href = 'login.html'; }, 1500);
        }
        return json;
      })
      .catch(function (err) {
        clearTimeout(timer);
        if (err.name === 'AbortError') {
          throw new Error('Permintaan timeout. Coba lagi.');
        }
        throw err;
      });
  },

  /* ============================================================
   * Shortcut per modul
   * ============================================================ */

  auth: {
    login: function (username, password) {
      return Api.call('auth.login', { username: username, password: password }, { useToken: false });
    },
    logout: function () {
      return Api.call('auth.logout', {});
    },
    whoami: function () {
      return Api.call('auth.whoami', {});
    }
  },

  settings: {
    getPublic: function () {
      return Api.call('settings.getPublic', {}, { useToken: false });
    },
    get: function () {
      return Api.call('settings.get', {});
    },
    update: function (settings) {
      return Api.call('settings.update', { settings: settings });
    },
    listKonsentrasi: function () {
      return Api.call('settings.listKonsentrasi', {}, { useToken: false });
    }
  },

  /**
   * Registration API — dipakai oleh dua pihak:
   * - PETUGAS  : list, get, verify, stats (pakai token sesi user)
   * - PENDAFTAR: start, resume, saveDraft, uploadDokumen, submit, status
   *              (pakai token pendaftar di payload, useToken: false)
   */
  registration: {

    /* --- Petugas --- */
    list: function (params) {
      return Api.call('registration.list', params || {});
    },
    get: function (registration_id) {
      return Api.call('registration.get', { registration_id: registration_id });
    },
    verify: function (registration_id, status, catatan) {
      return Api.call('registration.verify', {
        registration_id: registration_id,
        status: status,
        catatan: catatan || ''
      });
    },
    stats: function () {
      return Api.call('registration.stats', {});
    },

    /* --- Pendaftar --- */
    start: function () {
      return Api.call('registration.start', {}, { useToken: false });
    },
    resume: function (tokenPendaftar) {
      return Api.call('registration.resume', { token: tokenPendaftar }, { useToken: false });
    },
    saveDraft: function (tokenPendaftar, step, data) {
      return Api.call('registration.saveDraft', {
        token: tokenPendaftar,
        step: step,
        data: data
      }, { useToken: false });
    },
    uploadDokumen: function (tokenPendaftar, jenis_dokumen, base64, nama_file, mime_type) {
      return Api.call('registration.uploadDokumen', {
        token: tokenPendaftar,
        jenis_dokumen: jenis_dokumen,
        base64: base64,
        nama_file: nama_file,
        mime_type: mime_type
      }, { useToken: false, timeout: 60000 });
    },
    submit: function (tokenPendaftar) {
      return Api.call('registration.submit', { token: tokenPendaftar }, { useToken: false });
    },
    status: function (tokenPendaftar) {
      return Api.call('registration.status', { token: tokenPendaftar }, { useToken: false });
    }
  },

  ping: function () {
    return Api.call('ping', {}, { useToken: false });
  }
};
