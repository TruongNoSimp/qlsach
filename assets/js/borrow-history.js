(function () {
  const storage = window.BookStoreStorage;
  const app = window.BookStoreApp;

  function formatDate(value) {
    return new Date(value).toLocaleString('vi-VN');
  }

  function returnBook(recordId) {
    const session = storage.getSession();
    const history = storage.getBorrowHistory();
    const recordIndex = history.findIndex(function (item) {
      return item.id === recordId && item.userEmail === session.email && item.status === 'borrowed';
    });

    if (recordIndex === -1) {
      app.showToast('error', 'Không tìm thấy lượt mượn hợp lệ');
      return;
    }

    const books = storage.getBooks();
    const bookIndex = books.findIndex(function (item) {
      return item.id === history[recordIndex].bookId;
    });

    if (bookIndex !== -1) {
      books[bookIndex].quantity += 1;
      storage.saveBooks(books);
    }

    history[recordIndex].status = 'returned';
    history[recordIndex].returnedAt = new Date().toISOString();
    storage.saveBorrowHistory(history);

    app.showToast('success', 'Trả sách thành công');
    renderHistory();
  }

  function renderHistory() {
    const list = app.getElement('borrow-history-list');
    const empty = app.getElement('empty-history-message');
    const session = storage.getSession();
    const history = storage.getBorrowHistory().filter(function (item) {
      return item.userEmail === session.email;
    });

    list.innerHTML = '';

    if (!history.length) {
      empty.classList.remove('d-none');
      return;
    }

    empty.classList.add('d-none');

    history.forEach(function (item, index) {
      const row = document.createElement('div');
      row.className = 'borrow-item';
      row.id = 'borrow-item-' + index;
      row.innerHTML = `
        <div class="borrow-item-media">
          <img src="${item.imageUrl || storage.DEFAULT_IMAGE}" alt="${item.title}">
        </div>
        <div class="borrow-item-content">
          <div>
            <h3 class="h5 mb-1">${item.title}</h3>
            <p class="text-muted mb-1">${item.author}</p>
            <p class="text-muted small mb-2">Ngày mượn: ${formatDate(item.borrowedAt)}</p>
            <p class="text-muted small mb-0">${item.returnedAt ? 'Ngày trả: ' + formatDate(item.returnedAt) : 'Đang được mượn'}</p>
          </div>
          <div class="borrow-item-actions mt-3 mt-md-0">
            <span class="borrow-status ${item.status === 'borrowed' ? 'status-active' : 'status-returned'}">${item.status === 'borrowed' ? 'Borrowing' : 'Returned'}</span>
            ${item.status === 'borrowed' ? `<button class="btn btn-outline-success btn-sm mt-2" type="button" data-return-id="${item.id}">Return Book</button>` : ''}
          </div>
        </div>
      `;
      list.appendChild(row);
    });

    list.querySelectorAll('[data-return-id]').forEach(function (button) {
      button.addEventListener('click', function () {
        returnBook(Number(button.getAttribute('data-return-id')));
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (document.body.dataset.page !== 'borrow-history') {
      return;
    }

    if (!app.requireAuth('Vui lòng đăng nhập để xem lịch sử mượn sách')) {
      return;
    }

    renderHistory();
  });
})();
