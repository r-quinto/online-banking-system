// Check authentication
let currentUser = JSON.parse(localStorage.getItem('currentUser'));
if (!currentUser) {
    window.location.href = 'auth.html';
}

// Check if account is active
function checkAccountStatus() {
    // Refresh user data
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const updatedUser = users.find(u => u.id === currentUser.id);
    if (updatedUser) {
        currentUser = updatedUser;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }
    
    return currentUser.isActive !== false;
}

// Show account frozen notification
function showAccountFrozenMessage() {
    const message = 'Your account has been deactivated. Please contact support to reactivate your account.';
    alert(message);
    showSuccess('Account Deactivated', message, 'error');
}

// Update user data
function updateUser(newData) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    
    if (userIndex !== -1) {
        users[userIndex] = { ...users[userIndex], ...newData };
        localStorage.setItem('users', JSON.stringify(users));
        currentUser = users[userIndex];
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        // Update avatar if profile picture changed
        if (newData.hasOwnProperty('profilePicture')) {
            updateUserAvatar();
        }
    }
}

// Format currency
function formatCurrency(amount) {
    return '₱' + amount.toLocaleString();
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}

function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Show success modal
function showSuccess(title, message, type = 'success') {
    const modal = document.getElementById('success-modal');
    const successIcon = document.querySelector('#success-modal .success-icon i');
    document.getElementById('success-title').textContent = title;
    document.getElementById('success-message').textContent = message;
    
    // Change icon based on type
    if (type === 'error') {
        successIcon.className = 'fa-solid fa-circle-xmark';
        successIcon.parentElement.style.background = 'rgba(239, 68, 68, 0.1)';
        successIcon.parentElement.style.color = '#ef4444';
    } else {
        successIcon.className = 'fa-solid fa-circle-check';
        successIcon.parentElement.style.background = 'rgba(16, 185, 129, 0.1)';
        successIcon.parentElement.style.color = '#10b981';
    }
    
    modal.classList.add('show');
    
    setTimeout(() => {
        modal.classList.remove('show');
    }, 3000);
}

