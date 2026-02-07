/* ===================================
APPLICATION STATE & STORAGE
=================================== */

// Global state object
const AppState = {
currentPage: ‘dashboard’,
currentViewer: ‘me’,
currentTimeFrame: ‘today’,
currentTaskFilter: ‘all’,
selectedVibe: null,
editingTask: null,

```
// Data structures
budget: {
    income: [],
    fixedExpenses: [],
    variableExpenses: []
},
tasks: [],
meals: {
    saved: [],
    suggestions: []
}
```

};

// LocalStorage helpers
const Storage = {
save(key, data) {
localStorage.setItem(key, JSON.stringify(data));
},

```
load(key, defaultValue = null) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
},

saveState() {
    this.save('budget', AppState.budget);
    this.save('tasks', AppState.tasks);
    this.save('meals', AppState.meals);
},

loadState() {
    AppState.budget = this.load('budget', AppState.budget);
    AppState.tasks = this.load('tasks', AppState.tasks);
    AppState.meals = this.load('meals', AppState.meals);
}
```

};

/* ===================================
NAVIGATION & PAGE SWITCHING
=================================== */

function initNavigation() {
const navLinks = document.querySelectorAll(’.nav-link’);

```
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const page = link.dataset.page;
        switchPage(page);
    });
});
```

}

function switchPage(pageName) {
// Update state
AppState.currentPage = pageName;

```
// Update nav links
document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.toggle('active', link.dataset.page === pageName);
});

// Update pages
document.querySelectorAll('.page').forEach(page => {
    page.classList.remove('active');
});
document.getElementById(`${pageName}-page`).classList.add('active');

// Refresh page content
if (pageName === 'dashboard') renderDashboard();
if (pageName === 'budget') renderBudgetPage();
if (pageName === 'tasks') renderTasksPage();
```

}

/* ===================================
DASHBOARD PAGE
=================================== */

function initDashboard() {
// Viewer selector
document.querySelectorAll(’.viewer-btn’).forEach(btn => {
btn.addEventListener(‘click’, () => {
document.querySelectorAll(’.viewer-btn’).forEach(b => b.classList.remove(‘active’));
btn.classList.add(‘active’);
AppState.currentViewer = btn.dataset.viewer;
renderDashboard();
});
});

```
// Time toggle
document.querySelectorAll('.time-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        AppState.currentTimeFrame = btn.dataset.time;
        renderDashboard();
    });
});
```

}

function renderDashboard() {
renderScheduleCard();
renderTasksCard();
renderBudgetCard();
renderMealsCard();
renderPriorityCard();
checkAlerts();
}

function renderScheduleCard() {
const content = document.getElementById(‘schedule-content’);
const count = document.getElementById(‘schedule-count’);

```
// Placeholder - no calendar integration yet
content.innerHTML = '<p class="empty-state">No events scheduled</p>';
count.textContent = '0';
```

}

function renderTasksCard() {
const content = document.getElementById(‘tasks-content’);
const count = document.getElementById(‘tasks-count’);

```
const filteredTasks = filterTasks(AppState.tasks);
const incompleteTasks = filteredTasks.filter(t => !t.completed);

if (incompleteTasks.length === 0) {
    content.innerHTML = '<p class="empty-state">No tasks due</p>';
    count.textContent = '0';
    return;
}

count.textContent = incompleteTasks.length;

let html = '<div class="budget-overview">';
incompleteTasks.slice(0, 5).forEach(task => {
    const dueDate = new Date(task.dueDate);
    const formattedDate = dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    html += `
        <div class="budget-row">
            <span>${task.name}</span>
            <span style="color: var(--text-tertiary); font-size: 0.8rem">${formattedDate}</span>
        </div>
    `;
});
html += '</div>';

content.innerHTML = html;
```

}

function renderBudgetCard() {
const statusEl = document.getElementById(‘budget-status’);
const incomeEl = document.getElementById(‘budget-income’);
const expensesEl = document.getElementById(‘budget-expenses’);
const remainingEl = document.getElementById(‘budget-remaining’);

```
const totals = calculateBudgetTotals();

incomeEl.textContent = formatCurrency(totals.income);
expensesEl.textContent = formatCurrency(totals.expenses);
remainingEl.textContent = formatCurrency(totals.remaining);

if (totals.remaining >= 0) {
    statusEl.textContent = '✓';
    statusEl.style.color = 'var(--accent-emerald)';
    remainingEl.style.color = 'var(--accent-emerald)';
} else {
    statusEl.textContent = '!';
    statusEl.style.color = 'var(--color-danger)';
    remainingEl.style.color = 'var(--color-danger)';
}
```

}

