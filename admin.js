// ============================================
// ADMIN DASHBOARD LOGIC
// ============================================

// CONFIGURATION
// REPLACE THIS WITH YOUR DEPLOYED GOOGLE APPS SCRIPT WEB APP URL
const BACKEND_URL = 'https://script.google.com/macros/s/AKfycbzorDVhYk_bJiUpMdDw5OqxqWHa-OGb_MXT3mImE8B0ymEt1CZmYi3pRy4yYfF0YN96/exec';

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
    document.getElementById('editBookingForm').addEventListener('submit', handleEditBookingSubmit);
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
// CALENDARS
// ============================================
function switchCalendar(calendarType) {
    // Hide all calendar iframes
    document.querySelectorAll('.calendar-iframe').forEach(el => el.classList.remove('active'));
    // Show selected calendar
    document.getElementById(`calendar-${calendarType}`).classList.add('active');

    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
}


// ============================================
// BOOKINGS
// ============================================
// ============================================
// BOOKINGS
// ============================================
let allBookings = []; // Store for client-side filtering

async function fetchBookings() {
    if (!currentUserToken) return;

    const tableBody = document.querySelector('#bookingsTable tbody');
    // Adjust colspan to 14 to account for the new # column and Actions column
    tableBody.innerHTML = '<tr><td colspan="14" style="text-align:center;">Loading data...</td></tr>';

    try {
        // GET request requires query params if using doGet
        // But our backend setup uses POST for actions usually, let's try GET parameter for verify
        const response = await fetch(`${BACKEND_URL}?action=getBookings`);
        const data = await response.json();

        if (data.status === 'success') {
            allBookings = data.bookings; // Save to memory
            renderBookings(allBookings);
        } else {
            tableBody.innerHTML = `<tr><td colspan="14" style="text-align:center; color:red;">Error: ${data.message}</td></tr>`;
        }
    } catch (err) {
        console.error(err);
        tableBody.innerHTML = `<tr><td colspan="14" style="text-align:center; color:red;">Connection Failed</td></tr>`;
    }
}

function filterBookings() {
    const loader = document.getElementById('searchLoader');
    const query = document.getElementById('searchInput').value.toLowerCase();

    // Show loader
    if (loader) loader.style.display = 'block';

    // Simulate delay for UX
    setTimeout(() => {
        try {
            allBookings = allBookings || []; // Safety check
            const filtered = allBookings.filter(b => {
                const searchStr = query.toLowerCase();
                // Generic search: Check ALL values in the row
                return Object.values(b).some(val =>
                    String(val).toLowerCase().includes(searchStr)
                );
            });
            renderBookings(filtered);
        } catch (e) {
            console.error('Filter error:', e);
        } finally {
            // Hide loader always
            if (loader) loader.style.display = 'none';
        }
    }, 500);
}

function toggleMobileView() {
    const container = document.getElementById('bookingsTableContainer');
    const btn = document.getElementById('viewToggleBtn');

    container.classList.toggle('mobile-list-view');

    if (container.classList.contains('mobile-list-view')) {
        btn.innerText = 'Switch to Card View';
    } else {
        btn.innerText = 'Switch to List View';
    }
}

