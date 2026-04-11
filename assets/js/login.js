(function () {
  const storage = window.BookStoreStorage;
  const app = window.BookStoreApp;

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function validateLogin(email, password) {
    let isValid = true;
    app.clearFieldErrors(['login-email', 'login-password']);
    const generalError = app.getElement('login-error');

    generalError.textContent = '';
    generalError.classList.add('d-none');

    if (!email) {
      app.showFieldError('login-email', 'Email là bắt buộc');
      isValid = false;
    } else if (email.length > 50) {
      app.showFieldError('login-email', 'Email tối đa 50 ký tự');
      isValid = false;
    } else if (!isValidEmail(email)) {
      app.showFieldError('login-email', 'Email không đúng định dạng');
      isValid = false;
    }

    if (!password) {
      app.showFieldError('login-password', 'Password là bắt buộc');
      isValid = false;
    } else if (password.trim().length === 0) {
      app.showFieldError('login-password', 'Password không được chỉ chứa khoảng trắng');
      isValid = false;
    } else if (password.length < 6 || password.length > 20) {
      app.showFieldError('login-password', 'Password phải dài từ 6 đến 20 ký tự');
      isValid = false;
    }

    return isValid;
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (document.body.dataset.page !== 'login') {
      return;
    }

    const form = document.querySelector('form');
    const emailInput = app.getElement('login-email');
    const passwordInput = app.getElement('login-password');
    const generalError = app.getElement('login-error');

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      const email = app.trimValue(emailInput.value);
      const password = String(passwordInput.value || '');

      emailInput.value = email;

      if (!validateLogin(email, password)) {
        return;
      }

      const users = storage.getUsers();
      const matchedUser = users.find(function (user) {
        return user.email.toLowerCase() === email.toLowerCase();
      });

      if (!matchedUser) {
        generalError.textContent = 'Email không tồn tại';
        generalError.classList.remove('d-none');
        app.showToast('error', 'Email không tồn tại');
        return;
      }

      if (matchedUser.password !== password) {
        generalError.textContent = 'Sai mật khẩu';
        generalError.classList.remove('d-none');
        app.showToast('error', 'Sai mật khẩu');
        return;
      }

      storage.saveSession({
        email: matchedUser.email,
        fullName: matchedUser.fullName,
        loginAt: new Date().toISOString()
      });
      storage.setFlash('Đăng nhập thành công', 'success');
      window.location.href = 'catalog.html';
    });
  });
})();
