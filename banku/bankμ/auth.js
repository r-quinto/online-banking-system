// Initialize demo account
function initializeDemoAccount() {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    if (!users.find(u => u.email === 'demo@bank.com')) {
        users.push({
            id: 'demo',
            email: 'demo@bank.com',
            password: 'demo123',
            firstName: 'Demo',
            middleName: 'Test',
            lastName: 'User',
            gender: 'Other',
            birthday: '1990-01-01',
            phone: '09123456789',
            address: {
                city: 'Demo City',
                province: 'Demo Province',
                country: 'Philippines'
            },
            balance: 25000,
            savings: 15000,
            accountNumber: '1234567890',
            transactions: [
                {
                    id: '1',
                    type: 'credit',
                    amount: 5000,
                    description: 'Salary Deposit',
                    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                    balance: 5000
                },
                {
                    id: '2',
                    type: 'debit',
                    amount: 150,
                    description: 'Electricity Bill',
                    date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
                    balance: 4850
                },
                {
                    id: '3',
                    type: 'credit',
                    amount: 20000,
                    description: 'Freelance Payment',
                    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                    balance: 24850
                },
                {
                    id: '4',
                    type: 'debit',
                    amount: 500,
                    description: 'Transfer to John Doe',
                    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                    balance: 24350
                },
                {
                    id: '5',
                    type: 'debit',
                    amount: 75,
                    description: 'Internet Bill',
                    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                    balance: 24275
                },
                {
                    id: '6',
                    type: 'credit',
                    amount: 725,
                    description: 'Refund from Store',
                    date: new Date().toISOString(),
                    balance: 25000
                }
            ],
            isActive: true
        });
        localStorage.setItem('users', JSON.stringify(users));
    }
}

initializeDemoAccount();

// Toggle between login and register
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const authTitle = document.getElementById('auth-title');
const toggleAuthBtn = document.getElementById('toggle-auth');

let isLogin = true;

// Check URL parameter to determine which form to show
const urlParams = new URLSearchParams(window.location.search);
const mode = urlParams.get('mode');
const authContainer = document.querySelector('.auth-container');
const authPage = document.querySelector('.auth-page');

// Page load animations (matching index.html style)
window.addEventListener('load', () => {
    const authCard = document.querySelector('.auth-card');
    const authHeader = document.querySelector('.auth-header');
    const authToggle = document.querySelector('.auth-toggle');
    const demoInfo = document.querySelector('.demo-info');
    const activeForm = isLogin ? loginForm : registerForm;
    
    // Animate card (like aboutbox in index.html)
    setTimeout(() => {
        if (authCard) {
            authCard.classList.add('show');
        }
    }, 100);
    
    // Animate header
    setTimeout(() => {
        if (authHeader) {
            authHeader.classList.add('show');
        }
    }, 200);
    
    // Animate form (like servicesbox in index.html)
    setTimeout(() => {
        if (activeForm) {
            activeForm.classList.add('show');
        }
    }, 300);
    
    // Animate toggle and demo info
    setTimeout(() => {
        if (authToggle) {
            authToggle.classList.add('show');
        }
        if (demoInfo) {
            demoInfo.classList.add('show');
        }
    }, 400);
});

if (mode === 'register') {
    isLogin = false;
    loginForm.style.display = 'none';
    registerForm.style.display = 'block';
    authTitle.textContent = 'Create Account';
    toggleAuthBtn.textContent = 'Already have an account? Login';
    authContainer.classList.add('register-mode');
    authPage.classList.add('has-register');
}

toggleAuthBtn.addEventListener('click', () => {
    isLogin = !isLogin;
    
    const currentForm = isLogin ? registerForm : loginForm;
    const nextForm = isLogin ? loginForm : registerForm;
    
    // Fade out current form
    currentForm.classList.remove('show');
    
    setTimeout(() => {
        if (isLogin) {
            loginForm.style.display = 'block';
            registerForm.style.display = 'none';
            authTitle.textContent = 'Welcome Back';
            toggleAuthBtn.textContent = "Don't have an account? Register";
            authContainer.classList.remove('register-mode');
            authPage.classList.remove('has-register');
        } else {
            loginForm.style.display = 'none';
            registerForm.style.display = 'block';
            authTitle.textContent = 'Create Account';
            toggleAuthBtn.textContent = 'Already have an account? Login';
            authContainer.classList.add('register-mode');
            authPage.classList.add('has-register');
        }
        
        // Fade in new form
        setTimeout(() => {
            nextForm.classList.add('show');
        }, 50);
    }, 300);
});

