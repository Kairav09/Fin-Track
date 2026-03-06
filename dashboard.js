// ── Helpers ──────────────────────────────────────────────────────────────────
const getTxns    = () => JSON.parse(localStorage.getItem("transactions") || "[]");
const getBudgets = () => JSON.parse(localStorage.getItem("budgets") || "[]");
const saveTxns   = (t) => localStorage.setItem("transactions", JSON.stringify(t));
const saveBudgets = (b) => localStorage.setItem("budgets", JSON.stringify(b));

// ── Theme Toggle ──────────────────────────────────────────────────────────────
// Dark mode is always on — body.dark-mode kept for any remaining overrides
document.body.classList.add("dark-mode");
document.getElementById("themeToggle")?.addEventListener("click", function () {
  document.body.classList.toggle("dark-mode");
  localStorage.setItem("theme", document.body.classList.contains("dark-mode") ? "dark" : "light");
});

// ── Greeting ──────────────────────────────────────────────────────────────────
const displayName = ((localStorage.getItem("fullname") || localStorage.getItem("username") || "User").split(" ")[0]);
const hour = new Date().getHours();
const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
const headerTitle = document.querySelector(".header-left h1");
if (headerTitle) headerTitle.textContent = `${greeting}, ${displayName}! 👋`;

// ── Seed sample data on first visit ──────────────────────────────────────────
if (getTxns().length === 0) {
  saveTxns([
    { id: 1,  type: "income",  name: "Salary Deposit",     amount: 52000, category: "Salary",        date: "2026-02-14" },
    { id: 2,  type: "expense", name: "Rent Payment",        amount: 12500, category: "Housing",       date: "2026-02-01" },
    { id: 3,  type: "expense", name: "Grocery Shopping",    amount: 2450,  category: "Food & Dining", date: "2026-02-14" },
    { id: 4,  type: "expense", name: "Netflix Subscription",amount: 649,   category: "Entertainment", date: "2026-02-03" },
    { id: 5,  type: "expense", name: "Uber Ride",           amount: 320,   category: "Transportation",date: "2026-02-02" },
    { id: 6,  type: "expense", name: "Electricity Bill",    amount: 1850,  category: "Utilities",     date: "2026-02-01" },
    { id: 7,  type: "income",  name: "Freelance Project",   amount: 8500,  category: "Freelance",     date: "2026-02-10" },
    { id: 8,  type: "expense", name: "Restaurant Dinner",   amount: 1200,  category: "Food & Dining", date: "2026-02-12" },
    { id: 9,  type: "expense", name: "Movie Tickets",       amount: 700,   category: "Entertainment", date: "2026-02-09" },
    { id: 10, type: "expense", name: "Fuel",                amount: 2500,  category: "Transportation",date: "2026-02-07" },
  ]);
}

// ── Animate stat counter ──────────────────────────────────────────────────────
function animateCount(el, target, prefix) {
  const start = performance.now();
  (function step(now) {
    const eased = 1 - Math.pow(1 - Math.min((now - start) / 900, 1), 3);
    el.textContent = prefix + Math.round(target * eased).toLocaleString("en-IN");
    if (eased < 1) requestAnimationFrame(step);
  })(start);
}

function updateStats() {
  const txns = getTxns();
  const totalIncome   = txns.filter(t => t.type === "income") .reduce((s, t) => s + t.amount, 0);
  const totalExpenses = txns.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const balance = totalIncome - totalExpenses;
  animateCount(document.getElementById("statBalance"),  Math.abs(balance),  balance < 0 ? "-₹" : "₹");
  animateCount(document.getElementById("statIncome"),   totalIncome,  "₹");
  animateCount(document.getElementById("statExpenses"), totalExpenses, "₹");
  animateCount(document.getElementById("statSavings"),  Math.max(balance, 0), "₹");
}

// ── Spending Overview Chart ───────────────────────────────────────────────────
const chartContainer = document.querySelector(".chart-container");
const chartPeriod    = document.getElementById("chartPeriod");

