(function () {
  const storage = window.BookStoreStorage;
  const app = window.BookStoreApp;

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function containsDigit(value) {
    return /\d/.test(value);
  }

  function validateRegister(formData) {
    let isValid = true;
    app.clearFieldErrors([
      'register-name',
      'register-email',
      'register-password',
      'register-confirm-password'
    ]);

    if (!formData.fullName) {
      app.showFieldError('register-name', 'Full Name là bắt buộc');
      isValid = false;
    } else if (formData.fullName.length < 2 || formData.fullName.length > 20) {
      app.showFieldError('register-name', 'Full Name phải dài từ 2 đến 20 ký tự');
      isValid = false;
    } else if (containsDigit(formData.fullName)) {
      app.showFieldError('register-name', 'Full Name không được chứa số');
      isValid = false;
    }

    if (!formData.email) {
      app.showFieldError('register-email', 'Email là bắt buộc');
      isValid = false;
    } else if (formData.email.length > 30) {
      app.showFieldError('register-email', 'Email tối đa 30 ký tự');
      isValid = false;
    } else if (!isValidEmail(formData.email)) {
      app.showFieldError('register-email', 'Email không đúng định dạng');
      isValid = false;
    }

    if (!formData.password) {
      app.showFieldError('register-password', 'Password là bắt buộc');
      isValid = false;
    } else if (formData.password.length < 6 || formData.password.length > 20) {
      app.showFieldError('register-password', 'Password phải dài từ 6 đến 20 ký tự');
      isValid = false;
    }

    if (!formData.confirmPassword) {
      app.showFieldError('register-confirm-password', 'Confirm Password là bắt buộc');
      isValid = false;
    } else if (formData.confirmPassword !== formData.password) {
      app.showFieldError('register-confirm-password', 'Confirm Password phải trùng Password');
      isValid = false;
    }

    return isValid;
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (document.body.dataset.page !== 'register') {
      return;
    }

    const form = document.querySelector('form');

    form.addEventListener('submit', function (event) {
      event.preventDefault();

      const formData = {
        fullName: app.trimValue(app.getElement('register-name').value),
        email: app.trimValue(app.getElement('register-email').value),
        password: String(app.getElement('register-password').value || ''),
        confirmPassword: String(app.getElement('register-confirm-password').value || '')
      };

      app.getElement('register-name').value = formData.fullName;
      app.getElement('register-email').value = formData.email;

      if (!validateRegister(formData)) {
        return;
      }

      const users = storage.getUsers();
      const emailExists = users.some(function (user) {
        return user.email.toLowerCase() === formData.email.toLowerCase();
      });

      if (emailExists) {
        app.showFieldError('register-email', 'Email đã tồn tại');
        app.showToast('error', 'Email đã tồn tại');
        return;
      }

      users.push({
        id: storage.createId(users),
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        createdAt: new Date().toISOString()
      });

      storage.saveUsers(users);
      storage.setFlash('Đăng ký thành công, vui lòng đăng nhập', 'success');
      window.location.href = 'login.html';
    });
  });
})();