function renderBookings(bookings) {
    const tableBody = document.querySelector('#bookingsTable tbody');
    tableBody.innerHTML = '';

    if (!bookings || bookings.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="14" style="text-align:center;">No results found</td></tr>';
        return;
    }

    // Sort by Date (newest first)
    bookings.sort((a, b) => new Date(b.Timestamp) - new Date(a.Timestamp));

    bookings.forEach((b, index) => {
        const row = document.createElement('tr');
        // Encode booking object for safe passing to function
        const bookingData = encodeURIComponent(JSON.stringify(b));

        row.innerHTML = `
            <td data-label="#">${index + 1}</td>
            <td data-label="Date">${new Date(b.Timestamp).toLocaleDateString()}</td>
            <td data-label="Guest Name">${b.Name}</td>
            <td data-label="Phone">${b.Phone}</td>
            <td data-label="Room Type">${b.Room}</td>
            <td data-label="Arrival">${b.Arrival} ${b['Arrival Time'] || ''}</td>
            <td data-label="Departure">${b.Departure} ${b['Departure Time'] || ''}</td>
            <td data-label="Total (KES)">KES ${Number(b.Total).toLocaleString()}</td>
            <td data-label="Nationality">${b.Nationality || '-'}</td>
            <td data-label="Address">${b.Address || '-'}</td>
            <td data-label="ID/Passport">${b['ID/Passport'] || '-'}</td>
            <td data-label="Car Plate">${b['Car Plate'] || '-'}</td>
            <td data-label="Status"><span style="padding: 4px 8px; border-radius: 4px; background: #e6f4ea; color: #1e7e34;">${b.Status}</span></td>
            <td data-label="Actions">
                <button onclick="openEditModal('${bookingData}')" style="background: var(--primary); padding: 5px 10px; font-size: 12px; width: auto; margin-right: 5px;">Edit</button>
                <button onclick="deleteBooking('${b.ID}')" style="background: var(--danger); padding: 5px 10px; font-size: 12px; width: auto;">Delete</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function openEditModal(bookingStr) {
    const booking = JSON.parse(decodeURIComponent(bookingStr));

    document.getElementById('editBookingId').value = booking.ID;
    document.getElementById('editName').value = booking.Name;
    document.getElementById('editPhone').value = booking.Phone;
    document.getElementById('editRoom').value = booking.Room;

    // Format dates for input type="date" (YYYY-MM-DD)
    // Assuming backend sends YYYY-MM-DD or standard ISO
    // The sheet seems to store YYYY-MM-DD based on Code.js so we can set directly or parse
    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr; // Fallback if already string format
        return d.toISOString().split('T')[0];
    };

    document.getElementById('editArrival').value = formatDate(booking.Arrival);
    document.getElementById('editDeparture').value = formatDate(booking.Departure);
    document.getElementById('editStatus').value = booking.Status;

    document.getElementById('editBookingModal').style.display = 'flex';
}

function closeEditModal() {
    document.getElementById('editBookingModal').style.display = 'none';
}

async function handleEditBookingSubmit(e) {
    e.preventDefault();

    const id = document.getElementById('editBookingId').value;
    const name = document.getElementById('editName').value;
    const phone = document.getElementById('editPhone').value;
    const room = document.getElementById('editRoom').value;
    const arrival = document.getElementById('editArrival').value;
    const departure = document.getElementById('editDeparture').value;
    const status = document.getElementById('editStatus').value;

    showLoading(true);
    try {
        const response = await fetch(BACKEND_URL, {
            method: 'POST',
            body: JSON.stringify({
                action: 'editBooking',
                token: currentUserToken,
                bookingId: id,
                name: name,
                phone: phone,
                room: room,
                arrival: arrival,
                departure: departure,
                status: status
            })
        });

        const data = await response.json();
        if (data.status === 'success') {
            alert('Booking updated!');
            closeEditModal();
            fetchBookings(); // Refresh table
        } else {
            alert('Error: ' + data.message);
        }
    } catch (err) {
        console.error(err);
        alert('Connection Failed');
    } finally {
        showLoading(false);
    }
}

async function deleteBooking(id) {
    if (!confirm('Are you sure you want to PERMANENTLY delete this booking?')) return;

    showLoading(true);
    try {
        const response = await fetch(BACKEND_URL, {
            method: 'POST',
            body: JSON.stringify({
                action: 'deleteBooking',
                token: currentUserToken,
                bookingId: id
            })
        });

        const data = await response.json();
        if (data.status === 'success') {
            alert('Booking deleted!');
            fetchBookings(); // Refresh table
        } else {
            alert('Error: ' + data.message);
        }
    } catch (err) {
        console.error(err);
        alert('Connection Failed');
    } finally {
        showLoading(false);
    }
}

// ============================================
// PRICES
// ============================================
async function fetchCurrentPrices() {
    //Reuse the public getData endpoint
    try {
        const response = await fetch(`${BACKEND_URL}?action=getData`);
        const data = await response.json();

        if (data.status === 'success') {
            if (data.prices) {
                if (document.getElementById('price1Bedroom')) document.getElementById('price1Bedroom').value = data.prices['1 Bedroom'] || '';
                if (document.getElementById('price2Bedroom')) document.getElementById('price2Bedroom').value = data.prices['2 Bedroom'] || '';
                if (document.getElementById('price3Bedroom')) document.getElementById('price3Bedroom').value = data.prices['3 Bedroom'] || '';
            }
            if (data.images) {
                renderGallery(data.images);
            }
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

function renderGallery(images) {
    const grid = document.getElementById('galleryGrid');
    grid.innerHTML = '';

    if (!images || images.length === 0) {
        grid.innerHTML = '<p>No images uploaded.</p>';
        return;
    }

    images.forEach(img => {
        const item = document.createElement('div');
        item.className = 'gallery-item';

        // Use a placeholder if url is broken/missing
        item.innerHTML = `
            <img src="${img.url}" alt="Carousel Image" onerror="this.src='https://via.placeholder.com/150?text=Error'">
            <p title="${img.caption}">${img.caption || 'No Caption'}</p>
            <button class="gallery-btn-delete" onclick="deleteImage('${img.url}')">Delete</button>
        `;
        grid.appendChild(item);
    });
}

async function deleteImage(url) {
    if (!confirm('Are you sure you want to remove this image from the website?')) return;

    showLoading(true);
    try {
        const response = await fetch(BACKEND_URL, {
            method: 'POST',
            body: JSON.stringify({
                action: 'deleteImage',
                token: currentUserToken,
                url: url
            })
        });

        const data = await response.json();
        if (data.status === 'success') {
            alert('Image deleted!');
            // Refresh data
            fetchCurrentPrices();
        } else {
            alert('Error: ' + data.message);
        }
    } catch (err) {
        console.error(err);
        alert('Connection error');
    } finally {
        showLoading(false);
    }
}

// ============================================
// UTILS
// ============================================
function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    overlay.style.display = show ? 'flex' : 'none';
}

