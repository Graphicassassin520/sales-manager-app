// Task Manager
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function addTask(description, dueDate, priority) {
    const task = {
        id: Date.now(),
        description,
        dueDate,
        priority,
        status: 'to do'
    };
    tasks.push(task);
    saveTasks();
    renderTasks();
    checkReminders();
}

function renderTasks() {
    const toDoTasks = document.querySelector('#to-do .tasks');
    const inProgressTasks = document.querySelector('#in-progress .tasks');
    const completedTasks = document.querySelector('#completed .tasks');
    toDoTasks.innerHTML = '';
    inProgressTasks.innerHTML = '';
    completedTasks.innerHTML = '';
    tasks.forEach(task => {
        const taskCard = document.createElement('div');
        taskCard.className = 'task-card';
        taskCard.draggable = true;
        taskCard.textContent = task.description;
        taskCard.dataset.id = task.id;
        taskCard.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', task.id);
        });
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.onclick = () => {
            tasks = tasks.filter(t => t.id != task.id);
            saveTasks();
            renderTasks();
        };
        taskCard.appendChild(deleteBtn);
        if (task.status === 'to do') {
            toDoTasks.appendChild(taskCard);
        } else if (task.status === 'in progress') {
            inProgressTasks.appendChild(taskCard);
        } else if (task.status === 'completed') {
            completedTasks.appendChild(taskCard);
        }
    });
    document.querySelectorAll('.column').forEach(column => {
        column.addEventListener('dragover', (e) => {
            e.preventDefault();
        });
        column.addEventListener('drop', (e) => {
            e.preventDefault();
            const taskId = e.dataTransfer.getData('text/plain');
            const task = tasks.find(t => t.id == taskId);
            if (task) {
                const newStatus = column.id.replace('-', ' ');
                task.status = newStatus;
                saveTasks();
                renderTasks();
            }
        });
    });
    updateDashboard();
}

// Sales Tracker
let sales = JSON.parse(localStorage.getItem('sales')) || [];

function saveSales() {
    localStorage.setItem('sales', JSON.stringify(sales));
}

function addSale(clientName, amount, date) {
    const sale = {
        id: Date.now(),
        clientName,
        amount,
        date
    };
    sales.push(sale);
    saveSales();
    renderSales();
    const followUpDate = getFutureDate(7);
    addTask(`Follow up with ${clientName}`, followUpDate, 'medium');
}

function renderSales() {
    const saleList = document.getElementById('saleList');
    saleList.innerHTML = '';
    sales.forEach(sale => {
        const li = document.createElement('li');
        li.textContent = `${sale.clientName} - Amount: $${sale.amount} - Date: ${sale.date}`;
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.onclick = () => {
            sales = sales.filter(s => s.id != sale.id);
            saveSales();
            renderSales();
        };
        li.appendChild(deleteBtn);
        saleList.appendChild(li);
    });
    updateDashboard();
}

// Dashboard Updates
let salesChart, taskChart;

function getTodayDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function getFutureDate(days) {
    const date = new Date();
    date.setDate(date.getDate() + days);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function getPastWeekDates() {
    const dates = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        dates.push(`${year}-${month}-${day}`);
    }
    return dates;
}

function getSalesData() {
    const dates = getPastWeekDates();
    const salesData = dates.map(date => {
        const dailySales = sales.filter(sale => sale.date === date)
            .reduce((total, sale) => total + parseFloat(sale.amount), 0);
        return dailySales;
    });
    return { dates, salesData };
}

function getTaskData() {
    const statuses = ['to do', 'in progress', 'completed'];
    const counts = statuses.map(status => tasks.filter(task => task.status === status).length);
    return { statuses, counts };
}

function updateDashboard() {
    const today = getTodayDate();
    const todaySales = sales.filter(sale => sale.date === today)
        .reduce((total, sale) => total + parseFloat(sale.amount), 0);
    const pendingTasksCount = tasks.filter(task => task.status !== 'completed').length;
    document.getElementById('todaySales').textContent = `$${todaySales.toFixed(2)}`;
    document.getElementById('pendingTasks').textContent = pendingTasksCount;

    const { dates, salesData } = getSalesData();
    salesChart.data.labels = dates;
    salesChart.data.datasets[0].data = salesData;
    salesChart.update();

    const { statuses, counts } = getTaskData();
    taskChart.data.labels = statuses;
    taskChart.data.datasets[0].data = counts;
    taskChart.update();
}

// Reminders
function checkReminders() {
    const today = getTodayDate();
    const overdueTasks = tasks.filter(task => task.dueDate < today && task.status !== 'completed');
    const todayTasks = tasks.filter(task => task.dueDate === today && task.status !== 'completed');
    const notifications = document.getElementById('notifications');
    notifications.innerHTML = '';
    if (overdueTasks.length > 0) {
        const p = document.createElement('p');
        p.textContent = `You have ${overdueTasks.length} overdue tasks!`;
        notifications.appendChild(p);
    }
    if (todayTasks.length > 0) {
        const p = document.createElement('p');
        p.textContent = `You have ${todayTasks.length} tasks due today.`;
        notifications.appendChild(p);
    }
}

// Navigation
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
}

document.querySelectorAll('nav a').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const sectionId = link.getAttribute('href').substring(1);
        showSection(sectionId);
    });
});

window.addEventListener('hashchange', () => {
    const sectionId = window.location.hash.substring(1) || 'dashboard';
    showSection(sectionId);
});

// Form Handlers
document.getElementById('taskForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const description = document.getElementById('taskDesc').value;
    const dueDate = document.getElementById('taskDue').value;
    const priority = document.getElementById('taskPriority').value;
    addTask(description, dueDate, priority);
    document.getElementById('taskForm').reset();
});

document.getElementById('saleForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const clientName = document.getElementById('clientName').value;
    const amount = document.getElementById('saleAmount').value;
    const date = document.getElementById('saleDate').value;
    addSale(clientName, amount, date);
    document.getElementById('saleForm').reset();
});

// Initial Setup
const initialSection = window.location.hash.substring(1) || 'dashboard';
showSection(initialSection);
renderTasks();
renderSales();
checkReminders();

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js');
}

const ctx = document.getElementById('salesChart').getContext('2d');
salesChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Sales',
            data: [],
            borderColor: 'blue',
            fill: false
        }]
    },
    options: {
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});

const taskCtx = document.getElementById('taskChart').getContext('2d');
taskChart = new Chart(taskCtx, {
    type: 'pie',
    data: {
        labels: [],
        datasets: [{
            data: [],
            backgroundColor: ['#ff6384', '#36a2eb', '#ffce56']
        }]
    }
});
