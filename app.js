/* ===================================
PREMIUM LIFE OS APPLICATION
Enterprise-grade state management
=================================== */

// ===== STATE MANAGEMENT =====

const LifeOS = {
version: ‘1.0.0’,
currentViewer: ‘me’,
currentPage: ‘command’,
currentTaskView: ‘all’,
currentTaskFilters: {
priority: ‘all’,
assignee: ‘all’
},
editingTaskId: null,
selectedNoteId: null,

```
data: {
    tasks: [],
    budget: {
        transactions: [],
        categories: ['Food', 'Transport', 'Utilities', 'Entertainment', 'Healthcare', 'Other']
    },
    calendar: {
        events: [],
        currentMonth: new Date().getMonth(),
        currentYear: new Date().getFullYear()
    },
    health: {
        logs: [],
        goals: {}
    },
    notes: [],
    meals: {
        plan: {},
        recipes: []
    }
}
```

};

// ===== LOCAL STORAGE =====

const Storage = {
keys: {
TASKS: ‘life_os_tasks’,
BUDGET: ‘life_os_budget’,
CALENDAR: ‘life_os_calendar’,
HEALTH: ‘life_os_health’,
NOTES: ‘life_os_notes’,
MEALS: ‘life_os_meals’,
VIEWER: ‘life_os_viewer’
},

```
save(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (e) {
        console.error('Storage save failed:', e);
        return false;
    }
},

load(key, defaultValue = null) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
    } catch (e) {
        console.error('Storage load failed:', e);
        return defaultValue;
    }
},

saveAll() {
    this.save(this.keys.TASKS, LifeOS.data.tasks);
    this.save(this.keys.BUDGET, LifeOS.data.budget);
    this.save(this.keys.CALENDAR, LifeOS.data.calendar);
    this.save(this.keys.HEALTH, LifeOS.data.health);
    this.save(this.keys.NOTES, LifeOS.data.notes);
    this.save(this.keys.MEALS, LifeOS.data.meals);
    this.save(this.keys.VIEWER, LifeOS.currentViewer);
},

loadAll() {
    LifeOS.data.tasks = this.load(this.keys.TASKS, []);
    LifeOS.data.budget = this.load(this.keys.BUDGET, LifeOS.data.budget);
    LifeOS.data.calendar = this.load(this.keys.CALENDAR, LifeOS.data.calendar);
    LifeOS.data.health = this.load(this.keys.HEALTH, LifeOS.data.health);
    LifeOS.data.notes = this.load(this.keys.NOTES, []);
    LifeOS.data.meals = this.load(this.keys.MEALS, LifeOS.data.meals);
    LifeOS.currentViewer = this.load(this.keys.VIEWER, 'me');
}
```

};

// ===== NAVIGATION =====

function initNavigation() {
document.querySelectorAll(’.nav-item’).forEach(link => {
link.addEventListener(‘click’, (e) => {
e.preventDefault();
const page = link.dataset.page;
navigateTo(page);
});
});
}

function navigateTo(page) {
LifeOS.currentPage = page;

```
// Update nav
document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.page === page);
});

// Update pages
document.querySelectorAll('.page').forEach(p => {
    p.classList.remove('active');
});
document.getElementById(`${page}-page`).classList.add('active');

// Page-specific rendering
switch(page) {
    case 'command':
        renderDashboard();
        break;
    case 'calendar':
        renderCalendar();
        break;
    case 'tasks':
        renderTasksPage();
        break;
    case 'budget':
        renderBudgetPage();
        break;
    case 'health':
        renderHealthPage();
        break;
    case 'notes':
        renderNotesPage();
        break;
    case 'meals':
        renderMealsPage();
        break;
}
```

}

// ===== DASHBOARD =====

function renderDashboard() {
updateCurrentDate();
updateStats();
renderTodayFocus();
renderQuickTasks();
renderBudgetSnapshot();
renderWeekOverview();
renderTodayMeals();
}

function updateCurrentDate() {
const dateEl = document.getElementById(‘current-date’);
if (dateEl) {
const now = new Date();
dateEl.textContent = now.toLocaleDateString(‘en-US’, {
weekday: ‘long’,
year: ‘numeric’,
month: ‘long’,
day: ‘numeric’
});
}
}

