/**
 * ============================================================
 * auth.js
 * ------------------------------------------------------------
 * Manajemen sesi petugas di frontend.
 * - Simpan token & data user di sessionStorage
 * - Guard halaman: redirect ke login jika belum login
 * ============================================================
 */

const Auth = {

  /** Simpan sesi setelah login sukses. */
  saveSession: function (data) {
    Utils.setSession('spmb_token', data.token);
    Utils.setSession('spmb_user', data.user);
    Utils.setSession('spmb_expires_at', data.expires_at);
  },

  /** Ambil user yang login. */
  getUser: function () {
    return Utils.getSession('spmb_user');
  },

  /** Ambil token. */
  getToken: function () {
    return Utils.getSession('spmb_token');
  },

  /** Cek apakah user login (lokal saja, bukan verifikasi server). */
  isLoggedIn: function () {
    const token = Auth.getToken();
    const expiresAt = Utils.getSession('spmb_expires_at');
    if (!token) return false;
    if (expiresAt && new Date(expiresAt).getTime() < Date.now()) {
      Auth.logoutLocal();
      return false;
    }
    return true;
  },

  /** Cek apakah user punya salah satu role. */
  hasRole: function (roles) {
    const user = Auth.getUser();
    if (!user) return false;
    if (!roles || !roles.length) return true;
    return roles.indexOf(user.role) >= 0;
  },

  /** Logout lokal (tanpa panggil server). */
  logoutLocal: function () {
    Utils.removeSession('spmb_token');
    Utils.removeSession('spmb_user');
    Utils.removeSession('spmb_expires_at');
  },

  /** Logout penuh (panggil server + bersihkan lokal). */
  logout: function () {
    return Api.auth.logout()
      .catch(function () { /* abaikan error server */ })
      .then(function () {
        Auth.logoutLocal();
        window.location.href = 'login.html';
      });
  },

  /**
   * Guard: panggil di awal halaman terproteksi.
   * Jika belum login → redirect ke login.html
   * Jika role tidak sesuai → redirect ke dashboard.html
   */
  guard: function (allowedRoles) {
    if (!Auth.isLoggedIn()) {
      window.location.href = 'login.html';
      return false;
    }
    if (allowedRoles && allowedRoles.length && !Auth.hasRole(allowedRoles)) {
      Utils.toast('Anda tidak memiliki akses ke halaman ini.', 'error');
      setTimeout(function () { window.location.href = 'dashboard.html'; }, 1200);
      return false;
    }
    return true;
  },

  /** Verifikasi sesi ke server (opsional, lebih aman). */
  verifyServer: function () {
    return Api.auth.whoami().then(function (res) {
      if (!res.success) {
        Auth.logoutLocal();
        window.location.href = 'login.html';
        return false;
      }
      Utils.setSession('spmb_user', res.data);
      return true;
    }).catch(function () {
      Auth.logoutLocal();
      window.location.href = 'login.html';
      return false;
    });
  },

  /** Redirect berdasarkan role. */
  redirectByRole: function () {
    const user = Auth.getUser();
    if (!user) {
      window.location.href = 'login.html';
      return;
    }
    // Semua role petugas masuk ke dashboard.html dulu
    window.location.href = 'dashboard.html';
  }
};
