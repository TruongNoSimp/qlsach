(function () {
  const storage = window.BookStoreStorage;
  const app = window.BookStoreApp;

  document.addEventListener('DOMContentLoaded', function () {
    if (document.body.dataset.page !== 'profile') {
      return;
    }

    if (!app.requireAuth('Vui lòng đăng nhập để xem trang hồ sơ')) {
      return;
    }

    const session = storage.getSession();
    if (!session) {
      window.location.href = 'login.html';
      return;
    }

    app.getElement('profile-name').textContent = session.fullName;
    app.getElement('profile-email').textContent = session.email;
    app.getElement('profile-name-display').textContent = session.fullName;
    app.getElement('profile-email-display').textContent = session.email;

    const avatar = app.getElement('profile-name').textContent.trim().charAt(0).toUpperCase() || 'B';
    document.querySelector('.profile-avatar').textContent = avatar;

    app.getElement('profile-edit-button').addEventListener('click', function () {
      app.showToast('success', 'Tính năng Edit Profile sẽ được mở rộng sau');
    });

    app.getElement('profile-logout-button').addEventListener('click', function () {
      storage.clearSession();
      storage.setFlash('Đăng xuất thành công', 'success');
      window.location.href = 'login.html';
    });
  });
})();
