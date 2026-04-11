(function () {
  const STORAGE_KEYS = {
    users: 'bookstore_users',
    books: 'bookstore_books',
    session: 'bookstore_session',
    flash: 'bookstore_flash',
    borrowHistory: 'bookstore_borrow_history'
  };

  const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=900&q=80';

  const sampleUsers = [
    {
      id: 1,
      fullName: 'Admin Demo',
      email: 'admin@gmail.com',
      password: '123456',
      createdAt: new Date().toISOString()
    }
  ];

  const sampleBooks = [
    { id: 1, title: 'Atomic Habits', author: 'James Clear', category: 'Business', price: 185000, quantity: 20, imageUrl: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=900&q=80', description: 'Cuon sach ve thoi quen va cach thay doi nho de tao ket qua lon.' },
    { id: 2, title: 'The Silent Patient', author: 'Alex Michaelides', category: 'Fiction', price: 139000, quantity: 14, imageUrl: 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=900&q=80', description: 'Tieu thuyet tam ly gay can voi nhieu nut that bat ngo.' },
    { id: 3, title: 'Clean Code', author: 'Robert C. Martin', category: 'Technology', price: 325000, quantity: 12, imageUrl: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=900&q=80', description: 'Sach kinh dien cho lap trinh vien ve viet ma sach va de bao tri.' },
    { id: 4, title: 'Sapiens', author: 'Yuval Noah Harari', category: 'History', price: 210000, quantity: 18, imageUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=900&q=80', description: 'Cau chuyen tien hoa va phat trien cua loai nguoi tu qua khu den hien tai.' },
    { id: 5, title: 'A Brief History of Time', author: 'Stephen Hawking', category: 'Science', price: 198000, quantity: 10, imageUrl: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=900&q=80', description: 'Gioi thieu ve vu tru, thoi gian va nhung cau hoi lon cua khoa hoc.' },
    { id: 6, title: 'The Lean Startup', author: 'Eric Ries', category: 'Business', price: 172000, quantity: 16, imageUrl: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=900&q=80', description: 'Phuong phap khoi nghiep tinh gon de kiem chung y tuong nhanh hon.' },
    { id: 7, title: 'Charlotte s Web', author: 'E. B. White', category: 'Children', price: 115000, quantity: 25, imageUrl: 'https://images.unsplash.com/photo-1511108690759-009324a90311?auto=format&fit=crop&w=900&q=80', description: 'Tac pham thieu nhi am ap ve tinh ban va long nhan ai.' },
    { id: 8, title: 'Deep Work', author: 'Cal Newport', category: 'Technology', price: 165000, quantity: 13, imageUrl: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=900&q=80', description: 'Huong dan ren luyen kha nang tap trung sau trong thoi dai xao nhang.' },
    { id: 9, title: 'Thinking Fast and Slow', author: 'Daniel Kahneman', category: 'Science', price: 229000, quantity: 11, imageUrl: 'https://images.unsplash.com/photo-1526243741027-444d633d7365?auto=format&fit=crop&w=900&q=80', description: 'Kham pha hai he thong tu duy anh huong den phan doan va quyet dinh.' },
    { id: 10, title: 'The Midnight Library', author: 'Matt Haig', category: 'Fiction', price: 149000, quantity: 17, imageUrl: 'https://images.unsplash.com/photo-1518112166137-85f9979a43b5?auto=format&fit=crop&w=900&q=80', description: 'Hanh trinh gia tuong ve lua chon, hoi tiec va y nghia song.' }
  ];

  function read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function write(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function seedData() {
    if (!localStorage.getItem(STORAGE_KEYS.users)) {
      write(STORAGE_KEYS.users, sampleUsers);
    }

    if (!localStorage.getItem(STORAGE_KEYS.books)) {
      write(STORAGE_KEYS.books, sampleBooks);
    }
  }

  function getUsers() {
    return read(STORAGE_KEYS.users, []);
  }

  function saveUsers(users) {
    write(STORAGE_KEYS.users, users);
  }

  function getBooks() {
    return read(STORAGE_KEYS.books, []);
  }

  function saveBooks(books) {
    write(STORAGE_KEYS.books, books);
  }

  function getSession() {
    return read(STORAGE_KEYS.session, null);
  }

  function saveSession(session) {
    write(STORAGE_KEYS.session, session);
  }

  function clearSession() {
    localStorage.removeItem(STORAGE_KEYS.session);
  }

  function setFlash(message, type) {
    write(STORAGE_KEYS.flash, { message: message, type: type });
  }

  function getFlash() {
    return read(STORAGE_KEYS.flash, null);
  }

  function clearFlash() {
    localStorage.removeItem(STORAGE_KEYS.flash);
  }

  function getBorrowHistory() {
    return read(STORAGE_KEYS.borrowHistory, []);
  }

  function saveBorrowHistory(history) {
    write(STORAGE_KEYS.borrowHistory, history);
  }

  function createId(collection) {
    return collection.length ? Math.max.apply(null, collection.map(function (item) { return item.id || 0; })) + 1 : 1;
  }

  window.BookStoreStorage = {
    STORAGE_KEYS: STORAGE_KEYS,
    DEFAULT_IMAGE: DEFAULT_IMAGE,
    seedData: seedData,
    getUsers: getUsers,
    saveUsers: saveUsers,
    getBooks: getBooks,
    saveBooks: saveBooks,
    getSession: getSession,
    saveSession: saveSession,
    clearSession: clearSession,
    setFlash: setFlash,
    getFlash: getFlash,
    clearFlash: clearFlash,
    getBorrowHistory: getBorrowHistory,
    saveBorrowHistory: saveBorrowHistory,
    createId: createId
  };
})();
