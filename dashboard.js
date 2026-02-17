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

// Simple bar chart using JavaScript
const chartContainer = document.querySelector(".chart-container");
if (chartContainer) {
  const data = [
    { day: "Mon", income: 5000, expense: 3200 },
    { day: "Tue", income: 3500, expense: 4100 },
    { day: "Wed", income: 4200, expense: 2800 },
    { day: "Thu", income: 6800, expense: 5200 },
    { day: "Fri", income: 8500, expense: 3900 },
    { day: "Sat", income: 2100, expense: 4500 },
    { day: "Sun", income: 3200, expense: 2100 },
  ];

  const maxVal = Math.max(...data.map((d) => Math.max(d.income, d.expense)));

  chartContainer.innerHTML = `
    <div style="display:flex; align-items:flex-end; justify-content:space-around; width:100%; height:100%; padding:20px; gap:8px;">
      ${data
        .map(
          (d) => `
        <div style="display:flex; flex-direction:column; align-items:center; flex:1; gap:8px;">
          <div style="display:flex; gap:4px; align-items:flex-end; width:100%; height:180px;">
            <div style="flex:1; background:#10b981; border-radius:4px 4px 0 0; height:${(d.income / maxVal) * 100}%;"></div>
            <div style="flex:1; background:#ef4444; border-radius:4px 4px 0 0; height:${(d.expense / maxVal) * 100}%;"></div>
          </div>
          <span style="font-size:11px; font-weight:600; color:#64748b;">${d.day}</span>
        </div>
      `,
        )
        .join("")}
    </div>
  `;
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
function renderCategories() {
  const transactions = JSON.parse(localStorage.getItem("transactions") || "[]");
  const categoryList = document.getElementById("categoryList");

  // Only count expenses for category breakdown
  const expenses = transactions.filter((t) => t.type === "expense");

  if (expenses.length === 0) {
    categoryList.innerHTML =
      '<p style="text-align:center; color:#94a3b8; padding:24px; font-size:14px;">No expenses to show yet.</p>';
    return;
  }

  // Group by category and sum amounts
  const categoryTotals = {};
  expenses.forEach((txn) => {
    categoryTotals[txn.category] =
      (categoryTotals[txn.category] || 0) + txn.amount;
  });

  // Total expenses for percentage calculation
  const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);

  // Sort categories by amount (highest first)
  const sorted = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);

  categoryList.innerHTML = sorted
    .map(([category, amount]) => {
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
    })
    .join("");
}

// Load everything on page load
renderTransactions();
updateStats();
renderCategories();
