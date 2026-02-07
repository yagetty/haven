/* =========================================
   CORE STATE MANAGEMENT
   ========================================= */
const Store = {
    data: {
        tasks: [],
        transactions: [],
        journal: [],
        notes: "",
        settings: {
            name: "My Life"
        }
    },
    
    init() {
        const saved = localStorage.getItem('life_os_v2');
        if (saved) {
            this.data = JSON.parse(saved);
        } else {
            // Seed initial data if empty
            this.data.tasks.push(
                { id: 1, title: 'Define Core Values', status: 'done', ikigai: 'passion', date: new Date().toISOString() },
                { id: 2, title: 'Draft Life Plan', status: 'progress', ikigai: 'mission', date: new Date().toISOString() }
            );
            this.data.transactions.push({ id: 1, desc: 'Initial Deposit', amount: 1000, type: 'income', ikigai: 'vocation' });
        }
    },

    save() {
        localStorage.setItem('life_os_v2', JSON.stringify(this.data));
        App.renderDashboard(); // Reactive update
    }
};

/* =========================================
   IKIGAI ENGINE
   ========================================= */
const Ikigai = {
    types: {
        passion: { label: 'What you Love', color: 'var(--accent-red)' },
        mission: { label: 'What the World Needs', color: 'var(--accent-blue)' },
        vocation: { label: 'What you can be Paid For', color: 'var(--accent-gold)' },
        profession: { label: 'What you are Good At', color: 'var(--accent-purple)' }
    },

    getTag(type) {
        if(!type || !this.types[type]) return '';
        const t = this.types[type];
        return `<span class="tag tag-${type === 'vocation' ? 'gold' : 'blue'}" style="color:${t.color}; background:${t.color}20">${t.label}</span>`;
    }
};

/* =========================================
   APPLICATION CONTROLLER
   ========================================= */