function updateStats() {
// Tasks stat
const activeTasks = LifeOS.data.tasks.filter(t => !t.completed).length;
const tasksEl = document.getElementById(‘stat-tasks’);
if (tasksEl) tasksEl.textContent = activeTasks;

```
// Budget stat
const budgetTotal = calculateBudgetTotals();
const budgetEl = document.getElementById('stat-budget');
if (budgetEl) budgetEl.textContent = formatCurrency(budgetTotal.remaining);

// Health stat (placeholder)
const healthEl = document.getElementById('stat-health');
if (healthEl) healthEl.textContent = '—';

// Meals stat
const mealCount = Object.values(LifeOS.data.meals.plan).reduce((sum, day) => {
    return sum + Object.keys(day).length;
}, 0);
const mealsEl = document.getElementById('stat-meals');
if (mealsEl) mealsEl.textContent = mealCount;
```

}

function renderTodayFocus() {
const container = document.getElementById(‘today-focus’);
if (!container) return;

```
const today = new Date();
today.setHours(0, 0, 0, 0);

const todayTasks = LifeOS.data.tasks.filter(t => {
    if (t.completed) return false;
    const taskDate = new Date(t.dueDate);
    taskDate.setHours(0, 0, 0, 0);
    return taskDate.getTime() === today.getTime();
});

const highPriorityTask = todayTasks.find(t => t.priority === 'critical' || t.priority === 'high');

if (highPriorityTask) {
    container.innerHTML = `
        <div style="text-align: center; padding: var(--space-8) 0;">
            <div class="priority-badge priority-${highPriorityTask.priority}" style="display: inline-block; margin-bottom: var(--space-4);">
                ${highPriorityTask.priority}
            </div>
            <h3 style="font-family: var(--font-display); font-size: 1.75rem; margin-bottom: var(--space-2); color: var(--gold);">
                ${highPriorityTask.name}
            </h3>
            <p style="color: var(--text-secondary);">${highPriorityTask.category || 'Uncategorized'}</p>
        </div>
    `;
} else {
    container.innerHTML = `
        <div class="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
            </svg>
            <p>Set your top priority for today</p>
        </div>
    `;
}
```

}

function renderQuickTasks() {
const container = document.getElementById(‘quick-tasks’);
if (!container) return;

```
const now = new Date();
const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

const dueSoon = LifeOS.data.tasks
    .filter(t => !t.completed && new Date(t.dueDate) <= weekFromNow)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 5);

if (dueSoon.length === 0) {
    container.innerHTML = '<p class="empty-state-inline">No upcoming tasks</p>';
    return;
}

container.innerHTML = dueSoon.map(task => {
    const dueDate = new Date(task.dueDate);
    const isOverdue = dueDate < now;
    
    return `
        <div class="task-item-compact">
            <input type="checkbox" class="task-checkbox" onchange="toggleTaskComplete(${task.id})">
            <div class="task-info">
                <div class="task-title">${task.name}</div>
                <div class="task-meta">
                    <span class="priority-badge priority-${task.priority}">${task.priority}</span>
                    <span style="color: ${isOverdue ? 'var(--ruby)' : 'var(--text-tertiary)'}">
                        ${formatDate(dueDate)}
                    </span>
                </div>
            </div>
        </div>
    `;
}).join('');
```

}

function renderBudgetSnapshot() {
const totals = calculateBudgetTotals();
const percentSpent = totals.income > 0 ? (totals.expenses / totals.income) * 100 : 0;

```
// Update ring
const ring = document.getElementById('budget-ring');
if (ring) {
    const circumference = 251.2;
    const offset = circumference - (percentSpent / 100) * circumference;
    ring.style.strokeDashoffset = offset;
}

// Update percentage
const percentEl = document.getElementById('budget-percent');
if (percentEl) percentEl.textContent = `${Math.round(percentSpent)}%`;

// Update details
const details = document.getElementById('budget-snapshot-details');
if (details) {
    details.innerHTML = `
        <div class="budget-row">
            <span class="budget-row-label">Income</span>
            <span class="budget-row-value">${formatCurrency(totals.income)}</span>
        </div>
        <div class="budget-row">
            <span class="budget-row-label">Spent</span>
            <span class="budget-row-value">${formatCurrency(totals.expenses)}</span>
        </div>
        <div class="budget-row">
            <span class="budget-row-label">Remaining</span>
            <span class="budget-row-value" style="color: var(--gold);">${formatCurrency(totals.remaining)}</span>
        </div>
    `;
}
```

}

