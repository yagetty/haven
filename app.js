const SUPABASE_URL = "https://caqaigfhortcsbwmkhns.supabase.co";
const SUPABASE_KEY = "sb_publishable_Z0K7D_T_yqF86FmESMXvcw_UZM-4yn2";

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

function currentMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
}

async function loadBudget() {
  const month = currentMonth();

  const { data } = await supabase
    .from("budgets")
    .select("*")
    .eq("month", month)
    .single();

  if (data) {
    display(data.income, data.bills);
  }
}

function display(income, bills) {
  const left = income - bills;

  document.getElementById("income").innerText = `£${income}`;
  document.getElementById("bills").innerText = `£${bills}`;
  document.getElementById("left").innerText = `£${left}`;
}

async function saveBudget() {
  const income = Number(document.getElementById("incomeInput").value);
  const bills = Number(document.getElementById("billsInput").value);
  const month = currentMonth();

  await supabase.from("budgets").upsert({
    month,
    income,
    bills
  });

  display(income, bills);
}

loadBudget();