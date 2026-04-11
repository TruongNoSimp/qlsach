(function () {
  const storage = window.BookStoreStorage;
  const app = window.BookStoreApp;

  function getSession() {
    return storage.getSession();
  }

  function getActiveBorrowRecord(bookId) {
    const session = getSession();
    if (!session) {
      return null;
    }

    return storage.getBorrowHistory().find(function (item) {
      return item.bookId === bookId && item.userEmail === session.email && item.status === 'borrowed';
    }) || null;
  }

  function borrowBook(bookId) {
    if (!app.requireAuth('Vui lòng đăng nhập để mượn sách')) {
      return;
    }

    const books = storage.getBooks();
    const bookIndex = books.findIndex(function (item) {
      return item.id === bookId;
    });

    if (bookIndex === -1) {
      app.showToast('error', 'Không tìm thấy sách để mượn');
      return;
    }

    const book = books[bookIndex];
    if (book.quantity <= 0) {
      app.showToast('error', 'Sách hiện đã hết để mượn');
      return;
    }

    if (getActiveBorrowRecord(bookId)) {
      app.showToast('error', 'Bạn đang mượn cuốn sách này');
      return;
    }

    books[bookIndex].quantity -= 1;
    storage.saveBooks(books);

    const session = getSession();
    const history = storage.getBorrowHistory();
    history.unshift({
      id: storage.createId(history),
      bookId: book.id,
      title: book.title,
      author: book.author,
      imageUrl: book.imageUrl || storage.DEFAULT_IMAGE,
      userEmail: session.email,
      userName: session.fullName,
      borrowedAt: new Date().toISOString(),
      returnedAt: null,
      status: 'borrowed'
    });
    storage.saveBorrowHistory(history);

    app.showToast('success', 'Mượn sách thành công');
    renderCurrentView();
  }

  function returnBook(bookId) {
    if (!app.requireAuth('Vui lòng đăng nhập để trả sách')) {
      return;
    }

    const session = getSession();
    const history = storage.getBorrowHistory();
    const recordIndex = history.findIndex(function (item) {
      return item.bookId === bookId && item.userEmail === session.email && item.status === 'borrowed';
    });

    if (recordIndex === -1) {
      app.showToast('error', 'Bạn chưa mượn cuốn sách này');
      return;
    }

    const books = storage.getBooks();
    const bookIndex = books.findIndex(function (item) {
      return item.id === bookId;
    });

    if (bookIndex !== -1) {
      books[bookIndex].quantity += 1;
      storage.saveBooks(books);
    }

    history[recordIndex].status = 'returned';
    history[recordIndex].returnedAt = new Date().toISOString();
    storage.saveBorrowHistory(history);

    app.showToast('success', 'Trả sách thành công');
    renderCurrentView();
  }

  function updateDetailActions(book) {
    const borrowButton = app.getElement('borrow-book-button');
    const returnButton = app.getElement('return-book-button');
    const activeRecord = getActiveBorrowRecord(book.id);

    borrowButton.onclick = function () {
      borrowBook(book.id);
    };
    returnButton.onclick = function () {
      returnBook(book.id);
    };

    if (activeRecord) {
      borrowButton.classList.add('d-none');
      returnButton.classList.remove('d-none');
    } else {
      returnButton.classList.add('d-none');
      borrowButton.classList.remove('d-none');
      borrowButton.disabled = book.quantity <= 0;
    }
  }

  function showBookDetail(book) {
    app.getElement('detail-book-image').src = book.imageUrl || storage.DEFAULT_IMAGE;
    app.getElement('detail-book-image').alt = book.title;
    app.getElement('detail-book-title').textContent = book.title;
    app.getElement('detail-book-author').textContent = book.author;
    app.getElement('detail-book-category').textContent = book.category;
    app.getElement('detail-book-price').textContent = app.formatCurrency(book.price);
    app.getElement('detail-book-quantity').textContent = String(book.quantity);
    app.getElement('detail-book-description').textContent = book.description || 'Chưa có mô tả cho cuốn sách này.';
    updateDetailActions(book);

    app.getElement('edit-book-button').onclick = function () {
      window.location.href = 'add-book.html?mode=edit&id=' + book.id;
    };

    window.bootstrap.Modal.getOrCreateInstance(app.getElement('book-detail-modal')).show();
  }

  function deleteBook(bookId) {
    const hasActiveBorrow = storage.getBorrowHistory().some(function (item) {
      return item.bookId === bookId && item.status === 'borrowed';
    });

    if (hasActiveBorrow) {
      app.showToast('error', 'Không thể xóa sách đang có người mượn');
      return;
    }

    if (!window.confirm('Bạn có chắc muốn xóa sách này?')) {
      return;
    }

    const books = storage.getBooks().filter(function (item) {
      return item.id !== bookId;
    });
    storage.saveBooks(books);

    const history = storage.getBorrowHistory().filter(function (item) {
      return item.bookId !== bookId;
    });
    storage.saveBorrowHistory(history);

    app.showToast('success', 'Đã xóa sách khỏi thư viện');
    filterBooks();
  }

  function renderBooks(books) {
    const list = app.getElement('book-list');
    const emptyMessage = app.getElement('empty-search-message');

    if (!list || !emptyMessage) {
      return;
    }

    list.innerHTML = '';

    if (!books.length) {
      emptyMessage.classList.remove('d-none');
      return;
    }

    emptyMessage.classList.add('d-none');

    books.forEach(function (book, index) {
      const activeBorrow = getActiveBorrowRecord(book.id);
      const availability = book.quantity > 0 ? 'Có thể mượn' : 'Đã hết sách';
      const actionLabel = activeBorrow ? 'Đang mượn' : 'Xem chi tiết';

      const col = document.createElement('div');
      col.className = 'col-sm-6 col-xl-4';
      col.innerHTML = `
        <div class="card book-card" id="book-item-${index}" data-testid="book-item-${index}">
          <img class="book-cover" src="${book.imageUrl || storage.DEFAULT_IMAGE}" alt="${book.title}">
          <div class="card-body p-4 d-flex flex-column">
            <div class="book-meta">
              <span class="book-badge">${book.category}</span>
              <span class="price-badge">${app.formatCurrency(book.price)}</span>
            </div>
            <h3 class="h4">${book.title}</h3>
            <p class="mb-2"><strong>Tác giả:</strong> ${book.author}</p>
            <p class="book-description">${book.description || 'Chưa có mô tả cho cuốn sách này.'}</p>
            <div class="d-flex justify-content-between align-items-center mt-3 mb-3">
              <span class="text-muted">Số lượng: ${book.quantity}</span>
              <span class="fw-semibold ${book.quantity > 0 ? 'text-success' : 'text-danger'}">${availability}</span>
            </div>
            <div class="d-grid gap-2 mt-auto">
              <button class="btn btn-gradient" type="button" id="view-book-${index}" data-testid="view-book-${index}" data-view-book-id="${book.id}">${actionLabel}</button>
              <button class="btn btn-outline-danger" type="button" id="delete-book-${index}" data-testid="delete-book-${index}" data-delete-book-id="${book.id}">Xóa</button>
            </div>
          </div>
        </div>
      `;
      list.appendChild(col);
    });

    list.querySelectorAll('[data-view-book-id]').forEach(function (button) {
      button.addEventListener('click', function () {
        const bookId = Number(button.getAttribute('data-view-book-id'));
        const book = storage.getBooks().find(function (item) {
          return item.id === bookId;
        });
        if (book) {
          showBookDetail(book);
        }
      });
    });

    list.querySelectorAll('[data-delete-book-id]').forEach(function (button) {
      button.addEventListener('click', function () {
        deleteBook(Number(button.getAttribute('data-delete-book-id')));
      });
    });
  }

  function filterBooks() {
    const input = app.getElement('book-search');
    const error = app.getElement('book-search-error');
    const keyword = app.trimValue(input.value);

    error.textContent = '';

    if (keyword.length > 100) {
      error.textContent = 'Từ khóa tối đa 100 ký tự';
      return;
    }

    input.value = keyword;
    const books = storage.getBooks();

    if (!keyword) {
      renderBooks(books);
      return;
    }

    const lowered = keyword.toLowerCase();
    const filtered = books.filter(function (book) {
      return [book.title, book.author, book.category].some(function (value) {
        return String(value).toLowerCase().includes(lowered);
      });
    });

    renderBooks(filtered);
  }

  function renderCurrentView() {
    const input = app.getElement('book-search');
    if (!input) {
      return;
    }

    if (app.trimValue(input.value)) {
      filterBooks();
    } else {
      renderBooks(storage.getBooks());
    }
  }

  function initCatalogPage() {
    renderBooks(storage.getBooks());

    const searchInput = app.getElement('book-search');
    const searchButton = app.getElement('book-search-button');
    const clearButton = app.getElement('book-clear-button');

    if (!searchInput || !searchButton || !clearButton) {
      return;
    }

    searchButton.addEventListener('click', filterBooks);
    clearButton.addEventListener('click', function () {
      searchInput.value = '';
      app.getElement('book-search-error').textContent = '';
      renderBooks(storage.getBooks());
    });

    searchInput.addEventListener('keydown', function (event) {
      if (event.key === 'Enter') {
        event.preventDefault();
        filterBooks();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (document.body.dataset.page !== 'catalog') {
      return;
    }

    initCatalogPage();
  });
})();