// Function to update user avatar
function updateUserAvatar() {
    const userAvatar = document.getElementById('user-avatar');
    const profilePicture = currentUser.profilePicture;
    
    if (profilePicture) {
        userAvatar.innerHTML = `<img src="${profilePicture}" alt="Profile" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
    } else {
        userAvatar.textContent = `${currentUser.firstName[0]}${currentUser.lastName[0]}`;
    }
}

// Initialize user info
document.getElementById('user-name').textContent = `${currentUser.firstName} ${currentUser.lastName}`;
updateUserAvatar();

// Sidebar toggle
const sidebar = document.getElementById('sidebar');
const menuToggle = document.getElementById('menu-toggle');
const closeSidebar = document.getElementById('close-sidebar');

menuToggle.addEventListener('click', () => {
    sidebar.classList.add('open');
});

closeSidebar.addEventListener('click', () => {
    sidebar.classList.remove('open');
});

// Logout
document.getElementById('logout-btn').addEventListener('click', () => {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
});

// Navigation
const navItems = document.querySelectorAll('.nav-item');
const contentArea = document.getElementById('content-area');
const pageTitle = document.getElementById('page-title');

navItems.forEach(item => {
    item.addEventListener('click', () => {
        const page = item.getAttribute('data-page');
        
        // Update active state
        navItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        
        // Update page title
        pageTitle.textContent = item.textContent.trim();
        
        // Load content
        loadPage(page);
        
        // Close sidebar on mobile
        sidebar.classList.remove('open');
    });
});

// Logo click - navigate to home
document.getElementById('logo-home').addEventListener('click', () => {
    // Update active state
    navItems.forEach(i => i.classList.remove('active'));
    const homeNavItem = document.querySelector('.nav-item[data-page="home"]');
    if (homeNavItem) {
        homeNavItem.classList.add('active');
    }
    
    // Update page title
    pageTitle.textContent = 'Home';
    
    // Load home page
    loadPage('home');
    
    // Close sidebar on mobile
    sidebar.classList.remove('open');
});

// Load page content
function loadPage(page) {
    // Refresh user data
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const updatedUser = users.find(u => u.id === currentUser.id);
    if (updatedUser) {
        currentUser = updatedUser;
    }
    
    switch(page) {
        case 'home':
            loadHome();
            break;
        case 'transfer':
            loadTransfer();
            break;
        case 'payment':
            loadPayment();
            break;
        case 'savings':
            loadSavings();
            break;
        case 'history':
            loadHistory();
            break;
        case 'manage':
            loadManage();
            break;
        default:
            loadComingSoon(pageTitle.textContent);
    }
}

// HOME PAGE
function loadHome() {
    const recentTransactions = currentUser.transactions.slice(-5).reverse();
    const totalCredits = currentUser.transactions
        .filter(t => t.type === 'credit')
        .reduce((sum, t) => sum + t.amount, 0);
    const totalDebits = currentUser.transactions
        .filter(t => t.type === 'debit')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const warningBanner = !currentUser.isActive ? `
        <div style="background: #ef4444; color: white; padding: 1rem; border-radius: 0.5rem; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 1rem;">
            <i class="fa-solid fa-triangle-exclamation" style="font-size: 1.5rem;"></i>
            <div>
                <strong>Account Deactivated</strong>
                <p style="margin: 0.25rem 0 0 0; font-size: 0.875rem; opacity: 0.9;">Your account has been frozen. Transactions and payments are disabled.</p>
            </div>
        </div>
    ` : '';
    
    contentArea.innerHTML = warningBanner + `
        <div class="card-grid card-grid-3">
            <div class="card balance-card">
                <div class="card-icon"><i class="fa-solid fa-wallet"></i></div>
                <div class="card-label">Available Balance</div>
                <div class="card-value">${formatCurrency(currentUser.balance)}</div>
                <div class="card-subtitle">Account: ${currentUser.accountNumber}</div>
            </div>
            <div class="card balance-card accent">
                <div class="card-icon"><i class="fa-solid fa-piggy-bank"></i></div>
                <div class="card-label">Savings</div>
                <div class="card-value">${formatCurrency(currentUser.savings)}</div>
                <div class="card-subtitle">Growing steadily</div>
            </div>
            <div class="card balance-card success">
                <div class="card-icon"><i class="fa-solid fa-chart-line"></i></div>
                <div class="card-label">Total Assets</div>
                <div class="card-value">${formatCurrency(currentUser.balance + currentUser.savings)}</div>
                <div class="card-subtitle">Combined wealth</div>
            </div>
        </div>

        <div class="card-grid card-grid-2">
            <div class="card">
                <h3 style="color: var(--primary); margin-bottom: 1rem;">Income Summary</h3>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div style="display: flex; gap: 1rem; align-items: center;">
                            <div style="background: rgba(16, 185, 129, 0.1); padding: 1rem; border-radius: 0.5rem;">
                                <span style="font-size: 1.5rem; color: #10b981;"><i class="fa-solid fa-arrow-trend-down"></i></span>
                            </div>
                        <div>
                            <p style="font-size: 0.875rem; color: var(--gray-600);">Total Credits</p>
                            <p style="color: #10b981; font-weight: 600; font-size: 1.25rem;">${formatCurrency(totalCredits)}</p>
                        </div>
                    </div>
                    <div style="text-align: right;">
                        <p style="font-size: 0.875rem; color: var(--gray-600);">Transactions</p>
                        <p style="font-size: 1.25rem; font-weight: 600;">${currentUser.transactions.filter(t => t.type === 'credit').length}</p>
                    </div>
                </div>
            </div>
            <div class="card">
                <h3 style="color: var(--primary); margin-bottom: 1rem;">Expense Summary</h3>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div style="display: flex; gap: 1rem; align-items: center;">
                            <div style="background: rgba(239, 68, 68, 0.1); padding: 1rem; border-radius: 0.5rem;">
                                <span style="font-size: 1.5rem; color: #ef4444;"><i class="fa-solid fa-arrow-trend-up"></i></span>
                            </div>
                        <div>
                            <p style="font-size: 0.875rem; color: var(--gray-600);">Total Debits</p>
                            <p style="color: #ef4444; font-weight: 600; font-size: 1.25rem;">${formatCurrency(totalDebits)}</p>
                        </div>
                    </div>
                    <div style="text-align: right;">
                        <p style="font-size: 0.875rem; color: var(--gray-600);">Transactions</p>
                        <p style="font-size: 1.25rem; font-weight: 600;">${currentUser.transactions.filter(t => t.type === 'debit').length}</p>
                    </div>
                </div>
            </div>
        </div>

        <div class="card">
            <h3 style="color: var(--primary); margin-bottom: 1rem;">Recent Transactions</h3>
            <div>
                ${recentTransactions.map(t => `
                    <div class="transaction-item">
                        <div class="transaction-left">
                            <div class="transaction-icon ${t.type}">
                                ${t.type === 'credit' ? '<i class="fa-solid fa-arrow-down"></i>' : '<i class="fa-solid fa-arrow-up"></i>'}
                            </div>
                            <div class="transaction-info">
                                <p>${t.description}</p>
                                <p>${formatDate(t.date)}</p>
                            </div>
                        </div>
                        <div class="transaction-right">
                            <div class="transaction-amount ${t.type}">
                                ${t.type === 'credit' ? '+' : '-'}${formatCurrency(t.amount)}
                            </div>
                            <div class="transaction-balance">${formatCurrency(t.balance)}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>

        <div class="stats-grid">
            <div class="stat-card">
                <p>Account Status</p>
                <p style="color: ${currentUser.isActive ? '#10b981' : '#ef4444'}">
                    ${currentUser.isActive ? 'Active' : 'Inactive'}
                </p>
            </div>
            <div class="stat-card">
                <p>Total Transactions</p>
                <p>${currentUser.transactions.length}</p>
            </div>
            <div class="stat-card">
                <p>Average Transaction</p>
                <p>${formatCurrency(Math.round((totalCredits + totalDebits) / currentUser.transactions.length))}</p>
            </div>
            <div class="stat-card">
                <p>Net Flow</p>
                <p style="color: ${totalCredits - totalDebits >= 0 ? '#10b981' : '#ef4444'}">
                    ${formatCurrency(totalCredits - totalDebits)}
                </p>
            </div>
        </div>
    `;
}

// TRANSFER PAGE
function loadTransfer() {
    if (!checkAccountStatus()) {
        showAccountFrozenMessage();
        contentArea.innerHTML = `
            <div class="card">
                <div style="text-align: center; padding: 3rem;">
                    <div style="font-size: 4rem; color: #ef4444; margin-bottom: 1rem;">
                        <i class="fa-solid fa-ban"></i>
                    </div>
                    <h2 style="color: #ef4444; margin-bottom: 1rem;">Account Deactivated</h2>
                    <p style="color: var(--gray-600); margin-bottom: 2rem;">Your account has been frozen and transactions are not allowed.</p>
                    <p style="color: var(--gray-600);">Please contact support to reactivate your account.</p>
                </div>
            </div>
        `;
        return;
    }
    
    contentArea.innerHTML = `
        <div class="form-card card">
            <div class="form-header">
                <div class="form-header-icon"><i class="fa-solid fa-arrow-right-arrow-left"></i></div>
                <div class="form-header-text">
                    <h2>Transfer Money</h2>
                    <p>Send money to another account</p>
                </div>
            </div>
            
            <div class="info-box">
                <p>Available Balance: <span>${formatCurrency(currentUser.balance)}</span></p>
            </div>
            
            <form id="transfer-form">
                <div class="form-group">
                    <label for="account-number">Account Number *</label>
                    <input type="text" id="account-number" required>
                </div>
                <div class="form-group">
                    <label for="account-name">Account Name (Optional)</label>
                    <input type="text" id="account-name">
                </div>
                <div class="form-group">
                    <label for="amount">Amount *</label>
                    <input type="number" id="amount" step="0.01" required>
                </div>
                <div class="form-group">
                    <label for="description">Description (Optional)</label>
                    <input type="text" id="description">
                </div>
                <button type="submit" class="btn-primary btn-full">Transfer</button>
            </form>
        </div>
    `;
    
        document.getElementById('transfer-form').addEventListener('submit', (e) => {
            e.preventDefault();
            
            if (!checkAccountStatus()) {
                showAccountFrozenMessage();
                return;
            }
            
            const accountNumber = document.getElementById('account-number').value;
            const accountName = document.getElementById('account-name').value;
            const amount = parseFloat(document.getElementById('amount').value);
            const description = document.getElementById('description').value;
            
            if (amount <= 0) {
                alert('Please enter a valid amount');
                return;
            }
            
            if (amount > currentUser.balance) {
                alert('Insufficient balance');
                return;
            }
        
        const newBalance = currentUser.balance - amount;
        const newTransaction = {
            id: Date.now().toString(),
            type: 'debit',
            amount: amount,
            description: `Transfer to ${accountName || accountNumber}${description ? ' - ' + description : ''}`,
            date: new Date().toISOString(),
            balance: newBalance
        };
        
        updateUser({
            balance: newBalance,
            transactions: [...currentUser.transactions, newTransaction]
        });
        
        showSuccess('Transfer Successful!', `${formatCurrency(amount)} has been transferred successfully.`);
        
        setTimeout(() => {
            loadTransfer();
        }, 3000);
    });
}

// PAYMENT PAGE
let selectedCategory = '';

function loadPayment() {
    if (!checkAccountStatus()) {
        showAccountFrozenMessage();
        contentArea.innerHTML = `
            <div class="card">
                <div style="text-align: center; padding: 3rem;">
                    <div style="font-size: 4rem; color: #ef4444; margin-bottom: 1rem;">
                        <i class="fa-solid fa-ban"></i>
                    </div>
                    <h2 style="color: #ef4444; margin-bottom: 1rem;">Account Deactivated</h2>
                    <p style="color: var(--gray-600); margin-bottom: 2rem;">Your account has been frozen and payments are not allowed.</p>
                    <p style="color: var(--gray-600);">Please contact support to reactivate your account.</p>
                </div>
            </div>
        `;
        return;
    }
    
    if (!selectedCategory) {
        contentArea.innerHTML = `
            <div class="form-card card">
                <div class="form-header">
                    <div class="form-header-icon">💳</div>
                    <div class="form-header-text">
                        <h2>Pay Bills</h2>
                        <p>Pay your bills quickly and securely</p>
                    </div>
                </div>
                
                <div class="info-box">
                    <p>Available Balance: <span>${formatCurrency(currentUser.balance)}</span></p>
                </div>
                
                <div class="form-group">
                    <label>Select Bill Category</label>
                </div>
                <div class="category-grid">
                    <button class="category-btn" onclick="selectCategory('electricity')">
                        <div class="category-btn-icon"><i class="fa-solid fa-bolt"></i></div>
                        <p>Electricity</p>
                    </button>
                    <button class="category-btn" onclick="selectCategory('water')">
                        <div class="category-btn-icon"><i class="fa-solid fa-droplet"></i></div>
                        <p>Water</p>
                    </button>
                    <button class="category-btn" onclick="selectCategory('internet')">
                        <div class="category-btn-icon"><i class="fa-solid fa-wifi"></i></div>
                        <p>Internet</p>
                    </button>
                    <button class="category-btn" onclick="selectCategory('mobile')">
                        <div class="category-btn-icon"><i class="fa-solid fa-mobile-screen"></i></div>
                        <p>Mobile</p>
                    </button>
                    <button class="category-btn" onclick="selectCategory('streaming')">
                        <div class="category-btn-icon"><i class="fa-solid fa-tv"></i></div>
                        <p>Streaming</p>
                    </button>
                </div>
            </div>
        `;
    } else {
        const categoryNames = {
            electricity: 'Electricity',
            water: 'Water',
            internet: 'Internet',
            mobile: 'Mobile',
            streaming: 'Streaming'
        };
        
        contentArea.innerHTML = `
            <div class="form-card card">
                <div class="form-header">
                    <div class="form-header-icon">💳</div>
                    <div class="form-header-text">
                        <h2>Pay Bills</h2>
                        <p>Pay your bills quickly and securely</p>
                    </div>
                </div>
                
                <div class="info-box">
                    <p>Available Balance: <span>${formatCurrency(currentUser.balance)}</span></p>
                </div>
                
                <div class="form-group">
                    <label>Selected Category</label>
                    <div style="display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; background: rgba(30, 58, 95, 0.1); border-radius: 0.5rem; margin-top: 0.5rem;">
                        <span style="color: var(--primary);">${categoryNames[selectedCategory]}</span>
                        <button type="button" onclick="resetCategory()" style="margin-left: auto; background: none; border: none; color: #3b82f6; text-decoration: underline; cursor: pointer;">Change</button>
                    </div>
                </div>
                
                <form id="payment-form">
                    <div class="form-group">
                        <label for="ref-number">Account/Reference Number *</label>
                        <input type="text" id="ref-number" required>
                    </div>
                    <div class="form-group">
                        <label for="pay-amount">Amount *</label>
                        <input type="number" id="pay-amount" step="0.01" required>
                    </div>
                    <div class="form-group">
                        <label for="pay-notes">Notes (Optional)</label>
                        <input type="text" id="pay-notes">
                    </div>
                    <button type="submit" class="btn-primary btn-full">Pay</button>
                </form>
            </div>
        `;
        
        document.getElementById('payment-form').addEventListener('submit', (e) => {
            e.preventDefault();
            
            if (!checkAccountStatus()) {
                showAccountFrozenMessage();
                return;
            }
            
            const amount = parseFloat(document.getElementById('pay-amount').value);
            const notes = document.getElementById('pay-notes').value;
            
            if (amount <= 0) {
                alert('Please enter a valid amount');
                return;
            }
            
            if (amount > currentUser.balance) {
                alert('Insufficient balance');
                return;
            }
            
            const newBalance = currentUser.balance - amount;
            const newTransaction = {
                id: Date.now().toString(),
                type: 'debit',
                amount: amount,
                description: `${categoryNames[selectedCategory]} Payment${notes ? ' - ' + notes : ''}`,
                date: new Date().toISOString(),
                balance: newBalance
            };
            
            updateUser({
                balance: newBalance,
                transactions: [...currentUser.transactions, newTransaction]
            });
            
            showSuccess('Payment Successful!', `Your payment of ${formatCurrency(amount)} has been processed.`);
            
            selectedCategory = '';
            setTimeout(() => {
                loadPayment();
            }, 3000);
        });
    }
}

window.selectCategory = function(category) {
    selectedCategory = category;
    loadPayment();
};

window.resetCategory = function() {
    selectedCategory = '';
    loadPayment();
};

// SAVINGS PAGE
let savingsAction = '';

function loadSavings() {
    if (!checkAccountStatus()) {
        showAccountFrozenMessage();
        contentArea.innerHTML = `
            <div class="card">
                <div style="text-align: center; padding: 3rem;">
                    <div style="font-size: 4rem; color: #ef4444; margin-bottom: 1rem;">
                        <i class="fa-solid fa-ban"></i>
                    </div>
                    <h2 style="color: #ef4444; margin-bottom: 1rem;">Account Deactivated</h2>
                    <p style="color: var(--gray-600); margin-bottom: 2rem;">Your account has been frozen and savings operations are not allowed.</p>
                    <p style="color: var(--gray-600);">Please contact support to reactivate your account.</p>
                </div>
            </div>
        `;
        return;
    }
    
    if (!savingsAction) {
        contentArea.innerHTML = `
            <div class="card-grid card-grid-2">
                <div class="card balance-card accent">
                    <div class="card-icon"><i class="fa-solid fa-piggy-bank"></i></div>
                    <div class="card-label">Savings Balance</div>
                    <div class="card-value">${formatCurrency(currentUser.savings)}</div>
                    <div class="card-subtitle">Keep growing your savings</div>
                </div>
                <div class="card balance-card">
                    <div class="card-icon"><i class="fa-solid fa-wallet"></i></div>
                    <div class="card-label">Available Balance</div>
                    <div class="card-value">${formatCurrency(currentUser.balance)}</div>
                    <div class="card-subtitle">Available to deposit</div>
                </div>
            </div>
            
            <div class="form-card card">
                <div class="form-header">
                    <div class="form-header-icon" style="background: var(--accent); color: var(--primary-dark);"><i class="fa-solid fa-piggy-bank"></i></div>
                    <div class="form-header-text">
                        <h2>Manage Savings</h2>
                        <p>Deposit or withdraw from your savings</p>
                    </div>
                </div>
                
                <div class="card-grid card-grid-2">
                    <button class="category-btn" onclick="selectSavingsAction('deposit')" style="padding: 3rem 1rem; border-color: var(--primary);">
                        <div class="category-btn-icon" style="color: var(--primary);"><i class="fa-solid fa-arrow-down"></i></div>
                        <h3 style="margin-bottom: 0.5rem;">Deposit</h3>
                        <p style="font-size: 0.875rem; color: var(--gray-600);">Transfer money to savings</p>
                    </button>
                    <button class="category-btn" onclick="selectSavingsAction('withdraw')" style="padding: 3rem 1rem; border-color: var(--accent);">
                        <div class="category-btn-icon" style="color: var(--accent);"><i class="fa-solid fa-arrow-up"></i></div>
                        <h3 style="margin-bottom: 0.5rem;">Withdraw</h3>
                        <p style="font-size: 0.875rem; color: var(--gray-600);">Transfer money from savings</p>
                    </button>
                </div>
            </div>
        `;
    } else {
        contentArea.innerHTML = `
            <div class="form-card card">
                <form id="savings-form">
                    <div class="form-group">
                        <label>Action</label>
                        <div style="display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; background: ${savingsAction === 'deposit' ? 'rgba(30, 58, 95, 0.1)' : 'rgba(251, 191, 36, 0.1)'}; border-radius: 0.5rem; margin-top: 0.5rem;">
                            <span style="color: ${savingsAction === 'deposit' ? 'var(--primary)' : 'var(--accent)'}; display: flex; align-items: center; gap: 0.5rem;">
                                <i class="fa-solid ${savingsAction === 'deposit' ? 'fa-arrow-down' : 'fa-arrow-up'}"></i>
                                ${savingsAction === 'deposit' ? 'Deposit to Savings' : 'Withdraw from Savings'}
                            </span>
                            <button type="button" onclick="resetSavingsAction()" style="margin-left: auto; background: none; border: none; color: #3b82f6; text-decoration: underline; cursor: pointer;">Change</button>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="savings-amount">Amount *</label>
                        <input type="number" id="savings-amount" step="0.01" required>
                        <p style="font-size: 0.875rem; color: var(--gray-600); margin-top: 0.5rem;">
                            Maximum: ${formatCurrency(savingsAction === 'deposit' ? currentUser.balance : currentUser.savings)}
                        </p>
                    </div>
                    
                    <button type="submit" class="btn-primary btn-full" style="background: ${savingsAction === 'deposit' ? 'var(--primary)' : 'var(--accent)'}; color: white;">
                        ${savingsAction === 'deposit' ? 'Deposit' : 'Withdraw'}
                    </button>
                </form>
            </div>
        `;
        
        document.getElementById('savings-form').addEventListener('submit', (e) => {
            e.preventDefault();
            
            if (!checkAccountStatus()) {
                showAccountFrozenMessage();
                return;
            }
            
            const amount = parseFloat(document.getElementById('savings-amount').value);
            
            if (amount <= 0) {
                alert('Please enter a valid amount');
                return;
            }
            
            if (savingsAction === 'deposit') {
                if (amount > currentUser.balance) {
                    alert('Insufficient balance');
                    return;
                }
                
                const newBalance = currentUser.balance - amount;
                const newSavings = currentUser.savings + amount;
                const newTransaction = {
                    id: Date.now().toString(),
                    type: 'debit',
                    amount: amount,
                    description: 'Deposit to Savings',
                    date: new Date().toISOString(),
                    balance: newBalance
                };
                
                updateUser({
                    balance: newBalance,
                    savings: newSavings,
                    transactions: [...currentUser.transactions, newTransaction]
                });
                
                showSuccess('Transaction Successful!', `Deposited ${formatCurrency(amount)} to savings.`);
            } else {
                if (amount > currentUser.savings) {
                    alert('Insufficient savings');
                    return;
                }
                
                const newBalance = currentUser.balance + amount;
                const newSavings = currentUser.savings - amount;
                const newTransaction = {
                    id: Date.now().toString(),
                    type: 'credit',
                    amount: amount,
                    description: 'Withdrawal from Savings',
                    date: new Date().toISOString(),
                    balance: newBalance
                };
                
                updateUser({
                    balance: newBalance,
                    savings: newSavings,
                    transactions: [...currentUser.transactions, newTransaction]
                });
                
                showSuccess('Transaction Successful!', `Withdrew ${formatCurrency(amount)} from savings.`);
            }
            
            savingsAction = '';
            setTimeout(() => {
                loadSavings();
            }, 3000);
        });
    }
}

window.selectSavingsAction = function(action) {
    savingsAction = action;
    loadSavings();
};

window.resetSavingsAction = function() {
    savingsAction = '';
    loadSavings();
};

// HISTORY PAGE
function loadHistory() {
    const totalCredits = currentUser.transactions
        .filter(t => t.type === 'credit')
        .reduce((sum, t) => sum + t.amount, 0);
    const totalDebits = currentUser.transactions
        .filter(t => t.type === 'debit')
        .reduce((sum, t) => sum + t.amount, 0);
    
    contentArea.innerHTML = `
        <div class="card-grid card-grid-3">
            <div class="card">
                <p style="font-size: 0.875rem; color: var(--gray-600); margin-bottom: 0.5rem;">Total Transactions</p>
                <h2 style="color: var(--primary);">${currentUser.transactions.length}</h2>
            </div>
            <div class="card">
                <p style="font-size: 0.875rem; color: var(--gray-600); margin-bottom: 0.5rem;">Total Credits</p>
                <h2 style="color: #10b981;">${formatCurrency(totalCredits)}</h2>
            </div>
            <div class="card">
                <p style="font-size: 0.875rem; color: var(--gray-600); margin-bottom: 0.5rem;">Total Debits</p>
                <h2 style="color: #ef4444;">${formatCurrency(totalDebits)}</h2>
            </div>
        </div>
        
        <div class="card">
            <div style="margin-bottom: 1.5rem;">
                <input type="text" id="search-transactions" placeholder="Search transactions..." style="width: 100%; padding: 0.75rem; border: 1px solid var(--gray-200); border-radius: 0.5rem; font-size: 1rem;">
            </div>
            
            <div style="display: flex; gap: 0.5rem; margin-bottom: 1.5rem;">
                <button class="filter-btn active" data-filter="all" style="padding: 0.5rem 1rem; border: none; border-radius: 0.5rem; cursor: pointer; background: var(--primary); color: white;">All</button>
                <button class="filter-btn" data-filter="credit" style="padding: 0.5rem 1rem; border: 1px solid var(--gray-200); border-radius: 0.5rem; cursor: pointer; background: white;">Credits</button>
                <button class="filter-btn" data-filter="debit" style="padding: 0.5rem 1rem; border: 1px solid var(--gray-200); border-radius: 0.5rem; cursor: pointer; background: white;">Debits</button>
            </div>
            
            <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.5rem;">
                <span style="font-size: 1.5rem;"><i class="fa-solid fa-clock-rotate-left"></i></span>
                <h2 style="color: var(--primary-dark);">Transaction History</h2>
                <span style="margin-left: auto; font-size: 0.875rem; color: var(--gray-600);" id="transaction-count">${currentUser.transactions.length} transactions</span>
            </div>
            
            <div id="transaction-list">
                ${currentUser.transactions.slice().reverse().map(t => `
                    <div class="transaction-item" data-type="${t.type}" data-description="${t.description.toLowerCase()}">
                        <div class="transaction-left">
                            <div class="transaction-icon ${t.type}">
                                ${t.type === 'credit' ? '⬇️' : '⬆️'}
                            </div>
                            <div class="transaction-info">
                                <p>${t.description}</p>
                                <p>${formatDateTime(t.date)}</p>
                            </div>
                        </div>
                        <div class="transaction-right">
                            <div class="transaction-amount ${t.type}">
                                ${t.type === 'credit' ? '+' : '-'}${formatCurrency(t.amount)}
                            </div>
                            <div class="transaction-balance">Balance: ${formatCurrency(t.balance)}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    // Filter functionality
    const filterBtns = document.querySelectorAll('.filter-btn');
    const searchInput = document.getElementById('search-transactions');
    const transactionItems = document.querySelectorAll('.transaction-item');
    const transactionCount = document.getElementById('transaction-count');
    
    let currentFilter = 'all';
    let currentSearch = '';
    
    function applyFilters() {
        let visibleCount = 0;
        transactionItems.forEach(item => {
            const type = item.getAttribute('data-type');
            const description = item.getAttribute('data-description');
            
            const matchesFilter = currentFilter === 'all' || type === currentFilter;
            const matchesSearch = description.includes(currentSearch);
            
            if (matchesFilter && matchesSearch) {
                item.style.display = 'flex';
                visibleCount++;
            } else {
                item.style.display = 'none';
            }
        });
        
        transactionCount.textContent = `${visibleCount} transaction${visibleCount !== 1 ? 's' : ''}`;
    }
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => {
                b.classList.remove('active');
                b.style.background = 'white';
                b.style.color = 'inherit';
            });
            btn.classList.add('active');
            
            const filter = btn.getAttribute('data-filter');
            currentFilter = filter;
            
            if (filter === 'all') {
                btn.style.background = 'var(--primary)';
                btn.style.color = 'white';
            } else if (filter === 'credit') {
                btn.style.background = '#10b981';
                btn.style.color = 'white';
            } else {
                btn.style.background = '#ef4444';
                btn.style.color = 'white';
            }
            
            applyFilters();
        });
    });
    
    searchInput.addEventListener('input', (e) => {
        currentSearch = e.target.value.toLowerCase();
        applyFilters();
    });
}

