// ---- Theme Toggle ----
const themeToggle = document.getElementById("themeToggle");
if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark-mode");
}
if (themeToggle) {
  themeToggle.addEventListener("click", function () {
    document.body.classList.toggle("dark-mode");
    localStorage.setItem(
      "theme",
      document.body.classList.contains("dark-mode") ? "dark" : "light",
    );
  });
}

// Display user's first name in the greeting
const fullname = localStorage.getItem("fullname");
const username = localStorage.getItem("username");
let displayName = (fullname || username || "User").split(" ")[0];

const hour = new Date().getHours();
let greeting = "Welcome back";
if (hour < 12) greeting = "Good morning";
else if (hour < 18) greeting = "Good afternoon";
else greeting = "Good evening";

const headerTitle = document.querySelector(".header-left h1");
if (headerTitle) {
  headerTitle.textContent = `${greeting}, ${displayName}! 👋`;
}

// Seed sample transactions on first visit or if all transactions were deleted
const existingTxns = JSON.parse(localStorage.getItem("transactions") || "[]");
if (existingTxns.length === 0) {
  const sampleTransactions = [
    {
      id: 1,
      type: "income",
      name: "Salary Deposit",
      amount: 52000,
      category: "Salary",
      date: "2026-02-14",
    },
    {
      id: 2,
      type: "expense",
      name: "Rent Payment",
      amount: 12500,
      category: "Housing",
      date: "2026-02-01",
    },
    {
      id: 3,
      type: "expense",
      name: "Grocery Shopping",
      amount: 2450,
      category: "Food & Dining",
      date: "2026-02-14",
    },
    {
      id: 4,
      type: "expense",
      name: "Netflix Subscription",
      amount: 649,
      category: "Entertainment",
      date: "2026-02-03",
    },
    {
      id: 5,
      type: "expense",
      name: "Uber Ride",
      amount: 320,
      category: "Transportation",
      date: "2026-02-02",
    },
    {
      id: 6,
      type: "expense",
      name: "Electricity Bill",
      amount: 1850,
      category: "Utilities",
      date: "2026-02-01",
    },
    {
      id: 7,
      type: "income",
      name: "Freelance Project",
      amount: 8500,
      category: "Freelance",
      date: "2026-02-10",
    },
    {
      id: 8,
      type: "expense",
      name: "Restaurant Dinner",
      amount: 1200,
      category: "Food & Dining",
      date: "2026-02-12",
    },
    {
      id: 9,
      type: "expense",
      name: "Movie Tickets",
      amount: 700,
      category: "Entertainment",
      date: "2026-02-09",
    },
    {
      id: 10,
      type: "expense",
      name: "Fuel",
      amount: 2500,
      category: "Transportation",
      date: "2026-02-07",
    },
  ];
  localStorage.setItem("transactions", JSON.stringify(sampleTransactions));
}

// Dynamic bar chart from transactions
const chartContainer = document.querySelector(".chart-container");
const chartPeriod = document.getElementById("chartPeriod");

