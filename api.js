/**
 * ============================================================
 * api.js
 * ------------------------------------------------------------
 * Wrapper fetch() ke Apps Script Web App.
 *
 * PENTING:
 * - Apps Script redirect POST → CORS hilang → error.
 * - Solusi: kirim request via GET, payload di query string (base64).
 *
 * Dua jenis token:
 * - Token PETUGAS  → sessionStorage 'spmb_token' (auto via useToken).
 * - Token PENDAFTAR → dikirim manual via payload (useToken: false).
 * ============================================================
 */

const Api = {

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
   */
  call: function (action, payload, opts) {
    opts = opts || {};
    const useToken = opts.useToken !== false;
    const timeout = opts.timeout || APP_CONFIG.FETCH_TIMEOUT;

    if (!APP_CONFIG.APPS_SCRIPT_URL || APP_CONFIG.APPS_SCRIPT_URL.indexOf('ISI_URL') === 0) {
      return Promise.reject(new Error('APPS_SCRIPT_URL belum diisi di config.js'));
    }

    const token = useToken ? Utils.getSession('spmb_token') : null;
    const body = { action: action, token: token, payload: payload || {} };
    const b64 = Api._b64encode(JSON.stringify(body));
    const url = APP_CONFIG.APPS_SCRIPT_URL + '?data=' + encodeURIComponent(b64);

    const controller = new AbortController();
    const timer = setTimeout(function () { controller.abort(); }, timeout);

    return fetch(url, { method: 'GET', signal: controller.signal, redirect: 'follow' })
      .then(function (res) {
        clearTimeout(timer);
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.text();
      })
      .then(function (text) {
        let json;
        try { json = JSON.parse(text); }
        catch (e) { throw new Error('Respons server bukan JSON valid'); }
        if (useToken && !json.success && json.code === 'SESSION_EXPIRED') {
          Utils.clearSession();
          Utils.toast('Sesi telah berakhir. Silakan login ulang.', 'warning');
          setTimeout(function () { window.location.href = 'login.html'; }, 1500);
        }
        return json;
      })
      .catch(function (err) {
        clearTimeout(timer);
        if (err.name === 'AbortError') throw new Error('Permintaan timeout. Coba lagi.');
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

  /* ---- ADMIN ---- */
  admin: {
    // Users
    listUsers: function () { return Api.call('admin.listUsers', {}); },
    createUser: function (d) { return Api.call('admin.createUser', d); },
    updateUser: function (d) { return Api.call('admin.updateUser', d); },
    resetUserPassword: function (d) { return Api.call('admin.resetUserPassword', d); },
    deleteUser: function (userId) { return Api.call('admin.deleteUser', { user_id: userId }); },
    // Konsentrasi
    listKonsentrasi: function () { return Api.call('admin.listKonsentrasi', {}); },
    saveKonsentrasi: function (d) { return Api.call('admin.saveKonsentrasi', d); },
    deleteKonsentrasi: function (id) { return Api.call('admin.deleteKonsentrasi', { konsentrasi_id: id }); },
    // Pertanyaan
    listPertanyaan: function () { return Api.call('admin.listPertanyaan', {}); },
    savePertanyaan: function (d) { return Api.call('admin.savePertanyaan', d); },
    deletePertanyaan: function (id) { return Api.call('admin.deletePertanyaan', { question_id: id }); },
    // Template WA
    listTemplate: function () { return Api.call('admin.listTemplate', {}); },
    saveTemplate: function (d) { return Api.call('admin.saveTemplate', d); },
    // Settings lengkap
    getFullSettings: function () { return Api.call('admin.getFullSettings', {}); }
  },

  /* ---- REGISTRATION ---- */
  registration: {
    // Petugas
    list: function (params) { return Api.call('registration.list', params || {}); },
    get: function (id) { return Api.call('registration.get', { registration_id: id }); },
    verify: function (id, status, catatan) {
      return Api.call('registration.verify', { registration_id: id, status: status, catatan: catatan || '' });
    },
    stats: function () { return Api.call('registration.stats', {}); },
    // Pendaftar
    start: function () { return Api.call('registration.start', {}, { useToken: false }); },
    resume: function (t) { return Api.call('registration.resume', { token: t }, { useToken: false }); },
    saveDraft: function (t, step, data) {
      return Api.call('registration.saveDraft', { token: t, step: step, data: data }, { useToken: false });
    },
    uploadDokumen: function (t, jenis, b64, nama, mime) {
      return Api.call('registration.uploadDokumen', {
        token: t, jenis_dokumen: jenis, base64: b64, nama_file: nama, mime_type: mime
      }, { useToken: false, timeout: 60000 });
    },
    submit: function (t) { return Api.call('registration.submit', { token: t }, { useToken: false }); },
    status: function (t) { return Api.call('registration.status', { token: t }, { useToken: false }); }
  },

  /* ---- INTERVIEW ---- */
  interview: {
    listCandidates: function (params) { return Api.call('interview.listCandidates', params || {}); },
    get: function (id) { return Api.call('interview.get', { registration_id: id }); },
    save: function (d) { return Api.call('interview.save', d); }
  },

  /* ---- PAYMENT ---- */
  payment: {
    list: function (params) { return Api.call('payment.list', params || {}); },
    summary: function () { return Api.call('payment.summary', {}); },
    create: function (d) { return Api.call('payment.create', d); },
    cancel: function (id, alasan) {
      return Api.call('payment.cancel', { transaction_id: id, alasan: alasan || '' });
    },
    getForPrint: function (id) { return Api.call('payment.getForPrint', { transaction_id: id }); }
  },

  /* ---- SELECTION ---- */
  selection: {
    listCandidates: function (params) { return Api.call('selection.listCandidates', params || {}); },
    setDecision: function (id, decision, notes) {
      return Api.call('selection.setDecision', {
        registration_id: id, decision: decision, decision_notes: notes || ''
      });
    },
    bulkSet: function (items) { return Api.call('selection.bulkSet', { items: items }); },
    publish: function (publish) { return Api.call('selection.publish', { publish: publish }); },
    getResult: function (id) { return Api.call('selection.getResult', { registration_id: id }); },
    stats: function () { return Api.call('selection.stats', {}); }
  },

  /* ---- NOTIFIKASI WA ---- */
  notif: {
    preview: function (regId, templateCode, recipientType) {
      return Api.call('notif.preview', {
        registration_id: regId,
        template_code: templateCode,
        recipient_type: recipientType || 'SISWA'
      });
    },
    log: function (d) { return Api.call('notif.log', d); },
    listLog: function (params) { return Api.call('notif.listLog', params || {}); }
  },

  ping: function () { return Api.call('ping', {}, { useToken: false }); }
};