function renderWeekOverview() {
const container = document.getElementById(‘week-overview’);
if (!container) return;

```
const today = new Date();
const startOfWeek = new Date(today);
startOfWeek.setDate(today.getDate() - today.getDay());

let html = '';
for (let i = 0; i < 7; i++) {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);
    
    const isToday = day.toDateString() === today.toDateString();
    const dayTasks = LifeOS.data.tasks.filter(t => {
        const taskDate = new Date(t.dueDate);
        return taskDate.toDateString() === day.toDateString() && !t.completed;
    });
    
    html += `
        <div class="day-cell ${isToday ? 'today' : ''}">
            <div class="day-name">${day.toLocaleDateString('en-US', { weekday: 'short' })}</div>
            <div class="day-number">${day.getDate()}</div>
            ${dayTasks.length > 0 ? `<div class="day-events">${dayTasks.length} tasks</div>` : ''}
        </div>
    `;
}

container.innerHTML = html;
```

}

function renderTodayMeals() {
const container = document.getElementById(‘today-meals’);
if (!container) return;

```
const today = new Date().toLocaleDateString('en-US', { weekday: 'lowercase' });
const todayMeals = LifeOS.data.meals.plan[today] || {};

const mealTypes = ['breakfast', 'lunch', 'dinner'];
const meals = mealTypes.filter(type => todayMeals[type]);

if (meals.length === 0) {
    container.innerHTML = '<p class="empty-state-inline">No meals planned</p>';
    return;
}

container.innerHTML = meals.map(type => `
    <div style="margin-bottom: var(--space-2);">
        <strong style="text-transform: capitalize; color: var(--text-primary);">${type}:</strong>
        <span style="color: var(--text-secondary);"> ${todayMeals[type]}</span>
    </div>
`).join('');
```

}

function refreshDashboard() {
renderDashboard();
showToast(‘Dashboard refreshed’);
}

// ===== TASKS =====

function renderTasksPage() {
const container = document.getElementById(‘tasks-container’);
if (!container) return;

```
let tasks = filterTasks();

if (tasks.length === 0) {
    container.innerHTML = `
        <div class="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 11 12 14 22 4"/>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
            </svg>
            <p>No tasks found</p>
        </div>
    `;
    return;
}

container.innerHTML = tasks.map(task => {
    const dueDate = new Date(task.dueDate);
    return `
        <div class="task-item ${task.completed ? 'completed' : ''}">
            <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} 
                   onchange="toggleTaskComplete(${task.id})">
            <div class="task-details">
                <div class="task-title">${task.name}</div>
                <div class="task-meta">
                    <span class="priority-badge priority-${task.priority}">${task.priority}</span>
                    <span>${formatDate(dueDate)}</span>
                    <span>${task.category || 'Uncategorized'}</span>
                    <span>${task.assignee}</span>
                </div>
                ${task.notes ? `<p style="color: var(--text-tertiary); font-size: 0.875rem; margin-top: var(--space-2);">${task.notes}</p>` : ''}
            </div>
            <div class="task-actions">
                <button class="task-action" onclick="editTask(${task.id})" title="Edit">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                        <path d="M12 20h9"/>
                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                    </svg>
                </button>
                <button class="task-action" onclick="deleteTask(${task.id})" title="Delete">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                </button>
            </div>
        </div>
    `;
}).join('');
```

}

function filterTasks() {
let tasks = […LifeOS.data.tasks];
const view = LifeOS.currentTaskView;
const today = new Date();
today.setHours(0, 0, 0, 0);

```
// Filter by view
switch(view) {
    case 'today':
        tasks = tasks.filter(t => {
            const taskDate = new Date(t.dueDate);
            taskDate.setHours(0, 0, 0, 0);
            return taskDate.getTime() === today.getTime() && !t.completed;
        });
        break;
    case 'upcoming':
        tasks = tasks.filter(t => {
            const taskDate = new Date(t.dueDate);
            return taskDate > today && !t.completed;
        });
        break;
    case 'completed':
        tasks = tasks.filter(t => t.completed);
        break;
    default: // all
        tasks = tasks.filter(t => !t.completed);
}

// Filter by priority
if (LifeOS.currentTaskFilters.priority !== 'all') {
    tasks = tasks.filter(t => t.priority === LifeOS.currentTaskFilters.priority);
}

// Filter by assignee
if (LifeOS.currentTaskFilters.assignee !== 'all') {
    tasks = tasks.filter(t => t.assignee === LifeOS.currentTaskFilters.assignee);
}

// Sort by due date
tasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

return tasks;
```

}

