// 1. Define the Data
const data = {
    task: {
        title: "Finalize Design System",
        desc: "Review typography scale and color tokens for the new proposal.",
        time: "Due in 4 hours",
        tag: "Priority"
    },
    stats: {
        balance: 75
    },
    habits: [
        { name: "Morning Meditation", done: true },
        { name: "Drink 2L Water", done: false },
        { name: "Read 30 mins", done: false }
    ]
};

// 2. Create HTML Strings
const taskCard = `
    <div class="card">
        <span class="badge">${data.task.tag}</span>
        <h3 style="font-size: 20px; margin-bottom: 8px;">${data.task.title}</h3>
        <p style="color: #86868B; margin-bottom: 20px;">${data.task.desc}</p>
        <div style="font-size: 13px; color: #A1A1A6;">🕒 ${data.task.time}</div>
    </div>
`;

const statsCard = `
    <div class="card" style="text-align: center;">
        <div class="progress-circle">
            <div class="progress-inner">${data.stats.balance}%</div>
        </div>
        <h3 style="font-size: 16px; margin-bottom: 4px;">Day Balance</h3>
        <p style="font-size: 13px; color: #86868B;">You're doing great.</p>
    </div>
`;

const habitsCard = `
    <div class="card">
        <h3 style="font-size: 18px; margin-bottom: 16px;">Habits</h3>
        ${data.habits.map(habit => `
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                <div style="
                    width: 20px; height: 20px; 
                    border: 1px solid #ccc; border-radius: 6px;
                    ${habit.done ? 'background: #81B29A; border-color: #81B29A;' : ''}
                "></div>
                <span style="${habit.done ? 'text-decoration: line-through; color: #ccc;' : ''}">${habit.name}</span>
            </div>
        `).join('')}
    </div>
`;

// 3. Inject into the Page
const app = document.getElementById('app');
app.innerHTML = `
    <div class="grid">
        <div>
            ${taskCard}
            ${habitsCard}
        </div>
        <div>
            ${statsCard}
        </div>
    </div>
`;