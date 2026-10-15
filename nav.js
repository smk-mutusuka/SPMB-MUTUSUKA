/**
 * ============================================================
 * nav.js
 * ------------------------------------------------------------
 * Definisi menu sidebar per role, dipakai di semua halaman.
 * Cara pakai: Nav.render(currentPage)
 * ============================================================
 */

const Nav = {

  // Definisi menu lengkap untuk setiap role
  MENUS: {
    ADMIN: [
      { group: 'Utama', items: [
        { icon: '🏠', label: 'Dashboard', href: 'dashboard.html', key: 'dashboard' }
      ]},
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
        { icon: '📲', label: 'Notifikasi WA', href: 'notif.html', key: 'notif' },
        { icon: '⚙️', label: 'Pengaturan', href: 'settings.html', key: 'settings' }
      ]}
    ],

    WAWANCARA: [
      { group: 'Utama', items: [
        { icon: '🏠', label: 'Dashboard', href: 'dashboard.html', key: 'dashboard' }
      ]},
      { group: 'Pendaftaran', items: [
        { icon: '👥', label: 'Daftar Pendaftar', href: 'admin.html', key: 'admin' }
      ]},
      { group: 'Wawancara', items: [
        { icon: '🎤', label: 'Wawancara', href: 'interview.html', key: 'interview' }
      ]},
      { group: 'Sistem', items: [
        { icon: '📊', label: 'Laporan', href: 'report.html', key: 'report' },
        { icon: '📲', label: 'Notifikasi WA', href: 'notif.html', key: 'notif' }
      ]}
    ],

    BENDAHARA: [
      { group: 'Utama', items: [
        { icon: '🏠', label: 'Dashboard', href: 'dashboard.html', key: 'dashboard' }
      ]},
      { group: 'Pembayaran', items: [
        { icon: '💵', label: 'Input Pembayaran', href: 'payment.html', key: 'payment' },
        { icon: '🧾', label: 'Riwayat Transaksi', href: 'payment.html', key: 'payment' }
      ]},
      { group: 'Daftar Ulang', items: [
        { icon: '🎓', label: 'Daftar Ulang', href: 'daftar-ulang.html', key: 'daftar-ulang' }
      ]},
      { group: 'Sistem', items: [
        { icon: '📊', label: 'Laporan', href: 'report.html', key: 'report' },
        { icon: '📲', label: 'Notifikasi WA', href: 'notif.html', key: 'notif' }
      ]}
    ],

    SELEKSI: [
      { group: 'Utama', items: [
        { icon: '🏠', label: 'Dashboard', href: 'dashboard.html', key: 'dashboard' }
      ]},
      { group: 'Seleksi', items: [
        { icon: '📋', label: 'Tetapkan Hasil', href: 'selection.html', key: 'selection' },
        { icon: '📄', label: 'Cetak Pengumuman', href: 'selection.html', key: 'selection' }
      ]},
      { group: 'Sistem', items: [
        { icon: '📊', label: 'Laporan', href: 'report.html', key: 'report' },
        { icon: '📲', label: 'Notifikasi WA', href: 'notif.html', key: 'notif' }
      ]}
    ]
  },

  /**
   * Render sidebar.
   * @param {string} currentKey - key halaman aktif (mis. 'settings', 'admin')
   * @param {string} containerId - id elemen <nav> (default: 'nav')
   */
  render: function (currentKey, containerId) {
    containerId = containerId || 'nav';
    var el = document.getElementById(containerId);
    if (!el) return;

    var user = Auth.getUser();
    var role = user && user.role ? user.role : 'ADMIN';
    var menu = Nav.MENUS[role] || Nav.MENUS.ADMIN;

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
