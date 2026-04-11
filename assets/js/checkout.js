(function () {
  const storage = window.BookStoreStorage;
  const app = window.BookStoreApp;
  const SHIPPING_FEE = 30000;

  function getSummary() {
    const books = storage.getBooks();
    const items = storage.getCart().map(function (item) {
      const book = books.find(function (entry) {
        return entry.id === item.bookId;
      });

      return book ? book.price * item.quantity : 0;
    });

    const subtotal = items.reduce(function (sum, value) {
      return sum + value;
    }, 0);
    const shipping = subtotal > 0 ? SHIPPING_FEE : 0;

    return {
      subtotal: subtotal,
      shipping: shipping,
      total: subtotal + shipping
    };
  }

  function validateCheckout(formData) {
    let isValid = true;
    app.clearFieldErrors([
      'checkout-name',
      'checkout-phone',
      'checkout-address',
      'checkout-payment'
    ]);

    if (!formData.fullName) {
      app.showFieldError('checkout-name', 'Full Name là bắt buộc');
      isValid = false;
    } else if (formData.fullName.length < 2 || formData.fullName.length > 50) {
      app.showFieldError('checkout-name', 'Full Name phải dài từ 2 đến 50 ký tự');
      isValid = false;
    }

    if (!formData.phone) {
      app.showFieldError('checkout-phone', 'Phone là bắt buộc');
      isValid = false;
    } else if (!/^\d{10,11}$/.test(formData.phone)) {
      app.showFieldError('checkout-phone', 'Phone phải gồm 10 đến 11 chữ số');
      isValid = false;
    }

    if (!formData.address) {
      app.showFieldError('checkout-address', 'Address là bắt buộc');
      isValid = false;
    }

    if (!formData.paymentMethod) {
      app.showFieldError('checkout-payment', 'Payment Method là bắt buộc');
      isValid = false;
    }

    return isValid;
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (document.body.dataset.page !== 'checkout') {
      return;
    }

    if (!storage.getCart().length) {
      storage.setFlash('Giỏ hàng đang trống, vui lòng thêm sách trước khi checkout', 'error');
      window.location.href = 'cart.html';
      return;
    }

    const summary = getSummary();
    app.getElement('checkout-subtotal').textContent = app.formatCurrency(summary.subtotal);
    app.getElement('checkout-shipping').textContent = app.formatCurrency(summary.shipping);
    app.getElement('checkout-total').textContent = app.formatCurrency(summary.total);

    const form = document.querySelector('form');
    const successMessage = app.getElement('checkout-success-message');

    form.addEventListener('submit', function (event) {
      event.preventDefault();

      const formData = {
        fullName: app.trimValue(app.getElement('checkout-name').value),
        phone: app.trimValue(app.getElement('checkout-phone').value),
        address: app.trimValue(app.getElement('checkout-address').value),
        paymentMethod: app.getElement('checkout-payment').value
      };

      app.getElement('checkout-name').value = formData.fullName;
      app.getElement('checkout-phone').value = formData.phone;
      app.getElement('checkout-address').value = formData.address;

      if (!validateCheckout(formData)) {
        return;
      }

      const orders = storage.getOrders();
      orders.push({
        id: storage.createId(orders),
        customer: formData,
        items: storage.getCart(),
        summary: summary,
        createdAt: new Date().toISOString()
      });

      storage.saveOrders(orders);
      storage.clearCart();
      app.updateCartBadge();
      successMessage.classList.remove('d-none');
      app.showToast('success', 'Đặt hàng thành công');
      storage.setFlash('Thanh toán thành công', 'success');

      setTimeout(function () {
        window.location.href = 'catalog.html';
      }, 1500);
    });
  });
})();