function changeTaskView(view) {
LifeOS.currentTaskView = view;
document.querySelectorAll(’.view-btn’).forEach(btn => {
btn.classList.toggle(‘active’, btn.dataset.view === view);
});
renderTasksPage();
}

function filterTasksByPriority(priority) {
LifeOS.currentTaskFilters.priority = priority;
renderTasksPage();
}

function filterTasksByAssignee(assignee) {
LifeOS.currentTaskFilters.assignee = assignee;
renderTasksPage();
}

function openTaskModal(task = null) {
LifeOS.editingTaskId = task ? task.id : null;

```
const modal = document.getElementById('task-modal');
const title = document.getElementById('task-modal-title');

if (task) {
    title.textContent = 'Edit Task';
    document.getElementById('task-name-input').value = task.name;
    document.getElementById('task-date-input').value = task.dueDate;
    document.getElementById('task-priority-input').value = task.priority;
    document.getElementById('task-category-input').value = task.category || '';
    document.getElementById('task-assignee-input').value = task.assignee;
    document.getElementById('task-notes-input').value = task.notes || '';
} else {
    title.textContent = 'New Task';
    document.getElementById('task-name-input').value = '';
    document.getElementById('task-date-input').value = '';
    document.getElementById('task-priority-input').value = 'medium';
    document.getElementById('task-category-input').value = '';
    document.getElementById('task-assignee-input').value = 'me';
    document.getElementById('task-notes-input').value = '';
}

openModal('task-modal');
```

}

function openQuickTask() {
openTaskModal();
}

function saveTask() {
const name = document.getElementById(‘task-name-input’).value.trim();
const dueDate = document.getElementById(‘task-date-input’).value;
const priority = document.getElementById(‘task-priority-input’).value;
const category = document.getElementById(‘task-category-input’).value.trim();
const assignee = document.getElementById(‘task-assignee-input’).value;
const notes = document.getElementById(‘task-notes-input’).value.trim();

```
if (!name || !dueDate) {
    showToast('Please fill in task name and due date', 'error');
    return;
}

if (LifeOS.editingTaskId) {
    const task = LifeOS.data.tasks.find(t => t.id === LifeOS.editingTaskId);
    if (task) {
        task.name = name;
        task.dueDate = dueDate;
        task.priority = priority;
        task.category = category;
        task.assignee = assignee;
        task.notes = notes;
    }
} else {
    LifeOS.data.tasks.push({
        id: Date.now(),
        name,
        dueDate,
        priority,
        category,
        assignee,
        notes,
        completed: false,
        createdAt: new Date().toISOString()
    });
}

Storage.saveAll();
closeModal('task-modal');
renderTasksPage();
renderDashboard();
showToast('Task saved successfully');
```

}

function editTask(id) {
const task = LifeOS.data.tasks.find(t => t.id === id);
if (task) openTaskModal(task);
}

function deleteTask(id) {
if (confirm(‘Are you sure you want to delete this task?’)) {
LifeOS.data.tasks = LifeOS.data.tasks.filter(t => t.id !== id);
Storage.saveAll();
renderTasksPage();
renderDashboard();
showToast(‘Task deleted’);
}
}

function toggleTaskComplete(id) {
const task = LifeOS.data.tasks.find(t => t.id === id);
if (task) {
task.completed = !task.completed;
Storage.saveAll();
renderTasksPage();
renderDashboard();
}
}

// ===== BUDGET =====

function renderBudgetPage() {
updateBudgetSummary();
renderCategoryBreakdown();
renderSavingsRate();
renderTransactions();
}

function updateBudgetSummary() {
const totals = calculateBudgetTotals();

```
const incomeEl = document.getElementById('total-income');
const expensesEl = document.getElementById('total-expenses');
const balanceEl = document.getElementById('net-balance');

if (incomeEl) incomeEl.textContent = formatCurrency(totals.income);
if (expensesEl) expensesEl.textContent = formatCurrency(totals.expenses);
if (balanceEl) {
    balanceEl.textContent = formatCurrency(totals.remaining);
    balanceEl.style.color = totals.remaining >= 0 ? 'var(--emerald)' : 'var(--ruby)';
}
```

}