function renderChart() {
  if (!chartContainer) return;
  const transactions = getTxns();
  if (transactions.length === 0) {
    chartContainer.innerHTML = '<p style="text-align:center;color:#94a3b8;padding:80px 24px;font-size:14px;">No transaction data to display.</p>';
    return;
  }
  const days = parseInt(chartPeriod.value);
  const today = new Date(); today.setHours(23, 59, 59, 999);
  const startDate = new Date(today); startDate.setDate(startDate.getDate() - days + 1); startDate.setHours(0, 0, 0, 0);
  const filtered = transactions.filter(t => { const d = new Date(t.date); return d >= startDate && d <= today; });

  if (filtered.length === 0) {
    chartContainer.innerHTML = `<p style="text-align:center;color:#94a3b8;padding:80px 24px;font-size:14px;">No transactions in the selected period.</p>`;
    return;
  }

  let groups = [];
  if (days === 7) {
    for (let i = 0; i < 7; i++) {
      const d = new Date(startDate); d.setDate(d.getDate() + i);
      groups.push({ label: d.toLocaleDateString("en-IN", { weekday: "short" }), dateStr: d.toISOString().split("T")[0], income: 0, expense: 0 });
    }
    filtered.forEach(t => { const g = groups.find(g => g.dateStr === t.date); if (g) g[t.type] += t.amount; });
  } else {
    const chunk = days === 30 ? 5 : 7;
    const count = days === 30 ? 6 : 12;
    for (let i = 0; i < count; i++) {
      const s = new Date(startDate); s.setDate(s.getDate() + i * chunk);
      const e = new Date(s); e.setDate(e.getDate() + chunk - 1);
      const label = days === 30 ? s.toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "W" + (i + 1);
      groups.push({ label, start: s, end: e, income: 0, expense: 0 });
    }
    filtered.forEach(t => {
      const d = new Date(t.date);
      const g = groups.find(g => d >= g.start && d <= g.end);
      if (g) g[t.type] += t.amount;
    });
  }

  const maxVal = Math.max(...groups.map(g => Math.max(g.income, g.expense)), 1);
  const gridLines = [1, .75, .5, .25].map(pct => {
    const val = Math.round(maxVal * pct);
    return `<div class="chart-grid-line" style="bottom:${pct * 100}%;"><span class="chart-grid-label">${val >= 1000 ? "₹" + (val / 1000).toFixed(1) + "k" : "₹" + val}</span></div>`;
  }).join("");

  chartContainer.innerHTML = `
    <div class="chart-area">
      <div class="chart-grid">${gridLines}</div>
      <div class="chart-bars">${groups.map(g => `
        <div class="chart-bar-group">
          <div class="chart-bar-pair">
            <div class="chart-bar income-bar"  style="height:${(g.income  / maxVal) * 100}%;min-height:${g.income  > 0 ? "4px" : "0"}" title="Income: ₹${g.income.toLocaleString("en-IN")}"></div>
            <div class="chart-bar expense-bar" style="height:${(g.expense / maxVal) * 100}%;min-height:${g.expense > 0 ? "4px" : "0"}" title="Expense: ₹${g.expense.toLocaleString("en-IN")}"></div>
          </div>
          <span class="chart-bar-label">${g.label}</span>
        </div>`).join("")}
      </div>
    </div>`;
  void chartContainer.offsetHeight; // force reflow for bar animations
}
chartPeriod?.addEventListener("change", renderChart);