// MANAGE ACCOUNT PAGE
let manageSection = 'details';

function loadManage() {
    contentArea.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
            <button class="manage-tab ${manageSection === 'details' ? 'active' : ''}" onclick="selectManageSection('details')" style="padding: 1.5rem; border: 2px solid ${manageSection === 'details' ? 'var(--primary)' : 'var(--gray-200)'}; background: ${manageSection === 'details' ? 'var(--primary)' : 'white'}; color: ${manageSection === 'details' ? 'white' : 'inherit'}; border-radius: 0.5rem; cursor: pointer; text-align: center;">
                <div style="font-size: 1.5rem; margin-bottom: 0.5rem;"><i class="fa-solid fa-user"></i></div>
                <p style="font-size: 0.875rem;">Details</p>
            </button>
            <button class="manage-tab ${manageSection === 'password' ? 'active' : ''}" onclick="selectManageSection('password')" style="padding: 1.5rem; border: 2px solid ${manageSection === 'password' ? 'var(--primary)' : 'var(--gray-200)'}; background: ${manageSection === 'password' ? 'var(--primary)' : 'white'}; color: ${manageSection === 'password' ? 'white' : 'inherit'}; border-radius: 0.5rem; cursor: pointer; text-align: center;">
                <div style="font-size: 1.5rem; margin-bottom: 0.5rem;"><i class="fa-solid fa-lock"></i></div>
                <p style="font-size: 0.875rem;">Password</p>
            </button>
            <button class="manage-tab ${manageSection === 'deactivate' ? 'active' : ''}" onclick="selectManageSection('deactivate')" style="padding: 1.5rem; border: 2px solid ${manageSection === 'deactivate' ? '#ef4444' : 'var(--gray-200)'}; background: ${manageSection === 'deactivate' ? '#ef4444' : 'white'}; color: ${manageSection === 'deactivate' ? 'white' : 'inherit'}; border-radius: 0.5rem; cursor: pointer; text-align: center;">
                <div style="font-size: 1.5rem; margin-bottom: 0.5rem;"><i class="fa-solid fa-triangle-exclamation"></i></div>
                <p style="font-size: 0.875rem;">Deactivate</p>
            </button>
            <button class="manage-tab ${manageSection === 'debug' ? 'active' : ''}" onclick="selectManageSection('debug')" style="padding: 1.5rem; border: 2px solid ${manageSection === 'debug' ? 'var(--accent)' : 'var(--gray-200)'}; background: ${manageSection === 'debug' ? 'var(--accent)' : 'white'}; color: ${manageSection === 'debug' ? 'white' : 'inherit'}; border-radius: 0.5rem; cursor: pointer; text-align: center;">
                <div style="font-size: 1.5rem; margin-bottom: 0.5rem;"><i class="fa-solid fa-bug"></i></div>
                <p style="font-size: 0.875rem;">Debug</p>
            </button>
        </div>
        
        <div id="manage-content"></div>
    `;
    
    renderManageSection();
}

function renderManageSection() {
    const manageContent = document.getElementById('manage-content');
    
    if (manageSection === 'details') {
        const memberSince = currentUser.transactions.length > 0 
            ? new Date(currentUser.transactions[0].date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
            : 'Recently';
        
        // Format address
        const address = currentUser.address || {};
        const fullAddress = typeof address === 'string' 
            ? address 
            : `${address.city || 'N/A'}, ${address.province || 'N/A'}, ${address.country || 'N/A'}`;
        
        // Check if profile picture exists
        const profilePicture = currentUser.profilePicture || null;
        const iconDisplay = profilePicture 
            ? `<img src="${profilePicture}" alt="Profile" style="width: 100%; height: 100%; object-fit: cover; border-radius: 0.75rem;">`
            : `<i class="fa-solid fa-user"></i>`;
            
        manageContent.innerHTML = `
            <div class="card">
                <div class="form-header">
                    <div class="form-header-icon" id="profile-icon-display">${iconDisplay}</div>
                    <div class="form-header-text">
                        <h2>Personal Details</h2>
                        <p>View your account information</p>
                    </div>
                </div>
                
                <div style="margin-top: 1.5rem; padding: 1.5rem; background: var(--gray-50); border-radius: 0.5rem;">
                    <h3 style="color: var(--primary-dark); font-size: 1rem; margin-bottom: 1rem;">Profile Picture</h3>
                    <div style="display: flex; align-items: center; gap: 1.5rem; margin-bottom: 1rem;">
                        <div style="width: 100px; height: 100px; border-radius: 50%; overflow: hidden; border: 3px solid var(--primary); background: var(--primary-dark); display: flex; align-items: center; justify-content: center; color: var(--accent); font-size: 2.5rem;" id="profile-preview">
                            ${profilePicture ? `<img src="${profilePicture}" alt="Profile" style="width: 100%; height: 100%; object-fit: cover;">` : '<i class="fa-solid fa-user"></i>'}
                        </div>
                        <div style="flex: 1;">
                            <div>
                                <label for="profile-upload" class="btn-primary" style="display: inline-block; cursor: pointer; margin-bottom: 0.5rem; padding: 0.75rem 1.5rem;">
                                    <i class="fa-solid fa-upload"></i> Upload Photo
                                </label>
                                <input type="file" id="profile-upload" accept="image/*" style="display: none;">
                            </div>
                            <p style="font-size: 0.875rem; color: var(--gray-600); margin-top: 0.5rem;">Upload a profile picture (JPG, PNG, max 5MB)</p>
                            ${profilePicture ? '<button type="button" id="remove-profile" class="btn-primary" style="background: #ef4444; margin-top: 0.5rem; cursor: pointer;"><i class="fa-solid fa-trash"></i> Remove Photo</button>' : ''}
                        </div>
                    </div>
                </div>
                
                <div style="display: grid; gap: 1rem; margin-top: 1.5rem;">
                    <h3 style="color: var(--primary-dark); font-size: 1rem; margin-top: 1rem; border-bottom: 2px solid var(--primary-dark); padding-bottom: 0.5rem;">Personal Information</h3>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem;">
                        <div class="form-group">
                            <label>First Name</label>
                            <div style="padding: 0.75rem; background: var(--gray-50); border-radius: 0.5rem; margin-top: 0.5rem;">${currentUser.firstName || 'N/A'}</div>
                        </div>
                        <div class="form-group">
                            <label>Middle Name</label>
                            <div style="padding: 0.75rem; background: var(--gray-50); border-radius: 0.5rem; margin-top: 0.5rem;">${currentUser.middleName || 'N/A'}</div>
                        </div>
                        <div class="form-group">
                            <label>Last Name</label>
                            <div style="padding: 0.75rem; background: var(--gray-50); border-radius: 0.5rem; margin-top: 0.5rem;">${currentUser.lastName || 'N/A'}</div>
                        </div>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                        <div class="form-group">
                            <label>Gender</label>
                            <div style="padding: 0.75rem; background: var(--gray-50); border-radius: 0.5rem; margin-top: 0.5rem;">${currentUser.gender || 'N/A'}</div>
                        </div>
                        <div class="form-group">
                            <label>Birthday</label>
                            <div style="padding: 0.75rem; background: var(--gray-50); border-radius: 0.5rem; margin-top: 0.5rem;">${currentUser.birthday ? new Date(currentUser.birthday).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}</div>
                        </div>
                    </div>
                    
                    <h3 style="color: var(--primary-dark); font-size: 1rem; margin-top: 1rem; border-bottom: 2px solid var(--primary-dark); padding-bottom: 0.5rem;">Contact Information</h3>
                    
                    <div class="form-group">
                        <label>Email Address</label>
                        <div style="padding: 0.75rem; background: var(--gray-50); border-radius: 0.5rem; margin-top: 0.5rem;">${currentUser.email || 'N/A'}</div>
                    </div>
                    
                    <div class="form-group">
                        <label>Phone Number</label>
                        <div style="padding: 0.75rem; background: var(--gray-50); border-radius: 0.5rem; margin-top: 0.5rem;">${currentUser.phone || 'N/A'}</div>
                    </div>
                    
                    <div class="form-group">
                        <label>Address</label>
                        <div style="padding: 0.75rem; background: var(--gray-50); border-radius: 0.5rem; margin-top: 0.5rem;">${fullAddress}</div>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem;">
                        <div class="form-group">
                            <label>City</label>
                            <div style="padding: 0.75rem; background: var(--gray-50); border-radius: 0.5rem; margin-top: 0.5rem;">${address.city || 'N/A'}</div>
                        </div>
                        <div class="form-group">
                            <label>Province</label>
                            <div style="padding: 0.75rem; background: var(--gray-50); border-radius: 0.5rem; margin-top: 0.5rem;">${address.province || 'N/A'}</div>
                        </div>
                        <div class="form-group">
                            <label>Country</label>
                            <div style="padding: 0.75rem; background: var(--gray-50); border-radius: 0.5rem; margin-top: 0.5rem;">${address.country || 'N/A'}</div>
                        </div>
                    </div>
                    
                    <h3 style="color: var(--primary-dark); font-size: 1rem; margin-top: 1rem; border-bottom: 2px solid var(--primary-dark); padding-bottom: 0.5rem;">Account Information</h3>
                    
                    <div class="form-group">
                        <label>Account Number</label>
                        <div style="padding: 0.75rem; background: var(--gray-50); border-radius: 0.5rem; margin-top: 0.5rem; font-family: monospace; font-weight: bold; font-size: 1.1rem;">${currentUser.accountNumber || 'N/A'}</div>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                        <div class="form-group">
                            <label>Account Status</label>
                            <div style="padding: 0.75rem; background: ${currentUser.isActive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'}; color: ${currentUser.isActive ? '#10b981' : '#ef4444'}; border-radius: 0.5rem; margin-top: 0.5rem; font-weight: bold;">
                                ${currentUser.isActive ? '✅ Active' : '❌ Inactive'}
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Member Since</label>
                            <div style="padding: 0.75rem; background: var(--gray-50); border-radius: 0.5rem; margin-top: 0.5rem;">${memberSince}</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Profile picture upload handler
        const profileUpload = document.getElementById('profile-upload');
        const profilePreview = document.getElementById('profile-preview');
        const profileIconDisplay = document.getElementById('profile-icon-display');
        
        if (profileUpload) {
            profileUpload.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    // Check file size (max 5MB)
                    if (file.size > 5 * 1024 * 1024) {
                        alert('File size must be less than 5MB');
                        return;
                    }
                    
                    // Check file type
                    if (!file.type.startsWith('image/')) {
                        alert('Please select an image file');
                        return;
                    }
                    
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        const imageData = event.target.result;
                        
                        // Update preview
                        profilePreview.innerHTML = `<img src="${imageData}" alt="Profile" style="width: 100%; height: 100%; object-fit: cover;">`;
                        
                        // Update icon in header
                        profileIconDisplay.innerHTML = `<img src="${imageData}" alt="Profile" style="width: 100%; height: 100%; object-fit: cover; border-radius: 0.75rem;">`;
                        
                        // Save to user data
                        updateUser({ profilePicture: imageData });
                        
                        // Show remove button
                        const removeBtn = document.getElementById('remove-profile');
                        if (!removeBtn) {
                            const uploadSection = profileUpload.closest('div').querySelector('div');
                            const removeButton = document.createElement('button');
                            removeButton.type = 'button';
                            removeButton.id = 'remove-profile';
                            removeButton.className = 'btn-primary';
                            removeButton.style.cssText = 'background: #ef4444; margin-top: 0.5rem; cursor: pointer;';
                            removeButton.innerHTML = '<i class="fa-solid fa-trash"></i> Remove Photo';
                            removeButton.addEventListener('click', removeProfilePicture);
                            uploadSection.appendChild(removeButton);
                        }
                        
                        showSuccess('Success!', 'Profile picture updated successfully.');
                    };
                    reader.readAsDataURL(file);
                }
            });
        }
        
        // Remove profile picture handler
        const removeProfileBtn = document.getElementById('remove-profile');
        if (removeProfileBtn) {
            removeProfileBtn.addEventListener('click', removeProfilePicture);
        }
        
        function removeProfilePicture() {
            if (confirm('Are you sure you want to remove your profile picture?')) {
                // Update preview
                profilePreview.innerHTML = '<i class="fa-solid fa-user"></i>';
                
                // Update icon in header
                profileIconDisplay.innerHTML = '<i class="fa-solid fa-user"></i>';
                
                // Remove from user data
                updateUser({ profilePicture: null });
                
                // Remove remove button
                const removeBtn = document.getElementById('remove-profile');
                if (removeBtn) {
                    removeBtn.remove();
                }
                
                // Clear file input
                if (profileUpload) {
                    profileUpload.value = '';
                }
                
                showSuccess('Success!', 'Profile picture removed successfully.');
            }
        }
    } else if (manageSection === 'password') {
        manageContent.innerHTML = `
            <div class="card">
                <div class="form-header">
                    <div class="form-header-icon"><i class="fa-solid fa-lock"></i></div>
                    <div class="form-header-text">
                        <h2>Change Password</h2>
                        <p>Update your account password</p>
                    </div>
                </div>
                
                <form id="password-form" style="margin-top: 1.5rem;">
                    <div class="form-group">
                        <label for="current-password">Current Password *</label>
                        <input type="password" id="current-password" required>
                    </div>
                    <div class="form-group">
                        <label for="new-password">New Password *</label>
                        <input type="password" id="new-password" required>
                        <p style="font-size: 0.875rem; color: var(--gray-600); margin-top: 0.25rem;">Must be at least 6 characters</p>
                    </div>
                    <div class="form-group">
                        <label for="confirm-password">Confirm New Password *</label>
                        <input type="password" id="confirm-password" required>
                    </div>
                    <button type="submit" class="btn-primary btn-full">Change Password</button>
                </form>
            </div>
        `;
        
        document.getElementById('password-form').addEventListener('submit', (e) => {
            e.preventDefault();
            
            const currentPassword = document.getElementById('current-password').value;
            const newPassword = document.getElementById('new-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            
            if (currentPassword !== currentUser.password) {
                alert('Current password is incorrect');
                return;
            }
            
            if (newPassword !== confirmPassword) {
                alert('New passwords do not match');
                return;
            }
            
            if (newPassword.length < 6) {
                alert('Password must be at least 6 characters');
                return;
            }
            
            updateUser({ password: newPassword });
            showSuccess('Success!', 'Your password has been changed successfully.');
            
            setTimeout(() => {
                manageSection = 'details';
                loadManage();
            }, 3000);
        });
    } else if (manageSection === 'deactivate') {
        const isAccountActive = currentUser.isActive !== false;
        
        manageContent.innerHTML = `
            <div class="card">
                <div class="form-header">
                    <div class="form-header-icon" style="background: ${isAccountActive ? '#ef4444' : '#10b981'};"><i class="fa-solid fa-triangle-exclamation"></i></div>
                    <div class="form-header-text">
                        <h2 style="color: ${isAccountActive ? '#ef4444' : '#10b981'};">${isAccountActive ? 'Deactivate Account' : 'Account Status'}</h2>
                        <p>${isAccountActive ? 'Permanently close your account' : 'Reactivate your account'}</p>
                    </div>
                </div>
                
                ${isAccountActive ? `
                <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 0.5rem; padding: 1rem; margin: 1.5rem 0;">
                    <p style="color: #991b1b; margin-bottom: 0.5rem;"><strong>⚠️ Warning: This action cannot be undone</strong></p>
                    <ul style="margin-left: 1.5rem; color: #b91c1c; font-size: 0.875rem;">
                        <li>Your account will be permanently closed</li>
                        <li>All data will be retained but account will be inactive</li>
                        <li>You will be logged out immediately</li>
                        <li>You can reactivate your account using the button below</li>
                    </ul>
                </div>
                
                <button onclick="deactivateAccount()" class="btn-primary btn-full" style="background: #ef4444; margin-bottom: 1rem;">
                    <i class="fa-solid fa-ban"></i> Deactivate My Account
                </button>
                ` : `
                <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 0.5rem; padding: 1rem; margin: 1.5rem 0;">
                    <p style="color: #065f46; margin-bottom: 0.5rem;"><strong>ℹ️ Account Status: Deactivated</strong></p>
                    <ul style="margin-left: 1.5rem; color: #047857; font-size: 0.875rem;">
                        <li>Your account is currently inactive</li>
                        <li>Transactions and payments are disabled</li>
                        <li>You can reactivate your account to restore full functionality</li>
                    </ul>
                </div>
                
                <button onclick="activateAccount()" class="btn-primary btn-full" style="background: #10b981; margin-bottom: 1rem;">
                    <i class="fa-solid fa-check-circle"></i> Activate My Account
                </button>
                `}
            </div>
        `;
    } else if (manageSection === 'debug') {
        manageContent.innerHTML = `
            <div class="card">
                <div class="form-header">
                    <div class="form-header-icon" style="background: var(--accent); color: var(--primary-dark);"><i class="fa-solid fa-sack-dollar"></i></div>
                    <div class="form-header-text">
                        <h2 style="color: var(--accent);">Debug: Import Funds</h2>
                        <p>Add funds to your account for testing</p>
                    </div>
                </div>
                
                <div style="background: rgba(251, 191, 36, 0.1); border: 1px solid var(--accent); border-radius: 0.5rem; padding: 1rem; margin: 1.5rem 0;">
                    <p style="font-size: 0.875rem; color: var(--gray-700);">
                        🔧 This is a debug feature for prototype testing. In production, funds would come from real deposits or transfers.
                    </p>
                </div>
                
                <form id="debug-form">
                    <div class="form-group">
                        <label for="debug-amount">Amount to Import *</label>
                        <input type="number" id="debug-amount" step="0.01" required>
                        <p style="font-size: 0.875rem; color: var(--gray-600); margin-top: 0.25rem;">Maximum: ₱1,000,000</p>
                    </div>
                    <button type="submit" class="btn-primary btn-full" style="background: var(--accent);">Import</button>
                </form>
            </div>
        `;
        
        document.getElementById('debug-form').addEventListener('submit', (e) => {
            e.preventDefault();
            
            const amount = parseFloat(document.getElementById('debug-amount').value);
            
            if (amount <= 0 || amount > 1000000) {
                alert('Please enter a valid amount (max: 1,000,000)');
                return;
            }
            
            const newBalance = currentUser.balance + amount;
            const newTransaction = {
                id: Date.now().toString(),
                type: 'credit',
                amount: amount,
                description: 'Debug Import - Manual Deposit',
                date: new Date().toISOString(),
                balance: newBalance
            };
            
            updateUser({
                balance: newBalance,
                transactions: [...currentUser.transactions, newTransaction]
            });
            
            showSuccess('Success!', `${formatCurrency(amount)} has been added to your account.`);
            
            setTimeout(() => {
                manageSection = 'details';
                loadManage();
            }, 3000);
        });
    }
}

