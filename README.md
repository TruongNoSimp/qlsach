# Bookoria Library Management Demo

Demo web quan ly va muon sach bang HTML, Bootstrap 5, JavaScript thuan va `localStorage`, khong can backend.

## Cau truc project

```text
bookstore/
|-- index.html
|-- catalog.html
|-- borrow-history.html
|-- login.html
|-- register.html
|-- add-book.html
|-- profile.html
|-- README.md
`-- assets/
    |-- css/
    |   `-- styles.css
    `-- js/
        |-- storage.js
        |-- common.js
        |-- home.js
        |-- borrow-history.js
        |-- login.js
        |-- register.js
        |-- add-book.js
        `-- profile.js
```

## Chuc nang chinh

- `Home`: landing page gioi thieu he thong thu vien, vai tro quan ly dau sach va theo doi luot muon.
- `Catalog`: trang tra cuu sach, tim kiem theo title/author/category, xem chi tiet, sua sach va muon tra sach.
- `Borrow Book`: co trong modal chi tiet sach. Neu sach con so luong va user da dang nhap thi cho phep muon.
- `Return Book`: co trong modal chi tiet va trong Borrow History. Chi user dang muon sach do moi co the tra.
- `Borrow History`: xem lich su muon sach cua user dang dang nhap, kem ngay muon, ngay tra va trang thai.
- `Login`: dang nhap bang email/password, luu session vao `localStorage`, chuyen ve `catalog.html`.
- `Register`: tao tai khoan moi, kiem tra trung email, chuyen ve `login.html` khi thanh cong.
- `Add Book`: chi cho user da dang nhap; dung chung form cho ca them moi va chinh sua sach.
- `Profile`: hien thong tin thanh vien dang dang nhap tu `localStorage`.

## Du lieu localStorage

- `bookstore_users`
  - Mang user.
  - User mau mac dinh:
  - `fullName`: `Admin Demo`
  - `email`: `admin@gmail.com`
  - `password`: `123456`
- `bookstore_books`
  - Mang sach mau ban dau gom 10 cuon.
  - Moi sach co cac truong: `id`, `title`, `author`, `category`, `price`, `quantity`, `imageUrl`, `description`.
- `bookstore_session`
  - Luu phien dang nhap hien tai.
  - `email`, `fullName`, `loginAt`
- `bookstore_flash`
  - Dung de chuyen toast thong bao giua cac trang.
  - `message`, `type`
- `bookstore_borrow_history`
  - Mang lich su muon/tra.
  - Moi record co: `id`, `bookId`, `title`, `author`, `imageUrl`, `userEmail`, `userName`, `borrowedAt`, `returnedAt`, `status`.

## Validation rules da implement

### Login

- `Email`: bat buoc, toi da 50 ky tu, dung dinh dang email.
- `Password`: bat buoc, 6-20 ky tu, khong chi chua khoang trang.
- Neu email khong ton tai: hien `Email không tồn tại`.
- Neu password sai: hien `Sai mật khẩu`.
- Dang nhap thanh cong se chuyen sang `catalog.html`.

### Register

- `Full Name`: bat buoc, 2-50 ky tu, khong chi chua khoang trang, khong chua so.
- `Email`: bat buoc, toi da 50 ky tu, dung dinh dang, khong trung.
- `Password`: bat buoc, 6-20 ky tu.
- `Confirm Password`: phai trung `Password`.

### Search

- Tim theo `title`, `author`, `category`.
- Tu khoa toi da 100 ky tu.
- Trim dau/cuoi.
- Khong phan biet hoa thuong.
- Search rong => hien toan bo sach.
- Khong co ket qua => hien `Không tìm thấy sách phù hợp`.

### Borrow / Return

- Chi user da login moi muon hoac tra sach.
- Muon sach chi thanh cong khi `quantity > 0`.
- Moi user chi co 1 luot muon dang active tren cung 1 cuon sach.
- Khi muon:
  - Giam `quantity` cua sach di `1`.
  - Tao record moi trong `bookstore_borrow_history` voi `status = borrowed`.
- Khi tra:
  - Tang `quantity` cua sach len `1`.
  - Cap nhat record dang active thanh `status = returned` va them `returnedAt`.
- Khong cho xoa sach neu con luot muon dang active.

### Add / Edit Book

- Chi user da login moi them hoac sua sach.
- `Book Title`: bat buoc, 2-100 ky tu.
- `Author`: bat buoc, 2-50 ky tu.
- `Category`: chi nhan 1 trong 6 gia tri:
  - `Fiction`, `Science`, `Technology`, `Business`, `Children`, `History`
- `Price`: bat buoc, la so, trong khoang `1000` den `100000000`.
- `Quantity`: bat buoc, la so nguyen, trong khoang `0` den `1000`.
- `Image URL`: khong bat buoc; neu co phai bat dau bang `http://` hoac `https://`.
- `Description`: khong bat buoc, toi da 500 ky tu.
- Khong cho trung hoan toan `Book Title` va `Author` khi them moi.
- Che do edit cap nhat dung record sach hien tai, khong tao sach moi.

## Selenium selectors

### Catalog

- `#book-search`
- `#book-search-button`
- `#book-clear-button`
- `#book-list`
- `#book-item-0`
- `#empty-search-message`
- `data-testid="view-book-0"`
- `data-testid="delete-book-0"`
- `#book-detail-modal`
- `#edit-book-button`
- `#borrow-book-button`
- `#return-book-button`

### Borrow History

- `#borrow-history-list`
- `#borrow-item-0`

### Login page

- `#login-email`
- `#login-password`
- `#login-submit`
- `#login-error`

### Register page

- `#register-name`
- `#register-email`
- `#register-password`
- `#register-confirm-password`
- `#register-submit`

### Add Book page

- `#add-book-button`
- `#book-title`
- `#book-author`
- `#book-category`
- `#book-price`
- `#book-quantity`
- `#book-image-url`
- `#book-description`
- `#book-submit`
- `#edit-mode-title`
- `data-testid="save-book-button"`

### Profile page

- `#profile-name`
- `#profile-email`
- `#profile-edit-button`

### Common

- `#navbar-login`
- `#navbar-register`
- `#navbar-logout`
- `#current-user`
- `#nav-profile`
- `data-testid="nav-logout"`
- `#toast-success`
- `#toast-error`

## Cach chay

1. Mo `index.html` bang Live Server hoac trinh duyet.
2. Neu muon reset du lieu, xoa cac key `bookstore_*` trong `localStorage`.
3. Dang nhap bang tai khoan mau:
   - Email: `admin@gmail.com`
   - Password: `123456`
4. Tim sach tai `catalog.html`, mo chi tiet va thu flow muon/tra sach.
5. Vao `borrow-history.html` de xem lich su va tra sach neu can.
6. Dung `add-book.html` de them sach moi hoac sua sach tu catalog.

## Ghi chu

- Toan bo du lieu chi luu tren trinh duyet, khong dong bo giua cac may.
- Bootstrap duoc nap bang CDN.
- Code duoc tach file de de doc, de test va de nang cap sau nay.
- `cart.html`, `checkout.html`, `assets/js/cart.js`, `assets/js/checkout.js` duoc giu lai trong workspace nhu phan du thua tu phien ban truoc, nhung khong con nam trong flow chinh cua he thong library.