// ── Category Breakdown ────────────────────────────────────────────────────────
const categoryStyles = {
  Housing:         { bg: "#fef3c7", color: "#f59e0b", icon: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" },
  "Food & Dining": { bg: "#dbeafe", color: "#3b82f6", icon: "M3 6h18M3 12h18M3 18h18" },
  Entertainment:   { bg: "#fce7f3", color: "#ec4899", icon: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM12 6v6l4 2" },
  Transportation:  { bg: "#e0e7ff", color: "#6366f1", icon: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" },
  Shopping:        { bg: "#fef3c7", color: "#f59e0b", icon: "M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18" },
  Utilities:       { bg: "#dcfce7", color: "#22c55e", icon: "M13 2L3 14h9l-1 8 10-12h-9l1-8" },
  Salary:          { bg: "#d1fae5", color: "#10b981", icon: "M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" },
  Freelance:       { bg: "#e0e7ff", color: "#6366f1", icon: "M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" },
  Other:           { bg: "#f1f5f9", color: "#64748b", icon: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" },
};

function categoryHTML(category, amount, totalExpenses) {
  const pct   = Math.round((amount / totalExpenses) * 100);
  const style = categoryStyles[category] || categoryStyles["Other"];
  return `<div class="category-item">
    <div class="category-info">
      <div class="category-icon" style="background:${style.bg}">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="${style.icon}" stroke="${style.color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </div>
      <div class="category-details">
        <span class="category-name">${category}</span>
        <span class="category-amount">₹${amount.toLocaleString("en-IN")}</span>
      </div>
    </div>
    <div class="category-progress">
      <div class="progress-bar"><div class="progress-fill" style="width:${pct}%;background:${style.color}"></div></div>
      <span class="category-percent">${pct}%</span>
    </div>
  </div>`;
}

function getCategoryData() {
  const expenses = getTxns().filter(t => t.type === "expense");
  const incomes  = getTxns().filter(t => t.type === "income");
  const totalExpenses = expenses.reduce((s, t) => s + t.amount, 0);
  const totalIncome   = incomes.reduce((s, t)  => s + t.amount, 0);
  const catMap = {};
  expenses.forEach(t => { catMap[t.category] = (catMap[t.category] || 0) + t.amount; });
  const sorted = Object.entries(catMap).sort((a, b) => b[1] - a[1]);
  return { sorted, totalExpenses, totalIncome, expenses };
}

function renderCategories() {
  const catList  = document.getElementById("categoryList");
  const viewAll  = document.getElementById("viewAllCategories");
  const { sorted, totalExpenses, expenses } = getCategoryData();

  if (expenses.length === 0) {
    catList.innerHTML = '<p style="text-align:center;color:#94a3b8;padding:24px;font-size:14px;">No expenses to show yet.</p>';
    if (viewAll) viewAll.style.display = "none";
    return;
  }
  if (viewAll) { viewAll.style.display = sorted.length > 3 ? "inline-block" : "none"; viewAll.textContent = `View All (${sorted.length})`; }
  catList.innerHTML = sorted.slice(0, 3).map(([c, a]) => categoryHTML(c, a, totalExpenses)).join("");
}

// ── Transaction rendering helper ──────────────────────────────────────────────
function txnItemHTML(txn, onDelete = `deleteTransaction(${txn.id})`) {
  const inc  = txn.type === "income";
  const date = new Date(txn.date).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" });
  return `<div class="transaction-item">
    <div class="transaction-icon ${inc ? "income-icon" : "expense-icon"}">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="${inc ? "M12 19V5M5 12l7-7 7 7" : "M12 5v14M19 12l-7 7-7-7"}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </div>
    <div class="transaction-details">
      <span class="transaction-name">${txn.name}</span>
      <span class="transaction-date">${date} • ${txn.category}</span>
    </div>
    <span class="transaction-amount ${txn.type}">${inc ? "+" : "-"}₹${txn.amount.toLocaleString("en-IN")}</span>
    <div class="transaction-actions">
      <button class="action-btn edit-btn"   onclick="editTransaction(${txn.id})" title="Edit"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
      <button class="action-btn delete-btn" onclick="${onDelete}"                title="Delete"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
    </div>
  </div>`;
}

function renderTransactions() {
  const list = document.querySelector(".transaction-list");
  const txns = getTxns();
  list.innerHTML = txns.length === 0
    ? '<p style="text-align:center;color:#94a3b8;padding:24px;font-size:14px;">No transactions yet. Click "Add Transaction" to get started.</p>'
    : txns.slice(0, 5).map(t => txnItemHTML(t)).join("");
}

// ── Add / Edit Transaction Modal ──────────────────────────────────────────────
const modal    = document.getElementById("transactionModal");
const addBtn   = document.getElementById("addTransactionBtn");
const closeBtn = document.getElementById("closeModal");
const cancelBtn = document.getElementById("cancelModal");
const txnForm  = document.getElementById("transactionForm");
let selectedType = "expense";
let editingId    = null;

addBtn.addEventListener("click", () => {
  editingId = null;
  document.querySelector(".modal-header h3").textContent = "Add Transaction";
  document.querySelector("#transactionForm .btn-primary").textContent = "Add Transaction";
  modal.classList.add("active");
  document.getElementById("txnDate").valueAsDate = new Date();
});

function closeModal() {
  modal.classList.remove("active");
  txnForm.reset();
  selectedType = "expense"; editingId = null;
  document.querySelectorAll(".type-btn").forEach(b => b.classList.remove("active"));
  document.querySelector('.type-btn[data-type="expense"]').classList.add("active");
  document.querySelector(".modal-header h3").textContent = "Add Transaction";
  document.querySelector("#transactionForm .btn-primary").textContent = "Add Transaction";
}
closeBtn.addEventListener("click", closeModal);
cancelBtn.addEventListener("click", closeModal);
modal.addEventListener("click", e => { if (e.target === modal) closeModal(); });

document.querySelectorAll(".type-btn").forEach(btn => {
  btn.addEventListener("click", function () {
    document.querySelectorAll(".type-btn").forEach(b => b.classList.remove("active"));
    this.classList.add("active");
    selectedType = this.dataset.type;
  });
});

txnForm.addEventListener("submit", function (e) {
  e.preventDefault();
  const txn = {
    type:     selectedType,
    name:     document.getElementById("txnName").value,
    amount:   parseFloat(document.getElementById("txnAmount").value),
    category: document.getElementById("txnCategory").value,
    date:     document.getElementById("txnDate").value,
    id:       editingId || Date.now(),
  };
  let txns = getTxns();

  if (editingId) {
    const i = txns.findIndex(t => t.id === editingId);
    if (i !== -1) txns[i] = txn;
    saveTxns(txns); refreshAll(); alert("Transaction updated!"); closeModal();
  } else {
    const same = txns.find(t => t.name.toLowerCase() === txn.name.toLowerCase() && t.date === txn.date);
    let msg = "Transaction added successfully!";
    if (same) {
      if (same.type === txn.type) {
        if (confirm(`"${same.name}" already exists on this date (₹${same.amount.toLocaleString("en-IN")}).\nOK to add ₹${txn.amount.toLocaleString("en-IN")} to it, Cancel to create new.`)) {
          txns.find(t => t.id === same.id).amount += txn.amount; msg = "Amount added to existing transaction!";
        } else { txn.id = Date.now(); txns.unshift(txn); }
      } else {
        if (!confirm(`"${same.name}" exists as ${same.type}. OK to create new ${txn.type}?`)) return;
        txn.id = Date.now(); txns.unshift(txn);
      }
    } else { txns.unshift(txn); }
    saveTxns(txns); refreshAll(); alert(msg); closeModal();
  }
});

function deleteTransaction(id) {
  if (!confirm("Are you sure you want to delete this transaction?")) return;
  saveTxns(getTxns().filter(t => t.id !== id));
  refreshAll();
}

function editTransaction(id) {
  const txn = getTxns().find(t => t.id === id);
  if (!txn) return;
  editingId = id; selectedType = txn.type;
  document.getElementById("txnName").value     = txn.name;
  document.getElementById("txnAmount").value   = txn.amount;
  document.getElementById("txnCategory").value = txn.category;
  document.getElementById("txnDate").value     = txn.date;
  document.querySelectorAll(".type-btn").forEach(b => b.classList.remove("active"));
  document.querySelector(`.type-btn[data-type="${txn.type}"]`).classList.add("active");
  document.querySelector(".modal-header h3").textContent = "Edit Transaction";
  document.querySelector("#transactionForm .btn-primary").textContent = "Update Transaction";
  modal.classList.add("active");
}

// ── All Transactions Modal ────────────────────────────────────────────────────
const allTxnModal = document.getElementById("allTransactionsModal");
document.getElementById("viewAllTransactions")?.addEventListener("click", openAllTxnModal);
document.getElementById("closeAllTransactions")?.addEventListener("click", () => allTxnModal.classList.remove("active"));
allTxnModal?.addEventListener("click", e => { if (e.target === allTxnModal) allTxnModal.classList.remove("active"); });

function openAllTxnModal() {
  const txns   = getTxns();
  const inc    = txns.filter(t => t.type === "income") .reduce((s, t) => s + t.amount, 0);
  const exp    = txns.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  document.getElementById("txnModalSummary").innerHTML = `
    <div class="summary-card income-summary"><span class="summary-label">Total Income</span><span class="summary-value">₹${inc.toLocaleString("en-IN")}</span></div>
    <div class="summary-card expense-summary"><span class="summary-label">Total Expenses</span><span class="summary-value">₹${exp.toLocaleString("en-IN")}</span></div>`;
  document.getElementById("allTransactionsList").innerHTML = txns.length === 0
    ? '<p style="text-align:center;color:#94a3b8;padding:24px;font-size:14px;">No transactions yet.</p>'
    : txns.map(t => txnItemHTML(t, `deleteTransaction(${t.id}); openAllTxnModal()`)).join("");
  allTxnModal.classList.add("active");
}

// ── Category Modal ────────────────────────────────────────────────────────────
const catModal = document.getElementById("categoryModal");
document.getElementById("viewAllCategories")?.addEventListener("click", openCatModal);
document.getElementById("closeCategoryModal")?.addEventListener("click", () => catModal.classList.remove("active"));
catModal?.addEventListener("click", e => { if (e.target === catModal) catModal.classList.remove("active"); });

function openCatModal() {
  const { sorted, totalExpenses, totalIncome } = getCategoryData();
  document.getElementById("categoryModalSummary").innerHTML = `
    <div class="summary-card expense-summary"><span class="summary-label">Total Expenses</span><span class="summary-value">₹${totalExpenses.toLocaleString("en-IN")}</span></div>
    <div class="summary-card income-summary"><span class="summary-label">Total Income</span><span class="summary-value">₹${totalIncome.toLocaleString("en-IN")}</span></div>`;
  document.getElementById("categoryModalList").innerHTML = sorted.map(([c, a]) => categoryHTML(c, a, totalExpenses)).join("");
  catModal.classList.add("active");
}

// ── Budget Modal ──────────────────────────────────────────────────────────────
const budgetModal = document.getElementById("budgetModal");
document.getElementById("manageBudget")?.addEventListener("click", openBudgetModal);
document.getElementById("closeBudgetModal")?.addEventListener("click", () => budgetModal.classList.remove("active"));
budgetModal?.addEventListener("click", e => { if (e.target === budgetModal) budgetModal.classList.remove("active"); });

function getSpentByCategory(category) {
  const txns = getTxns();
  if (category === "Monthly Budget") return txns.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  return txns.filter(t => t.type === "expense" && t.category === category).reduce((s, t) => s + t.amount, 0);
}

function budgetItemHTML(b) {
  const spent   = getSpentByCategory(b.category);
  const pct     = Math.min(Math.round((spent / b.limit) * 100), 100);
  const remaining = Math.max(b.limit - spent, 0);
  const fillCls = pct >= 85 ? "success" : "";
  return `<div class="budget-item">
    <div class="budget-header">
      <span class="budget-name">${b.category}</span>
      <span class="budget-amount">₹${spent.toLocaleString("en-IN")} / ₹${b.limit.toLocaleString("en-IN")}</span>
    </div>
    <div class="budget-bar"><div class="budget-fill ${fillCls}" style="width:${pct}%"></div></div>
    <div style="display:flex;justify-content:space-between;align-items:center">
      <span class="budget-status">${pct}% used • ₹${remaining.toLocaleString("en-IN")} remaining</span>
      <div style="display:inline-flex;gap:4px">
        <button class="action-btn edit-btn" onclick="editDashboardBudget(${b.id})" title="Edit" style="width:28px;height:28px"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
        <button class="action-btn delete-btn" onclick="deleteBudget(${b.id})" title="Delete" style="width:28px;height:28px"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
      </div>
    </div>
  </div>`;
}

window.editDashboardBudget = function (id) {
  const budgets = getBudgets();
  const b = budgets.find(b => b.id === id);
  if (!b) return;
  const val = Number(prompt(`Enter new budget amount for ${b.category}:`, b.limit));
  if (!isNaN(val) && val > 0) { b.limit = val; saveBudgets(budgets); openBudgetModal(); renderDashboardBudgets(); }
  else if (val !== null) alert("Please enter a valid amount greater than 0.");
};

window.deleteBudget = function (id) {
  if (!confirm("Delete this budget?")) return;
  saveBudgets(getBudgets().filter(b => b.id !== id));
  renderDashboardBudgets(); openBudgetModal();
};

function openBudgetModal() {
  const budgets = getBudgets();
  const list = document.getElementById("budgetModalList");
  list.innerHTML = budgets.length === 0
    ? '<p style="text-align:center;color:#94a3b8;padding:24px;font-size:14px;">No budgets set yet. Add one above!</p>'
    : budgets.map(b => budgetItemHTML(b)).join("");
  // Scroll only when many items
  if (budgets.length > 3) { list.style.cssText += ";max-height:380px;overflow-y:auto;padding-right:18px"; }
  budgetModal.classList.add("active");
}

function renderDashboardBudgets() {
  const budgets = getBudgets();
  const list = document.querySelector(".budget-card .budget-list");
  if (!list) return;
  list.innerHTML = budgets.length === 0
    ? '<p style="text-align:center;color:#94a3b8;padding:24px;font-size:14px;">No budgets set. Click "Manage" to add budgets.</p>'
    : budgets.map(b => {
        const spent = getSpentByCategory(b.category);
        const pct   = Math.min(Math.round((spent / b.limit) * 100), 100);
        const rem   = Math.max(b.limit - spent, 0);
        return `<div class="budget-item">
          <div class="budget-header">
            <span class="budget-name">${b.category}</span>
            <span class="budget-amount">₹${spent.toLocaleString("en-IN")} / ₹${b.limit.toLocaleString("en-IN")}</span>
          </div>
          <div class="budget-bar"><div class="budget-fill ${pct >= 85 ? "success" : ""}" style="width:${pct}%"></div></div>
          <span class="budget-status">${pct}% used • ₹${rem.toLocaleString("en-IN")} remaining</span>
        </div>`;
      }).join("");
}

// ── Mobile sidebar ────────────────────────────────────────────────────────────
const menuBtn = document.getElementById("menuBtn");
const sidebar = document.querySelector(".sidebar");
const overlay = document.getElementById("mobileOverlay");
if (menuBtn && sidebar && overlay) {
  menuBtn.addEventListener("click", () => { sidebar.classList.add("active"); overlay.classList.add("active"); });
  overlay.addEventListener("click", () => { sidebar.classList.remove("active"); overlay.classList.remove("active"); });
}

// ── Refresh all dashboard UI elements ────────────────────────────────────────
function refreshAll() {
  renderTransactions();
  updateStats();
  renderCategories();
  renderChart();
  renderDashboardBudgets();
}

// ── Default budgets on first visit ───────────────────────────────────────────
if (!localStorage.getItem("budgets")) {
  saveBudgets([
    { id: 1, category: "Monthly Budget", limit: 35000 },
    { id: 2, category: "Food & Dining",  limit: 10000 },
    { id: 3, category: "Entertainment",  limit: 5000  },
  ]);
}

// ── Init ──────────────────────────────────────────────────────────────────────
refreshAll();