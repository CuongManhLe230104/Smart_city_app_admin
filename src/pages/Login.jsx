import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import '../styles/Login.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    // ✅ Lấy mock accounts
    // const mockAccounts = authService.getMockAccounts();

    // ✅ Kiểm tra đã login chưa
    useEffect(() => {
        if (authService.isLoggedIn()) {
            navigate('/', { replace: true });
        }
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            console.log('🔧 Attempting login...');

            await authService.login(email, password);

            console.log('✅ Login successful, redirecting...');

            // ✅ Redirect to dashboard
            navigate('/', { replace: true });
        } catch (err) {
            console.error('❌ Login failed:', err);
            setError(err.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className="login-container">
            <div className="login-box">
                <div className="login-header">
                    <h2>Administrator</h2>
                    <p>Đăng nhập để quản lý hệ thống Vũng Tàu Smart City</p>
                </div>

                <form onSubmit={handleSubmit}>
                    {error && <div className="error-message">❌ {error}</div>}

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@example.com"
                            required
                            disabled={isLoading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Mật khẩu</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                    </div>
                    <button type="submit" className="login-btn" disabled={isLoading}>
                        {isLoading ? 'Đang xử lý...' : 'Đăng nhập'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;