function renderMealsCard() {
const content = document.getElementById(‘meals-content’);
const count = document.getElementById(‘meals-count’);

```
const savedMeals = AppState.meals.saved;

if (savedMeals.length === 0) {
    content.innerHTML = '<p class="empty-state">No meals planned</p>';
    count.textContent = '0';
    return;
}

count.textContent = savedMeals.length;

let html = '<div class="budget-overview">';
savedMeals.slice(0, 5).forEach(meal => {
    html += `
        <div class="budget-row">
            <span>${meal.name}</span>
            <span style="color: var(--text-tertiary); font-size: 0.8rem">${meal.time}min</span>
        </div>
    `;
});
html += '</div>';

content.innerHTML = html;
```

}

function renderPriorityCard() {
const content = document.getElementById(‘priority-content’);

```
const highPriorityTasks = AppState.tasks
    .filter(t => !t.completed && t.priority === 'high')
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

if (highPriorityTasks.length === 0) {
    content.innerHTML = '<p class="empty-state">No priorities set</p>';
    return;
}

const topTask = highPriorityTasks[0];
const dueDate = new Date(topTask.dueDate);
const formattedDate = dueDate.toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
});

content.innerHTML = `
    <div style="text-align: center; padding: var(--spacing-lg) 0;">
        <h3 style="color: var(--accent-emerald); font-size: 1.5rem; margin-bottom: var(--spacing-sm);">
            ${topTask.name}
        </h3>
        <p style="color: var(--text-secondary); margin-bottom: var(--spacing-xs);">
            Due: ${formattedDate}
        </p>
        <p style="color: var(--text-tertiary); font-size: 0.875rem;">
            ${topTask.category} • ${topTask.assignee}
        </p>
    </div>
`;
```

}

function checkAlerts() {
const banner = document.getElementById(‘alert-banner’);

```
const overdueTasks = AppState.tasks.filter(t => {
    if (t.completed) return false;
    const dueDate = new Date(t.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dueDate < today;
});

if (overdueTasks.length > 0) {
    banner.textContent = `⚠ You have ${overdueTasks.length} overdue task${overdueTasks.length > 1 ? 's' : ''}`;
    banner.classList.remove('hidden');
} else {
    banner.classList.add('hidden');
}
```

}

function filterTasks(tasks) {
const viewer = AppState.currentViewer;
const timeFrame = AppState.currentTimeFrame;

```
return tasks.filter(task => {
    // Filter by viewer
    if (viewer !== 'all') {
        if (viewer === 'household' && task.assignee !== 'household') return false;
        if (viewer !== 'household' && task.assignee !== viewer) return false;
    }
    
    // Filter by time frame
    const dueDate = new Date(task.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (timeFrame === 'today') {
        const taskDate = new Date(dueDate);
        taskDate.setHours(0, 0, 0, 0);
        return taskDate.getTime() === today.getTime();
    } else if (timeFrame === 'week') {
        const weekFromNow = new Date(today);
        weekFromNow.setDate(weekFromNow.getDate() + 7);
        return dueDate >= today && dueDate <= weekFromNow;
    }
    
    return true;
});
```

}

/* ===================================
BUDGET PAGE
=================================== */

function initBudget() {
document.getElementById(‘add-income’).addEventListener(‘click’, () => addBudgetItem(‘income’));
document.getElementById(‘add-fixed-expense’).addEventListener(‘click’, () => addBudgetItem(‘fixedExpenses’));
document.getElementById(‘add-variable-expense’).addEventListener(‘click’, () => addBudgetItem(‘variableExpenses’));
document.getElementById(‘save-budget’).addEventListener(‘click’, saveBudget);
}

function renderBudgetPage() {
renderBudgetList(‘income’, AppState.budget.income);
renderBudgetList(‘fixedExpenses’, AppState.budget.fixedExpenses);
renderBudgetList(‘variableExpenses’, AppState.budget.variableExpenses);
updateBudgetTotals();
}

