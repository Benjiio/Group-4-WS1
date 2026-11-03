let itemsList = [];
let requestsList = [];
let currentUser = { name: "", role: "" };

function switchView(viewId) {
    if (!currentUser.name && viewId !== 'login' && viewId !== 'register') {
        showToast("Please log in first", "error");
        return;
    }

    document.querySelectorAll(".view-panel").forEach(panel => panel.classList.remove("active"));
    document.querySelectorAll(".nav-item").forEach(btn => btn.classList.remove("active"));

    const targetPanel = document.getElementById(`${viewId}-view`);
    if (targetPanel) targetPanel.classList.add("active");

    const activeNav = Array.from(document.querySelectorAll(".nav-item")).find(btn => btn.getAttribute("onclick").includes(viewId));
    if (activeNav) activeNav.classList.add("active");

    if (viewId === 'items') renderItems();
    if (viewId === 'requests') renderRequests();
    if (viewId === 'dashboard') renderDashboardContent();
}

function switchAuthView(authType) {
    document.querySelectorAll(".view-panel").forEach(panel => panel.classList.remove("active"));
    document.getElementById(`${authType}-view`).classList.add("active");
}

function renderDashboardContent() {
    const container = document.getElementById("dynamic-dashboard-content");
    
    const totalParts = itemsList.length;
    const availableParts = itemsList.filter(i => i.status === 'Return').length;
    const requestingParts = requestsList.length;
    const pendingStatus = itemsList.filter(i => i.status === 'Return').length + requestsList.filter(r => r.status === 'Pending').length;

    if (currentUser.role === 'admin') {
        document.getElementById("dash-title").innerHTML = `<i class="fa-solid fa-gauge-high"></i> ADMIN DASHBOARD`;
        document.getElementById("dash-subtitle").textContent = `Full access to check availability, manage records, and request parts`;
        
        container.innerHTML = `
            <div class="metrics-grid">
                <div class="metric-card"><div class="metric-title">Total Parts</div><div class="metric-value">${totalParts}</div></div>
                <div class="metric-card"><div class="metric-title">Available Parts</div><div class="metric-value">${availableParts}</div></div>
                <div class="metric-card"><div class="metric-title">Requesting Parts</div><div class="metric-value">${requestingParts}</div></div>
                <div class="metric-card"><div class="metric-title">Pending Status</div><div class="metric-value">${pendingStatus}</div></div>
            </div>
            <div class="dashboard-cards-grid">
                <div class="feature-card">
                    <h4>Admin Management Panel</h4>
                    <div class="feature-content"><i class="fa-solid fa-shield-halved feature-icon"></i><div><h5>Cloud Storage Active</h5><p>Secure inventory records & status editing</p></div></div>
                    <div class="feature-banner" onclick="switchView('items')" style="cursor:pointer;">Manage Equipment Records →</div>
                </div>
                <div class="chart-card">
                    <h4>Equipment Categories</h4>
                    <p class="sub-text" style="margin-top:10px;">• Desktop PC's (${itemsList.filter(i => i.category === 'desktop').length})</p>
                    <p class="sub-text">• POS Machine (${itemsList.filter(i => i.category === 'pos').length})</p>
                    <p class="sub-text">• Cliqq Machine (${itemsList.filter(i => i.category === 'cliqq').length})</p>
                </div>
            </div>
        `;
    } else {
        document.getElementById("dash-title").innerHTML = `<i class="fa-solid fa-user"></i> USER DASHBOARD`;
        document.getElementById("dash-subtitle").textContent = `Input serial numbers and part details for store deployments`;

        container.innerHTML = `
            <div class="metrics-grid">
                <div class="metric-card"><div class="metric-title">Total Parts Logged</div><div class="metric-value">${totalParts}</div></div>
                <div class="metric-card"><div class="metric-title">Available Parts</div><div class="metric-value">${availableParts}</div></div>
                <div class="metric-card"><div class="metric-title">Requesting Parts</div><div class="metric-value">${requestingParts}</div></div>
                <div class="metric-card"><div class="metric-title">Pending Status</div><div class="metric-value">${pendingStatus}</div></div>
            </div>
            <div class="dashboard-cards-grid">
                <div class="feature-card">
                    <h4>Deployment Entry Form</h4>
                    <div class="feature-content"><i class="fa-solid fa-desktop feature-icon"></i><div><h5>Select Category</h5><p>Desktop PC's, POS Machine, or Cliqq Machine</p></div></div>
                    <div class="feature-banner" onclick="openNewItemModal()" style="cursor:pointer;">+ Add Part Log →</div>
                </div>
                <div class="chart-card">
                    <h4>Quick Actions</h4>
                    <button class="btn btn-primary btn-sm" style="margin-top:10px; width:100%;" onclick="switchView('items')">View Equipment List</button>
                    <button class="btn btn-secondary btn-sm" style="margin-top:8px; width:100%;" onclick="switchView('requests')">Check Pending Status</button>
                </div>
            </div>
        `;
    }
}

