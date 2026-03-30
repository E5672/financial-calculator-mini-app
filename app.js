// Инициализация Telegram WebApp
if (window.Telegram && window.Telegram.WebApp) {
    Telegram.WebApp.expand();
}

// Получение элементов
const inputs = document.querySelectorAll('input[type="number"]');
const radios = document.querySelectorAll('input[type="radio"]');
const profitValue = document.getElementById('profit-value');
const incomeValue = document.getElementById('income-value');
const expenseValue = document.getElementById('expense-value');
const expenseRatioValue = document.getElementById('expense-ratio-value');
const profitCard = document.getElementById('profit-card');
const warning = document.getElementById('warning');

// Функция форматирования чисел
function formatNumber(num) {
    return num.toLocaleString('ru-RU');
}

// Функция расчёта
function calculate() {
    // Сбор доходов
    const salary = parseFloat(document.getElementById('salary').value) || 0;
    const freelance = parseFloat(document.getElementById('freelance').value) || 0;
    const passiveIncome = parseFloat(document.getElementById('passive_income').value) || 0;
    const otherIncome = parseFloat(document.getElementById('other_income').value) || 0;

    // Сбор расходов
    const rent = parseFloat(document.getElementById('rent').value) || 0;
    const food = parseFloat(document.getElementById('food').value) || 0;
    const transport = parseFloat(document.getElementById('transport').value) || 0;
    const marketing = parseFloat(document.getElementById('marketing').value) || 0;
    const otherExpenses = parseFloat(document.getElementById('other_expenses').value) || 0;

    // Расчёты
    const totalIncome = salary + freelance + passiveIncome + otherIncome;
    const totalExpenses = rent + food + transport + marketing + otherExpenses;
    let profit = totalIncome - totalExpenses;

    // Период
    const period = document.querySelector('input[name="period"]:checked').value;
    if (period === 'day') {
        profit = profit / 30;
    } else if (period === 'week') {
        profit = profit / 4;
    }
    // month: без изменений

    // Процент расходов
    let expenseRatio = 0;
    if (totalIncome > 0) {
        expenseRatio = (totalExpenses / totalIncome) * 100;
    }

    // Обновление DOM
    incomeValue.textContent = formatNumber(totalIncome);
    expenseValue.textContent = formatNumber(totalExpenses);
    profitValue.textContent = formatNumber(profit.toFixed(2));
    expenseRatioValue.textContent = expenseRatio.toFixed(1) + '%';

    // Цвет прибыли
    profitCard.classList.remove('positive', 'negative');
    if (profit > 0) {
        profitCard.classList.add('positive');
    } else if (profit < 0) {
        profitCard.classList.add('negative');
    }

    // Предупреждение
    if (totalExpenses > totalIncome) {
        warning.style.display = 'block';
    } else {
        warning.style.display = 'none';
    }
}

// Добавление слушателей событий
inputs.forEach(input => {
    input.addEventListener('input', calculate);
});

radios.forEach(radio => {
    radio.addEventListener('change', calculate);
});

// Начальный расчёт
calculate();