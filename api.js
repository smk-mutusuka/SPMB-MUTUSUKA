/**
 * ============================================================
 * api.js
 * ------------------------------------------------------------
 * Wrapper fetch() ke Apps Script Web App.
 * - Selalu kirim Content-Type: text/plain (hindari preflight CORS)
 * - Body: JSON { action, token, payload }
 * - Response: JSON { success, message, code?, data? }
 * ============================================================
 */

const Api = {

  /**
   * Panggil API Apps Script.
   * @param {string} action - nama action, mis. 'auth.login'
   * @param {object} payload - data
   * @param {object} opts - { useToken: bool (default true), timeout: ms }
   * @return {Promise<object>} respons standar
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

    const controller = new AbortController();
    const timer = setTimeout(function () { controller.abort(); }, timeout);

    return fetch(APP_CONFIG.APPS_SCRIPT_URL, {
      method: 'POST',
      // PENTING: text/plain agar tidak trigger preflight CORS
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(body),
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
        // Auto-handle sesi kedaluwarsa
        if (!json.success && json.code === 'SESSION_EXPIRED') {
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
   * Shortcut per modul (akan ditambah seiring tahap)
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

  ping: function () {
    return Api.call('ping', {}, { useToken: false });
  }
};
