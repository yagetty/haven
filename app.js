// State management
const state = {
offset: 0,
get currentMonth() {
const d = new Date();
d.setMonth(d.getMonth() + this.offset);
return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}
};

// Storage utilities
const storage = {
load: () => JSON.parse(localStorage.getItem(“budget”) || “{}”),
save: (data) => localStorage.setItem(“budget”, JSON.stringify(data))
};

// Month utilities
const getMonth = (offset) => {
const d = new Date();
d.setMonth(d.getMonth() + offset);
return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

// Initialize month data
const initMonth = () => {
const data = storage.load();
const currentMonth = state.currentMonth;

if (!data[currentMonth]) {
const prevMonth = getMonth(state.offset - 1);
const recurringBills = data[prevMonth]?.bills?.filter(b => b.recurring) || [];
data[currentMonth] = {
income: 0,
bills: […recurringBills]
};
storage.save(data);
}
};

// AI Advice generator
const getAdvice = (income, remaining) => {
if (income === 0) return “⚠ SYSTEM AWAITING INCOME DATA”;
if (remaining < 0) return “⛔ CRITICAL: EXPENDITURE EXCEEDS INCOME”;
if (remaining < income * 0.1) return “⚠ WARNING: BUFFER CRITICALLY LOW”;
if (remaining > income * 0.4) return “✓ OPTIMAL: FINANCIAL TRAJECTORY STABLE”;
return “◆ SYSTEM NOMINAL”;
};

// Actions
const saveIncome = () => {
const data = storage.load();
const input = document.getElementById(‘incomeInput’);
data[state.currentMonth].income = Number(input.value || 0);
storage.save(data);
input.value = ‘’;
render();
};

const addBill = () => {
const data = storage.load();
const nameInput = document.getElementById(‘billName’);
const amountInput = document.getElementById(‘billAmount’);
const recurringCheckbox = document.getElementById(‘recurring’);

if (!nameInput.value || !amountInput.value) return;

data[state.currentMonth].bills.push({
name: nameInput.value,
amount: Number(amountInput.value || 0),
recurring: recurringCheckbox.checked
});

storage.save(data);
nameInput.value = ‘’;
amountInput.value = ‘’;
recurringCheckbox.checked = false;
render();
};

const deleteBill = (index) => {
const data = storage.load();
data[state.currentMonth].bills.splice(index, 1);
storage.save(data);
render();
};

const prevMonth = () => {
state.offset–;
render();
};

const nextMonth = () => {
state.offset++;
render();
};

// Main render function
const render = () => {
initMonth();
const data = storage.load()[state.currentMonth];

// Update month label
document.getElementById(‘monthLabel’).textContent = state.currentMonth;

// Calculate totals
const totalBills = data.bills.reduce((sum, bill) => sum + bill.amount, 0);
let remaining = data.income - totalBills;

// Guard: prevent negative display when no income set
if (data.income === 0) remaining = 0;

// Update UI
document.getElementById(‘income’).textContent = `£${data.income.toLocaleString()}`;
document.getElementById(‘bills’).textContent = `£${totalBills.toLocaleString()}`;
document.getElementById(‘left’).textContent = `£${remaining.toLocaleString()}`;

// Update progress bar
const barWidth = data.income ? (remaining / data.income) * 100 : 0;
document.getElementById(‘leftBar’).style.width = `${Math.max(0, barWidth)}%`;

// Render bills list
const billList = document.getElementById(‘billList’);
billList.innerHTML = data.bills.map((bill, index) => `<li class="bill-item"> <div class="bill-info"> <span class="bill-name">${bill.name}</span> <span class="bill-amount">£${bill.amount.toLocaleString()}</span> </div> <button onclick="deleteBill(${index})" class="delete-btn">×</button> </li>`).join(’’);

// Update AI advice
document.getElementById(‘aiAdvice’).textContent = getAdvice(data.income, remaining);
};

// Year view renderer
const renderYear = () => {
const data = storage.load();
let totalIncome = 0;
let totalBills = 0;

const monthCards = Object.keys(data).sort().map(month => {
const monthData = data[month];
const billsTotal = monthData.bills.reduce((sum, bill) => sum + bill.amount, 0);
let remaining = monthData.income - billsTotal;

```
if (monthData.income === 0) remaining = 0;

totalIncome += monthData.income;
totalBills += billsTotal;

return `
  <div class="card year-card">
    <h3>${month}</h3>
    <div class="year-stat">Income <span>£${monthData.income.toLocaleString()}</span></div>
    <div class="year-stat">Bills <span>£${billsTotal.toLocaleString()}</span></div>
    <div class="year-stat highlight">Left <span>£${remaining.toLocaleString()}</span></div>
  </div>
`;
```

}).join(’’);

const summaryCard = `<div class="card accent year-summary"> <h3>ANNUAL SUMMARY</h3> <div class="year-stat">Total Income <span>£${totalIncome.toLocaleString()}</span></div> <div class="year-stat">Total Bills <span>£${totalBills.toLocaleString()}</span></div> <div class="year-stat highlight">Total Saved <span>£${(totalIncome - totalBills).toLocaleString()}</span></div> </div>`;

document.getElementById(‘yearStats’).innerHTML = monthCards + summaryCard;
};

// Initialize on load
document.addEventListener(‘DOMContentLoaded’, () => {
if (document.getElementById(‘yearStats’)) {
renderYear();
} else {
render();
}
});