function calculateBudgetTotals() {
const now = new Date();
const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

```
const monthTransactions = LifeOS.data.budget.transactions.filter(t => {
    const tDate = new Date(t.date);
    return tDate >= firstDay && tDate <= lastDay;
});

const income = monthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

const expenses = monthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

return {
    income,
    expenses,
    remaining: income - expenses
};
```

}

function renderCategoryBreakdown() {
const container = document.getElementById(‘category-breakdown’);
if (!container) return;

```
const now = new Date();
const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

const expenses = LifeOS.data.budget.transactions.filter(t => {
    const tDate = new Date(t.date);
    return t.type === 'expense' && tDate >= firstDay && tDate <= lastDay;
});

const byCategory = {};
expenses.forEach(t => {
    byCategory[t.category] = (byCategory[t.category] || 0) + t.amount;
});

const sorted = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);

if (sorted.length === 0) {
    container.innerHTML = '<p class="empty-state-inline">No expenses this month</p>';
    return;
}

container.innerHTML = sorted.slice(0, 5).map(([category, amount]) => `
    <div class="category-item">
        <span class="category-name">${category}</span>
        <span class="category-amount">${formatCurrency(amount)}</span>
    </div>
`).join('');
```

}

function renderSavingsRate() {
const totals = calculateBudgetTotals();
const savingsRate = totals.income > 0 ? ((totals.remaining / totals.income) * 100) : 0;

```
const fill = document.getElementById('savings-fill');
const percent = document.getElementById('savings-percentage');

if (fill) fill.style.width = `${Math.max(0, savingsRate)}%`;
if (percent) percent.textContent = `${Math.round(savingsRate)}%`;
```

}

function renderTransactions() {
const container = document.getElementById(‘transactions-list’);
if (!container) return;

```
const transactions = [...LifeOS.data.budget.transactions]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 20);

if (transactions.length === 0) {
    container.innerHTML = '<p class="empty-state-inline">No transactions yet</p>';
    return;
}

container.innerHTML = transactions.map(t => {
    const date = new Date(t.date);
    return `
        <div class="transaction-item">
            <div class="transaction-info">
                <div class="transaction-name">${t.description}</div>
                <div class="transaction-meta">${t.category} • ${formatDate(date)}</div>
            </div>
            <div class="transaction-amount ${t.type}">
                ${t.type === 'income' ? '+' : '-'}${formatCurrency(t.amount)}
            </div>
        </div>
    `;
}).join('');
```

}

function openTransactionModal() {
const description = prompt(‘Transaction description:’);
if (!description) return;

```
const amount = parseFloat(prompt('Amount:'));
if (isNaN(amount) || amount <= 0) return;

const type = confirm('Is this income? (Cancel for expense)') ? 'income' : 'expense';
const category = type === 'expense' ? 
    prompt('Category:', LifeOS.data.budget.categories[0]) : 
    'Income';

LifeOS.data.budget.transactions.push({
    id: Date.now(),
    description,
    amount,
    type,
    category,
    date: new Date().toISOString()
});

Storage.saveAll();
renderBudgetPage();
renderDashboard();
showToast('Transaction added');
```

}

function filterTransactions(filter) {
// Implementation for filtering transactions
renderTransactions();
}

function exportBudgetData() {
const data = JSON.stringify(LifeOS.data.budget, null, 2);
const blob = new Blob([data], { type: ‘application/json’ });
const url = URL.createObjectURL(blob);
const a = document.createElement(‘a’);
a.href = url;
a.download = `budget-export-${new Date().toISOString().split('T')[0]}.json`;
a.click();
URL.revokeObjectURL(url);
showToast(‘Budget data exported’);
}

// ===== CALENDAR =====

function renderCalendar() {
renderCalendarGrid();
}

