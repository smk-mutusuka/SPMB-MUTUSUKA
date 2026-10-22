const Nav = {
  MENUS: {
    ADMIN: [
      { group: 'Utama', items: [{ icon: '🏠', label: 'Dashboard', href: 'dashboard.html', key: 'dashboard' }]},
      { group: 'Pendaftaran', items: [
        { icon: '👥', label: 'Daftar Pendaftar', href: 'admin.html', key: 'admin' },
        { icon: '✅', label: 'Verifikasi Data', href: 'admin.html', key: 'admin' }
      ]},
      { group: 'Proses', items: [
        { icon: '🎤', label: 'Wawancara', href: 'interview.html', key: 'interview' },
        { icon: '💰', label: 'Pembayaran', href: 'payment.html', key: 'payment' },
        { icon: '📋', label: 'Hasil Seleksi', href: 'selection.html', key: 'selection' },
        { icon: '🎓', label: 'Daftar Ulang', href: 'daftar-ulang.html', key: 'daftar-ulang' }
      ]},
      { group: 'Sistem', items: [
        { icon: '📊', label: 'Laporan', href: 'report.html', key: 'report' },
        { icon: '📄', label: 'Pengumuman Publik', href: 'pengumuman.html', key: 'pengumuman' },
        { icon: '📲', label: 'Notifikasi WA', href: 'notif.html', key: 'notif' },
        { icon: '⚙️', label: 'Pengaturan', href: 'settings.html', key: 'settings' }
      ]}
    ],
    PENDAFTARAN: [
      { group: 'Utama', items: [{ icon: '🏠', label: 'Dashboard', href: 'dashboard.html', key: 'dashboard' }]},
      { group: 'Pendaftaran', items: [
        { icon: '👥', label: 'Daftar Pendaftar', href: 'admin.html', key: 'admin' },
        { icon: '✅', label: 'Verifikasi Data', href: 'admin.html', key: 'admin' }
      ]},
      { group: 'Sistem', items: [
        { icon: '📲', label: 'Notifikasi WA', href: 'notif.html', key: 'notif' }
      ]}
    ],
    WAWANCARA: [
      { group: 'Utama', items: [{ icon: '🏠', label: 'Dashboard', href: 'dashboard.html', key: 'dashboard' }]},
      { group: 'Pendaftaran', items: [
        { icon: '👥', label: 'Daftar Pendaftar', href: 'admin.html', key: 'admin' }
      ]},
      { group: 'Proses', items: [
        { icon: '🎤', label: 'Wawancara', href: 'interview.html', key: 'interview' }
      ]},
      { group: 'Sistem', items: [
        { icon: '📲', label: 'Notifikasi WA', href: 'notif.html', key: 'notif' }
      ]}
    ],
    BENDAHARA: [
      { group: 'Proses', items: [
        { icon: '💰', label: 'Pembayaran', href: 'payment.html', key: 'payment' },
        { icon: '📋', label: 'Hasil Seleksi', href: 'selection.html', key: 'selection' }
      ]},
      { group: 'Sistem', items: [
        { icon: '📲', label: 'Notifikasi WA', href: 'notif.html', key: 'notif' }
      ]}
    ]
  },

  render: function (currentKey, containerId) {
    containerId = containerId || 'nav';
    var el = document.getElementById(containerId);
    if (!el) return;

    var user = Auth.getUser();
    var role = user && user.role ? user.role : 'ADMIN';
    
    var menuKey = (role === 'PENDAFTAR') ? 'PENDAFTARAN' : role;
    var menu = Nav.MENUS[menuKey] || Nav.MENUS.ADMIN;

    var html = '';
    menu.forEach(function (g) {
      html += '<div class="nav-group-title">' + Utils.escapeHtml(g.group) + '</div>';
      g.items.forEach(function (it) {
        var cls = 'nav-item' + (it.key === currentKey ? ' active' : '');
        html += '<a href="' + Utils.escapeHtml(it.href) + '" class="' + cls + '">' +
          '<span class="ico">' + it.icon + '</span>' +
          '<span>' + Utils.escapeHtml(it.label) + '</span></a>';
      });
    });
    el.innerHTML = html;
  }
};
