(function () {
  const storage = window.BookStoreStorage;
  const app = window.BookStoreApp;
  const categories = ['Fiction', 'Science', 'Technology', 'Business', 'Children', 'History'];
  const params = new URLSearchParams(window.location.search);
  const isEditMode = params.get('mode') === 'edit';
  const editBookId = Number(params.get('id'));

  function validateBook(bookData) {
    let isValid = true;
    app.clearFieldErrors([
      'book-title',
      'book-author',
      'book-category',
      'book-price',
      'book-quantity',
      'book-image-url',
      'book-description'
    ]);

    if (!bookData.title) {
      app.showFieldError('book-title', 'Book Title là bắt buộc');
      isValid = false;
    } else if (bookData.title.length < 2 || bookData.title.length > 20) {
      app.showFieldError('book-title', 'Book Title phải dài từ 2 đến 20 ký tự');
      isValid = false;
    }

    if (!bookData.author) {
      app.showFieldError('book-author', 'Author là bắt buộc');
      isValid = false;
    } else if (bookData.author.length < 2 || bookData.author.length > 20) {
      app.showFieldError('book-author', 'Author phải dài từ 2 đến 20 ký tự');
      isValid = false;
    }

    if (!bookData.category) {
      app.showFieldError('book-category', 'Category là bắt buộc');
      isValid = false;
    } else if (!categories.includes(bookData.category)) {
      app.showFieldError('book-category', 'Category không hợp lệ');
      isValid = false;
    }

    if (bookData.priceRaw === '') {
      app.showFieldError('book-price', 'Reference Price là bắt buộc');
      isValid = false;
    } else if (Number.isNaN(bookData.price)) {
      app.showFieldError('book-price', 'Reference Price phải là số');
      isValid = false;
    } else if (bookData.price < 1000 || bookData.price > 100000000) {
      app.showFieldError('book-price', 'Reference Price phải trong khoảng 1000 đến 100000000');
      isValid = false;
    }

    if (bookData.quantityRaw === '') {
      app.showFieldError('book-quantity', 'Quantity là bắt buộc');
      isValid = false;
    } else if (!Number.isInteger(bookData.quantity)) {
      app.showFieldError('book-quantity', 'Quantity phải là số nguyên');
      isValid = false;
    } else if (bookData.quantity < 0 || bookData.quantity > 1000) {
      app.showFieldError('book-quantity', 'Quantity phải trong khoảng 0 đến 1000');
      isValid = false;
    }

    if (bookData.imageUrl && !/^https?:\/\//i.test(bookData.imageUrl)) {
      app.showFieldError('book-image-url', 'Image URL phải bắt đầu bằng http:// hoặc https://');
      isValid = false;
    }

    if (bookData.description.length > 10) {
      app.showFieldError('book-description', 'Description tối đa 10 ký tự');
      isValid = false;
    }

    return isValid;
  }

  function getEditingBook() {
    if (!isEditMode || Number.isNaN(editBookId)) {
      return null;
    }

    return storage.getBooks().find(function (book) {
      return book.id === editBookId;
    }) || null;
  }

  function applyEditMode(book) {
    const titleElement = app.getElement('edit-mode-title');
    const submitButton = app.getElement('book-submit');

    if (titleElement) {
      titleElement.textContent = 'Edit Book';
    }

    if (submitButton) {
      submitButton.textContent = 'Save Changes';
    }

    app.getElement('book-title').value = book.title;
    app.getElement('book-author').value = book.author;
    app.getElement('book-category').value = book.category;
    app.getElement('book-price').value = book.price;
    app.getElement('book-quantity').value = book.quantity;
    app.getElement('book-image-url').value = book.imageUrl === storage.DEFAULT_IMAGE ? '' : (book.imageUrl || '');
    app.getElement('book-description').value = book.description || '';
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (document.body.dataset.page !== 'add-book') {
      return;
    }

    if (!app.requireAuth('Vui lòng đăng nhập để quản lý đầu sách')) {
      return;
    }

    const form = document.querySelector('form');
    const editingBook = getEditingBook();

    if (isEditMode) {
      if (!editingBook) {
        storage.setFlash('Không tìm thấy sách để chỉnh sửa', 'error');
        window.location.href = 'catalog.html';
        return;
      }

      applyEditMode(editingBook);
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();

      const bookData = {
        title: app.trimValue(app.getElement('book-title').value),
        author: app.trimValue(app.getElement('book-author').value),
        category: app.getElement('book-category').value,
        priceRaw: String(app.getElement('book-price').value || '').trim(),
        quantityRaw: String(app.getElement('book-quantity').value || '').trim(),
        imageUrl: app.trimValue(app.getElement('book-image-url').value),
        description: app.trimValue(app.getElement('book-description').value)
      };

      bookData.price = Number(bookData.priceRaw);
      bookData.quantity = Number(bookData.quantityRaw);

      app.getElement('book-title').value = bookData.title;
      app.getElement('book-author').value = bookData.author;
      app.getElement('book-image-url').value = bookData.imageUrl;
      app.getElement('book-description').value = bookData.description;

      if (!validateBook(bookData)) {
        return;
      }

      const books = storage.getBooks();
      const duplicateBook = books.some(function (book) {
        if (isEditMode && book.id === editBookId) {
          return false;
        }

        return book.title === bookData.title && book.author === bookData.author;
      });

      if (duplicateBook) {
        app.showFieldError('book-title', 'Sách với Book Title và Author này đã tồn tại');
        app.showFieldError('book-author', 'Sách với Book Title và Author này đã tồn tại');
        app.showToast('error', 'Sách đã tồn tại');
        return;
      }

      if (isEditMode) {
        const bookIndex = books.findIndex(function (book) {
          return book.id === editBookId;
        });

        books[bookIndex] = {
          id: books[bookIndex].id,
          title: bookData.title,
          author: bookData.author,
          category: bookData.category,
          price: bookData.price,
          quantity: bookData.quantity,
          imageUrl: bookData.imageUrl || storage.DEFAULT_IMAGE,
          description: bookData.description
        };
      } else {
        books.unshift({
          id: storage.createId(books),
          title: bookData.title,
          author: bookData.author,
          category: bookData.category,
          price: bookData.price,
          quantity: bookData.quantity,
          imageUrl: bookData.imageUrl || storage.DEFAULT_IMAGE,
          description: bookData.description
        });
      }

      storage.saveBooks(books);
      storage.setFlash(isEditMode ? 'Cập nhật sách thành công' : 'Thêm sách vào thư viện thành công', 'success');
      window.location.href = 'catalog.html';
    });
  });
})();