function renderChart() {
  if (!chartContainer) return;

  const transactions = JSON.parse(localStorage.getItem("transactions") || "[]");

  if (transactions.length === 0) {
    chartContainer.innerHTML =
      '<p style="text-align:center; color:#94a3b8; padding:80px 24px; font-size:14px;">No transaction data to display. Add transactions to see your spending overview.</p>';
    return;
  }

  const days = parseInt(chartPeriod.value);
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  // Calculate start date
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - days + 1);
  startDate.setHours(0, 0, 0, 0);

  // Filter transactions within the period
  const filtered = transactions.filter((t) => {
    const txnDate = new Date(t.date);
    return txnDate >= startDate && txnDate <= today;
  });

  // Determine grouping based on period
  let groups = [];

  if (days === 7) {
    // Group by individual day
    for (let i = 0; i < 7; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split("T")[0];
      const label = d.toLocaleDateString("en-IN", { weekday: "short" });
      groups.push({ label, dateStr, income: 0, expense: 0 });
    }
    filtered.forEach((t) => {
      const g = groups.find((g) => g.dateStr === t.date);
      if (g) {
        if (t.type === "income") g.income += t.amount;
        else g.expense += t.amount;
      }
    });
  } else if (days === 30) {
    // Group by 5-day intervals (6 groups)
    for (let i = 0; i < 6; i++) {
      const gStart = new Date(startDate);
      gStart.setDate(gStart.getDate() + i * 5);
      const gEnd = new Date(gStart);
      gEnd.setDate(gEnd.getDate() + 4);
      const label = gStart.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
      });
      groups.push({ label, start: gStart, end: gEnd, income: 0, expense: 0 });
    }
    filtered.forEach((t) => {
      const txnDate = new Date(t.date);
      for (const g of groups) {
        if (txnDate >= g.start && txnDate <= g.end) {
          if (t.type === "income") g.income += t.amount;
          else g.expense += t.amount;
          break;
        }
      }
    });
  } else {
    // 90 days: group by week (approx 12 weeks)
    const numWeeks = 12;
    for (let i = 0; i < numWeeks; i++) {
      const wStart = new Date(startDate);
      wStart.setDate(wStart.getDate() + i * 7);
      const wEnd = new Date(wStart);
      wEnd.setDate(wEnd.getDate() + 6);
      const label = "W" + (i + 1);
      groups.push({ label, start: wStart, end: wEnd, income: 0, expense: 0 });
    }
    filtered.forEach((t) => {
      const txnDate = new Date(t.date);
      for (const g of groups) {
        if (txnDate >= g.start && txnDate <= g.end) {
          if (t.type === "income") g.income += t.amount;
          else g.expense += t.amount;
          break;
        }
      }
    });
  }

  const maxVal = Math.max(
    ...groups.map((g) => Math.max(g.income, g.expense)),
    1,
  );

  // Build grid lines (4 lines at 25%, 50%, 75%, 100%)
  const gridLines = [1, 0.75, 0.5, 0.25]
    .map((pct) => {
      const val = Math.round(maxVal * pct);
      const label = val >= 1000 ? `₹${(val / 1000).toFixed(1)}k` : `₹${val}`;
      return `<div class="chart-grid-line" style="bottom:${pct * 100}%;">
        <span class="chart-grid-label">${label}</span>
      </div>`;
    })
    .join("");

  chartContainer.innerHTML = `
    <div class="chart-area">
      <div class="chart-grid">${gridLines}</div>
      <div class="chart-bars">
        ${groups
          .map(
            (g) => `
          <div class="chart-bar-group">
            <div class="chart-bar-pair">
              <div class="chart-bar income-bar" style="height:${(g.income / maxVal) * 100}%; min-height:${g.income > 0 ? "4px" : "0"};" title="Income: ₹${g.income.toLocaleString("en-IN")}"></div>
              <div class="chart-bar expense-bar" style="height:${(g.expense / maxVal) * 100}%; min-height:${g.expense > 0 ? "4px" : "0"};" title="Expense: ₹${g.expense.toLocaleString("en-IN")}"></div>
            </div>
            <span class="chart-bar-label">${g.label}</span>
          </div>
        `,
          )
          .join("")}
      </div>
    </div>
  `;
}

// Listen for period change
if (chartPeriod) {
  chartPeriod.addEventListener("change", renderChart);
}

// ---- Add Transaction Modal ----
const modal = document.getElementById("transactionModal");
const addBtn = document.getElementById("addTransactionBtn");
const closeBtn = document.getElementById("closeModal");
const cancelBtn = document.getElementById("cancelModal");
const transactionForm = document.getElementById("transactionForm");
let selectedType = "expense";
let editingId = null;

// Open modal
addBtn.addEventListener("click", function () {
  editingId = null;
  document.querySelector(".modal-header h3").textContent = "Add Transaction";
  document.querySelector("#transactionForm .btn-primary").textContent =
    "Add Transaction";
  modal.classList.add("active");
  document.getElementById("txnDate").valueAsDate = new Date();
});

