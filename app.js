// ========================================
// JORDY LIFE OS - ENHANCED
// ========================================

// — 1. STATE MANAGEMENT —
const store = {
tasks: [
{
id: 1,
text: “Review Design Tokens”,
done: false,
category: “Work”,
priority: “high”,
dueDate: null,
createdAt: new Date().toISOString()
},
{
id: 2,
text: “Morning Walk”,
done: true,
category: “Health”,
priority: “medium”,
dueDate: null,
createdAt: new Date().toISOString()
}
],
journal: [
{
id: 1,
date: “Oct 24”,
text: “Feeling focused today. The new color palette looks calm.”,
mood: “😊”,
timestamp: new Date().toISOString()
}
],
goals: [
{
id: 1,
title: “Read 12 Books This Year”,
description: “Focus on personal development and fiction”,
current: 3,
target: 12,
category: “Personal”,
deadline: “2026-12-31”
}
],
categories: [“Work”, “Personal”, “Health”, “Learning”, “Finance”],
settings: {
theme: “warm-minimal”,
weekStartsOn: “monday”,
notifications: true
},
stats: {
totalTasksCompleted: 0,
currentStreak: 0,
longestStreak: 0,
journalEntries: 0
}
};

// Load data from localStorage
function loadData() {
if(localStorage.getItem(‘havenData’)) {
const saved = JSON.parse(localStorage.getItem(‘havenData’));
store.tasks = saved.tasks || store.tasks;
store.journal = saved.journal || store.journal;
store.goals = saved.goals || store.goals;
store.categories = saved.categories || store.categories;
store.settings = saved.settings || store.settings;
store.stats = saved.stats || store.stats;
}
}

// Save data to localStorage
function save() {
localStorage.setItem(‘havenData’, JSON.stringify(store));
}

// — 2. UTILITY FUNCTIONS —

function formatDate(dateString) {
const date = new Date(dateString);
return date.toLocaleDateString(‘en-US’, { month: ‘short’, day: ‘numeric’ });
}

function formatDateLong(dateString) {
const date = new Date(dateString);
return date.toLocaleDateString(‘en-US’, {
weekday: ‘long’,
year: ‘numeric’,
month: ‘long’,
day: ‘numeric’
});
}

function getGreeting() {
const hour = new Date().getHours();
if (hour < 12) return “Good Morning”;
if (hour < 18) return “Good Afternoon”;
return “Good Evening”;
}

function calculateStreak() {
// Simple streak calculation based on consecutive days with completed tasks
const today = new Date().toDateString();
const completedToday = store.tasks.some(t =>
t.done && new Date(t.createdAt).toDateString() === today
);
return completedToday ? store.stats.currentStreak : 0;
}

function getTaskStats() {
const total = store.tasks.length;
const done = store.tasks.filter(t => t.done).length;
const pending = total - done;
const percent = total === 0 ? 0 : Math.round((done / total) * 100);

```
const today = new Date().toDateString();
const todayTasks = store.tasks.filter(t => {
    if (!t.dueDate) return false;
    return new Date(t.dueDate).toDateString() === today;
});
const todayDone = todayTasks.filter(t => t.done).length;

return { total, done, pending, percent, todayTasks: todayTasks.length, todayDone };
```

}

// — 3. RENDER FUNCTIONS —

