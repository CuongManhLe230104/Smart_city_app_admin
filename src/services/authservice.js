import './api.js';

const API_BASE = 'http://localhost:5000/api';

// ✅ MOCK DATA - Tài khoản admin giả
const MOCK_ADMIN_ACCOUNTS = [
    {
        id: 1,
        email: 'adminsmartcity@gmail.com',
        password: 'admin123',
        fullName: 'Administrator',
        phone: '0123456789',
        role: 'Admin',
        address: 'TP.HCM'
    },
    {
        id: 2,
        email: 'adminsmartcity@gmail.com',
        password: 'password123',
        fullName: 'Administrator',
        phone: '0987654321',
        role: 'Admin',
        address: 'Hà Nội'
    }
];

// ✅ MOCK JWT Token Generator
const generateMockToken = (user) => {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({
        sub: user.id,
        email: user.email,
        role: user.role,
        exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) // 24 hours
    }));
    const signature = btoa('mock-signature');
    return `${header}.${payload}.${signature}`;
};

export const authService = {
    // ✅ Login with Mock or Real API
    login: async (email, password) => {
        try {
            console.log('🔧 Logging in:', email);

            // ✅ TRY MOCK LOGIN FIRST
            const mockUser = MOCK_ADMIN_ACCOUNTS.find(
                u => u.email === email && u.password === password
            );

            if (mockUser) {
                console.log('✅ Mock login successful:', mockUser.email);

                const token = generateMockToken(mockUser);
                const userData = {
                    id: mockUser.id,
                    email: mockUser.email,
                    fullName: mockUser.fullName,
                    phone: mockUser.phone,
                    role: mockUser.role,
                    address: mockUser.address
                };

                // ✅ Lưu token và user
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(userData));

                console.log('✅ Token saved:', token.substring(0, 30) + '...');
                console.log('✅ User saved:', userData);

                return {
                    success: true,
                    token: token,
                    user: userData,
                };
            }

            // ✅ IF MOCK FAILS, TRY REAL API
            console.log('🔧 Mock login failed, trying real API...');

            const response = await fetch(`${API_BASE}/Auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            console.log('🔧 API Response status:', response.status);

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Đăng nhập thất bại');
            }

            const data = await response.json();
            console.log('✅ API Login successful:', data);

            // ✅ Kiểm tra role Admin
            if (data.data?.user?.role !== 'Admin') {
                throw new Error('Bạn không có quyền truy cập trang Admin');
            }

            // ✅ Lưu token và user
            localStorage.setItem('token', data.data.token);
            localStorage.setItem('user', JSON.stringify(data.data.user));

            return {
                success: true,
                token: data.data.token,
                user: data.data.user,
            };
        } catch (error) {
            console.error('❌ Login error:', error);
            throw error;
        }
    },

    // ✅ Logout
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        console.log('✅ Logged out');
    },

    // ✅ Get current user
    getCurrentUser: () => {
        try {
            const userStr = localStorage.getItem('user');
            return userStr ? JSON.parse(userStr) : null;
        } catch (error) {
            console.error('❌ Error getting user:', error);
            return null;
        }
    },

    // ✅ Get token
    getToken: () => {
        return localStorage.getItem('token');
    },

    // ✅ Check if logged in
    isLoggedIn: () => {
        const token = localStorage.getItem('token');
        const user = authService.getCurrentUser();
        return token && user && user.role === 'Admin';
    },

    // ✅ Check if token expired
    isTokenExpired: () => {
        const token = authService.getToken();
        if (!token) return true;

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const exp = payload.exp * 1000;
            return Date.now() >= exp;
            // eslint-disable-next-line no-unused-vars
        } catch (error) {
            return true;
        }
    },

    // ✅ Get all mock accounts (for demo)
    getMockAccounts: () => {
        return MOCK_ADMIN_ACCOUNTS.map(acc => ({
            email: acc.email,
            password: acc.password,
            fullName: acc.fullName
        }));
    }
};

export default authService;