// Close modal
function closeModal() {
  modal.classList.remove("active");
  transactionForm.reset();
  selectedType = "expense";
  editingId = null;
  document
    .querySelectorAll(".type-btn")
    .forEach((btn) => btn.classList.remove("active"));
  document
    .querySelector('.type-btn[data-type="expense"]')
    .classList.add("active");
  document.querySelector(".modal-header h3").textContent = "Add Transaction";
  document.querySelector("#transactionForm .btn-primary").textContent =
    "Add Transaction";
}

closeBtn.addEventListener("click", closeModal);
cancelBtn.addEventListener("click", closeModal);

// Close on overlay click
modal.addEventListener("click", function (e) {
  if (e.target === modal) closeModal();
});

// Type toggle
document.querySelectorAll(".type-btn").forEach((btn) => {
  btn.addEventListener("click", function () {
    document
      .querySelectorAll(".type-btn")
      .forEach((b) => b.classList.remove("active"));
    this.classList.add("active");
    selectedType = this.dataset.type;
  });
});

// Save transaction (handles both add and edit)
transactionForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const transaction = {
    type: selectedType,
    name: document.getElementById("txnName").value,
    amount: parseFloat(document.getElementById("txnAmount").value),
    category: document.getElementById("txnCategory").value,
    date: document.getElementById("txnDate").value,
    id: editingId || Date.now(),
  };

  let transactions = JSON.parse(localStorage.getItem("transactions") || "[]");

  if (editingId) {
    // Edit mode: replace existing transaction
    const index = transactions.findIndex((t) => t.id === editingId);
    if (index !== -1) transactions[index] = transaction;

    localStorage.setItem("transactions", JSON.stringify(transactions));
    renderTransactions();
    updateStats();
    renderCategories();
    renderChart();
    alert("Transaction updated!");
    closeModal();
  } else {
    // Add mode: check for duplicate by name AND date (case-insensitive)
    const sameName = transactions.find(
      (t) =>
        t.name.toLowerCase() === transaction.name.toLowerCase() &&
        t.date === transaction.date,
    );

    let message = "";

    if (sameName) {
      if (sameName.type === transaction.type) {
        // Same name, date, and type — add amount to existing
        const choice = confirm(
          `"${sameName.name}" already exists on this date as ${sameName.type} (₹${sameName.amount.toLocaleString("en-IN")}).\n\nClick OK to add ₹${transaction.amount.toLocaleString("en-IN")} to it (new total: ₹${(sameName.amount + transaction.amount).toLocaleString("en-IN")}), or Cancel to create a new transaction.`,
        );

        if (choice) {
          const index = transactions.findIndex((t) => t.id === sameName.id);
          if (index !== -1) {
            transactions[index].amount += transaction.amount;
            transactions[index].category = transaction.category;
          }
          message = "Amount added to existing transaction!";
        } else {
          transaction.id = Date.now();
          transactions.unshift(transaction);
          message = "Transaction added successfully!";
        }
      } else {
        // Same name and date but different type — warn
        const choice = confirm(
          `"${sameName.name}" already exists on this date as ${sameName.type} (₹${sameName.amount.toLocaleString("en-IN")}), but you're adding it as ${transaction.type}.\n\nClick OK to create a new ${transaction.type} transaction, or Cancel to go back.`,
        );

        if (choice) {
          transaction.id = Date.now();
          transactions.unshift(transaction);
          message = "Transaction added successfully!";
        } else {
          return; // Go back to modal
        }
      }
    } else {
      // No match on name + date, add normally
      transactions.unshift(transaction);
      message = "Transaction added successfully!";
    }

    localStorage.setItem("transactions", JSON.stringify(transactions));
    renderTransactions();
    updateStats();
    renderCategories();
    renderChart();
    alert(message);
    closeModal();
  }
});

// Delete transaction
function deleteTransaction(id) {
  if (!confirm("Are you sure you want to delete this transaction?")) return;

  let transactions = JSON.parse(localStorage.getItem("transactions") || "[]");
  transactions = transactions.filter((t) => t.id !== id);
  localStorage.setItem("transactions", JSON.stringify(transactions));

  renderTransactions();
  updateStats();
  renderCategories();
  renderChart();
}