// Page: HOME / DASHBOARD
function renderHome() {
const app = document.getElementById(‘app’);
document.getElementById(‘page-title’).innerText = getGreeting();
document.getElementById(‘header-actions’).innerHTML = ‘’;

```
const stats = getTaskStats();
const streak = calculateStreak();

app.innerHTML = `
    <!-- Stats Overview -->
    <div class="card card-gradient">
        <h3>Focus Pulse</h3>
        <div style="font-size: 52px; font-weight: 700; margin: 20px 0;">${stats.percent}%</div>
        <p style="opacity: 0.9;">Overall task completion rate</p>
        <div class="progress-bar-container" style="margin-top: 20px;">
            <div class="progress-bar" style="width: ${stats.percent}%;"></div>
        </div>
    </div>

    <!-- Quick Stats Grid -->
    <div class="card">
        <h3>Today's Overview</h3>
        <div class="card-grid">
            <div class="stat-card">
                <div class="stat-number">${stats.todayDone}/${stats.todayTasks}</div>
                <div class="stat-label">Today</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${stats.pending}</div>
                <div class="stat-label">Pending</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${streak}</div>
                <div class="stat-label">Streak</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${store.journal.length}</div>
                <div class="stat-label">Entries</div>
            </div>
        </div>
    </div>

    <!-- Quick Tasks -->
    <div class="card">
        <div class="flex-between mb-2">
            <h3>Quick Tasks</h3>
            <button class="btn-small btn-secondary" onclick="router('habits')">View All</button>
        </div>
        ${renderQuickTasks()}
    </div>

    <!-- Active Goals Preview -->
    ${store.goals.length > 0 ? `
    <div class="card">
        <div class="flex-between mb-2">
            <h3>Active Goals</h3>
            <button class="btn-small btn-secondary" onclick="router('goals')">View All</button>
        </div>
        ${renderGoalsPreview()}
    </div>
    ` : ''}

    <!-- Recent Journal Entry -->
    ${store.journal.length > 0 ? `
    <div class="card">
        <div class="flex-between mb-2">
            <h3>Latest Reflection</h3>
            <button class="btn-small btn-secondary" onclick="router('journal')">View All</button>
        </div>
        ${renderLatestJournal()}
    </div>
    ` : ''}
`;
```

}

function renderQuickTasks() {
const incompleteTasks = store.tasks.filter(t => !t.done).slice(0, 5);

```
if (incompleteTasks.length === 0) {
    return '<div class="empty-state"><div class="empty-state-icon">✨</div><div class="empty-state-text">All caught up!</div></div>';
}

return incompleteTasks.map(task => `
    <div class="habit-row">
        <div class="habit-content">
            <div class="habit-text" style="${task.done ? 'text-decoration: line-through; color: #ccc;' : ''}">${task.text}</div>
            <div class="habit-meta">
                <span class="category-badge">${task.category}</span>
                ${task.dueDate ? `<span>📅 ${formatDate(task.dueDate)}</span>` : ''}
            </div>
        </div>
        <div class="habit-actions">
            ${task.priority === 'high' ? '<span class="priority-badge priority-high">High</span>' : ''}
            <div class="checkbox ${task.done ? 'checked' : ''}" onclick="toggleTask(${task.id}, 'home')">
                ${task.done ? '✓' : ''}
            </div>
        </div>
    </div>
`).join('');
```

}

function renderGoalsPreview() {
return store.goals.slice(0, 2).map(goal => {
const progress = Math.round((goal.current / goal.target) * 100);
return `<div class="goal-card"> <div class="goal-header"> <div> <div class="goal-title">${goal.title}</div> <div class="category-badge" style="margin-top: 4px;">${goal.category}</div> </div> </div> <div class="progress-bar-container"> <div class="progress-bar" style="width: ${progress}%;"></div> </div> <div class="goal-progress-text">${goal.current} / ${goal.target} completed (${progress}%)</div> </div>`;
}).join(’’);
}

function renderLatestJournal() {
const latest = store.journal[store.journal.length - 1];
return `<div class="journal-entry"> <div class="journal-header"> <span class="date-badge">${latest.date}</span> <span class="mood-indicator">${latest.mood || '📝'}</span> </div> <p class="journal-text">${latest.text.substring(0, 150)}${latest.text.length > 150 ? '...' : ''}</p> </div>`;
}

// Page: HABITS
let currentFilter = ‘all’;
let currentCategory = ‘all’;

