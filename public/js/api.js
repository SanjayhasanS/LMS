const API_BASE = 'http://localhost:3000';

function getToken() {
    return localStorage.getItem('token');
}

function getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}

async function apiFetch(path, options = {}) {
    const token = getToken();
    const headers = { 'Content-Type': 'application/json', ...options.headers };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
    const data = await res.json();
    if (!res.ok) throw new Error(data.msg || 'Something went wrong');
    return data;
}

function requireAuth() {
    if (!getToken()) window.location.href = 'login.html';
}

function toggleUserMenu() {
    const menu = document.getElementById('userDropdown');
    if (menu) menu.classList.toggle('open');
}

document.addEventListener('click', (e) => {
    const wrapper = document.getElementById('userMenuWrapper');
    const menu = document.getElementById('userDropdown');
    if (wrapper && menu && !wrapper.contains(e.target)) {
        menu.classList.remove('open');
    }
});
function renderNav() {
    const user = getUser();
    const nav = document.getElementById('nav');
    if (!nav) return;

    if (user) {
        const initial = user.name.charAt(0).toUpperCase();
        nav.innerHTML = `
            <div class="nav-left">
            <a href="index.html">Home</a>
            <a href="courses.html">Courses</a>
            ${user.role === 'instructor' ? '<a href="dashboard.html">Dashboard</a>' : '<a href="progress.html">My Progress</a>'}
            </div>
            <div class="nav-right" id="userMenuWrapper">
                <button class="user-menu-btn" onclick="toggleUserMenu()">
                    <span class="avatar">${initial}</span>
                    <span>${user.name}</span>
                    <span class="arrow">v</span>
                </button>
               <div class="user-dropdown" id="userDropdown">
               <div class="dropdown-item-static">${user.role.charAt(0).toUpperCase() + user.role.slice(1)}</div>
               <a href="profile.html">View Profile</a>
               <a href="#" onclick="logout(); return false;">Logout</a>
               </div>
            </div>
        `;
    } else {
        nav.innerHTML = `
            <div class="nav-left">
            <a href="index.html" class="brand" style="text-decoration:none;">Pathory</a>
            <a href="courses.html">Courses</a>
            </div>
            <div class="nav-right">
                <a href="login.html">Login</a>
                <a href="signup.html">Sign Up</a>
            </div>
        `;
    }
}
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js');
    });
}