function renderCalendarGrid() {
const grid = document.getElementById(‘calendar-grid’);
const monthYear = document.getElementById(‘calendar-month-year’);
if (!grid || !monthYear) return;

```
const { currentMonth, currentYear } = LifeOS.data.calendar;
const firstDay = new Date(currentYear, currentMonth, 1);
const lastDay = new Date(currentYear, currentMonth + 1, 0);
const startDay = firstDay.getDay();
const daysInMonth = lastDay.getDate();

monthYear.textContent = firstDay.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

let html = '';

// Day headers
['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].forEach(day => {
    html += `<div style="padding: var(--space-2); text-align: center; color: var(--text-tertiary); font-weight: 600; font-size: 0.875rem;">${day}</div>`;
});

// Empty cells before first day
for (let i = 0; i < startDay; i++) {
    html += '<div></div>';
}

// Days
for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentYear, currentMonth, day);
    const isToday = date.toDateString() === new Date().toDateString();
    
    html += `
        <div class="day-cell ${isToday ? 'today' : ''}" onclick="selectCalendarDay(${day})">
            <div class="day-number">${day}</div>
        </div>
    `;
}

grid.innerHTML = html;
```

}

function changeMonth(delta) {
LifeOS.data.calendar.currentMonth += delta;

```
if (LifeOS.data.calendar.currentMonth > 11) {
    LifeOS.data.calendar.currentMonth = 0;
    LifeOS.data.calendar.currentYear++;
} else if (LifeOS.data.calendar.currentMonth < 0) {
    LifeOS.data.calendar.currentMonth = 11;
    LifeOS.data.calendar.currentYear--;
}

Storage.saveAll();
renderCalendarGrid();
```

}

function selectCalendarDay(day) {
// Handle day selection
showToast(`Selected: ${LifeOS.data.calendar.currentMonth + 1}/${day}/${LifeOS.data.calendar.currentYear}`);
}

function openEventModal() {
showToast(‘Event creation coming soon’);
}

function filterCalendar(type) {
// Implementation for calendar filtering
}

// ===== HEALTH =====

function renderHealthPage() {
renderHealthMetrics();
}

function renderHealthMetrics() {
// Placeholder implementation
const stepsEl = document.getElementById(‘steps-today’);
const waterEl = document.getElementById(‘water-today’);
const sleepEl = document.getElementById(‘sleep-today’);

```
if (stepsEl) stepsEl.textContent = '0';
if (waterEl) waterEl.textContent = '0';
if (sleepEl) sleepEl.textContent = '0h';
```

}

function logHealthData() {
showToast(‘Health logging coming soon’);
}

function saveJournalEntry() {
const journal = document.getElementById(‘wellness-journal’);
if (!journal) return;

```
const entry = journal.value.trim();
if (!entry) return;

LifeOS.data.health.logs.push({
    id: Date.now(),
    entry,
    date: new Date().toISOString()
});

Storage.saveAll();
journal.value = '';
showToast('Journal entry saved');
```

}

// ===== NOTES =====

function renderNotesPage() {
renderNotesList();
}

function renderNotesList() {
const list = document.getElementById(‘notes-list’);
if (!list) return;

```
if (LifeOS.data.notes.length === 0) {
    list.innerHTML = '<p class="empty-state-inline">No notes yet</p>';
    return;
}

list.innerHTML = LifeOS.data.notes.map(note => `
    <div class="note-item ${note.id === LifeOS.selectedNoteId ? 'active' : ''}" 
         onclick="selectNote(${note.id})">
        <div class="note-title">${note.title}</div>
        <div class="note-preview">${note.content.substring(0, 100)}...</div>
    </div>
`).join('');
```

}

function createNote() {
const title = prompt(‘Note title:’);
if (!title) return;

```
const note = {
    id: Date.now(),
    title,
    content: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
};

LifeOS.data.notes.unshift(note);
LifeOS.selectedNoteId = note.id;

Storage.saveAll();
renderNotesList();
selectNote(note.id);
```

}

function selectNote(id) {
LifeOS.selectedNoteId = id;
const note = LifeOS.data.notes.find(n => n.id === id);
if (!note) return;

```
const editor = document.getElementById('notes-editor');
if (editor) {
    editor.innerHTML = `
        <div style="margin-bottom: var(--space-6);">
            <h2 style="font-family: var(--font-display); font-size: 2rem; margin-bottom: var(--space-2);">
                ${note.title}
            </h2>
            <p style="color: var(--text-tertiary); font-size: 0.875rem;">
                Last edited: ${formatDate(new Date(note.updatedAt))}
            </p>
        </div>
        <textarea class="wellness-journal" style="min-height: 400px;" 
                  placeholder="Start writing..." 
                  onchange="updateNoteContent(${note.id}, this.value)">${note.content}</textarea>
    `;
}

renderNotesList();
```

}

