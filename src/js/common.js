// Функция для обновления даты и времени
function updateDateTime() {
    const now = new Date();
    const timeElement = document.querySelector('.time');
    const dateElement = document.querySelector('.date');

    if (timeElement && dateElement) {
        // Форматирование времени (12:00)
        timeElement.textContent = now.toLocaleTimeString('ru-RU', { 
            hour: '2-digit', 
            minute: '2-digit'
        });

        // Форматирование даты (понедельник 9 марта 2025)
        const weekday = now.toLocaleString('ru-RU', { weekday: 'long' });
        const day = now.getDate();
        const month = now.toLocaleString('ru-RU', { month: 'long' });
        const year = now.getFullYear();
        dateElement.textContent = `${weekday} ${day} ${month} ${year}`;
    }
}

// Функция для обновления погоды
function updateWeather() {
    // Здесь будет код для получения погоды
    const temperature = '--'; // Заглушка
    const weatherElement = document.querySelector('.temperature');
    if (weatherElement) {
        weatherElement.textContent = `${temperature}°C`;
    }
}

// Инициализация страницы
function initPage() {
    // Немедленно пытаемся обновить время
    updateDateTime();
    // Устанавливаем интервал обновления
    setInterval(updateDateTime, 1000);
    // Запускаем обновление погоды
    updateWeather();
}

// Запускаем инициализацию при загрузке страницы
document.addEventListener('DOMContentLoaded', initPage); 