function addBudgetItem(type) {
const item = {
id: Date.now(),
name: ‘’,
amount: 0
};

```
AppState.budget[type].push(item);
renderBudgetPage();

// Focus on the new item's name input
setTimeout(() => {
    const inputs = document.querySelectorAll(`#${type === 'income' ? 'income' : type.replace('Expenses', '-expenses')}-list input`);
    if (inputs.length > 0) {
        inputs[inputs.length - 2].focus();
    }
}, 0);
```

}

function renderBudgetList(type, items) {
const listId = type === ‘income’ ? ‘income-list’ :
type === ‘fixedExpenses’ ? ‘fixed-expenses-list’ :
‘variable-expenses-list’;

```
const list = document.getElementById(listId);

if (items.length === 0) {
    list.innerHTML = '<p class="empty-state" style="text-align: left; padding: var(--spacing-md) 0;">No items added</p>';
    return;
}

let html = '';
items.forEach(item => {
    html += `
        <div class="budget-item">
            <input type="text" 
                   placeholder="Name" 
                   value="${item.name}" 
                   onchange="updateBudgetItem('${type}', ${item.id}, 'name', this.value)"
                   style="flex: 1; margin-right: var(--spacing-sm);">
            <input type="number" 
                   placeholder="0.00" 
                   value="${item.amount}" 
                   step="0.01"
                   onchange="updateBudgetItem('${type}', ${item.id}, 'amount', parseFloat(this.value) || 0)">
            <button onclick="deleteBudgetItem('${type}', ${item.id})">×</button>
        </div>
    `;
});

list.innerHTML = html;
```

}

function updateBudgetItem(type, id, field, value) {
const item = AppState.budget[type].find(i => i.id === id);
if (item) {
item[field] = value;
updateBudgetTotals();
}
}

function deleteBudgetItem(type, id) {
AppState.budget[type] = AppState.budget[type].filter(i => i.id !== id);
renderBudgetPage();
}

function calculateBudgetTotals() {
const income = AppState.budget.income.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
const fixedExpenses = AppState.budget.fixedExpenses.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
const variableExpenses = AppState.budget.variableExpenses.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
const expenses = fixedExpenses + variableExpenses;
const remaining = income - expenses;

```
return { income, expenses, remaining };
```

}

function updateBudgetTotals() {
const totals = calculateBudgetTotals();

```
// Update individual totals
document.getElementById('total-income').textContent = formatCurrency(totals.income);
document.getElementById('total-fixed').textContent = formatCurrency(
    AppState.budget.fixedExpenses.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0)
);
document.getElementById('total-variable').textContent = formatCurrency(
    AppState.budget.variableExpenses.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0)
);

// Update summary
document.getElementById('summary-income').textContent = formatCurrency(totals.income);
document.getElementById('summary-expenses').textContent = formatCurrency(totals.expenses);
document.getElementById('summary-remaining').textContent = formatCurrency(totals.remaining);

// Update progress bar
const progress = document.getElementById('budget-progress');
const percentage = totals.income > 0 ? (totals.expenses / totals.income) * 100 : 0;
progress.style.width = `${Math.min(percentage, 100)}%`;

// Color coding
const remainingEl = document.getElementById('summary-remaining');
if (totals.remaining >= 0) {
    remainingEl.style.color = 'var(--accent-emerald)';
} else {
    remainingEl.style.color = 'var(--color-danger)';
}
```

}

function saveBudget() {
Storage.saveState();
showNotification(‘Budget saved successfully!’);
}

function formatCurrency(amount) {
return new Intl.NumberFormat(‘en-US’, {
style: ‘currency’,
currency: ‘USD’
}).format(amount);
}

/* ===================================
TASKS PAGE
=================================== */

function initTasks() {
// Add task button
document.getElementById(‘add-task’).addEventListener(‘click’, openTaskModal);

```
// Modal controls
document.querySelector('.modal-close').addEventListener('click', closeTaskModal);
document.querySelector('.modal-cancel').addEventListener('click', closeTaskModal);
document.getElementById('save-task').addEventListener('click', saveTask);

// Filter buttons
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        AppState.currentTaskFilter = btn.dataset.filter;
        renderTasksPage();
    });
});

