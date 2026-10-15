const Api = {

  _b64encode: function (str) {
    const utf8 = unescape(encodeURIComponent(str));
    return btoa(utf8).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  },

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

  upload: function (action, payload, opts) {
    opts = opts || {};
    const timeout = opts.timeout || 120000;
    if (!APP_CONFIG.APPS_SCRIPT_URL) return Promise.reject(new Error('APPS_SCRIPT_URL belum diisi'));
    const body = { action: action, token: null, payload: payload || {} };
    const controller = new AbortController();
    const timer = setTimeout(function () { controller.abort(); }, timeout);
    return fetch(APP_CONFIG.APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(body),
      signal: controller.signal, redirect: 'follow'
    })
      .then(function (res) { clearTimeout(timer); return res.text(); })
      .then(function (text) {
        let json;
        try { json = JSON.parse(text); }
        catch (e) { throw new Error('Respons server bukan JSON: ' + text.substring(0, 200)); }
        return json;
      })
      .catch(function (err) {
        clearTimeout(timer);
        if (err.name === 'AbortError') throw new Error('Upload timeout. Coba lagi.');
        throw err;
      });
  },

  auth: {
    login: function (username, password) {
      return Api.call('auth.login', { username: username, password: password }, { useToken: false });
    },
    logout: function () { return Api.call('auth.logout', {}); },
    whoami: function () { return Api.call('auth.whoami', {}); }
  },

  settings: {
    getPublic: function () { return Api.call('settings.getPublic', {}, { useToken: false }); },
    get: function () { return Api.call('settings.get', {}); },
    update: function (settings) { return Api.call('settings.update', { settings: settings }); },
    listKonsentrasi: function () { return Api.call('settings.listKonsentrasi', {}, { useToken: false }); }
  },

  admin: {
    listUsers: function () { return Api.call('admin.listUsers', {}); },
    createUser: function (d) { return Api.call('admin.createUser', d); },
    updateUser: function (d) { return Api.call('admin.updateUser', d); },
    resetUserPassword: function (d) { return Api.call('admin.resetUserPassword', d); },
    deleteUser: function (userId) { return Api.call('admin.deleteUser', { user_id: userId }); },
    listKonsentrasi: function () { return Api.call('admin.listKonsentrasi', {}); },
    saveKonsentrasi: function (d) { return Api.call('admin.saveKonsentrasi', d); },
    deleteKonsentrasi: function (id) { return Api.call('admin.deleteKonsentrasi', { konsentrasi_id: id }); },
    listPertanyaan: function () { return Api.call('admin.listPertanyaan', {}); },
    savePertanyaan: function (d) { return Api.call('admin.savePertanyaan', d); },
    deletePertanyaan: function (id) { return Api.call('admin.deletePertanyaan', { question_id: id }); },
    listTemplate: function () { return Api.call('admin.listTemplate', {}); },
    saveTemplate: function (d) { return Api.call('admin.saveTemplate', d); },
    getFullSettings: function () { return Api.call('admin.getFullSettings', {}); }
  },

  registration: {
    list: function (params) { return Api.call('registration.list', params || {}); },
    get: function (id) { return Api.call('registration.get', { registration_id: id }); },
    verify: function (id, status, catatan) {
      return Api.call('registration.verify', { registration_id: id, status: status, catatan: catatan || '' });
    },
    stats: function () { return Api.call('registration.stats', {}); },
    start: function () { return Api.call('registration.start', {}, { useToken: false }); },
    resume: function (t) { return Api.call('registration.resume', { token: t }, { useToken: false }); },
    saveDraft: function (t, step, data) {
      return Api.call('registration.saveDraft', { token: t, step: step, data: data }, { useToken: false });
    },
    uploadDokumen: function (t, jenis, b64, nama, mime) {
      return Api.upload('registration.uploadDokumen', {
        token: t, jenis_dokumen: jenis, base64: b64, nama_file: nama, mime_type: mime
      }, { timeout: 120000 });
    },
    submit: function (t) { return Api.call('registration.submit', { token: t }, { useToken: false }); },
    status: function (t) { return Api.call('registration.status', { token: t }, { useToken: false }); }
  },

  interview: {
    listCandidates: function (params) { return Api.call('interview.listCandidates', params || {}); },
    get: function (id) { return Api.call('interview.get', { registration_id: id }); },
    save: function (d) { return Api.call('interview.save', d); }
  },

  payment: {
    list: function (params) { return Api.call('payment.list', params || {}); },
    summary: function () { return Api.call('payment.summary', {}); },
    create: function (d) { return Api.call('payment.create', d); },
    cancel: function (id, alasan) {
      return Api.call('payment.cancel', { transaction_id: id, alasan: alasan || '' });
    },
    getForPrint: function (id) { return Api.call('payment.getForPrint', { transaction_id: id }); }
  },

  selection: {
    listCandidates: function (params) { return Api.call('selection.listCandidates', params || {}); },
    setDecision: function (id, decision, notes) {
      return Api.call('selection.setDecision', { registration_id: id, decision: decision, decision_notes: notes || '' });
    },
    bulkSet: function (items) { return Api.call('selection.bulkSet', { items: items }); },
    publish: function (publish) { return Api.call('selection.publish', { publish: publish }); },
    getResult: function (id) { return Api.call('selection.getResult', { registration_id: id }); },
    stats: function () { return Api.call('selection.stats', {}); }
  },

  gelombang: {
    list: function () { return Api.call('gelombang.list', {}); },
    getActive: function () { return Api.call('gelombang.getActive', {}, { useToken: false }); },
    save: function (d) { return Api.call('gelombang.save', d); },
    delete: function (id) { return Api.call('gelombang.delete', { gelombang_id: id }); }
  },

  daftarUlang: {
    getByReg: function (regId) { return Api.call('daftarUlang.getByReg', { registration_id: regId }); },
    updateStatus: function (id, status, catatan) {
      return Api.call('daftarUlang.updateStatus', { daftar_ulang_id: id, status: status, catatan: catatan || '' });
    },
    list: function (params) { return Api.call('daftarUlang.list', params || {}); },
    stats: function () { return Api.call('daftarUlang.stats', {}); }
  },

  report: {
    dashboard: function () { return Api.call('report.dashboard', {}); },
    exportData: function (params) { return Api.call('report.exportData', params || {}); },
    daftarHadir: function (params) { return Api.call('report.daftarHadir', params || {}); }
  },

  notif: {
    preview: function (regId, templateCode, recipientType) {
      return Api.call('notif.preview', {
        registration_id: regId, template_code: templateCode, recipient_type: recipientType || 'SISWA'
      });
    },
    log: function (d) { return Api.call('notif.log', d); },
    listLog: function (params) { return Api.call('notif.listLog', params || {}); }
  },

  ping: function () { return Api.call('ping', {}, { useToken: false }); }
};
