let offset=0;

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

function clear(id){document.getElementById(id).value="";}

function saveIncome(){
const d=load();
d[m(offset)].income=Number(incomeInput.value||0);
save(d);
clear("incomeInput");
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
clear("billName");
clear("billAmount");
render();
}

function setGoal(){
const d=load();
d[m(offset)].goal=Number(goalInput.value||0);
save(d);
clear("goalInput");
render();
}

function advice(i,b,l){
if(i===0)return"Add your income first.";
if(l<0)return"Overspending. Cut bills.";
if(l<i*0.1)return"Very low buffer this month.";
if(l>i*0.4)return"Strong savings rate.";
return"Budget stable.";
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
<button onclick="dlt(${i})">🗑</button>`;
billList.appendChild(li);
});

const left=d.income-total;

income.innerText=`£${d.income}`;
bills.innerText=`£${total}`;
left.innerText=`£${left}`;

leftBar.style.width=(d.income?Math.max(0,(left/d.income)*100):0)+"%";

aiAdvice.innerText=advice(d.income,total,left);
}

function dlt(i){
const d=load();
d[m(offset)].bills.splice(i,1);
save(d);
render();
}

function prevMonth(){offset--;render();}
function nextMonth(){offset++;render();}

function toggleDark(){
document.body.classList.toggle("dark");
localStorage.setItem("dark",document.body.classList.contains("dark"));
}

if(localStorage.getItem("dark")==="true")toggleDark();

render();

function renderYear(){
const data=load();
let html="",yearTotal=0,yearIncome=0;

for(const m in data){
let bills=0;
data[m].bills.forEach(b=>bills+=b.amount);

yearIncome+=data[m].income;
yearTotal+=bills;

html+=`<div class="card">
<h3>${m}</h3>
Income £${data[m].income}<br>
Bills £${bills}<br>
Left £${data[m].income-bills}
</div>`;
}

html+=`<div class="card highlight">
Year Income £${yearIncome}<br>
Year Bills £${yearTotal}<br>
Saved £${yearIncome-yearTotal}
</div>`;

document.getElementById("yearStats").innerHTML=html;
}