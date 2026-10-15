const Auth = {

  saveSession: function (data) {
    Utils.setSession('spmb_token', data.token);
    Utils.setSession('spmb_user', data.user);
    Utils.setSession('spmb_expires_at', data.expires_at);
  },

  getUser: function () { return Utils.getSession('spmb_user'); },
  getToken: function () { return Utils.getSession('spmb_token'); },

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

  hasRole: function (roles) {
    const user = Auth.getUser();
    if (!user) return false;
    if (!roles || !roles.length) return true;
    return roles.indexOf(user.role) >= 0;
  },

  logoutLocal: function () {
    Utils.removeSession('spmb_token');
    Utils.removeSession('spmb_user');
    Utils.removeSession('spmb_expires_at');
  },

  logout: function () {
    return Api.auth.logout()
      .catch(function () {})
      .then(function () {
        Auth.logoutLocal();
        window.location.href = 'login.html';
      });
  },

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

  redirectByRole: function () {
    const user = Auth.getUser();
    if (!user) { window.location.href = 'login.html'; return; }
    window.location.href = 'dashboard.html';
  }
};