// Close modal on background click
document.getElementById('task-modal').addEventListener('click', (e) => {
    if (e.target.id === 'task-modal') closeTaskModal();
});
```

}

function renderTasksPage() {
const list = document.getElementById(‘task-list’);
const filter = AppState.currentTaskFilter;

```
let filteredTasks = [...AppState.tasks];
const today = new Date();
today.setHours(0, 0, 0, 0);

// Apply filters
if (filter === 'today') {
    filteredTasks = filteredTasks.filter(t => {
        const taskDate = new Date(t.dueDate);
        taskDate.setHours(0, 0, 0, 0);
        return taskDate.getTime() === today.getTime();
    });
} else if (filter === 'upcoming') {
    filteredTasks = filteredTasks.filter(t => {
        const taskDate = new Date(t.dueDate);
        return taskDate > today && !t.completed;
    });
} else if (filter === 'overdue') {
    filteredTasks = filteredTasks.filter(t => {
        const taskDate = new Date(t.dueDate);
        return taskDate < today && !t.completed;
    });
}

// Sort by date
filteredTasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

if (filteredTasks.length === 0) {
    list.innerHTML = '<p class="empty-state">No tasks found</p>';
    return;
}

let html = '';
filteredTasks.forEach(task => {
    const dueDate = new Date(task.dueDate);
    const formattedDate = dueDate.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: dueDate.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
    });
    
    html += `
        <div class="task-item ${task.completed ? 'completed' : ''}">
            <input type="checkbox" 
                   class="task-checkbox" 
                   ${task.completed ? 'checked' : ''}
                   onchange="toggleTaskComplete(${task.id})">
            <div class="task-details">
                <div class="task-name">${task.name}</div>
                <div class="task-meta">
                    <span class="task-priority ${task.priority}">${task.priority}</span>
                    <span>${formattedDate}</span>
                    <span>${task.category}</span>
                    <span>${task.assignee}</span>
                </div>
            </div>
            <div class="task-actions">
                <button onclick="editTask(${task.id})" title="Edit">✎</button>
                <button onclick="deleteTask(${task.id})" title="Delete">×</button>
            </div>
        </div>
    `;
});

list.innerHTML = html;
```

}

function openTaskModal(task = null) {
const modal = document.getElementById(‘task-modal’);
const title = document.getElementById(‘modal-title’);

```
if (task) {
    // Edit mode
    AppState.editingTask = task.id;
    title.textContent = 'Edit Task';
    document.getElementById('task-name').value = task.name;
    document.getElementById('task-date').value = task.dueDate;
    document.getElementById('task-priority').value = task.priority;
    document.getElementById('task-category').value = task.category;
    document.getElementById('task-assignee').value = task.assignee;
} else {
    // New task mode
    AppState.editingTask = null;
    title.textContent = 'New Task';
    document.getElementById('task-name').value = '';
    document.getElementById('task-date').value = '';
    document.getElementById('task-priority').value = 'medium';
    document.getElementById('task-category').value = '';
    document.getElementById('task-assignee').value = 'me';
}

modal.classList.remove('hidden');
```

}

function closeTaskModal() {
document.getElementById(‘task-modal’).classList.add(‘hidden’);
AppState.editingTask = null;
}

function saveTask() {
const name = document.getElementById(‘task-name’).value.trim();
const dueDate = document.getElementById(‘task-date’).value;
const priority = document.getElementById(‘task-priority’).value;
const category = document.getElementById(‘task-category’).value.trim();
const assignee = document.getElementById(‘task-assignee’).value;

```
if (!name || !dueDate) {
    alert('Please fill in task name and due date');
    return;
}

if (AppState.editingTask) {
    // Update existing task
    const task = AppState.tasks.find(t => t.id === AppState.editingTask);
    if (task) {
        task.name = name;
        task.dueDate = dueDate;
        task.priority = priority;
        task.category = category;
        task.assignee = assignee;
    }
} else {
    // Create new task
    const task = {
        id: Date.now(),
        name,
        dueDate,
        priority,
        category,
        assignee,
        completed: false
    };
    AppState.tasks.push(task);
}

