// Initialize localStorage data
if (!localStorage.getItem("employees")) localStorage.setItem("employees", JSON.stringify([]));
if (!localStorage.getItem("logs")) localStorage.setItem("logs", JSON.stringify([]));

let employees = JSON.parse(localStorage.getItem("employees"));
let logs = JSON.parse(localStorage.getItem("logs"));

const checkInGrid = document.getElementById("checkInGrid");
const checkOutGrid = document.getElementById("checkOutGrid");
const employeeList = document.getElementById("employeeList");
const logTableBody = document.querySelector("#logTable tbody");
const toast = document.getElementById("toast");

// Render employees (sorted alphabetically)
function renderEmployees() {
  checkInGrid.innerHTML = "";
  checkOutGrid.innerHTML = "";
  employeeList.innerHTML = "";

  // ✅ Sort employees alphabetically by first letter
  const sortedEmployees = [...employees].sort((a, b) => {
    return a.localeCompare(b, 'en', { sensitivity: 'base' });
  });

  sortedEmployees.forEach((name, index) => {
    // Check-In Card
    const inCard = document.createElement("div");
    inCard.className = "employee-card";
    inCard.textContent = name;
    inCard.onclick = () => logAction(name, "in");
    checkInGrid.appendChild(inCard);

    // Check-Out Card
    const outCard = document.createElement("div");
    outCard.className = "employee-card";
    outCard.textContent = name;
    outCard.onclick = () => logAction(name, "out");
    checkOutGrid.appendChild(outCard);

    // Employee List in Admin
    const li = document.createElement("li");
    li.textContent = name;

    // Actions container (Edit + Delete side by side)
    const actions = document.createElement("div");
    actions.className = "actions";

    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.className = "edit";
    editBtn.onclick = () => {
      const newName = prompt("Edit name:", name);
      if (newName) {
        employees[index] = newName;
        localStorage.setItem("employees", JSON.stringify(employees));
        renderEmployees();
      }
    };

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.className = "delete";
    deleteBtn.onclick = () => {
      employees.splice(index, 1);
      localStorage.setItem("employees", JSON.stringify(employees));
      renderEmployees();
    };

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);
    li.appendChild(actions);
    employeeList.appendChild(li);
  });
}

// Log action
function logAction(name, type) {
  const now = new Date();
  const date = now.toLocaleDateString();
  const time = now.toLocaleTimeString();

  let log = logs.find(l => l.name === name && l.date === date);
  if (!log) {
    log = { name, date, timeIn: "", timeOut: "" };
    logs.push(log);
  }
  if (type === "in") log.timeIn = time;
  else log.timeOut = time;

  localStorage.setItem("logs", JSON.stringify(logs));
  renderLogs();
  showToast(`Successfully logged ${type === "in" ? "in" : "out"}: ${name}`);
}

// Render logs
function renderLogs() {
  logTableBody.innerHTML = "";
  logs.forEach((log, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${log.name}</td>
      <td>${log.date}</td>
      <td>${log.timeIn}</td>
      <td>${log.timeOut}</td>
      <td><button onclick="deleteLog(${index})">Delete</button></td>
    `;
    logTableBody.appendChild(row);
  });
}

function deleteLog(index) {
  logs.splice(index, 1);
  localStorage.setItem("logs", JSON.stringify(logs));
  renderLogs();
}

// Toast Notification
function showToast(message) {
  toast.textContent = message;
  toast.classList.remove("hidden");
  setTimeout(() => toast.classList.add("hidden"), 2000);
}

// Add Employee
document.getElementById("addEmployeeForm").onsubmit = e => {
  e.preventDefault();
  const name = document.getElementById("employeeName").value.trim();
  if (name) {
    employees.push(name);
    localStorage.setItem("employees", JSON.stringify(employees));
    renderEmployees();
    e.target.reset();
  }
};

// Export CSV
document.getElementById("exportCSV").onclick = () => {
  let csv = "Name,Date,Time In,Time Out\n";
  logs.forEach(log => {
    csv += `${log.name},${log.date},${log.timeIn},${log.timeOut}\n`;
  });
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "employee_logs.csv";
  a.click();
  URL.revokeObjectURL(url);
};

// Tab switching
const checkInSection = document.getElementById("checkInSection");
const checkOutSection = document.getElementById("checkOutSection");
const adminSection = document.getElementById("adminSection");

document.getElementById("checkInTab").onclick = () => {
  checkInSection.classList.remove("hidden");
  checkOutSection.classList.add("hidden");
  adminSection.classList.add("hidden");
};
document.getElementById("checkOutTab").onclick = () => {
  checkOutSection.classList.remove("hidden");
  checkInSection.classList.add("hidden");
  adminSection.classList.add("hidden");
};
document.getElementById("adminTab").onclick = () => {
  adminSection.classList.remove("hidden");
  checkInSection.classList.add("hidden");
  checkOutSection.classList.add("hidden");
};

// Initial render
renderEmployees();
renderLogs();