function renderHabits() {
const app = document.getElementById(‘app’);
document.getElementById(‘page-title’).innerText = “Habits & Tasks”;
document.getElementById(‘header-actions’).innerHTML = `<button class="header-btn" onclick="openAddTaskModal()">+ Add Task</button>`;

```
const stats = getTaskStats();

// Apply filters
let filteredTasks = store.tasks;
if (currentFilter === 'active') filteredTasks = filteredTasks.filter(t => !t.done);
if (currentFilter === 'completed') filteredTasks = filteredTasks.filter(t => t.done);
if (currentCategory !== 'all') filteredTasks = filteredTasks.filter(t => t.category === currentCategory);

app.innerHTML = `
    <!-- Stats Bar -->
    <div class="card">
        <div class="flex-between">
            <div>
                <div style="font-size: 24px; font-weight: 700;">${stats.done} / ${stats.total}</div>
                <div class="text-muted text-small">Tasks Completed</div>
            </div>
            <div style="text-align: right;">
                <div style="font-size: 24px; font-weight: 700;">${stats.percent}%</div>
                <div class="text-muted text-small">Completion Rate</div>
            </div>
        </div>
        <div class="progress-bar-container">
            <div class="progress-bar" style="width: ${stats.percent}%;"></div>
        </div>
    </div>

    <!-- Filters -->
    <div class="filter-bar">
        <div class="filter-chip ${currentFilter === 'all' ? 'active' : ''}" onclick="filterTasks('all')">
            All (${store.tasks.length})
        </div>
        <div class="filter-chip ${currentFilter === 'active' ? 'active' : ''}" onclick="filterTasks('active')">
            Active (${store.tasks.filter(t => !t.done).length})
        </div>
        <div class="filter-chip ${currentFilter === 'completed' ? 'active' : ''}" onclick="filterTasks('completed')">
            Completed (${store.tasks.filter(t => t.done).length})
        </div>
    </div>

    <div class="filter-bar">
        <div class="filter-chip ${currentCategory === 'all' ? 'active' : ''}" onclick="filterByCategory('all')">
            All Categories
        </div>
        ${store.categories.map(cat => `
            <div class="filter-chip ${currentCategory === cat ? 'active' : ''}" onclick="filterByCategory('${cat}')">
                ${cat}
            </div>
        `).join('')}
    </div>

    <!-- Tasks List -->
    <div id="tasks-container">
        ${renderTasksList(filteredTasks)}
    </div>
`;
```

}

function renderTasksList(tasks) {
if (tasks.length === 0) {
return `<div class="empty-state"> <div class="empty-state-icon">📋</div> <div class="empty-state-text">No tasks found</div> <div class="empty-state-subtext">Create your first task to get started</div> </div>`;
}

```
return tasks.map(task => `
    <div class="card">
        <div class="habit-row" style="border: none;">
            <div class="habit-content">
                <div class="habit-text" style="${task.done ? 'text-decoration: line-through; color: #ccc;' : ''}">${task.text}</div>
                <div class="habit-meta">
                    <span class="category-badge">${task.category}</span>
                    ${task.priority !== 'low' ? `<span class="priority-badge priority-${task.priority}">${task.priority}</span>` : ''}
                    ${task.dueDate ? `<span>📅 ${formatDate(task.dueDate)}</span>` : ''}
                </div>
            </div>
            <div class="habit-actions">
                <button class="btn-small btn-secondary" onclick="editTask(${task.id})">✏️</button>
                <button class="btn-small btn-danger" onclick="deleteTask(${task.id})">🗑️</button>
                <div class="checkbox ${task.done ? 'checked' : ''}" onclick="toggleTask(${task.id}, 'habits')">
                    ${task.done ? '✓' : ''}
                </div>
            </div>
        </div>
    </div>
`).join('');
```

}

function filterTasks(filter) {
currentFilter = filter;
renderHabits();
}

function filterByCategory(category) {
currentCategory = category;
renderHabits();
}

// Page: JOURNAL
function renderJournal() {
const app = document.getElementById(‘app’);
document.getElementById(‘page-title’).innerText = “Journal”;
document.getElementById(‘header-actions’).innerHTML = `<button class="header-btn" onclick="openAddJournalModal()">+ New Entry</button>`;

```
const sortedJournal = [...store.journal].reverse();

app.innerHTML = `
    <!-- Journal Stats -->
    <div class="card">
        <div class="flex-between">
            <div>
                <div style="font-size: 24px; font-weight: 700;">${store.journal.length}</div>
                <div class="text-muted text-small">Total Entries</div>
            </div>
            <div style="font-size: 32px;">📓</div>
        </div>
    </div>

    <!-- Entries -->
    <div id="journal-container">
        ${sortedJournal.length === 0 ? `
            <div class="empty-state">
                <div class="empty-state-icon">✍️</div>
                <div class="empty-state-text">No journal entries yet</div>
                <div class="empty-state-subtext">Start writing to capture your thoughts</div>
            </div>
        ` : sortedJournal.map(entry => `
            <div class="card journal-entry">
                <div class="journal-header">
                    <span class="date-badge">${entry.date}</span>
                    <div style="display: flex; gap: 8px; align-items: center;">
                        <span class="mood-indicator">${entry.mood || '📝'}</span>
                        <button class="btn-small btn-danger" onclick="deleteJournalEntry(${entry.id})">🗑️</button>
                    </div>
                </div>
                <p class="journal-text">${entry.text}</p>
            </div>
        `).join('')}
    </div>
`;
```

}

