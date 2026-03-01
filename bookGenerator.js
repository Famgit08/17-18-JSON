// Массив возможных жанров книг для запроса к API
const SUBJECTS = [
    'fantasy',          // фэнтези
    'science_fiction',  // научная фантастика
    'romance',          // романтика
    'history',          // история
    'horror',           // ужасы
    'love'              // любовные романы
];

/**
 * Функция для получения случайного элемента из массива
 * @param {Array} arr - массив, из которого нужно выбрать случайный элемент
 * @returns {*} случайный элемент массива
 */
function randomItem(arr) {
    // Math.random() дает число от 0 до 1, умножаем на длину массива,
    // Math.floor округляет вниз, получаем случайный индекс
    return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Асинхронная функция для генерации книг через Open Library API
 * @param {number} count - количество книг для генерации (по умолчанию 10)
 * @returns {Promise<Array>} массив сгенерированных книг
 * @throws {Error} если не удалось получить книги после 5 попыток
 */
export async function generateBooks(count = 10){
    // Пытаемся получить книги максимум 5 раз
    for (let attempt = 0; attempt < 5; attempt++){
        // Выбираем случайный жанр из списка
        const subject = randomItem(SUBJECTS);
        
        // ИСПРАВЛЕНО: используем обратные кавычки ` для подстановки переменной subject
        const url = `https://openlibrary.org/subjects/${subject}.json?limit=50`;
        
        // Выполняем запрос к API
        const response = await fetch(url);
        
        // Если ответ неуспешный (например, 404 или 500), пробуем следующую попытку
        if (!response.ok) continue;
        
        // Парсим JSON ответ от сервера
        const data = await response.json();
        
        // Проверяем, что данные содержат массив works (книги)
        if (!data.works || !Array.isArray(data.works)) continue;

        // Преобразуем полученные данные в нужный нам формат
        const books = data.works
            // Фильтруем: оставляем только книги с названием и хотя бы одним автором
            .filter(book => book.title && book.authors?.length)
            // Берем только нужное количество книг
            .slice(0, count)
            // Преобразуем каждую книгу в нужный формат
            .map(book => ({
                id: crypto.randomUUID(),                    // генерируем уникальный ID
                title: book.title,                           // название книги
                author: book.authors.map(a => a.name).join(', '), // объединяем всех авторов через запятую
                genre: subject,                              // жанр (тот, который запрашивали)
                year: book.first_publish_year ?? null,       // год первой публикации
                rating: +(Math.random() * 2 + 3).toFixed(1)  // случайный рейтинг от 3.0 до 5.0
            }));

        // Если удалось получить хотя бы одну книгу, возвращаем массив
        if (books.length > 0) {
            return books;
        }
    }
    
    // Если после 5 попыток не удалось получить книги, выбрасываем ошибку
    throw new Error('Не удалось сгенерировать книги');
}
