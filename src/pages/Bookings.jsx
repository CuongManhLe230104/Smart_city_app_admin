import React, { useState, useEffect, useCallback } from 'react';
import Panel from '../components/Panel.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { getBookings, updateBookingStatus } from '../services/api.js';

// ✅ THÊM BASE URL CHO IMAGES
const API_BASE_URL = 'http://localhost:5000'; // ✅ Đổi thành IP backend của bạn

// ✅ HÀM LẤY URL HÌNH ẢNH ĐẦY ĐỦ
const getFullImageUrl = (imagePath) => {
    if (!imagePath) return null;

    // Nếu đã là URL đầy đủ (http/https)
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
    }

    // Nếu là relative path, thêm base URL
    const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    return `${API_BASE_URL}${cleanPath}`;
};

const ActionButton = ({ title, onClick, color, icon }) => (
    <button
        onClick={onClick}
        style={{
            background: color,
            padding: '8px 14px',
            fontSize: '13px',
            fontWeight: '600',
            whiteSpace: 'nowrap',
            border: 'none',
            borderRadius: '6px',
            color: 'white',
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}
        onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
        onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
    >
        {icon} {title}
    </button>
);

const Bookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [showModal, setShowModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [newStatus, setNewStatus] = useState('');

    const fetchBookings = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getBookings();
            console.log('📥 Bookings data:', data);

            if (Array.isArray(data)) {
                // ✅ Log image URLs để debug
                data.forEach(booking => {
                    if (booking.tour?.coverImageUrl) {
                        const fullUrl = getFullImageUrl(booking.tour.coverImageUrl);
                        console.log('🖼️ Image URL:', {
                            original: booking.tour.coverImageUrl,
                            full: fullUrl
                        });
                    }
                });
                setBookings(data);
            } else {
                console.warn('⚠️ Data is not an array:', data);
                setBookings([]);
            }

            setError(null);
        } catch (err) {
            console.error('❌ Fetch bookings error:', err);
            setError(err.message || "Lỗi tải danh sách đơn hàng.");
            setBookings([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]);

    const openModal = (booking, statusType) => {
        setSelectedBooking(booking);
        setNewStatus(statusType);
        setShowModal(true);
    };

    const handleSaveStatus = async () => {
        if (!selectedBooking || !newStatus) return;

        if (!window.confirm(`Chuyển đơn #${selectedBooking.bookingId} sang "${newStatus}"?`)) {
            return;
        }

        try {
            await updateBookingStatus(selectedBooking.bookingId, newStatus);
            alert('✅ Cập nhật trạng thái thành công!');
            setShowModal(false);
            fetchBookings();
        } catch (err) {
            alert(`❌ Lỗi cập nhật: ${err.message || 'Không thể kết nối API'}`);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    if (loading) {
        return (
            <Panel>
                <div style={{ padding: '60px', textAlign: 'center', color: '#6b7280' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
                    <p>Đang tải danh sách đơn đặt tour...</p>
                </div>
            </Panel>
        );
    }

    if (error) {
        return (
            <Panel>
                <div style={{ padding: '60px', textAlign: 'center', color: '#ef4444' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
                    <p style={{ fontWeight: '600', fontSize: '18px' }}>Lỗi: {error}</p>
                    <button
                        onClick={fetchBookings}
                        style={{
                            marginTop: '20px',
                            padding: '10px 20px',
                            background: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: '600'
                        }}
                    >
                        🔄 Thử lại
                    </button>
                </div>
            </Panel>
        );
    }

    return (
        <Panel>
            {/* HEADER */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 24,
                paddingBottom: 16,
                borderBottom: '2px solid #e5e7eb'
            }}>
                <div>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1f2937', marginBottom: 8 }}>
                        🎫 Quản Lý Đơn Đặt Tour
                    </h2>
                    <p style={{ color: '#6b7280', fontSize: '14px' }}>
                        Tổng số: <strong>{bookings.length}</strong> đơn
                    </p>
                </div>
                <button
                    onClick={fetchBookings}
                    style={{
                        padding: '10px 18px',
                        background: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '14px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                >
                    🔄 Làm mới
                </button>
            </div>

            {/* TABLE */}
            <div style={{ overflowX: 'auto', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <table style={{
                    width: '100%',
                    borderCollapse: 'separate',
                    borderSpacing: 0,
                    background: 'white'
                }}>
                    <thead>
                        <tr style={{ background: '#f3f4f6', color: '#4b5563' }}>
                            <th style={headerStyle}>ID</th>
                            <th style={headerStyle}>Ảnh Tour</th>
                            <th style={headerStyle}>Tên Tour</th>
                            <th style={headerStyle}>Khách hàng</th>
                            <th style={headerStyle}>Ngày đi</th>
                            <th style={headerStyle}>Số người</th>
                            <th style={headerStyle}>Tổng tiền</th>
                            <th style={headerStyle}>Trạng thái</th>
                            <th style={headerStyle}>Hành động</th>
                        </tr>
                    </thead>

                    <tbody>
                        {bookings.map((booking, index) => {
                            // ✅ Lấy URL hình ảnh đầy đủ
                            const imageUrl = getFullImageUrl(booking.tour?.coverImageUrl);

                            return (
                                <tr
                                    key={booking.bookingId}
                                    style={{
                                        background: index % 2 === 0 ? 'white' : '#f9fafb',
                                        borderBottom: '1px solid #e5e7eb'
                                    }}
                                >
                                    <td style={cellStyle}>{booking.bookingId}</td>

                                    {/* ✅ HIỂN THỊ ẢNH TOUR - SỬA */}
                                    <td style={{ ...cellStyle, textAlign: 'center' }}>
                                        {imageUrl ? (
                                            <img
                                                src={imageUrl}
                                                alt={booking.tour?.nameTour || 'Tour'}
                                                style={{
                                                    width: 80,
                                                    height: 60,
                                                    objectFit: 'cover',
                                                    borderRadius: 6,
                                                    border: '2px solid #e5e7eb',
                                                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                                                }}
                                                onError={(e) => {
                                                    console.error('❌ Image load error for booking:', booking.bookingId);
                                                    console.error('❌ Failed URL:', imageUrl);
                                                    // ✅ Chỉ set placeholder 1 lần
                                                    if (!e.target.dataset.errorHandled) {
                                                        e.target.dataset.errorHandled = 'true';
                                                        e.target.src = 'https://via.placeholder.com/80x60?text=No+Image';
                                                    }
                                                }}
                                            />
                                        ) : (
                                            <div style={{
                                                width: 80,
                                                height: 60,
                                                background: '#e5e7eb',
                                                borderRadius: 6,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '24px',
                                                margin: '0 auto'
                                            }}>
                                                🖼️
                                            </div>
                                        )}
                                    </td>

                                    {/* ✅ TÊN TOUR */}
                                    <td style={cellStyle}>
                                        <div style={{ fontWeight: '600', color: '#1f2937' }}>
                                            {booking.tour?.nameTour || 'N/A'}
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#6b7280', marginTop: 2 }}>
                                            {booking.tour?.tourType} • {booking.tour?.duration}
                                        </div>
                                    </td>

                                    {/* ✅ KHÁCH HÀNG */}
                                    <td style={cellStyle}>
                                        <div style={{ fontWeight: '500', color: '#374151' }}>
                                            {booking.user?.fullName || booking.user?.username || 'N/A'}
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#6b7280', marginTop: 2 }}>
                                            {booking.user?.email}
                                        </div>
                                    </td>

                                    <td style={cellStyle}>
                                        {new Date(booking.travelDate).toLocaleDateString('vi-VN', {
                                            day: '2-digit',
                                            month: '2-digit',
                                            year: 'numeric'
                                        })}
                                    </td>

                                    <td style={{ ...cellStyle, textAlign: 'center' }}>
                                        <span style={{
                                            padding: '4px 10px',
                                            background: '#dbeafe',
                                            color: '#1e40af',
                                            borderRadius: '6px',
                                            fontWeight: '600',
                                            fontSize: '13px'
                                        }}>
                                            👥 {booking.numberOfPeople}
                                        </span>
                                    </td>

                                    <td style={{ ...cellStyle, textAlign: 'right', fontWeight: '600', color: '#059669' }}>
                                        {formatCurrency(booking.totalPrice)}
                                    </td>

                                    <td style={cellStyle}>
                                        <StatusBadge status={booking.status} size="md" />
                                    </td>

                                    {/* ✅ CÁC NÚT HÀNH ĐỘNG */}
                                    <td style={cellStyle}>
                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                                            {booking.status === 'Pending' && (
                                                <>
                                                    <ActionButton
                                                        title="Xác nhận"
                                                        icon="✅"
                                                        onClick={() => openModal(booking, 'Confirmed')}
                                                        color="#10b981"
                                                    />
                                                    <ActionButton
                                                        title="Hủy"
                                                        icon="❌"
                                                        onClick={() => openModal(booking, 'Cancelled')}
                                                        color="#ef4444"
                                                    />
                                                </>
                                            )}

                                            {(booking.status === 'Confirmed' || booking.status === 'Cancelled') && (
                                                <ActionButton
                                                    title="Chi tiết"
                                                    icon="👁️"
                                                    onClick={() => openModal(booking, booking.status)}
                                                    color="#6b7280"
                                                />
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {bookings.length === 0 && (
                <div style={{
                    padding: '60px',
                    textAlign: 'center',
                    color: '#6b7280',
                    background: '#f9fafb',
                    borderRadius: '8px',
                    marginTop: '20px'
                }}>
                    <div style={{ fontSize: '64px', marginBottom: '16px' }}>📭</div>
                    <p style={{ fontSize: '18px', fontWeight: '600' }}>Chưa có đơn đặt tour nào</p>
                </div>
            )}

            {/* MODAL */}
            {showModal && selectedBooking && (
                <BookingModal
                    booking={selectedBooking}
                    newStatus={newStatus}
                    onSave={handleSaveStatus}
                    onClose={() => setShowModal(false)}
                    formatCurrency={formatCurrency}
                    getFullImageUrl={getFullImageUrl}
                />
            )}
        </Panel>
    );
};

// ✅ STYLES
const headerStyle = {
    padding: '14px 16px',
    textAlign: 'left',
    fontWeight: '600',
    fontSize: '13px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
};

const cellStyle = {
    padding: '16px',
    fontSize: '14px',
    color: '#374151'
};

export default Bookings;

// ========================================
// MODAL COMPONENT - SỬA
// ========================================

function BookingModal({ booking, newStatus, onSave, onClose, formatCurrency, getFullImageUrl }) {
    const imageUrl = getFullImageUrl(booking.tour?.coverImageUrl);

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: '20px'
            }}
            onClick={onClose}
        >
            <div
                style={{
                    background: 'white',
                    padding: '32px',
                    borderRadius: '12px',
                    minWidth: '500px',
                    maxWidth: '700px',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
                    maxHeight: '90vh',
                    overflowY: 'auto'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* ✅ TIÊU ĐỀ MODAL */}
                <h3 style={{ marginBottom: '24px', color: '#1f2937', fontSize: '1.5rem', fontWeight: '700' }}>
                    {newStatus === 'Confirmed' && booking.status === 'Pending' && '✅ Xác nhận đơn hàng'}
                    {newStatus === 'Cancelled' && '❌ Hủy đơn hàng'}
                    {newStatus === booking.status && '👁️ Chi tiết đơn hàng'}
                </h3>

                {/* THÔNG TIN TOUR - SỬA */}
                {booking.tour && (
                    <div style={{
                        marginBottom: '24px',
                        padding: '16px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        borderRadius: '12px',
                        color: 'white'
                    }}>
                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                            {imageUrl ? (
                                <img
                                    src={imageUrl}
                                    alt={booking.tour.nameTour}
                                    style={{
                                        width: 100,
                                        height: 75,
                                        objectFit: 'cover',
                                        borderRadius: '8px',
                                        border: '2px solid white'
                                    }}
                                    onError={(e) => {
                                        if (!e.target.dataset.errorHandled) {
                                            e.target.dataset.errorHandled = 'true';
                                            e.target.src = 'https://via.placeholder.com/100x75?text=No+Image';
                                        }
                                    }}
                                />
                            ) : (
                                <div style={{
                                    width: 100,
                                    height: 75,
                                    background: 'rgba(255,255,255,0.2)',
                                    borderRadius: '8px',
                                    border: '2px solid white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '32px'
                                }}>
                                    🖼️
                                </div>
                            )}
                            <div style={{ flex: 1 }}>
                                <h4 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
                                    {booking.tour.nameTour}
                                </h4>
                                <p style={{ margin: '4px 0 0 0', fontSize: '13px', opacity: 0.9 }}>
                                    {booking.tour.tourType} • {booking.tour.duration}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* THÔNG TIN ĐƠN HÀNG */}
                <div style={{
                    padding: '20px',
                    background: '#f3f4f6',
                    borderRadius: '8px',
                    marginBottom: '24px'
                }}>
                    <div style={infoRowStyle}>
                        <strong>🆔 Booking ID:</strong>
                        <span>{booking.bookingId}</span>
                    </div>
                    <div style={infoRowStyle}>
                        <strong>👤 Khách hàng:</strong>
                        <span>{booking.user?.fullName || booking.user?.username || 'N/A'}</span>
                    </div>
                    <div style={infoRowStyle}>
                        <strong>📧 Email:</strong>
                        <span>{booking.user?.email || 'N/A'}</span>
                    </div>
                    <div style={infoRowStyle}>
                        <strong>📅 Ngày đi:</strong>
                        <span>{new Date(booking.travelDate).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <div style={infoRowStyle}>
                        <strong>👥 Số người:</strong>
                        <span>{booking.numberOfPeople}</span>
                    </div>
                    <div style={infoRowStyle}>
                        <strong>💰 Tổng tiền:</strong>
                        <span style={{ color: '#059669', fontWeight: '700', fontSize: '16px' }}>
                            {formatCurrency(booking.totalPrice)}
                        </span>
                    </div>
                    <div style={infoRowStyle}>
                        <strong>📊 Trạng thái:</strong>
                        <StatusBadge status={booking.status} size="md" />
                    </div>
                </div>

                {/* NÚT HÀNH ĐỘNG TRONG MODAL */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
                    <button
                        onClick={onClose}
                        style={{
                            padding: '10px 20px',
                            background: '#e5e7eb',
                            color: '#374151',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '14px'
                        }}
                    >
                        {booking.status === 'Pending' ? 'Hủy' : 'Đóng'}
                    </button>

                    {booking.status === 'Pending' && (
                        <button
                            onClick={onSave}
                            style={{
                                padding: '10px 20px',
                                background: newStatus === 'Confirmed' ? '#10b981' : '#ef4444',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontWeight: '600',
                                fontSize: '14px'
                            }}
                        >
                            {newStatus === 'Confirmed' ? '✅ Xác nhận' : '❌ Hủy đơn'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

const infoRowStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 0',
    borderBottom: '1px solid #e5e7eb',
    fontSize: '14px'
};