// Page: GOALS
function renderGoals() {
const app = document.getElementById(‘app’);
document.getElementById(‘page-title’).innerText = “Goals”;
document.getElementById(‘header-actions’).innerHTML = `<button class="header-btn" onclick="openAddGoalModal()">+ New Goal</button>`;

```
app.innerHTML = `
    <!-- Goals Stats -->
    <div class="card">
        <div class="flex-between">
            <div>
                <div style="font-size: 24px; font-weight: 700;">${store.goals.length}</div>
                <div class="text-muted text-small">Active Goals</div>
            </div>
            <div>
                <div style="font-size: 24px; font-weight: 700;">${store.goals.filter(g => (g.current/g.target) >= 1).length}</div>
                <div class="text-muted text-small">Completed</div>
            </div>
        </div>
    </div>

    <!-- Goals List -->
    <div id="goals-container">
        ${store.goals.length === 0 ? `
            <div class="empty-state">
                <div class="empty-state-icon">🎯</div>
                <div class="empty-state-text">No goals set</div>
                <div class="empty-state-subtext">Create your first goal to start tracking</div>
            </div>
        ` : store.goals.map(goal => {
            const progress = Math.round((goal.current / goal.target) * 100);
            const isComplete = progress >= 100;
            return `
                <div class="card goal-card">
                    <div class="goal-header">
                        <div style="flex: 1;">
                            <div class="goal-title">${goal.title}</div>
                            <div style="font-size: 14px; color: var(--gray-dark); margin-top: 4px;">${goal.description}</div>
                            <div style="margin-top: 8px; display: flex; gap: 8px;">
                                <span class="category-badge">${goal.category}</span>
                                ${goal.deadline ? `<span class="text-small text-muted">📅 ${formatDate(goal.deadline)}</span>` : ''}
                            </div>
                        </div>
                        ${isComplete ? '<div style="font-size: 32px;">✅</div>' : ''}
                    </div>
                    <div class="progress-bar-container">
                        <div class="progress-bar" style="width: ${Math.min(progress, 100)}%;"></div>
                    </div>
                    <div class="flex-between" style="margin-top: 12px;">
                        <div class="goal-progress-text">${goal.current} / ${goal.target} (${progress}%)</div>
                        <div style="display: flex; gap: 8px;">
                            <button class="btn-small btn-secondary" onclick="updateGoalProgress(${goal.id}, -1)">-</button>
                            <button class="btn-small btn-secondary" onclick="updateGoalProgress(${goal.id}, 1)">+</button>
                            <button class="btn-small btn-danger" onclick="deleteGoal(${goal.id})">🗑️</button>
                        </div>
                    </div>
                </div>
            `;
        }).join('')}
    </div>
`;
```

}

