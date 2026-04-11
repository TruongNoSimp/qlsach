(function () {
  const storage = window.BookStoreStorage;
  storage.seedData();

  function getElement(id) {
    return document.getElementById(id);
  }

  function formatCurrency(value) {
    return Number(value).toLocaleString('vi-VN') + ' VND';
  }

  function trimValue(value) {
    return String(value || '').trim();
  }

  function showFieldError(inputId, message) {
    const input = getElement(inputId);
    const error = getElement(inputId + '-error');

    if (input) {
      input.classList.toggle('is-invalid-custom', Boolean(message));
    }

    if (error) {
      error.textContent = message || '';
    }
  }

  function clearFieldErrors(fieldIds) {
    fieldIds.forEach(function (fieldId) {
      showFieldError(fieldId, '');
    });
  }

  function showToast(type, message) {
    const toastElement = getElement(type === 'success' ? 'toast-success' : 'toast-error');
    if (!toastElement || !window.bootstrap) {
      return;
    }

    const body = toastElement.querySelector('.toast-body');
    body.textContent = message;
    window.bootstrap.Toast.getOrCreateInstance(toastElement, { delay: 2800 }).show();
  }

  function showFlashMessage() {
    const flash = storage.getFlash();
    if (!flash) {
      return;
    }

    showToast(flash.type, flash.message);
    storage.clearFlash();
  }

  function updateNavbar() {
    const session = storage.getSession();
    const loginLink = getElement('navbar-login');
    const registerLink = getElement('navbar-register');
    const logoutButton = getElement('navbar-logout');
    const currentUser = getElement('current-user');
    const userMenu = getElement('user-menu');

    if (session && currentUser && logoutButton && loginLink && registerLink && userMenu) {
      currentUser.textContent = session.fullName;
      userMenu.classList.remove('d-none');
      loginLink.classList.add('d-none');
      registerLink.classList.add('d-none');
    }

    if (!session && currentUser && logoutButton && loginLink && registerLink && userMenu) {
      currentUser.textContent = '';
      userMenu.classList.add('d-none');
      loginLink.classList.remove('d-none');
      registerLink.classList.remove('d-none');
    }

    if (logoutButton) {
      logoutButton.addEventListener('click', function () {
        storage.clearSession();
        storage.setFlash('Đăng xuất thành công', 'success');
        window.location.href = 'login.html';
      });
    }
  }

  function requireAuth(message) {
    if (!storage.getSession()) {
      storage.setFlash(message || 'Vui lòng đăng nhập để tiếp tục', 'error');
      window.location.href = 'login.html';
      return false;
    }

    return true;
  }

  window.BookStoreApp = {
    getElement: getElement,
    formatCurrency: formatCurrency,
    trimValue: trimValue,
    showFieldError: showFieldError,
    clearFieldErrors: clearFieldErrors,
    showToast: showToast,
    showFlashMessage: showFlashMessage,
    updateNavbar: updateNavbar,
    requireAuth: requireAuth
  };

  document.addEventListener('DOMContentLoaded', function () {
    updateNavbar();
    showFlashMessage();
  });
})();
