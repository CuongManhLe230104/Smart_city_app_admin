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
    const mockAccounts = authService.getMockAccounts();

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

    // ✅ Quick login với mock account
    const handleQuickLogin = (account) => {
        setEmail(account.email);
        setPassword(account.password);
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <div className="login-header">
                    <h2>🏛️ Admin Portal</h2>
                    <p>Đăng nhập để quản lý hệ thống Smart City</p>
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
                            placeholder="••••••••"
                            required
                            disabled={isLoading}
                        />
                    </div>

                    <button type="submit" className="login-btn" disabled={isLoading}>
                        {isLoading ? '🔄 Đang xử lý...' : '🔐 Đăng nhập'}
                    </button>
                </form>

                {/* ✅ MOCK ACCOUNTS - Quick Login */}
                <div style={{
                    marginTop: '24px',
                    padding: '16px',
                    background: '#f0f9ff',
                    borderRadius: '8px',
                    border: '1px solid #bae6fd'
                }}>
                    <p style={{
                        margin: '0 0 12px 0',
                        fontWeight: '600',
                        color: '#0369a1',
                        fontSize: '0.9rem'
                    }}>
                        💡 Tài khoản Demo (Click để tự động điền)
                    </p>

                    {mockAccounts.map((account, index) => (
                        <button
                            key={index}
                            type="button"
                            onClick={() => handleQuickLogin(account)}
                            style={{
                                width: '100%',
                                padding: '12px',
                                marginBottom: '8px',
                                background: 'white',
                                border: '1px solid #e0e7ff',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                textAlign: 'left',
                                transition: 'all 0.2s',
                                fontSize: '0.85rem'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.background = '#e0e7ff';
                                e.currentTarget.style.borderColor = '#6366f1';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.background = 'white';
                                e.currentTarget.style.borderColor = '#e0e7ff';
                            }}
                        >
                            <div style={{ fontWeight: '600', color: '#1e40af' }}>
                                👤 {account.fullName}
                            </div>
                            <div style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '4px' }}>
                                📧 {account.email}
                            </div>
                            <div style={{ color: '#64748b', fontSize: '0.75rem' }}>
                                🔑 {account.password}
                            </div>
                        </button>
                    ))}
                </div>

                <div style={{
                    marginTop: '16px',
                    padding: '12px',
                    background: '#fef3c7',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    color: '#92400e',
                    border: '1px solid #fde68a'
                }}>
                    ⚠️ <strong>Lưu ý:</strong> Đây là mock data để test. Khi Backend hoạt động, hệ thống sẽ tự động chuyển sang xác thực thật.
                </div>
            </div>
        </div>
    );
};

export default Login;