Storage.saveState();
renderTasksPage();
closeTaskModal();
```

}

function toggleTaskComplete(id) {
const task = AppState.tasks.find(t => t.id === id);
if (task) {
task.completed = !task.completed;
Storage.saveState();
renderTasksPage();
renderDashboard();
}
}

function editTask(id) {
const task = AppState.tasks.find(t => t.id === id);
if (task) {
openTaskModal(task);
}
}

function deleteTask(id) {
if (confirm(‘Are you sure you want to delete this task?’)) {
AppState.tasks = AppState.tasks.filter(t => t.id !== id);
Storage.saveState();
renderTasksPage();
renderDashboard();
}
}

/* ===================================
MEALS PAGE
=================================== */

function initMeals() {
// Vibe selector
document.querySelectorAll(’.vibe-btn’).forEach(btn => {
btn.addEventListener(‘click’, () => {
document.querySelectorAll(’.vibe-btn’).forEach(b => b.classList.remove(‘active’));
btn.classList.add(‘active’);
AppState.selectedVibe = btn.dataset.vibe;
});
});

```
// Suggest meals button
document.getElementById('suggest-meals').addEventListener('click', suggestMeals);
```

}

function suggestMeals() {
const ingredients = document.getElementById(‘ingredients-input’).value.trim();
const time = document.getElementById(‘time-available’).value;
const vibe = AppState.selectedVibe;

```
if (!ingredients) {
    alert('Please enter some ingredients');
    return;
}

// Generate mock suggestions based on inputs
const suggestions = generateMealSuggestions(ingredients, time, vibe);
AppState.meals.suggestions = suggestions;

renderMealSuggestions();
```

}

function generateMealSuggestions(ingredients, time, vibe) {
// This is placeholder logic - in production, this could integrate with an AI API
const ingredientList = ingredients.toLowerCase().split(’,’).map(i => i.trim());
const timeNum = parseInt(time);

```
const mealTemplates = {
    quick: [
        { name: 'Stir Fry', time: 15, base: ['rice', 'vegetables', 'chicken', 'soy sauce'] },
        { name: 'Pasta Aglio e Olio', time: 20, base: ['pasta', 'garlic', 'olive oil'] },
        { name: 'Quesadilla', time: 10, base: ['tortilla', 'cheese'] }
    ],
    comfort: [
        { name: 'Mac and Cheese', time: 30, base: ['pasta', 'cheese', 'milk'] },
        { name: 'Chicken Soup', time: 45, base: ['chicken', 'vegetables', 'broth'] },
        { name: 'Mashed Potatoes', time: 30, base: ['potatoes', 'butter', 'milk'] }
    ],
    healthy: [
        { name: 'Grilled Chicken Salad', time: 25, base: ['chicken', 'lettuce', 'vegetables'] },
        { name: 'Buddha Bowl', time: 30, base: ['rice', 'vegetables', 'chickpeas'] },
        { name: 'Salmon with Veggies', time: 35, base: ['salmon', 'vegetables'] }
    ],
    fancy: [
        { name: 'Pan-Seared Salmon', time: 30, base: ['salmon', 'lemon', 'herbs'] },
        { name: 'Risotto', time: 45, base: ['rice', 'broth', 'parmesan'] },
        { name: 'Stuffed Chicken Breast', time: 60, base: ['chicken', 'cheese', 'spinach'] }
    ]
};

const vibeTemplates = vibe ? mealTemplates[vibe] : Object.values(mealTemplates).flat();

// Filter meals that match time and have some ingredient overlap
const suggestions = vibeTemplates
    .filter(meal => meal.time <= timeNum)
    .map(meal => {
        const matchCount = meal.base.filter(ingredient => 
            ingredientList.some(userIng => 
                userIng.includes(ingredient) || ingredient.includes(userIng)
            )
        ).length;
        return { ...meal, matchCount };
    })
    .sort((a, b) => b.matchCount - a.matchCount)
    .slice(0, 3)
    .map(meal => ({
        name: meal.name,
        time: meal.time,
        description: `A delicious ${vibe || 'homemade'} meal ready in ${meal.time} minutes`,
        ingredients: meal.base
    }));

return suggestions.length > 0 ? suggestions : [
    {
        name: 'Custom Creation',
        time: timeNum,
        description: `Create something unique with your ingredients in ${timeNum} minutes`,
        ingredients: ingredientList
    }
];
```

}

function renderMealSuggestions() {
const container = document.getElementById(‘meal-suggestions’);
const suggestions = AppState.meals.suggestions;

```
if (suggestions.length === 0) {
    container.innerHTML = '<p class="empty-state">Enter ingredients and preferences to see suggestions</p>';
    return;
}

