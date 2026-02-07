// --- 1. STATE MANAGEMENT (Simple Data Store) ---
const store = {
    tasks: [
        { id: 1, text: "Review Design Tokens", done: false },
        { id: 2, text: "Morning Walk", done: true }
    ],
    journal: [
        { id: 1, date: "Oct 24", text: "Feeling focused today. The new color palette looks calm." }
    ]
};

// Load data from phone memory if it exists
if(localStorage.getItem('havenData')) {
    const saved = JSON.parse(localStorage.getItem('havenData'));
    store.tasks = saved.tasks || store.tasks;
    store.journal = saved.journal || store.journal;
}

// --- 2. RENDER FUNCTIONS (The "Pages") ---

// Page: HOME
function renderHome() {
    const app = document.getElementById('app');
    document.getElementById('page-title').innerText = "Dashboard";
    
    // Calculate Progress
    const total = store.tasks.length;
    const done = store.tasks.filter(t => t.done).length;
    const percent = total === 0 ? 0 : Math.round((done / total) * 100);

    app.innerHTML = `
        <div class="card" style="background: linear-gradient(135deg, #1D1D1F, #3D405B); color: white;">
            <h3>Focus Pulse</h3>
            <div style="font-size: 48px; font-weight: 700; margin: 20px 0;">${percent}%</div>
            <p style="opacity: 0.8;">Daily progress overview.</p>
        </div>

        <div class="card">
            <h3>Quick Tasks</h3>
            ${store.tasks.slice(0, 3).map(task => `
                <div class="habit-row">
                    <span style="${task.done ? 'text-decoration: line-through; color: #ccc;' : ''}">${task.text}</span>
                    <div class="checkbox ${task.done ? 'checked' : ''}" onclick="toggleTask(${task.id})">
                        ${task.done ? '✓' : ''}
                    </div>
                </div>
            `).join('')}
            <div style="margin-top:15px; font-size:14px; color:#86868B; text-align:center;">
                Go to Habits tab to manage full list
            </div>
        </div>
    `;
}

// Page: HABITS
function renderHabits() {
    const app = document.getElementById('app');
    document.getElementById('page-title').innerText = "Habits";

    app.innerHTML = `
        <div class="card">
            <input type="text" id="newTaskInput" placeholder="Add a new habit or task..." onkeypress="handleEnter(event)">
            <button class="btn" onclick="addTask()">Add Task</button>
        </div>

        ${store.tasks.map(task => `
            <div class="card">
                <div class="habit-row">
                    <span style="font-size:16px;">${task.text}</span>
                    <div class="checkbox ${task.done ? 'checked' : ''}" onclick="toggleTask(${task.id})">
                        ${task.done ? '✓' : ''}
                    </div>
                </div>
            </div>
        `).join('')}
        
        ${store.tasks.length === 0 ? '<p style="text-align:center; color:#ccc;">No habits yet.</p>' : ''}
    `;
}

// Page: JOURNAL
function renderJournal() {
    const app = document.getElementById('app');
    document.getElementById('page-title').innerText = "Journal";

    app.innerHTML = `
        <div class="card">
            <textarea id="journalInput" rows="4" style="width:100%; border:1px solid #E5E5EA; border-radius:12px; padding:15px; font-family:inherit; resize:none;" placeholder="What's on your mind?"></textarea>
            <button class="btn" onclick="addEntry()">Save Entry</button>
        </div>

        ${store.journal.reverse().map(entry => `
            <div class="card journal-entry">
                <div class="date-badge">${entry.date}</div>
                <p style="margin-top:8px; line-height:1.6;">${entry.text}</p>
            </div>
        `).join('')}
    `;
}

// Page: SETTINGS
function renderSettings() {
    const app = document.getElementById('app');
    document.getElementById('page-title').innerText = "Settings";
    app.innerHTML = `
        <div class="card">
            <h3>Appearance</h3>
            <p style="color:#86868B; margin-bottom:10px;">Theme: Warm Minimal (Default)</p>
        </div>
        <div class="card">
            <h3>Data</h3>
            <button class="btn" style="background: #E07A5F;" onclick="clearData()">Reset All Data</button>
        </div>
    `;
}

// --- 3. ACTIONS (The Logic) ---

function router(page) {
    // Update Navbar UI
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    // This is a simple way to highlight the clicked icon based on order
    const icons = document.querySelectorAll('.nav-item');
    if(page === 'home') icons[0].classList.add('active');
    if(page === 'habits') icons[1].classList.add('active');
    if(page === 'journal') icons[2].classList.add('active');
    if(page === 'settings') icons[3].classList.add('active');

    // Render Page
    if(page === 'home') renderHome();
    if(page === 'habits') renderHabits();
    if(page === 'journal') renderJournal();
    if(page === 'settings') renderSettings();
}

function toggleTask(id) {
    const task = store.tasks.find(t => t.id === id);
    if(task) {
        task.done = !task.done;
        save();
        router('habits'); // Re-render habits tab
    }
}

function addTask() {
    const input = document.getElementById('newTaskInput');
    const text = input.value.trim();
    if(text) {
        store.tasks.push({ id: Date.now(), text: text, done: false });
        input.value = '';
        save();
        router('habits');
    }
}

function handleEnter(e) {
    if(e.key === 'Enter') addTask();
}

function addEntry() {
    const input = document.getElementById('journalInput');
    const text = input.value.trim();
    if(text) {
        const date = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        store.journal.push({ id: Date.now(), date: date, text: text });
        input.value = '';
        save();
        router('journal');
    }
}

function clearData() {
    if(confirm("Are you sure? This will delete all your habits and journal entries.")) {
        localStorage.removeItem('havenData');
        location.reload();
    }
}

function save() {
    localStorage.setItem('havenData', JSON.stringify(store));
}

// --- 4. INIT ---
// Start on home page
router('home');