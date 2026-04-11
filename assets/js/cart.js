(function () {
  const storage = window.BookStoreStorage;
  const app = window.BookStoreApp;
  const SHIPPING_FEE = 30000;

  function getCartDetails() {
    const books = storage.getBooks();
    return storage.getCart().map(function (item) {
      const book = books.find(function (entry) {
        return entry.id === item.bookId;
      });

      return {
        bookId: item.bookId,
        quantity: item.quantity,
        book: book,
        total: book ? book.price * item.quantity : 0
      };
    }).filter(function (item) {
      return Boolean(item.book);
    });
  }

  function calculateSummary(items) {
    const subtotal = items.reduce(function (sum, item) {
      return sum + item.total;
    }, 0);
    const shipping = items.length ? SHIPPING_FEE : 0;

    return {
      subtotal: subtotal,
      shipping: shipping,
      total: subtotal + shipping
    };
  }

  function saveCartFromItems(items) {
    const cart = items.map(function (item) {
      return {
        bookId: item.bookId,
        quantity: item.quantity
      };
    });

    storage.saveCart(cart);
    app.updateCartBadge();
  }

  function renderCart() {
    const list = app.getElement('cart-list');
    const empty = app.getElement('empty-cart-message');
    const checkoutButton = app.getElement('cart-checkout-button');
    const items = getCartDetails();
    const summary = calculateSummary(items);

    list.innerHTML = '';
    app.getElement('cart-subtotal').textContent = app.formatCurrency(summary.subtotal);
    app.getElement('cart-shipping').textContent = app.formatCurrency(summary.shipping);
    app.getElement('cart-total').textContent = app.formatCurrency(summary.total);

    if (!items.length) {
      empty.classList.remove('d-none');
      checkoutButton.classList.add('disabled');
      checkoutButton.setAttribute('aria-disabled', 'true');
      return;
    }

    empty.classList.add('d-none');
    checkoutButton.classList.remove('disabled');
    checkoutButton.removeAttribute('aria-disabled');

    items.forEach(function (item, index) {
      const row = document.createElement('div');
      row.className = 'cart-item';
      row.id = 'cart-item-' + index;
      row.innerHTML = `
        <div class="cart-item-media">
          <img src="${item.book.imageUrl || storage.DEFAULT_IMAGE}" alt="${item.book.title}">
        </div>
        <div class="cart-item-content">
          <div>
            <h3 class="h5 mb-1">${item.book.title}</h3>
            <p class="text-muted mb-2">${app.formatCurrency(item.book.price)}</p>
          </div>
          <div class="cart-actions">
            <button class="btn btn-outline-secondary btn-sm" type="button" id="cart-decrease-${index}">-</button>
            <span class="cart-qty">${item.quantity}</span>
            <button class="btn btn-outline-secondary btn-sm" type="button" id="cart-increase-${index}">+</button>
            <button class="btn btn-outline-danger btn-sm ms-sm-auto" type="button" id="cart-remove-${index}">Xóa</button>
          </div>
        </div>
        <div class="cart-item-total">${app.formatCurrency(item.total)}</div>
      `;
      list.appendChild(row);

      app.getElement('cart-increase-' + index).addEventListener('click', function () {
        if (item.quantity >= item.book.quantity) {
          app.showToast('error', 'Không thể vượt quá số lượng tồn kho');
          return;
        }

        item.quantity += 1;
        saveCartFromItems(items);
        renderCart();
      });

      app.getElement('cart-decrease-' + index).addEventListener('click', function () {
        if (item.quantity <= 1) {
          items.splice(index, 1);
        } else {
          item.quantity -= 1;
        }

        saveCartFromItems(items);
        renderCart();
      });

      app.getElement('cart-remove-' + index).addEventListener('click', function () {
        items.splice(index, 1);
        saveCartFromItems(items);
        renderCart();
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (document.body.dataset.page !== 'cart') {
      return;
    }

    const checkoutButton = app.getElement('cart-checkout-button');
    checkoutButton.addEventListener('click', function (event) {
      if (!storage.getCart().length) {
        event.preventDefault();
        app.showToast('error', 'Giỏ hàng đang trống');
      }
    });

    renderCart();
  });
})();
