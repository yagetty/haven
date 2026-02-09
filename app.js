let offset = 0;

function m(o=0){
  const d=new Date();
  d.setMonth(d.getMonth()+o);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
}

function load(){return JSON.parse(localStorage.getItem("budget")||"{}");}
function save(d){localStorage.setItem("budget",JSON.stringify(d));}

function init(){
  const d=load(),mo=m(offset);
  if(!d[mo]){
    const prev=m(offset-1);
    const rec=d[prev]?.bills?.filter(b=>b.recurring)||[];
    d[mo]={income:0,bills:[...rec],goal:0};
    save(d);
  }
}

function clearInputs(...ids){
  ids.forEach(id=>document.getElementById(id).value="");
}

function saveIncome(){
  const d=load();
  d[m(offset)].income=Number(incomeInput.value||0);
  save(d);
  clearInputs("incomeInput");
  render();
}

function addBill(){
  const d=load();
  d[m(offset)].bills.push({
    name:billName.value,
    amount:Number(billAmount.value||0),
    recurring:recurring.checked
  });
  save(d);
  clearInputs("billName","billAmount");
  render();
}

function setGoal(){
  const d=load();
  d[m(offset)].goal=Number(goalInput.value||0);
  save(d);
  clearInputs("goalInput");
  render();
}

function deleteBill(i){
  const d=load();
  d[m(offset)].bills.splice(i,1);
  save(d);
  render();
}

function editBill(i){
  const d=load(),b=d[m(offset)].bills[i];
  b.name=prompt("Bill",b.name)||b.name;
  b.amount=Number(prompt("Amount",b.amount)||b.amount);
  save(d);
  render();
}

function advice(income,bills,left,goal){
  if(income===0)return"Start by adding your monthly income.";
  if(left<0)return"You are overspending. Reduce bills immediately.";
  if(goal>0&&left>0)return`At this rate you'll hit your goal in ${Math.ceil(goal/left)} months.`;
  if(left>income*0.4)return"Excellent savings rate. You're financially strong.";
  if(left<income*0.1)return"Warning: very little buffer left this month.";
  return"Your budget is balanced. Maintain discipline.";
}

function render(){
  init();
  const d=load()[m(offset)];
  monthLabel.innerText=m(offset);

  let total=0;
  billList.innerHTML="";
  d.bills.forEach((b,i)=>{
    total+=b.amount;
    const li=document.createElement("li");
    li.innerHTML=`${b.name} £${b.amount}
      <span>
        <button onclick="editBill(${i})">✏</button>
        <button onclick="deleteBill(${i})">🗑</button>
      </span>`;
    billList.appendChild(li);
  });

  const left=d.income-total;

  income.innerText=`£${d.income}`;
  bills.innerText=`£${total}`;
  left.innerText=`£${left}`;

  leftBar.style.width=Math.max(0,(left/d.income)*100||0)+"%";

  savingsText.innerText=`£${left} / £${d.goal}`;
  savingsBar.style.width=d.goal?Math.min(100,(left/d.goal)*100)+"%":"0%";

  aiAdvice.innerText=advice(d.income,total,left,d.goal);
}

function prevMonth(){offset--;render();}
function nextMonth(){offset++;render();}

function toggleDark(){
  document.body.classList.toggle("dark");
  localStorage.setItem("dark",document.body.classList.contains("dark"));
}

if(localStorage.getItem("dark")==="true")toggleDark();

render();