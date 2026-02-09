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
d[mo]={income:0,bills:[...rec]};
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

function advice(i,l){
if(i===0)return"Income not detected. Awaiting input.";
if(l<0)return"Warning: expenditure exceeds safe threshold.";
if(l<i*0.1)return"Buffer critically low. Adjust behaviour.";
if(l>i*0.4)return"Surplus strong. Financial trajectory optimal.";
return"System stable. Continue current pattern.";
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
<button onclick="dlt(${i})">✕</button>`;
billList.appendChild(li);
});

const left=Math.max(0,d.income-total);

income.innerText=`£${d.income}`;
bills.innerText=`£${total}`;
left.innerText=`£${left}`;

leftBar.style.width=d.income?((left/d.income)*100)+"%":"0%";

aiAdvice.innerText=advice(d.income,left);
}

function dlt(i){
const d=load();
d[m(offset)].bills.splice(i,1);
save(d);
render();
}

function prevMonth(){offset--;render();}
function nextMonth(){offset++;render();}

render();

function renderYear(){
const data=load();
let html="",ti=0,tb=0;

for(const k in data){
let b=0;
data[k].bills.forEach(x=>b+=x.amount);
ti+=data[k].income;
tb+=b;

html+=`<div class="card">
<h3>${k}</h3>
Income £${data[k].income}<br>
Bills £${b}<br>
Left £${data[k].income-b}
</div>`;
}

html+=`<div class="card accent">
Year Income £${ti}<br>
Year Bills £${tb}<br>
Saved £${ti-tb}
</div>`;

document.getElementById("yearStats").innerHTML=html;
}