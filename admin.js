// ============================================
// ADMIN DASHBOARD LOGIC
// ============================================

// CONFIGURATION
// REPLACE THIS WITH YOUR DEPLOYED GOOGLE APPS SCRIPT WEB APP URL
const BACKEND_URL = 'REPLACE_WITH_YOUR_WEB_APP_URL';

// STATE
let currentUserToken = localStorage.getItem('adminToken');

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();

    // Event Listeners
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('uploadForm').addEventListener('submit', handleImageUpload);
});

// ============================================
// AUTHENTICATION
// ============================================
function checkAuth() {
    const loginScreen = document.getElementById('loginScreen');
    const dashboard = document.getElementById('dashboard');

    if (currentUserToken) {
        loginScreen.style.display = 'none';
        dashboard.style.display = 'block';
        // Load initial data
        fetchBookings();
        fetchCurrentPrices();
    } else {
        loginScreen.style.display = 'flex';
        dashboard.style.display = 'none';
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const errorMsg = document.getElementById('loginError');

    showLoading(true);
    errorMsg.style.display = 'none';

    try {
        const response = await fetch(BACKEND_URL, {
            method: 'POST',
            body: JSON.stringify({
                action: 'login',
                username: usernameInput.value,
                password: passwordInput.value
            })
        });

        const data = await response.json();

        if (data.status === 'success') {
            currentUserToken = data.token;
            localStorage.setItem('adminToken', currentUserToken);
            checkAuth();
        } else {
            errorMsg.style.display = 'block';
            errorMsg.textContent = data.message || 'Invalid credentials';
        }
    } catch (err) {
        console.error(err);
        errorMsg.style.display = 'block';
        errorMsg.textContent = 'Connection error. Check console.';
    } finally {
        showLoading(false);
    }
}

function logout() {
    currentUserToken = null;
    localStorage.removeItem('adminToken');
    checkAuth();
}

// ============================================
// NAVIGATION
// ============================================

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('show');
}

// Close sidebar on mobile when a link is clicked
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(el => el.classList.remove('active'));
    // Show target
    document.getElementById(sectionId).classList.add('active');

    // Update Sidebar
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    // Find button that calls this function (approximate)
    const buttons = document.querySelectorAll('.nav-btn');
    for (let btn of buttons) {
        if (btn.getAttribute('onclick').includes(sectionId)) {
            btn.classList.add('active');
            break;
        }
    }

    // Close sidebar on mobile
    if (window.innerWidth <= 768) {
        document.getElementById('sidebar').classList.remove('show');
    }
}

// ============================================
// BOOKINGS
// ============================================
async function fetchBookings() {
    if (!currentUserToken) return;

    const tableBody = document.querySelector('#bookingsTable tbody');
    tableBody.innerHTML = '<tr><td colspan="8" style="text-align:center;">Loading data...</td></tr>';

    try {
        // GET request requires query params if using doGet
        // But our backend setup uses POST for actions usually, let's try GET parameter for verify
        const response = await fetch(`${BACKEND_URL}?action=getBookings`);
        const data = await response.json();

        if (data.status === 'success') {
            renderBookings(data.bookings);
        } else {
            tableBody.innerHTML = `<tr><td colspan="8" style="text-align:center; color:red;">Error: ${data.message}</td></tr>`;
        }
    } catch (err) {
        console.error(err);
        tableBody.innerHTML = `<tr><td colspan="8" style="text-align:center; color:red;">Connection Failed</td></tr>`;
    }
}

function renderBookings(bookings) {
    const tableBody = document.querySelector('#bookingsTable tbody');
    tableBody.innerHTML = '';

    if (bookings.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="8" style="text-align:center;">No bookings found.</td></tr>';
        return;
    }

    // Sort by Date (newest first) - assuming Timestamp is index 1 or named 'Timestamp'
    // The backend returns an array of objects
    bookings.sort((a, b) => new Date(b.Timestamp) - new Date(a.Timestamp));

    bookings.forEach(b => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${new Date(b.Timestamp).toLocaleDateString()}</td>
            <td>${b.Name}</td>
            <td>${b.Phone}</td>
            <td>${b.Room}</td>
            <td>${b.Arrival}</td>
            <td>${b.Departure}</td>
            <td>KES ${b.Total}</td>
            <td><span style="padding: 4px 8px; border-radius: 4px; background: #e6f4ea; color #1e7e34;">${b.Status}</span></td>
        `;
        tableBody.appendChild(row);
    });
}

// ============================================
// PRICES
// ============================================
async function fetchCurrentPrices() {
    //Reuse the public getData endpoint
    try {
        const response = await fetch(`${BACKEND_URL}?action=getData`);
        const data = await response.json();

        if (data.status === 'success' && data.prices) {
            if (document.getElementById('price1Bedroom')) document.getElementById('price1Bedroom').value = data.prices['1 Bedroom'] || '';
            if (document.getElementById('price2Bedroom')) document.getElementById('price2Bedroom').value = data.prices['2 Bedroom'] || '';
            if (document.getElementById('price3Bedroom')) document.getElementById('price3Bedroom').value = data.prices['3 Bedroom'] || '';
        }
    } catch (err) {
        console.error('Failed to load prices', err);
    }
}

async function updatePrice(roomType) {
    const inputId = `price${roomType}`;
    const priceVal = document.getElementById(inputId).value;

    if (!priceVal) return alert('Please enter a price');

    showLoading(true);
    try {
        const response = await fetch(BACKEND_URL, {
            method: 'POST',
            body: JSON.stringify({
                action: 'updatePrice',
                token: currentUserToken,
                roomType: roomType,
                newPrice: priceVal
            })
        });

        const data = await response.json();
        if (data.status === 'success') {
            alert('Price updated successfully!');
        } else {
            alert('Error: ' + data.message);
        }
    } catch (err) {
        alert('Connection error');
    } finally {
        showLoading(false);
    }
}

// ============================================
// GALLERY
// ============================================
async function handleImageUpload(e) {
    e.preventDefault();
    const fileInput = document.getElementById('imageInput');
    const captionInput = document.getElementById('imageCaption');
    const status = document.getElementById('uploadStatus');

    if (fileInput.files.length === 0) return;

    const file = fileInput.files[0];
    const reader = new FileReader();

    showLoading(true);
    status.innerText = 'Uploading... Please wait.';

    reader.onload = async function () {
        const base64Data = reader.result.split(',')[1]; // Remove "data:image/jpeg;base64," prefix

        try {
            const response = await fetch(BACKEND_URL, {
                method: 'POST',
                body: JSON.stringify({
                    action: 'uploadImage',
                    token: currentUserToken,
                    fileData: base64Data,
                    fileName: file.name,
                    mimeType: file.type,
                    caption: captionInput.value
                })
            });

            const data = await response.json();

            if (data.status === 'success') {
                status.innerText = 'Upload Successful! Refresh website to see changes.';
                status.style.color = 'green';
                fileInput.value = '';
                captionInput.value = '';
            } else {
                status.innerText = 'Error: ' + data.message;
                status.style.color = 'red';
            }
        } catch (err) {
            console.error(err);
            status.innerText = 'Upload failed due to connection error.';
            status.style.color = 'red';
        } finally {
            showLoading(false);
        }
    };

    reader.readAsDataURL(file);
}

// ============================================
// UTILS
// ============================================
function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    overlay.style.display = show ? 'flex' : 'none';
}