// Page: SETTINGS
function renderSettings() {
const app = document.getElementById(‘app’);
document.getElementById(‘page-title’).innerText = “Settings”;
document.getElementById(‘header-actions’).innerHTML = ‘’;

```
app.innerHTML = `
    <div class="card">
        <h3>Categories</h3>
        <p class="text-muted text-small mb-2">Manage your task categories</p>
        <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px;">
            ${store.categories.map(cat => `
                <span class="category-badge" style="display: flex; align-items: center; gap: 6px;">
                    ${cat}
                    <span onclick="deleteCategory('${cat}')" style="cursor: pointer; opacity: 0.6;">×</span>
                </span>
            `).join('')}
        </div>
        <div style="display: flex; gap: 8px;">
            <input type="text" id="newCategory" placeholder="New category name..." style="margin: 0;">
            <button class="btn btn-small" onclick="addCategory()" style="width: auto; padding: 12px 24px;">Add</button>
        </div>
    </div>

    <div class="card">
        <h3>Statistics</h3>
        <div class="card-grid">
            <div class="stat-card">
                <div class="stat-number">${store.stats.totalTasksCompleted}</div>
                <div class="stat-label">Total Completed</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${store.stats.currentStreak}</div>
                <div class="stat-label">Current Streak</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${store.stats.longestStreak}</div>
                <div class="stat-label">Longest Streak</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${store.journal.length}</div>
                <div class="stat-label">Journal Entries</div>
            </div>
        </div>
    </div>

    <div class="card">
        <h3>Data Management</h3>
        <p class="text-muted text-small mb-2">Export or reset your data</p>
        <button class="btn btn-secondary" onclick="exportData()">📥 Export Data (JSON)</button>
        <button class="btn btn-secondary" onclick="importDataPrompt()">📤 Import Data</button>
        <button class="btn btn-danger" onclick="clearData()">🗑️ Reset All Data</button>
    </div>

    <div class="card">
        <h3>About</h3>
        <p class="text-muted text-small">Jordy Life OS v2.0</p>
        <p class="text-muted text-small">Built for productivity and mindfulness</p>
    </div>
`;
```

}

// — 4. MODAL FUNCTIONS —

function openAddTaskModal() {
const modal = `<div class="modal-overlay" onclick="closeModal(event)"> <div class="modal" onclick="event.stopPropagation()"> <div class="modal-header"> <div class="modal-title">Add New Task</div> </div> <div class="modal-body"> <div class="form-group"> <label class="form-label">Task Name</label> <input type="text" id="modalTaskText" placeholder="What needs to be done?"> </div> <div class="form-group"> <label class="form-label">Category</label> <select id="modalTaskCategory"> ${store.categories.map(cat =>`<option value="${cat}">${cat}</option>`).join('')} </select> </div> <div class="form-group"> <label class="form-label">Priority</label> <select id="modalTaskPriority"> <option value="low">Low</option> <option value="medium" selected>Medium</option> <option value="high">High</option> </select> </div> <div class="form-group"> <label class="form-label">Due Date (Optional)</label> <input type="date" id="modalTaskDueDate"> </div> </div> <div class="modal-footer"> <button class="btn btn-secondary" onclick="closeModal()">Cancel</button> <button class="btn" onclick="addTaskFromModal()">Add Task</button> </div> </div> </div> `;
document.getElementById(‘modal-container’).innerHTML = modal;
}

function openAddJournalModal() {
const modal = `<div class="modal-overlay" onclick="closeModal(event)"> <div class="modal" onclick="event.stopPropagation()"> <div class="modal-header"> <div class="modal-title">New Journal Entry</div> </div> <div class="modal-body"> <div class="form-group"> <label class="form-label">How are you feeling?</label> <div style="display: flex; gap: 12px; font-size: 32px; margin-bottom: 16px;"> <span onclick="selectMood('😊')" style="cursor: pointer; opacity: 0.5;" class="mood-option">😊</span> <span onclick="selectMood('😐')" style="cursor: pointer; opacity: 0.5;" class="mood-option">😐</span> <span onclick="selectMood('😔')" style="cursor: pointer; opacity: 0.5;" class="mood-option">😔</span> <span onclick="selectMood('😤')" style="cursor: pointer; opacity: 0.5;" class="mood-option">😤</span> <span onclick="selectMood('🤔')" style="cursor: pointer; opacity: 0.5;" class="mood-option">🤔</span> <span onclick="selectMood('🎉')" style="cursor: pointer; opacity: 0.5;" class="mood-option">🎉</span> </div> <input type="hidden" id="selectedMood" value="📝"> </div> <div class="form-group"> <label class="form-label">Your Thoughts</label> <textarea id="modalJournalText" rows="8" placeholder="What's on your mind today?"></textarea> </div> </div> <div class="modal-footer"> <button class="btn btn-secondary" onclick="closeModal()">Cancel</button> <button class="btn" onclick="addJournalFromModal()">Save Entry</button> </div> </div> </div>`;
document.getElementById(‘modal-container’).innerHTML = modal;
}