const App = {
    currentView: 'dashboard',

    init() {
        Store.init();
        this.setupNavigation();
        this.updateGreeting();
        this.renderDashboard();
        this.renderTasks();
        this.renderFinance();
        this.renderJournal();
        this.renderCalendar();
        
        // Load Notes
        document.getElementById('main-editor').value = Store.data.notes || "";
        document.getElementById('main-editor').addEventListener('input', (e) => {
            Store.data.notes = e.target.value;
            Store.save();
        });
    },

    setupNavigation() {
        document.querySelectorAll('.nav-item').forEach(btn => {
            btn.addEventListener('click', () => {
                const view = btn.dataset.view;
                this.switchView(view);
                
                // Update active state
                document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });

        // Task Filters
        document.querySelectorAll('.filter-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                this.renderTasks(chip.dataset.filter);
            });
        });
    },

    switchView(viewId) {
        this.currentView = viewId;
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        document.getElementById(`view-${viewId}`).classList.add('active');
        
        // Update Header Breadcrumbs
        document.getElementById('breadcrumbs').textContent = viewId.charAt(0).toUpperCase() + viewId.slice(1);
        
        // Update Global Action Button context
        const btn = document.getElementById('global-action-btn');
        btn.onclick = () => this.handleGlobalAction();
    },

    handleGlobalAction() {
        if (this.currentView === 'tasks') TaskManager.openModal();
        else if (this.currentView === 'finance') Finance.openModal();
        else if (this.currentView === 'journal') document.getElementById('journal-entry').focus();
        else TaskManager.openModal(); // Default
    },

    updateGreeting() {
        const hour = new Date().getHours();
        let text = "Good evening.";
        if (hour < 12) text = "Good morning.";
        else if (hour < 18) text = "Good afternoon.";
        document.getElementById('greeting').textContent = text;
    },

    /* --- DASHBOARD --- */
    renderDashboard() {
        const tasks = Store.data.tasks;
        
        // Metrics
        const passionCount = tasks.filter(t => t.ikigai === 'passion' && !t.done).length;
        const missionCount = tasks.filter(t => t.ikigai === 'mission' && t.status !== 'done').length;
        const vocationVal = Store.data.transactions.filter(t => t.ikigai === 'vocation' && t.type === 'income').reduce((a,b) => a + b.amount, 0);

        document.getElementById('metric-passion').textContent = passionCount;
        document.getElementById('metric-mission').textContent = missionCount;
        document.getElementById('metric-vocation').textContent = `$${vocationVal.toLocaleString()}`;

        // Focus List (Top 3 incomplete)
        const focusTasks = tasks.filter(t => t.status !== 'done').slice(0, 3);
        const listHtml = focusTasks.map(t => `
            <div class="task-item ${t.status === 'done' ? 'done' : ''}" onclick="TaskManager.toggle(${t.id})">
                <div class="task-checkbox"></div>
                <div class="task-content">
                    <div class="task-title">${t.title}</div>
                </div>
                <div class="task-meta">
                    ${Ikigai.getTag(t.ikigai)}
                </div>
            </div>
        `).join('');
        document.getElementById('dashboard-focus-list').innerHTML = listHtml || '<div style="color:var(--text-tertiary); padding:10px;">All clear. Enjoy the moment.</div>';

        // Resource Snapshot (Mockup for demo)
        document.getElementById('resource-snapshot').innerHTML = `
            <div style="margin-bottom:8px; display:flex; justify-content:space-between; font-size:12px;">
                <span>Vocation Health</span> <span style="color:var(--accent-green)">Strong</span>
            </div>
            <div style="height:4px; background:rgba(255,255,255,0.1); border-radius:2px; overflow:hidden;">
                <div style="width:75%; height:100%; background:var(--accent-green);"></div>
            </div>
        `;
    },

    /* --- TASK MANAGER --- */
    renderTasks(filter = 'all') {
        const cols = { backlog: [], progress: [], done: [] };
        
        Store.data.tasks.forEach(t => {
            if (filter !== 'all' && t.ikigai !== filter) return;
            if (cols[t.status]) cols[t.status].push(t);
        });

        const renderList = (list) => list.map(t => `
            <div class="task-item ${t.status === 'done' ? 'done' : ''}" onclick="TaskManager.toggle(${t.id})">
                <div class="task-checkbox"></div>
                <div class="task-content">
                    <div class="task-title">${t.title}</div>
                    <div class="task-meta">
                        ${Ikigai.getTag(t.ikigai)}
                        <span>${new Date(t.date).toLocaleDateString(undefined, {month:'short', day:'numeric'})}</span>
                    </div>
                </div>
            </div>
        `).join('');

        document.getElementById('col-backlog').innerHTML = renderList(cols.backlog);
        document.getElementById('col-progress').innerHTML = renderList(cols.progress);
        document.getElementById('col-done').innerHTML = renderList(cols.done);
    },

    /* --- FINANCE --- */
    renderFinance() {
        let income = 0, expense = 0;
        Store.data.transactions.forEach(t => {
            if (t.type === 'income') income += t.amount;
            else expense += t.amount;
        });

        document.getElementById('fin-income').textContent = `$${income.toLocaleString()}`;
        document.getElementById('fin-expense').textContent = `$${expense.toLocaleString()}`;
        
        const net = income - expense;
        const netEl = document.getElementById('fin-net');
        netEl.textContent = `$${net.toLocaleString()}`;
        netEl.style.color = net >= 0 ? 'var(--accent-green)' : 'var(--accent-red)';

        // ROI List (Income transactions linked to Vocation)
        const roi = Store.data.transactions.filter(t => t.ikigai === 'vocation' && t.type === 'income');
        document.getElementById('ikigai-roi-list').innerHTML = roi.length ? roi.map(t => 
            `<div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:4px;">
                <span>${t.desc}</span> <span style="color:var(--accent-green)">+$${t.amount}</span>
            </div>`
        ).join('') : '<div style="font-size:12px; color:var(--text-tertiary)">No vocation revenue tracked.</div>';
    },

    /* --- CALENDAR --- */
    renderCalendar() {
        const now = new Date();
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        document.getElementById('cal-month-year').textContent = `${monthNames[now.getMonth()]} ${now.getFullYear()}`;

        const grid = document.getElementById('calendar-grid');
        let html = '';
        // Headers
        ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].forEach(d => html += `<div class="cal-day header">${d}</div>`);
        // Days (Simple placeholder logic for current month)
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).getDay();
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        
        for(let i=0; i<firstDay; i++) html += `<div></div>`;
        for(let i=1; i<=daysInMonth; i++) {
            html += `<div class="cal-day">${i}</div>`;
        }
        grid.innerHTML = html;
    },

    /* --- JOURNAL --- */
    renderJournal() {
        const container = document.getElementById('journal-history');
        container.innerHTML = Store.data.journal.map(j => `
            <div class="journal-entry">
                <div class="journal-date">${new Date(j.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                <div style="color:var(--text-secondary); line-height:1.5;">${j.text}</div>
            </div>
        `).join('');
    },

    /* --- UTILS --- */
    closeModal() {
        document.getElementById('modal-container').classList.add('hidden');
    }
};