function renderItems(data = itemsList) {
    const tbody = document.getElementById("items-table-body");
    tbody.innerHTML = "";

    if (data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:#64748b; padding:24px;">No equipment records found. Click "Add Part Record" to create one.</td></tr>`;
    } else {
        data.forEach(item => {
            let badgeClass = item.status === 'Deployed' ? 'badge-success' : 'badge-warning';
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${item.date}</td>
                <td><strong>${item.name}</strong></td>
                <td>${item.serial}</td>
                <td>${item.location}</td>
                <td><span class="badge ${badgeClass}">${item.status}</span></td>
                <td>
                    <button class="btn btn-secondary btn-sm" onclick="openDetailsModal(${item.id})">Details</button>
                    <button class="btn btn-secondary btn-sm" style="color:#c70d0d; border-color:#f8d4d4;" onclick="deleteItem(${item.id})"><i class="fa-solid fa-trash"></i></button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    const gridWrapper = document.getElementById("items-grid-wrapper");
    gridWrapper.innerHTML = "";

    if (data.length === 0) {
        gridWrapper.innerHTML = `<div style="grid-column:1/-1; text-align:center; color:#ffffff; padding:24px;">No records found.</div>`;
    } else {
        data.forEach(item => {
            const card = document.createElement("div");
            card.className = "grid-card";
            card.innerHTML = `
                <h4>${item.name}</h4>
                <p>SN: ${item.serial}</p>
                <div style="font-size:12px; color:#380303; margin-bottom:8px;">Location: ${item.location}</div>
                <div style="font-size:12px; color:#64748b; margin-bottom:12px;">Date: ${item.date}</div>
                <button class="btn btn-secondary btn-sm" style="width:100%" onclick="openDetailsModal(${item.id})">View Details</button>
            `;
            gridWrapper.appendChild(card);
        });
    }
}

function renderRequests() {
    const tbody = document.getElementById("requests-table-body");
    tbody.innerHTML = "";

    if (requestsList.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:#64748b; padding:24px;">No pending part requests recorded.</td></tr>`;
        return;
    }

    requestsList.forEach(req => {
        let badgeClass = req.status === 'Deployed' ? 'badge-success' : 'badge-warning';
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${req.date}</td>
            <td><strong>${req.name}</strong></td>
            <td>${req.serial}</td>
            <td>${req.location}</td>
            <td><span class="badge ${badgeClass}">${req.status}</span></td>
            <td>
                <button class="btn btn-secondary btn-sm" onclick="updateRequestStatus(${req.id})">Toggle Status</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function updateRequestStatus(id) {
    const req = requestsList.find(r => r.id === id);
    if (req) {
        req.status = req.status === 'Deployed' ? 'Return' : 'Deployed';
        renderRequests();
        showToast("Request status updated!", "success");
    }
}

function deleteItem(id) {
    if (confirm("Delete this inventory record?")) {
        itemsList = itemsList.filter(i => i.id !== id);
        renderItems();
        showToast("Record deleted from inventory", "success");
    }
}

function toggleLayout(type) {
    const tableView = document.getElementById("table-view-container");
    const gridView = document.getElementById("grid-view-container");
    const btnTable = document.getElementById("btn-table-view");
    const btnGrid = document.getElementById("btn-grid-view");

    if (type === 'table') {
        tableView.style.display = "block";
        gridView.style.display = "none";
        btnTable.classList.add("active");
        btnGrid.classList.remove("active");
    } else {
        tableView.style.display = "none";
        gridView.style.display = "block";
        btnGrid.classList.add("active");
        btnTable.classList.remove("active");
    }
}

function filterItems() {
    const query = document.getElementById("search-box").value.toLowerCase();
    const cat = document.getElementById("category-filter").value;

    const filtered = itemsList.filter(item => {
        const matchesQuery = item.name.toLowerCase().includes(query) || item.serial.toLowerCase().includes(query);
        const matchesCat = cat === 'all' || item.category === cat;
        return matchesQuery && matchesCat;
    });

    renderItems(filtered);
}

function openDetailsModal(id) {
    const item = itemsList.find(i => i.id === id);
    if (!item) return;

    document.getElementById("modal-title").textContent = item.name;
    document.getElementById("modal-body").innerHTML = `
        <div style="margin-bottom:12px;"><strong>Category:</strong> ${item.category.toUpperCase()}</div>
        <div style="margin-bottom:12px;"><strong>Serial Number:</strong> ${item.serial}</div>
        <div style="margin-bottom:12px;"><strong>Location:</strong> ${item.location}</div>
        <div style="margin-bottom:12px;"><strong>Date:</strong> ${item.date}</div>
        <div style="margin-bottom:12px;"><strong>Status:</strong> ${item.status}</div>
    `;
    document.getElementById("modal-footer").innerHTML = `<button class="btn btn-secondary" onclick="closeModal()">Close</button>`;
    document.getElementById("modal-backdrop").classList.add("active");
}

function openNewItemModal() {
    document.getElementById("modal-title").textContent = "Enter Part & Serial Details";
    document.getElementById("modal-body").innerHTML = `
        <div class="form-group"><label>Type of Part / Equipment</label><input type="text" id="new-name" placeholder="e.g. Scanner / Mainboard" required></div>
        <div class="form-group"><label>Category</label>
            <select id="new-cat">
                <option value="desktop">Desktop PC's</option>
                <option value="pos">POS Machine</option>
                <option value="cliqq">Cliqq Machine</option>
            </select>
        </div>
        <div class="form-group"><label>Serial Number</label><input type="text" id="new-serial" placeholder="123656498556565" required></div>
        <div class="form-group"><label>Deployment Location</label><input type="text" id="new-location" placeholder="Store 3546 Kanto lang" required></div>
        <div class="form-group"><label>Status</label>
            <select id="new-status">
                <option value="Deployed">Deployed</option>
                <option value="Return">Return / Pending</option>
            </select>
        </div>
    `;
    document.getElementById("modal-footer").innerHTML = `
        <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="saveModalData()">Save Record</button>
    `;
    document.getElementById("modal-backdrop").classList.add("active");
}

function closeModal() {
    document.getElementById("modal-backdrop").classList.remove("active");
}

function saveModalData() {
    const name = document.getElementById("new-name").value;
    const serial = document.getElementById("new-serial").value;
    const location = document.getElementById("new-location").value;

    if (!name || !serial || !location) {
        showToast("INVALID INFORMATION: Please fill out all fields.", "error");
        return;
    }

    const newItem = {
        id: Date.now(),
        name,
        category: document.getElementById("new-cat").value,
        serial,
        location,
        date: new Date().toISOString().split('T')[0],
        status: document.getElementById("new-status").value
    };

    itemsList.push(newItem);
    renderItems();
    closeModal();
    showToast("Information saved successfully to database record!", "success");
}

function showToast(message, type = "success") {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    setTimeout(() => { toast.className = "toast"; }, 3000);
}

document.getElementById("login-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const username = document.getElementById("login-username").value.trim().toLowerCase();
    const password = document.getElementById("login-password").value;
    
    if (!username || !password) {
        showToast("Credentials INVALID. Try again.", "error");
        return;
    }

    currentUser.name = username;
    currentUser.role = username.includes("admin") ? "admin" : "user";

    document.getElementById("current-user-name").textContent = username;
    document.getElementById("current-user-role").textContent = currentUser.role;
    
    document.getElementById("nav-menu").style.display = "flex";
    document.getElementById("sidebar-user").style.display = "block";

    showToast("Login Successful!", "success");
    switchView("dashboard");
});

document.getElementById("register-form").addEventListener("submit", (e) => {
    e.preventDefault();
    showToast("Account created successfully!", "success");
    switchAuthView("login");
});

function logout() {
    currentUser = { name: "", role: "" };
    document.getElementById("nav-menu").style.display = "none";
    document.getElementById("sidebar-user").style.display = "none";
    showToast("Logged out successfully", "success");
    switchAuthView("login");
}