function openAddGoalModal() {
const modal = `<div class="modal-overlay" onclick="closeModal(event)"> <div class="modal" onclick="event.stopPropagation()"> <div class="modal-header"> <div class="modal-title">Create New Goal</div> </div> <div class="modal-body"> <div class="form-group"> <label class="form-label">Goal Title</label> <input type="text" id="modalGoalTitle" placeholder="e.g., Read 12 books this year"> </div> <div class="form-group"> <label class="form-label">Description</label> <textarea id="modalGoalDescription" rows="3" placeholder="What's this goal about?"></textarea> </div> <div class="form-group"> <label class="form-label">Category</label> <select id="modalGoalCategory"> ${store.categories.map(cat =>`<option value="${cat}">${cat}</option>`).join('')} </select> </div> <div class="form-group"> <label class="form-label">Target Number</label> <input type="number" id="modalGoalTarget" value="10" min="1"> </div> <div class="form-group"> <label class="form-label">Current Progress</label> <input type="number" id="modalGoalCurrent" value="0" min="0"> </div> <div class="form-group"> <label class="form-label">Deadline (Optional)</label> <input type="date" id="modalGoalDeadline"> </div> </div> <div class="modal-footer"> <button class="btn btn-secondary" onclick="closeModal()">Cancel</button> <button class="btn" onclick="addGoalFromModal()">Create Goal</button> </div> </div> </div> `;
document.getElementById(‘modal-container’).innerHTML = modal;
}

function selectMood(mood) {
document.getElementById(‘selectedMood’).value = mood;
document.querySelectorAll(’.mood-option’).forEach(el => {
el.style.opacity = el.innerText === mood ? ‘1’ : ‘0.5’;
});
}

function closeModal(event) {
if (event && event.target.className !== ‘modal-overlay’) return;
document.getElementById(‘modal-container’).innerHTML = ‘’;
}

// — 5. ACTION FUNCTIONS —

function router(page) {
// Update Navbar UI
document.querySelectorAll(’.nav-item’).forEach(el => el.classList.remove(‘active’));
const icons = document.querySelectorAll(’.nav-item’);
const pages = [‘home’, ‘habits’, ‘journal’, ‘goals’, ‘settings’];
const index = pages.indexOf(page);
if (index !== -1) icons[index].classList.add(‘active’);

```
// Render Page
if(page === 'home') renderHome();
if(page === 'habits') renderHabits();
if(page === 'journal') renderJournal();
if(page === 'goals') renderGoals();
if(page === 'settings') renderSettings();

// Scroll to top
window.scrollTo(0, 0);
```

}

function toggleTask(id, returnPage) {
const task = store.tasks.find(t => t.id === id);
if(task) {
task.done = !task.done;
if (task.done) {
store.stats.totalTasksCompleted++;
} else {
store.stats.totalTasksCompleted = Math.max(0, store.stats.totalTasksCompleted - 1);
}
save();
router(returnPage);
}
}

function addTaskFromModal() {
const text = document.getElementById(‘modalTaskText’).value.trim();
const category = document.getElementById(‘modalTaskCategory’).value;
const priority = document.getElementById(‘modalTaskPriority’).value;
const dueDate = document.getElementById(‘modalTaskDueDate’).value || null;

```
if(text) {
    store.tasks.push({ 
        id: Date.now(), 
        text: text, 
        done: false,
        category: category,
        priority: priority,
        dueDate: dueDate,
        createdAt: new Date().toISOString()
    });
    save();
    closeModal();
    router('habits');
}
```

}

function deleteTask(id) {
if(confirm(“Delete this task?”)) {
store.tasks = store.tasks.filter(t => t.id !== id);
save();
router(‘habits’);
}
}