function updateNoteContent(id, content) {
const note = LifeOS.data.notes.find(n => n.id === id);
if (note) {
note.content = content;
note.updatedAt = new Date().toISOString();
Storage.saveAll();
}
}

function searchNotes(query) {
// Implementation for note search
}

function openQuickNote() {
navigateTo(‘notes’);
setTimeout(() => createNote(), 100);
}

// ===== MEALS =====

function renderMealsPage() {
renderWeekMealGrid();
}

function renderWeekMealGrid() {
const grid = document.getElementById(‘week-meal-grid’);
if (!grid) return;

```
const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const mealTypes = ['breakfast', 'lunch', 'dinner'];

grid.innerHTML = days.map(day => {
    const dayMeals = LifeOS.data.meals.plan[day] || {};
    
    return `
        <div class="meal-day">
            <div class="meal-day-name">${day}</div>
            ${mealTypes.map(type => {
                const meal = dayMeals[type];
                return `
                    <div class="meal-slot">
                        <div class="meal-time">${type}</div>
                        <div>${meal || '—'}</div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}).join('');
```

}

function addQuickMeal() {
const name = document.getElementById(‘quick-meal-name’).value.trim();
const day = document.getElementById(‘quick-meal-day’).value;
const time = document.getElementById(‘quick-meal-time’).value;

```
if (!name) {
    showToast('Please enter a meal name', 'error');
    return;
}

if (!LifeOS.data.meals.plan[day]) {
    LifeOS.data.meals.plan[day] = {};
}

LifeOS.data.meals.plan[day][time] = name;

Storage.saveAll();
renderWeekMealGrid();
renderDashboard();

document.getElementById('quick-meal-name').value = '';
showToast('Meal added to plan');
```

}

function generateMealPlan() {
showToast(‘AI meal plan generation coming soon’);
}

// ===== VIEWER MANAGEMENT =====

function showViewerModal() {
openModal(‘viewer-modal’);
}

function switchViewer(viewer) {
LifeOS.currentViewer = viewer;
Storage.saveAll();
closeModal(‘viewer-modal’);
renderDashboard();
showToast(`Switched to ${viewer} view`);
}

// ===== MODAL SYSTEM =====

function openModal(modalId) {
const modal = document.getElementById(modalId);
const overlay = document.getElementById(‘modal-overlay’);
if (modal && overlay) {
modal.classList.add(‘active’);
overlay.classList.add(‘active’);
}
}

function closeModal(modalId) {
const modal = document.getElementById(modalId);
const overlay = document.getElementById(‘modal-overlay’);
if (modal && overlay) {
modal.classList.remove(‘active’);
overlay.classList.remove(‘active’);
}
}

// Close modals on overlay click
document.addEventListener(‘click’, (e) => {
if (e.target.id === ‘modal-overlay’) {
document.querySelectorAll(’.modal.active’).forEach(modal => {
modal.classList.remove(‘active’);
});
document.getElementById(‘modal-overlay’).classList.remove(‘active’);
}
});

// Close modals on Escape key
document.addEventListener(‘keydown’, (e) => {
if (e.key === ‘Escape’) {
document.querySelectorAll(’.modal.active’).forEach(modal => {
modal.classList.remove(‘active’);
});
document.getElementById(‘modal-overlay’).classList.remove(‘active’);
}
});

// ===== UTILITY FUNCTIONS =====

function formatCurrency(amount) {
return new Intl.NumberFormat(‘en-US’, {
style: ‘currency’,
currency: ‘USD’,
minimumFractionDigits: 0,
maximumFractionDigits: 0
}).format(amount);
}

function formatDate(date) {
const now = new Date();
const diff = now - date;
const days = Math.floor(diff / (1000 * 60 * 60 * 24));

```
if (days === 0) return 'Today';
if (days === 1) return 'Yesterday';
if (days === -1) return 'Tomorrow';
if (days < 7 && days > 0) return `${days} days ago`;
if (days > -7 && days < 0) return `In ${-days} days`;

return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
```

}

function showToast(message, type = ‘success’) {
const toast = document.createElement(‘div’);
toast.style.cssText = `position: fixed; bottom: 2rem; right: 2rem; background: var(--bg-elevated); border: 1px solid ${type === 'error' ? 'var(--ruby)' : 'var(--gold)'}; color: var(--text-primary); padding: 1rem 1.5rem; border-radius: 8px; box-shadow: var(--shadow-xl); z-index: 10000; animation: slideInRight 0.3s ease;`;
toast.textContent = message;

```
document.body.appendChild(toast);

setTimeout(() => {
    toast.style.animation = 'slideOutRight 0.3s ease';
    setTimeout(() => toast.remove(), 300);
}, 3000);
```

}

// Toast animations
const toastStyles = document.createElement(‘style’);
toastStyles.textContent = `
@keyframes slideInRight {
from {
transform: translateX(400px);
opacity: 0;
}
to {
transform: translateX(0);
opacity: 1;
}
}

```
@keyframes slideOutRight {
    from {
        transform: translateX(0);
        opacity: 1;
    }
    to {
        transform: translateX(400px);
        opacity: 0;
    }
}
```

`;
document.head.appendChild(toastStyles);

// ===== DEMO DATA =====

function loadDemoData() {
if (LifeOS.data.tasks.length === 0) {
LifeOS.data.tasks = [
{
id: 1,
name: ‘Review Q1 financial report’,
dueDate: new Date().toISOString().split(‘T’)[0],
priority: ‘high’,
category: ‘Work’,
assignee: ‘me’,
notes: ‘Prepare notes for board meeting’,
completed: false,
createdAt: new Date().toISOString()
},
{
id: 2,
name: ‘Grocery shopping’,
dueDate: new Date(Date.now() + 86400000).toISOString().split(‘T’)[0],
priority: ‘medium’,
category: ‘Personal’,
assignee: ‘household’,
notes: ‘’,
completed: false,
createdAt: new Date().toISOString()
},
{
id: 3,
name: ‘Schedule dentist appointment’,
dueDate: new Date(Date.now() + 172800000).toISOString().split(‘T’)[0],
priority: ‘low’,
category: ‘Health’,
assignee: ‘me’,
notes: ‘’,
completed: false,
createdAt: new Date().toISOString()
}
];
}

```
if (LifeOS.data.budget.transactions.length === 0) {
    LifeOS.data.budget.transactions = [
        {
            id: 1,
            description: 'Monthly Salary',
            amount: 5000,
            type: 'income',
            category: 'Income',
            date: new Date().toISOString()
        },
        {
            id: 2,
            description: 'Rent Payment',
            amount: 1500,
            type: 'expense',
            category: 'Utilities',
            date: new Date().toISOString()
        },
        {
            id: 3,
            description: 'Groceries',
            amount: 250,
            type: 'expense',
            category: 'Food',
            date: new Date().toISOString()
        }
    ];
}

Storage.saveAll();
```

}

// ===== INITIALIZATION =====

document.addEventListener(‘DOMContentLoaded’, () => {
// Show loading screen
const loadingScreen = document.getElementById(‘loading-screen’);

```
// Load data from storage
Storage.loadAll();

// Load demo data if empty
loadDemoData();

// Initialize navigation
initNavigation();

// Add SVG gradient for budget ring
const svg = document.querySelector('.budget-ring');
if (svg) {
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    gradient.setAttribute('id', 'budgetGradient');
    gradient.setAttribute('x1', '0%');
    gradient.setAttribute('y1', '0%');
    gradient.setAttribute('x2', '100%');
    gradient.setAttribute('y2', '0%');
    gradient.innerHTML = `
        <stop offset="0%" style="stop-color: var(--gold); stop-opacity: 1" />
        <stop offset="100%" style="stop-color: var(--gold-light); stop-opacity: 1" />
    `;
    defs.appendChild(gradient);
    svg.insertBefore(defs, svg.firstChild);
}

// Initial render
renderDashboard();

// Hide loading screen
setTimeout(() => {
    if (loadingScreen) {
        loadingScreen.classList.add('hidden');
    }
}, 800);

// Auto-save every 30 seconds
setInterval(() => {
    Storage.saveAll();
}, 30000);

// Save on page unload
window.addEventListener('beforeunload', () => {
    Storage.saveAll();
});

console.log('Life OS v' + LifeOS.version + ' initialized');
```

});