let offset = 0;

function getMonth(offset=0) {
  const d = new Date();
  d.setMonth(d.getMonth()+offset);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
}

function loadData() {
  return JSON.parse(localStorage.getItem("budget") || "{}");
}

function saveData(d) {
  localStorage.setItem("budget", JSON.stringify(d));
}

function initMonth() {
  const data = loadData();
  const m = getMonth(offset);

  if (!data[m]) {
    const prev = getMonth(offset-1);
    const recurring = data[prev]?.bills?.filter(b=>b.recurring) || [];
    data[m] = { income:0, bills:[...recurring] };
    saveData(data);
  }
}

function saveIncome() {
  const data = loadData();
  data[getMonth(offset)].income = Number(incomeInput.value);
  saveData(data);
  render();
}

function addBill() {
  const data = loadData();
  data[getMonth(offset)].bills.push({
    name: billName.value,
    amount: Number(billAmount.value),
    recurring: recurring.checked
  });
  saveData(data);
  render();
}

function deleteBill(i) {
  const data = loadData();
  data[getMonth(offset)].bills.splice(i,1);
  saveData(data);
  render();
}

function editBill(i) {
  const data = loadData();
  const b = data[getMonth(offset)].bills[i];
  const name = prompt("Edit name", b.name);
  const amount = prompt("Edit amount", b.amount);
  b.name = name;
  b.amount = Number(amount);
  saveData(data);
  render();
}

let chart;

function render() {
  initMonth();
  const data = loadData()[getMonth(offset)];

  monthLabel.innerText = getMonth(offset);

  let total = 0;
  billList.innerHTML = "";

  data.bills.forEach((b,i)=>{
    total += b.amount;
    const li = document.createElement("li");
    li.innerHTML =
      `${b.name} £${b.amount}
       <span>
         <button onclick="editBill(${i})">✏</button>
         <button onclick="deleteBill(${i})">🗑</button>
       </span>`;
    billList.appendChild(li);
  });

  income.innerText = `£${data.income}`;
  bills.innerText = `£${total}`;
  left.innerText = `£${data.income-total}`;

  const chartData = {
    labels:["Left","Bills"],
    datasets:[{
      data:[data.income-total,total],
      backgroundColor:["#34c759","#ff3b30"]
    }]
  };

  if(chart) chart.destroy();
  chart = new Chart(document.getElementById("chart"), {
    type:"doughnut",
    data:chartData
  });
}

function prevMonth(){ offset--; render(); }
function nextMonth(){ offset++; render(); }

function toggleDark(){
  document.body.classList.toggle("dark");
  localStorage.setItem("dark",document.body.classList.contains("dark"));
}

if(localStorage.getItem("dark")==="true") toggleDark();

render();