let offset = 0;

function month(o=0){
  const d = new Date();
  d.setMonth(d.getMonth()+o);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
}

function load(){
  return JSON.parse(localStorage.getItem("budget")||"{}");
}

function save(d){
  localStorage.setItem("budget",JSON.stringify(d));
}

function init(){
  const d = load();
  const m = month(offset);

  if(!d[m]){
    const prev = month(offset-1);
    const recurring = d[prev]?.bills?.filter(b=>b.recurring)||[];
    d[m] = {income:0,bills:[...recurring]};
    save(d);
  }
}

function saveIncome(){
  const d = load();
  d[month(offset)].income = Number(incomeInput.value||0);
  save(d);
  render();
}

function addBill(){
  const d = load();
  d[month(offset)].bills.push({
    name: billName.value,
    amount: Number(billAmount.value||0),
    recurring: recurring.checked
  });
  save(d);
  render();
}

function deleteBill(i){
  const d = load();
  d[month(offset)].bills.splice(i,1);
  save(d);
  render();
}

function editBill(i){
  const d = load();
  const b = d[month(offset)].bills[i];
  b.name = prompt("Bill name",b.name)||b.name;
  b.amount = Number(prompt("Amount",b.amount)||b.amount);
  save(d);
  render();
}

function render(){
  init();
  const d = load()[month(offset)];
  monthLabel.innerText = month(offset);

  let total = 0;
  billList.innerHTML = "";

  d.bills.forEach((b,i)=>{
    total+=b.amount;
    const li = document.createElement("li");
    li.innerHTML = `
      ${b.name} £${b.amount}
      <span>
        <button onclick="editBill(${i})">✏</button>
        <button onclick="deleteBill(${i})">🗑</button>
      </span>`;
    billList.appendChild(li);
  });

  income.innerText = `£${d.income}`;
  bills.innerText = `£${total}`;
  left.innerText = `£${d.income-total}`;
}

function prevMonth(){offset--;render();}
function nextMonth(){offset++;render();}

function toggleDark(){
  document.body.classList.toggle("dark");
  localStorage.setItem("dark",document.body.classList.contains("dark"));
}

if(localStorage.getItem("dark")==="true")toggleDark();

render();