const books = []
const RENDER_EVENT = 'render-book'
const SAVED_EVENT = 'saved-book'
const STORAGE_KEY = 'BOOKSHELF_APPS'


// ========= Event ========= //
document.addEventListener('DOMContentLoaded', function () {
    const submitForm = document.getElementById('inputBook');
    submitForm.addEventListener('submit', function (e) {
        e.preventDefault();
        addBook();
    })

    if (isStorageExist()) {
        localDataFromStorage()
    }

    const searchInput = document.getElementById('searchBookTitle');
    const searchSubmitBtn = document.getElementById('searchSubmit');

    // Menambahkan event listener pada tombol submit pencarian
    searchSubmitBtn.addEventListener('click', function (e) {
        e.preventDefault(); // Mencegah aksi default dari form submission
        const searchValue = searchInput.value.toLowerCase();
        const filteredBooks = searchBooks(searchValue);
        renderBooks(filteredBooks);
    })

    // Menambahkan event listener pada input pencarian untuk memperbarui hasil pencarian secara otomatis
    searchInput.addEventListener('input', function () {
        const searchValue = searchInput.value.toLowerCase();
        const filteredBooks = searchBooks(searchValue);
        renderBooks(filteredBooks);
    })
})

document.addEventListener(RENDER_EVENT, function () {
    console.log(books);

    const incompleteBookShelfList = document.getElementById('incompleteBookshelfList')
    incompleteBookShelfList.innerHTML = ''

    const completeBookshelfList = document.getElementById('completeBookshelfList')
    completeBookshelfList.innerHTML = ''

    for (const bookItem of books) {
        const booksElement = makeBookShelf(bookItem)

        if (!bookItem.isComplete)
            incompleteBookShelfList.append(booksElement)
        else
            completeBookshelfList.append(booksElement)
    }
    
});

document.addEventListener(SAVED_EVENT, function () {
    console.log(localStorage.getItem(STORAGE_KEY))
})


// ========= Function ========= //

// Fungsi Search
function searchBooks(searchValue) {
    return books.filter(
        book => 
            book.bookTitle.toLowerCase().includes(searchValue) ||
            book.bookAuthor.toLowerCase().includes(searchValue) ||
            book.bookYear.toString().includes(searchValue)
    );
}

// 
function renderBooks(booksToRender) {
    console.log(booksToRender);

    const incompleteBookShelfList = document.getElementById('incompleteBookshelfList');
    incompleteBookShelfList.innerHTML = '';

    const completeBookshelfList = document.getElementById('completeBookshelfList');
    completeBookshelfList.innerHTML = '';

    for (const bookItem of booksToRender) {
        const booksElement = makeBookShelf(bookItem);

        if (!bookItem.isComplete)
            incompleteBookShelfList.append(booksElement);
        else
            completeBookshelfList.append(booksElement);
    }
}

// Fungsi menambahkan buku
function addBook() {
    const bookTitleInput = document.getElementById('inputBookTitle');
    const bookAuthorInput = document.getElementById('inputBookAuthor');
    const bookYearInput = document.getElementById('inputBookYear');
    const bookCompletedInput = document.getElementById('inputBookIsComplete');

    const bookTitle = bookTitleInput.value;
    const bookAuthor = bookAuthorInput.value;
    const bookYear = parseInt(bookYearInput.value);
    const bookCompleted = bookCompletedInput.checked;

    const isComplete = bookCompleted ? true : false;

    const generateID = generateId();
    const bookShelfObj = generateBookShelfObject(generateID, bookTitle, bookAuthor, bookYear, isComplete);
    books.push(bookShelfObj);

    // Reset input setelah menambahkan buku
    bookTitleInput.value = '';
    bookAuthorInput.value = '';
    bookYearInput.value = '';
    bookCompletedInput.checked = false;

    document.dispatchEvent(new Event(RENDER_EVENT));

    saveData()
}

// Fungsi Generate Id
function generateId() {
    return +new Date()
}

// Fungsi Generate Book Shelf Object
function generateBookShelfObject(id, title, author, year, isComplete) {
    return {
        id,
        title,
        author,
        year,
        isComplete
    }
}

// Fungsi Menampilkan Book Shelf 
function makeBookShelf(bookObject) {
    // Book Title
    const title = document.createElement('h3')
    title.innerText = bookObject.title

    // Book Author
    const author = document.createElement('p')
    author.innerText = bookObject.author

    // Book Year
    const year = document.createElement('p')
    year.innerText = bookObject.year

    // Button
    const doneBtn = document.createElement('button')
    const deleteBtn = document.createElement('button')

    doneBtn.classList.add('green')
    deleteBtn.classList.add('red')

    // Kondisi text doneBtn
    if (bookObject.isComplete)
        doneBtn.innerText = 'Belum selesai'
    else
        doneBtn.innerText = 'Selesai dibaca'

    deleteBtn.innerText = 'Hapus buku'

    // Button Event Listener
    doneBtn.addEventListener('click', function () {
        bookCompletedStatus(bookObject.id)
    })

    deleteBtn.addEventListener('click', function () {
        removeBook(bookObject.id)

    })

    // Button Container
    const btnContainer = document.createElement('div')
    btnContainer.classList.add('action')
    btnContainer.append(doneBtn, deleteBtn)

    // Container
    const container = document.createElement('article')
    container.classList.add('book_item')
    container.append(title, author, year, btnContainer)

    return container;
}

// Fungsi Completed Status
function bookCompletedStatus(bookId) {
    const bookTarget = findBook(bookId)

    if (bookTarget == null) return

    // Ubah status isCompleted
    bookTarget.isComplete = !bookTarget.isComplete;
    // Cek lokasi buku
    bookTarget.isComplete ? document.getElementById('completeBookshelfList') : document.getElementById('incompleteBookshelfList');

    document.dispatchEvent(new Event(RENDER_EVENT))
    
    saveData()
}

// Fungsi Find Book
function findBook(bookId) {
    for (const bookItem of books) {
        if (bookItem.id === bookId) {
            return bookItem;
        }
    }
    return null;
}

// Fungsi Menghapus Buku
function removeBook(bookId) {
    const bookTarget = findIndexBook(bookId)

    if (bookTarget === -1) return
    books.splice(bookTarget, 1)

    document.dispatchEvent(new Event(RENDER_EVENT))

    saveData()
}

// Fungsi Find Book by Index
function findIndexBook(bookId) {
    for (const index in books) {
        if (books[index].id === bookId) {
            return index
        }
    }

    return -1
}

// Fungsi isStorageExist
function isStorageExist() {
    if (typeof (Storage) === undefined) {
        alert('Browser yang sedang digunakan tidak mendukung local storage')
        return false
    }

    return true
}

// Fungsi Save Data
function saveData() {
    if (isStorageExist()) {
        const parsed = JSON.stringify(books) 
        localStorage.setItem(STORAGE_KEY, parsed)
        document.dispatchEvent(new Event(SAVED_EVENT))
    }
}

// Fungsi Pemulihan Local Storage
function localDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY)
    let data = JSON.parse(serializedData)

    if (data !== null) {
        for (const book of data) {
            books.push(book)
        }
    }

    document.dispatchEvent(new Event(RENDER_EVENT))
}