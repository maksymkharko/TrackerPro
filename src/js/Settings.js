class Settings {
    constructor() {
        this.exportButton = document.getElementById('exportButton');
        this.importButton = document.getElementById('importButton');
        this.exportModal = document.getElementById('exportModal');
        this.importModal = document.getElementById('importModal');
        this.exportData = document.getElementById('exportData');
        this.importData = document.getElementById('importData');
        this.copyExportData = document.getElementById('copyExportData');
        this.closeExportModal = document.getElementById('closeExportModal');
        this.closeImportModal = document.getElementById('closeImportModal');
        this.confirmImport = document.getElementById('confirmImport');

        this.setupEventListeners();
    }

    setupEventListeners() {
        this.exportButton.addEventListener('click', () => this.showExportModal());
        this.importButton.addEventListener('click', () => this.showImportModal());
        this.copyExportData.addEventListener('click', () => this.copyToClipboard());
        this.closeExportModal.addEventListener('click', () => this.hideExportModal());
        this.closeImportModal.addEventListener('click', () => this.hideImportModal());
        this.confirmImport.addEventListener('click', () => this.importDataFromText());

        // Закрытие модальных окон при клике вне их содержимого
        this.exportModal.addEventListener('click', (e) => {
            if (e.target === this.exportModal) this.hideExportModal();
        });
        this.importModal.addEventListener('click', (e) => {
            if (e.target === this.importModal) this.hideImportModal();
        });
    }

    showExportModal() {
        const exportData = {
            todos: JSON.parse(localStorage.getItem('todos') || '[]'),
            goals: JSON.parse(localStorage.getItem('goals') || '[]'),
            events: JSON.parse(localStorage.getItem('events') || '[]'),
            calendarius: JSON.parse(localStorage.getItem('calendarius') || '[]')
        };

        this.exportData.value = JSON.stringify(exportData, null, 2);
        this.exportModal.classList.add('active');
    }

    hideExportModal() {
        this.exportModal.classList.remove('active');
    }

    showImportModal() {
        this.importModal.classList.add('active');
    }

    hideImportModal() {
        this.importModal.classList.remove('active');
        this.importData.value = '';
    }

    async copyToClipboard() {
        try {
            await navigator.clipboard.writeText(this.exportData.value);
            this.copyExportData.innerHTML = '<i class="fas fa-check"></i> Скопировано';
            setTimeout(() => {
                this.copyExportData.innerHTML = '<i class="fas fa-copy"></i> Копировать';
            }, 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
            alert('Не удалось скопировать текст');
        }
    }

    importDataFromText() {
        try {
            const importedData = JSON.parse(this.importData.value);
            
            // Проверяем структуру данных
            if (!this.validateImportData(importedData)) {
                throw new Error('Неверный формат данных');
            }

            // Импортируем данные
            localStorage.setItem('todos', JSON.stringify(importedData.todos));
            localStorage.setItem('goals', JSON.stringify(importedData.goals));
            localStorage.setItem('events', JSON.stringify(importedData.events));
            localStorage.setItem('calendarius', JSON.stringify(importedData.calendarius));

            this.hideImportModal();
            alert('Данные успешно импортированы');
            location.reload(); // Перезагружаем страницу для применения изменений
        } catch (err) {
            console.error('Failed to import data: ', err);
            alert('Ошибка при импорте данных. Проверьте формат введенного текста.');
        }
    }

    validateImportData(data) {
        // Проверяем наличие всех необходимых массивов
        return Array.isArray(data.todos) &&
               Array.isArray(data.goals) &&
               Array.isArray(data.events) &&
               Array.isArray(data.calendarius);
    }
}

// Инициализация настроек
const settings = new Settings(); 