let html = '';
suggestions.forEach(meal => {
    html += `
        <div class="meal-card">
            <h3>${meal.name}</h3>
            <p>${meal.description}</p>
            <p style="font-size: 0.8rem; color: var(--text-tertiary);">
                Ingredients: ${meal.ingredients.join(', ')}
            </p>
            <button onclick="saveMeal('${meal.name}', ${meal.time})">Add to Plan</button>
        </div>
    `;
});

container.innerHTML = html;
```

}

function saveMeal(name, time) {
const meal = { name, time, id: Date.now() };
AppState.meals.saved.push(meal);
Storage.saveState();
renderSavedMeals();
renderDashboard();
showNotification(`${name} added to meal plan!`);
}

function renderSavedMeals() {
const container = document.getElementById(‘saved-meals’);
const meals = AppState.meals.saved;

```
if (meals.length === 0) {
    container.innerHTML = '<p class="empty-state">No meals planned yet</p>';
    return;
}

let html = '';
meals.forEach(meal => {
    html += `
        <div class="meal-card">
            <h3>${meal.name}</h3>
            <p>Prep time: ${meal.time} minutes</p>
            <button onclick="removeMeal(${meal.id})" style="background: rgba(239, 68, 68, 0.1); border-color: var(--color-danger); color: var(--color-danger);">
                Remove
            </button>
        </div>
    `;
});

container.innerHTML = html;
```

}

function removeMeal(id) {
AppState.meals.saved = AppState.meals.saved.filter(m => m.id !== id);
Storage.saveState();
renderSavedMeals();
renderDashboard();
}

/* ===================================
ASSISTANT PAGE
=================================== */

function initAssistant() {
const input = document.getElementById(‘terminal-input’);
const clearBtn = document.getElementById(‘clear-terminal’);

```
input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const command = input.value.trim();
        if (command) {
            processCommand(command);
            input.value = '';
        }
    }
});

clearBtn.addEventListener('click', () => {
    const output = document.getElementById('terminal-output');
    output.innerHTML = `
        <div class="terminal-line system">
            <span class="prompt">system:</span>
            <span>Life Dashboard Assistant v1.0</span>
        </div>
        <div class="terminal-line system">
            <span class="prompt">system:</span>
            <span>Type 'help' for available commands</span>
        </div>
    `;
});
```

}

function processCommand(command) {
addTerminalLine(‘user’, command);

```
const cmd = command.toLowerCase().trim();

// Command routing
if (cmd === 'help') {
    showHelp();
} else if (cmd === 'status') {
    showStatus();
} else if (cmd.startsWith('tasks')) {
    showTasks(cmd);
} else if (cmd === 'budget') {
    showBudgetSummary();
} else if (cmd === 'meals') {
    showMeals();
} else if (cmd === 'clear') {
    document.getElementById('clear-terminal').click();
} else {
    addTerminalLine('response', `Unknown command: "${command}". Type 'help' for available commands.`);
}

scrollTerminalToBottom();
```

}

function addTerminalLine(type, content) {
const output = document.getElementById(‘terminal-output’);
const line = document.createElement(‘div’);
line.className = `terminal-line ${type}`;

```
if (type === 'user') {
    line.innerHTML = `<span class="prompt">you:</span><span>${content}</span>`;
} else if (type === 'response') {
    line.innerHTML = `<span class="prompt">assistant:</span><span>${content}</span>`;
} else if (type === 'system') {
    line.innerHTML = `<span class="prompt">system:</span><span>${content}</span>`;
} else if (type === 'error') {
    line.innerHTML = `<span class="prompt">error:</span><span>${content}</span>`;
}