/* =========================================
   SUB-MODULES
   ========================================= */
const TaskManager = {
    openModal() {
        const modal = document.getElementById('modal-container');
        const body = document.getElementById('modal-body');
        const title = document.getElementById('modal-title');
        const saveBtn = document.getElementById('modal-save-btn');

        title.textContent = "New Ikigai Task";
        body.innerHTML = `
            <div class="form-group">
                <label>Task Title</label>
                <input type="text" id="new-task-title" class="form-control" placeholder="e.g., Learn Japanese">
            </div>
            <div class="form-group">
                <label>Ikigai Alignment</label>
                <select id="new-task-ikigai" class="form-control">
                    <option value="">Select Alignment...</option>
                    <option value="passion">What you Love</option>
                    <option value="mission">What the World Needs</option>
                    <option value="vocation">What you can be Paid For</option>
                    <option value="profession">What you are Good At</option>
                </select>
            </div>
        `;
        
        saveBtn.onclick = () => {
            const tTitle = document.getElementById('new-task-title').value;
            const tIkigai = document.getElementById('new-task-ikigai').value;
            if(!tTitle) return;

            Store.data.tasks.unshift({
                id: Date.now(),
                title: tTitle,
                ikigai: tIkigai,
                status: 'backlog',
                date: new Date().toISOString()
            });
            Store.save();
            App.closeModal();
        };

        modal.classList.remove('hidden');
    },

    toggle(id) {
        const task = Store.data.tasks.find(t => t.id === id);
        if(task) {
            // Simple cycle: backlog -> progress -> done -> backlog
            if(task.status === 'backlog') task.status = 'progress';
            else if(task.status === 'progress') task.status = 'done';
            else task.status = 'backlog';
            Store.save();
        }
    }
};

const Finance = {
    openModal() {
        const modal = document.getElementById('modal-container');
        const body = document.getElementById('modal-body');
        const title = document.getElementById('modal-title');
        const saveBtn = document.getElementById('modal-save-btn');

        title.textContent = "Log Resource Flow";
        body.innerHTML = `
            <div class="form-group">
                <label>Description</label>
                <input type="text" id="new-fin-desc" class="form-control" placeholder="e.g. Freelance Project">
            </div>
            <div class="form-group">
                <label>Amount</label>
                <input type="number" id="new-fin-amount" class="form-control" placeholder="0.00">
            </div>
            <div class="form-group">
                <label>Type</label>
                <select id="new-fin-type" class="form-control">
                    <option value="income">Income (Inflow)</option>
                    <option value="expense">Expense (Outflow)</option>
                </select>
            </div>
             <div class="form-group">
                <label>Ikigai Alignment</label>
                <select id="new-fin-ikigai" class="form-control">
                    <option value="">None</option>
                    <option value="vocation">Vocation (Paid)</option>
                    <option value="mission">Mission (Charity/Cost)</option>
                </select>
            </div>
        `;

        saveBtn.onclick = () => {
            const desc = document.getElementById('new-fin-desc').value;
            const amt = parseFloat(document.getElementById('new-fin-amount').value);
            const type = document.getElementById('new-fin-type').value;
            const ikigai = document.getElementById('new-fin-ikigai').value;
            
            if(!desc || isNaN(amt)) return;

            Store.data.transactions.push({
                id: Date.now(),
                desc, amount: amt, type, ikigai,
                date: new Date().toISOString()
            });
            Store.save();
            App.closeModal();
        };
        modal.classList.remove('hidden');
    }
};

const Journal = {
    save() {
        const text = document.getElementById('journal-entry').value;
        if(!text.trim()) return;
        
        Store.data.journal.unshift({
            id: Date.now(),
            text: text,
            date: new Date().toISOString()
        });
        Store.save();
        document.getElementById('journal-entry').value = '';
        App.renderJournal();
    }
};

// Start the engine
document.addEventListener('DOMContentLoaded', () => App.init());