// Edit transaction
function editTransaction(id) {
  const transactions = JSON.parse(localStorage.getItem("transactions") || "[]");
  const txn = transactions.find((t) => t.id === id);
  if (!txn) return;

  editingId = id;
  selectedType = txn.type;

  // Pre-fill the form
  document.getElementById("txnName").value = txn.name;
  document.getElementById("txnAmount").value = txn.amount;
  document.getElementById("txnCategory").value = txn.category;
  document.getElementById("txnDate").value = txn.date;

  // Set type toggle
  document
    .querySelectorAll(".type-btn")
    .forEach((btn) => btn.classList.remove("active"));
  document
    .querySelector(`.type-btn[data-type="${txn.type}"]`)
    .classList.add("active");

  // Update modal title and button
  document.querySelector(".modal-header h3").textContent = "Edit Transaction";
  document.querySelector("#transactionForm .btn-primary").textContent =
    "Update Transaction";
  modal.classList.add("active");
}

// Render transactions from localStorage
function renderTransactions() {
  const transactions = JSON.parse(localStorage.getItem("transactions") || "[]");
  const transactionList = document.querySelector(".transaction-list");

  if (transactions.length === 0) {
    transactionList.innerHTML =
      '<p style="text-align:center; color:#94a3b8; padding:24px; font-size:14px;">No transactions yet. Click "Add Transaction" to get started.</p>';
    return;
  }

  // Show latest 5 transactions
  const recent = transactions.slice(0, 5);

  transactionList.innerHTML = recent
    .map((txn) => {
      const isIncome = txn.type === "income";
      const iconClass = isIncome ? "income-icon" : "expense-icon";
      const amountClass = isIncome ? "income" : "expense";
      const sign = isIncome ? "+" : "-";

      // Format date
      const date = new Date(txn.date);
      const formattedDate = date.toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

      return `
        <div class="transaction-item">
          <div class="transaction-icon ${iconClass}">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="${isIncome ? "M12 19V5M5 12l7-7 7 7" : "M12 5v14M19 12l-7 7-7-7"}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="transaction-details">
            <span class="transaction-name">${txn.name}</span>
            <span class="transaction-date">${formattedDate} • ${txn.category}</span>
          </div>
          <span class="transaction-amount ${amountClass}">${sign}₹${txn.amount.toLocaleString("en-IN")}</span>
          <div class="transaction-actions">
            <button class="action-btn edit-btn" onclick="editTransaction(${txn.id})" title="Edit">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <button class="action-btn delete-btn" onclick="deleteTransaction(${txn.id})" title="Delete">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      `;
    })
    .join("");
}

// Update stat cards from transactions
function updateStats() {
  const transactions = JSON.parse(localStorage.getItem("transactions") || "[]");

  let totalIncome = 0;
  let totalExpenses = 0;

  transactions.forEach(function (txn) {
    if (txn.type === "income") {
      totalIncome += txn.amount;
    } else {
      totalExpenses += txn.amount;
    }
  });

  const balance = totalIncome - totalExpenses;
  const savings = balance > 0 ? balance : 0;

  document.getElementById("statBalance").textContent =
    "₹" + balance.toLocaleString("en-IN");
  document.getElementById("statIncome").textContent =
    "₹" + totalIncome.toLocaleString("en-IN");
  document.getElementById("statExpenses").textContent =
    "₹" + totalExpenses.toLocaleString("en-IN");
  document.getElementById("statSavings").textContent =
    "₹" + savings.toLocaleString("en-IN");
}

// Category styles map
const categoryStyles = {
  Housing: {
    bg: "#fef3c7",
    color: "#f59e0b",
    icon: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
  },
  "Food & Dining": {
    bg: "#dbeafe",
    color: "#3b82f6",
    icon: "M3 6h18M3 12h18M3 18h18",
  },
  Entertainment: {
    bg: "#fce7f3",
    color: "#ec4899",
    icon: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM12 6v6l4 2",
  },
  Transportation: {
    bg: "#e0e7ff",
    color: "#6366f1",
    icon: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
  },
  Shopping: {
    bg: "#fef3c7",
    color: "#f59e0b",
    icon: "M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18",
  },
  Utilities: {
    bg: "#dcfce7",
    color: "#22c55e",
    icon: "M13 2L3 14h9l-1 8 10-12h-9l1-8",
  },
  Salary: {
    bg: "#d1fae5",
    color: "#10b981",
    icon: "M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",
  },
  Freelance: {
    bg: "#e0e7ff",
    color: "#6366f1",
    icon: "M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",
  },
  Other: {
    bg: "#f1f5f9",
    color: "#64748b",
    icon: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z",
  },
};