window.selectManageSection = function(section) {
    manageSection = section;
    loadManage();
};

window.deactivateAccount = function() {
    const confirmed = confirm('Are you sure you want to deactivate your account? This action cannot be undone and you will be logged out.');
    
    if (confirmed) {
        updateUser({ isActive: false });
        alert('Your account has been deactivated');
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    }
};

window.activateAccount = function() {
    const confirmed = confirm('Are you sure you want to activate your account? This will restore all account functionality.');
    
    if (confirmed) {
        updateUser({ isActive: true });
        showSuccess('Account Activated!', 'Your account has been successfully reactivated. All features are now available.');
        
        // Refresh the page to update UI
        setTimeout(() => {
            manageSection = 'deactivate';
            loadManage();
        }, 2000);
    }
};

// COMING SOON PAGE
function loadComingSoon(feature) {
    contentArea.innerHTML = `
        <div class="card coming-soon">
            <div class="coming-soon-icon"><i class="fa-solid fa-hammer"></i></div>
            <h2>Coming Soon</h2>
            <p style="margin-bottom: 0.5rem;">${feature} is currently under development.</p>
            <p style="font-size: 0.875rem; color: var(--gray-500);">
                This feature is part of our non-functional prototype and will be available in future updates.
            </p>
        </div>
    `;
}

// Load initial page
loadPage('home');
