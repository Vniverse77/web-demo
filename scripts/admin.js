document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const adminContent = document.getElementById('admin-content');
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const getUsersBtn = document.getElementById('get-users-btn');
    const userList = document.getElementById('user-list');

    // Check for token on page load
    const token = localStorage.getItem('token');
    if (token) {
        loginForm.style.display = 'none';
        adminContent.style.display = 'block';
    }

    loginBtn.addEventListener('click', async () => {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        if (response.ok) {
            const { token } = await response.json();
            localStorage.setItem('token', token);
            loginForm.style.display = 'none';
            adminContent.style.display = 'block';
        } else {
            alert('Invalid credentials');
        }
    });

    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('token');
        loginForm.style.display = 'block';
        adminContent.style.display = 'none';
    });

    getUsersBtn.addEventListener('click', async () => {
        const token = localStorage.getItem('token');
        if (token) {
            const response = await fetch('/api/admin/users', {
                headers: {
                    'Authorization': token
                }
            });

            if (response.ok) {
                const users = await response.json();
                userList.innerHTML = `
                    <h3>Users</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Verified</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${users.map(user => `
                                <tr>
                                    <td>${user.name}</td>
                                    <td>${user.email}</td>
                                    <td>${user.verified}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                `;
            } else {
                alert('Failed to fetch users');
            }
        }
    });
});