// Render category breakdown from transactions
function renderCategoryHTML(category, amount, totalExpenses) {
  const percent = Math.round((amount / totalExpenses) * 100);
  const style = categoryStyles[category] || categoryStyles["Other"];

  return `
    <div class="category-item">
      <div class="category-info">
        <div class="category-icon" style="background: ${style.bg}">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="${style.icon}" stroke="${style.color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="category-details">
          <span class="category-name">${category}</span>
          <span class="category-amount">₹${amount.toLocaleString("en-IN")}</span>
        </div>
      </div>
      <div class="category-progress">
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${percent}%; background: ${style.color}"></div>
        </div>
        <span class="category-percent">${percent}%</span>
      </div>
    </div>
  `;
}

function getCategoryData() {
  const transactions = JSON.parse(localStorage.getItem("transactions") || "[]");
  const expenses = transactions.filter((t) => t.type === "expense");
  const incomes = transactions.filter((t) => t.type === "income");
  const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
  const totalIncome = incomes.reduce((sum, t) => sum + t.amount, 0);

  const categoryTotals = {};
  expenses.forEach((txn) => {
    categoryTotals[txn.category] =
      (categoryTotals[txn.category] || 0) + txn.amount;
  });

  const sorted = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
  return { sorted, totalExpenses, totalIncome, expenses };
}

function renderCategories() {
  const categoryList = document.getElementById("categoryList");
  const viewAllBtn = document.getElementById("viewAllCategories");
  const { sorted, totalExpenses, expenses } = getCategoryData();

  if (expenses.length === 0) {
    categoryList.innerHTML =
      '<p style="text-align:center; color:#94a3b8; padding:24px; font-size:14px;">No expenses to show yet.</p>';
    if (viewAllBtn) viewAllBtn.style.display = "none";
    return;
  }

  // Always show top 3 in the dashboard card
  const top3 = sorted.slice(0, 3);

  if (viewAllBtn) {
    viewAllBtn.style.display = sorted.length > 3 ? "inline-block" : "none";
    viewAllBtn.textContent = `View All (${sorted.length})`;
  }

  categoryList.innerHTML = top3
    .map(([cat, amt]) => renderCategoryHTML(cat, amt, totalExpenses))
    .join("");
}

// Category Modal
const categoryModal = document.getElementById("categoryModal");
const closeCategoryModalBtn = document.getElementById("closeCategoryModal");

function openCategoryModal() {
  const { sorted, totalExpenses, totalIncome } = getCategoryData();

  document.getElementById("categoryModalSummary").innerHTML = `
    <div class="summary-card expense-summary">
      <span class="summary-label">Total Expenses</span>
      <span class="summary-value">₹${totalExpenses.toLocaleString("en-IN")}</span>
    </div>
    <div class="summary-card income-summary">
      <span class="summary-label">Total Income</span>
      <span class="summary-value">₹${totalIncome.toLocaleString("en-IN")}</span>
    </div>
  `;

  document.getElementById("categoryModalList").innerHTML = sorted
    .map(([cat, amt]) => renderCategoryHTML(cat, amt, totalExpenses))
    .join("");

  categoryModal.classList.add("active");
}

const viewAllCategoriesBtn = document.getElementById("viewAllCategories");
if (viewAllCategoriesBtn) {
  viewAllCategoriesBtn.addEventListener("click", openCategoryModal);
}

if (closeCategoryModalBtn) {
  closeCategoryModalBtn.addEventListener("click", function () {
    categoryModal.classList.remove("active");
  });
}
if (categoryModal) {
  categoryModal.addEventListener("click", function (e) {
    if (e.target === categoryModal) categoryModal.classList.remove("active");
  });
}

// Load everything on page load
renderTransactions();
updateStats();
renderCategories();
renderChart();