function editTask(id) {
const task = store.tasks.find(t => t.id === id);
if (!task) return;

```
const modal = `
    <div class="modal-overlay" onclick="closeModal(event)">
        <div class="modal" onclick="event.stopPropagation()">
            <div class="modal-header">
                <div class="modal-title">Edit Task</div>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label class="form-label">Task Name</label>
                    <input type="text" id="editTaskText" value="${task.text}">
                </div>
                <div class="form-group">
                    <label class="form-label">Category</label>
                    <select id="editTaskCategory">
                        ${store.categories.map(cat => `<option value="${cat}" ${task.category === cat ? 'selected' : ''}>${cat}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Priority</label>
                    <select id="editTaskPriority">
                        <option value="low" ${task.priority === 'low' ? 'selected' : ''}>Low</option>
                        <option value="medium" ${task.priority === 'medium' ? 'selected' : ''}>Medium</option>
                        <option value="high" ${task.priority === 'high' ? 'selected' : ''}>High</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Due Date</label>
                    <input type="date" id="editTaskDueDate" value="${task.dueDate || ''}">
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button class="btn" onclick="saveTaskEdit(${id})">Save Changes</button>
            </div>
        </div>
    </div>
`;
document.getElementById('modal-container').innerHTML = modal;
```

}

function saveTaskEdit(id) {
const task = store.tasks.find(t => t.id === id);
if (!task) return;

```
task.text = document.getElementById('editTaskText').value.trim();
task.category = document.getElementById('editTaskCategory').value;
task.priority = document.getElementById('editTaskPriority').value;
task.dueDate = document.getElementById('editTaskDueDate').value || null;

save();
closeModal();
router('habits');
```

}

function addJournalFromModal() {
const text = document.getElementById(‘modalJournalText’).value.trim();
const mood = document.getElementById(‘selectedMood’).value;

```
if(text) {
    const date = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    store.journal.push({ 
        id: Date.now(), 
        date: date, 
        text: text,
        mood: mood,
        timestamp: new Date().toISOString()
    });
    save();
    closeModal();
    router('journal');
}
```

}

function deleteJournalEntry(id) {
if(confirm(“Delete this journal entry?”)) {
store.journal = store.journal.filter(e => e.id !== id);
save();
router(‘journal’);
}
}

function addGoalFromModal() {
const title = document.getElementById(‘modalGoalTitle’).value.trim();
const description = document.getElementById(‘modalGoalDescription’).value.trim();
const category = document.getElementById(‘modalGoalCategory’).value;
const target = parseInt(document.getElementById(‘modalGoalTarget’).value);
const current = parseInt(document.getElementById(‘modalGoalCurrent’).value);
const deadline = document.getElementById(‘modalGoalDeadline’).value || null;

```
if(title && target > 0) {
    store.goals.push({
        id: Date.now(),
        title: title,
        description: description,
        category: category,
        target: target,
        current: current,
        deadline: deadline
    });
    save();
    closeModal();
    router('goals');
}
```

}

function updateGoalProgress(id, delta) {
const goal = store.goals.find(g => g.id === id);
if (goal) {
goal.current = Math.max(0, Math.min(goal.target, goal.current + delta));
save();
router(‘goals’);
}
}

function deleteGoal(id) {
if(confirm(“Delete this goal?”)) {
store.goals = store.goals.filter(g => g.id !== id);
save();
router(‘goals’);
}
}

function addCategory() {
const input = document.getElementById(‘newCategory’);
const name = input.value.trim();
if (name && !store.categories.includes(name)) {
store.categories.push(name);
input.value = ‘’;
save();
router(‘settings’);
}
}

function deleteCategory(name) {
if(confirm(`Delete category "${name}"? Tasks with this category will be kept but need reassignment.`)) {
store.categories = store.categories.filter(c => c !== name);
save();
router(‘settings’);
}
}

function exportData() {
const dataStr = JSON.stringify(store, null, 2);
const dataBlob = new Blob([dataStr], {type: ‘application/json’});
const url = URL.createObjectURL(dataBlob);
const link = document.createElement(‘a’);
link.href = url;
link.download = `jordy-life-os-backup-${new Date().toISOString().split('T')[0]}.json`;
link.click();
URL.revokeObjectURL(url);
}

function importDataPrompt() {
const input = document.createElement(‘input’);
input.type = ‘file’;
input.accept = ‘application/json’;
input.onchange = (e) => {
const file = e.target.files[0];
const reader = new FileReader();
reader.onload = (event) => {
try {
const imported = JSON.parse(event.target.result);
if(confirm(“This will replace all current data. Continue?”)) {
Object.assign(store, imported);
save();
location.reload();
}
} catch(err) {
alert(“Invalid JSON file”);
}
};
reader.readAsText(file);
};
input.click();
}

function clearData() {
if(confirm(“Are you sure? This will delete ALL your data permanently.”)) {
if(confirm(“Last chance! This action cannot be undone.”)) {
localStorage.removeItem(‘havenData’);
location.reload();
}
}
}

// — 6. INITIALIZATION —
loadData();
router(‘home’);