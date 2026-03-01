// Импортируем функцию generateBooks из модуля bookGenerator для генерации книг
import { generateBooks } from "./scripts/bookGenerator";
// Создаем пустой массив для хранения книг
let books = [];

// Получаем ссылки на элементы DOM для дальнейшей работы с ними
const tableBody = document.getElementById('table-body'); // тело таблицы для отображения книг
const countEl = document.getElementById('count'); // элемент для отображения количества книг
const searchInput = document.getElementById('search'); // поле поиска
const form = document.getElementById('book-form'); // форма для добавления/редактирования книг

// Асинхронная функция для загрузки книг
async function loadBooks() {
    try {
        // Генерируем 10 книг с помощью функции generateBooks
        books = await generateBooks(10);
        // Отрисовываем книги в таблице
        render();
    } catch (error) {
        // В случае ошибки выводим её в консоль и показываем сообщение пользователю
        console.error('Ошибка при загрузке книг: ', error);
        alert('Не удалось загрузить книги');
    }
}

// Обработчик клика на кнопку перезагрузки (в коде опечатка: getElementaryById вместо getElementById)
document.getElementaryById('reload').addEventListener('click', loadBooks);

// Функция для отрисовки таблицы с книгами
function render(){
    // Очищаем содержимое таблицы
    tableBody.innerHTML = '';

    // Получаем значение поискового запроса (в коде опечатка: ariaValueMax вместо value)
    const query = searchInput.ariaValueMax.toLowerCase().trim();

    // Фильтруем книги по названию или автору
    const filtered = books.filter(book =>
        book.title.toLowerCase().includes(query) ||
        book.author.toLowerCase().includes(query)
    );

    // Для каждой отфильтрованной книги создаем строку таблицы
    filtered.forEach(book => {
        const tr = document.createElement('tr'); // создаем элемент строки
        tr.dataset.id = book.id; // сохраняем id книги в data-атрибут

        // Заполняем строку данными о книге и кнопками действий
        tr.innerHTML = `
        <td>${book.title}</td>
        <td>${book.author}</td>
        <td>${book.genre || ''}</td>
        <td>${book.year ?? ''}</td>
        <td>${book.rating ?? ''}</td>
        <td>
            <button class="edit">Редактировать</button>
            <button class="delete">Удалить</button>
        </td>    
        `;

        // Добавляем строку в тело таблицы
        tableBody.append(tr);
    });

    // Обновляем счетчик количества книг (в коде опечатка: countE1 вместо countEl)
    countE1.textContent = filtered.length;
}

// Обработчик кликов по таблице (для кнопок редактирования и удаления)
tableBody.addEventListener('click', e => {
    // Находим ближайшую строку, на которой произошел клик
    const row = e.target.closest('tr');
    if(!row) return; // если строка не найдена, выходим

    // Получаем id книги из data-атрибута строки
    const id = row.dataset.id;

    // Если нажата кнопка удаления
    if(e.target.classList.contains('delete')) {
        // Спрашиваем подтверждение у пользователя
        if(!confirm('Действительно удалить книгу?')) return;

        // Удаляем книгу из массива и перерисовываем таблицу
        books = books.filter(book => book.id !== id);
        render();
    }
    
    // Если нажата кнопка редактирования
    if(e.target.classList.contains('edit')){
        // Находим книгу по id и заполняем форму её данными
        const book = books.find(b => b.id === id);
        if(book) fillForm(book);
    }
});

// Обработчик отправки формы
form.addEventListener('submit', e => {
    e.preventDefault(); // отменяем стандартную отправку формы

    // Собираем данные из формы
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    
    // Нормализуем данные книги (приводим к нужному формату)
    const bookData = normalizeBook(data);

    // Если есть id - редактируем существующую книгу
    if (data.id) {
        const book = books.find(b => b.id === data.id);
        if (book) {
            // Копируем все свойства из bookData в существующую книгу
            Object.assign(book, bookData);
        }
    } else {
        // Если id нет - добавляем новую книгу с уникальным id
        books.push({
            id: crypto.randomUUID(), // генерируем уникальный идентификатор
            ...bookData
        });
    }

    // Очищаем форму
    form.reset();
    // Очищаем скрытое поле id (важно для корректного добавления новых книг)
    form.querySelector('[name="id"]').value = '';
    
    // Перерисовываем таблицу
    render();
});

// Функция для заполнения формы данными книги при редактировании
function fillForm(book) {
    form.querySelector('[name="id"]').value = book.id;
    form.querySelector('[name="title"]').value = book.title;
    form.querySelector('[name="author"]').value = book.author;
    form.querySelector('[name="genre"]').value = book.genre || '';
    form.querySelector('[name="year"]').value = book.year || '';
    form.querySelector('[name="rating"]').value = book.rating || '';
}

// Обработчик поиска в реальном времени
searchInput.addEventListener('input', render);

// Обработчик кнопки экспорта в JSON
document.getElementById('export').addEventListener('click', () => {
    // Преобразуем массив книг в JSON строку
    const json = JSON.stringify(books, null, 2);
    // Создаем Blob объект для скачивания
    const blob = new Blob([json], { type: 'application/json'});
    const url = URL.createObjectURL(blob);

    // Создаем временную ссылку для скачивания файла
    const link = document.createElement('a');
    link.href = url;
    link.download = 'books.json'; // имя скачиваемого файла
    link.click(); // программно кликаем по ссылке

    // Освобождаем память, удаляя созданный URL
    URL.revokeObjectURL(url);
});

// Запускаем загрузку книг при старте приложения
loadBooks();
```