output.appendChild(line);
```

}

function scrollTerminalToBottom() {
const output = document.getElementById(‘terminal-output’);
output.scrollTop = output.scrollHeight;
}

function showHelp() {
addTerminalLine(‘response’, ‘Available commands:’);
addTerminalLine(‘system’, ’  help - Show this help message’);
addTerminalLine(‘system’, ’  status - Show dashboard overview’);
addTerminalLine(‘system’, ’  tasks [filter] - Show tasks (all/today/overdue)’);
addTerminalLine(‘system’, ’  budget - Show budget summary’);
addTerminalLine(‘system’, ’  meals - Show meal plan’);
addTerminalLine(‘system’, ’  clear - Clear terminal’);
}

function showStatus() {
const taskCount = AppState.tasks.filter(t => !t.completed).length;
const overdueCount = AppState.tasks.filter(t => {
if (t.completed) return false;
const dueDate = new Date(t.dueDate);
const today = new Date();
today.setHours(0, 0, 0, 0);
return dueDate < today;
}).length;

```
const totals = calculateBudgetTotals();
const mealCount = AppState.meals.saved.length;

addTerminalLine('response', '─── Dashboard Status ───');
addTerminalLine('system', `Tasks: ${taskCount} active, ${overdueCount} overdue`);
addTerminalLine('system', `Budget: ${formatCurrency(totals.remaining)} remaining`);
addTerminalLine('system', `Meals: ${mealCount} planned`);
```

}

function showTasks(cmd) {
const parts = cmd.split(’ ’);
const filter = parts[1] || ‘all’;

```
let tasks = [...AppState.tasks];
const today = new Date();
today.setHours(0, 0, 0, 0);

if (filter === 'today') {
    tasks = tasks.filter(t => {
        const taskDate = new Date(t.dueDate);
        taskDate.setHours(0, 0, 0, 0);
        return taskDate.getTime() === today.getTime();
    });
} else if (filter === 'overdue') {
    tasks = tasks.filter(t => {
        const taskDate = new Date(t.dueDate);
        return taskDate < today && !t.completed;
    });
}

tasks = tasks.filter(t => !t.completed);

if (tasks.length === 0) {
    addTerminalLine('response', `No ${filter} tasks found`);
    return;
}

addTerminalLine('response', `─── ${filter.toUpperCase()} Tasks (${tasks.length}) ───`);
tasks.forEach(task => {
    const dueDate = new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    addTerminalLine('system', `[${task.priority.toUpperCase()}] ${task.name} - Due: ${dueDate}`);
});
```

}

function showBudgetSummary() {
const totals = calculateBudgetTotals();

```
addTerminalLine('response', '─── Budget Summary ───');
addTerminalLine('system', `Income: ${formatCurrency(totals.income)}`);
addTerminalLine('system', `Expenses: ${formatCurrency(totals.expenses)}`);
addTerminalLine('system', `Remaining: ${formatCurrency(totals.remaining)}`);
```

}

function showMeals() {
const meals = AppState.meals.saved;

```
if (meals.length === 0) {
    addTerminalLine('response', 'No meals planned');
    return;
}

addTerminalLine('response', `─── Meal Plan (${meals.length}) ───`);
meals.forEach(meal => {
    addTerminalLine('system', `${meal.name} - ${meal.time} minutes`);
});
```

}

/* ===================================
UTILITY FUNCTIONS
=================================== */

function showNotification(message) {
// Simple notification - could be enhanced with a proper notification UI
const notification = document.createElement(‘div’);
notification.style.cssText = `position: fixed; top: 80px; right: 20px; background: var(--bg-elevated); border: 1px solid var(--accent-emerald); color: var(--accent-emerald); padding: var(--spacing-md) var(--spacing-lg); border-radius: 8px; box-shadow: var(--glow-emerald); z-index: 1001; animation: slideIn 0.3s ease;`;
notification.textContent = message;

```
document.body.appendChild(notification);

setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => notification.remove(), 300);
}, 3000);
```

}

// Add slide animations
const style = document.createElement(‘style’);
style.textContent = `@keyframes slideIn { from { transform: translateX(400px); opacity: 0; } to { transform: translateX(0); opacity: 1; } } @keyframes slideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(400px); opacity: 0; } }`;
document.head.appendChild(style);

/* ===================================
INITIALIZATION
=================================== */

document.addEventListener(‘DOMContentLoaded’, () => {
// Load saved state from LocalStorage
Storage.loadState();

```
// Initialize all modules
initNavigation();
initDashboard();
initBudget();
initTasks();
initMeals();
initAssistant();

// Render initial page
renderDashboard();
renderSavedMeals();

// Auto-save on page unload
window.addEventListener('beforeunload', () => {
    Storage.saveState();
});

console.log('Life Dashboard initialized');
```

});