// Login handler
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const submitBtn = loginForm.querySelector('.btn-primary');
    const authCard = document.querySelector('.auth-card');
    const formGroups = loginForm.querySelectorAll('.form-group');
    
    // Professional loading state
    if (submitBtn) {
        submitBtn.classList.add('loading');
        submitBtn.textContent = 'Logging in...';
    }
    
    // Animate card (pulsing effect)
    if (authCard) {
        authCard.classList.add('submitting');
    }
    
    // Animate form groups sequentially (like servicesbox in index.html)
    formGroups.forEach((group, index) => {
        setTimeout(() => {
            group.classList.add('submitting');
        }, index * 100);
    });
    
    // Process after animation
    setTimeout(() => {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            // Success animation
            if (authCard) {
                authCard.classList.remove('submitting');
                authCard.classList.add('success');
            }
            
            setTimeout(() => {
                localStorage.setItem('currentUser', JSON.stringify(user));
                window.location.href = 'dashboard.html';
            }, 500);
        } else {
            // Error animation
            if (authCard) {
                authCard.classList.remove('submitting');
                authCard.classList.add('error');
                setTimeout(() => {
                    authCard.classList.remove('error');
                }, 500);
            }
            
            // Reset form groups
            formGroups.forEach((group) => {
                group.classList.remove('submitting');
            });
            
            // Reset button
            if (submitBtn) {
                submitBtn.classList.remove('loading');
                submitBtn.textContent = 'Login';
            }
            
            alert('Invalid credentials. Try demo@bank.com / demo123');
        }
    }, 800);
});

// Password toggle for register form
const toggleRegPassword = document.getElementById('toggleRegPassword');
const toggleRegConfirm = document.getElementById('toggleRegConfirm');
const togglelogPass = document.getElementById('togglelogPass');

if (toggleRegPassword) {
    toggleRegPassword.addEventListener('click', () => {
        const passwordInput = document.getElementById('register-password');
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        
    });
}

if (toggleRegConfirm) {
    toggleRegConfirm.addEventListener('click', () => {
        const confirmInput = document.getElementById('register-confirm');
        const type = confirmInput.getAttribute('type') === 'password' ? 'text' : 'password';
        confirmInput.setAttribute('type', type);
        
    });
}

if (togglelogPass) {
    togglelogPass.addEventListener('click', () => {
        const confirmInput = document.getElementById('login-password');
        const type = confirmInput.getAttribute('type') === 'password' ? 'text' : 'password';
        confirmInput.setAttribute('type', type);
        
    });
}

// Register handler
registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const firstName = document.getElementById('register-firstname').value;
    const middleName = document.getElementById('register-middlename').value;
    const lastName = document.getElementById('register-lastname').value;
    const gender = document.getElementById('register-gender').value;
    const birthday = document.getElementById('register-birthday').value;
    const email = document.getElementById('register-email').value;
    const phone = document.getElementById('register-phone').value;
    const city = document.getElementById('register-city').value;
    const province = document.getElementById('register-province').value;
    const country = document.getElementById('register-country').value;
    const password = document.getElementById('register-password').value;
    const confirm = document.getElementById('register-confirm').value;
    const terms = document.getElementById('register-terms').checked;
    const submitBtn = registerForm.querySelector('.btn-primary');
    const authCard = document.querySelector('.auth-card');
    const formGroups = registerForm.querySelectorAll('.form-group');
    
    // Professional loading state
    if (submitBtn) {
        submitBtn.classList.add('loading');
        submitBtn.textContent = 'Creating Account...';
    }
    
    // Animate card (pulsing effect)
    if (authCard) {
        authCard.classList.add('submitting');
    }
    
    // Animate form groups sequentially (like servicesbox in index.html)
    formGroups.forEach((group, index) => {
        setTimeout(() => {
            group.classList.add('submitting');
        }, index * 60);
    });
    
    // Validation with animations
    setTimeout(() => {
        if (!terms) {
            showError(authCard, formGroups, submitBtn, 'Please agree to the Terms of Service and Privacy Policy');
            return;
        }
        
        if (password !== confirm) {
            showError(authCard, formGroups, submitBtn, 'Passwords do not match');
            return;
        }
        
        if (password.length < 6) {
            showError(authCard, formGroups, submitBtn, 'Password must be at least 6 characters long');
            return;
        }
        
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        
        if (users.find(u => u.email === email)) {
            showError(authCard, formGroups, submitBtn, 'Email already registered');
            return;
        }
        
        // Success - create user
        const newUser = {
            id: Date.now().toString(),
            email,
            password,
            firstName,
            middleName,
            lastName,
            gender,
            birthday,
            phone,
            address: {
                city,
                province,
                country
            },
            balance: 10000,
            savings: 5000,
            accountNumber: Math.floor(1000000000 + Math.random() * 9000000000).toString(),
            transactions: [
                {
                    id: '1',
                    type: 'credit',
                    amount: 10000,
                    description: 'Initial Deposit',
                    date: new Date().toISOString(),
                    balance: 10000
                }
            ],
            isActive: true,
            registrationDate: new Date().toISOString()
        };
        
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        
        // Success animation
        if (authCard) {
            authCard.classList.remove('submitting');
            authCard.classList.add('success');
        }
        
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 500);
    }, 800);
});

// Helper function for error animations
function showError(authCard, formGroups, submitBtn, message) {
    // Error animation
    if (authCard) {
        authCard.classList.remove('submitting');
        authCard.classList.add('error');
        setTimeout(() => {
            authCard.classList.remove('error');
        }, 500);
    }
    
    // Reset form groups
    formGroups.forEach((group) => {
        group.classList.remove('submitting');
    });
    
    // Reset button
    if (submitBtn) {
        submitBtn.classList.remove('loading');
        submitBtn.textContent = 'Create Account';
    }
    
    alert(message);
}
