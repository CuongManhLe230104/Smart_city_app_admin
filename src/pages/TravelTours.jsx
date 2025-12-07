import React, { useEffect, useState, useCallback } from "react";
import {
    getTours,
    createTour,
    updateTour,
    deleteTour,
} from "../services/api.js";

import Panel from "../components/Panel.jsx";

// ======================================
// Sub-Component: Action Button
// ======================================
const ActionButton = ({ icon, onClick, color, title }) => (
    <button
        onClick={onClick}
        title={title}
        style={{
            backgroundColor: color,
            border: "none",
            borderRadius: 6,
            padding: "8px 12px",
            cursor: "pointer",
            color: "white",
            fontSize: 14,
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
            transition: "all 0.2s",
            boxShadow: '0 1px 3px rgba(0,0,0,0.12)'
        }}
        onMouseOver={(e) => e.currentTarget.style.opacity = '0.85'}
        onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
    >
        <span>{icon}</span>
    </button>
);

// ======================================
// COMPONENT CHÍNH: TravelTour
// ======================================

export default function TravelTour() {
    const [tours, setTours] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentTour, setCurrentTour] = useState(null);

    const loadTours = useCallback(async () => {
        setLoading(true);
        try {
            console.log('📥 Fetching tours...');
            const res = await getTours();
            console.log('✅ Tours response:', res);
            setTours(res || []);
            setError("");
        } catch (err) {
            console.error('❌ Load tours error:', err);
            setError("Lỗi: Không thể tải danh sách tour. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadTours();
    }, [loadTours]);

    const handleDelete = async (id) => {
        if (!window.confirm("⚠️ Bạn có chắc chắn muốn xóa Tour này? Hành động không thể hoàn tác.")) return;

        try {
            await deleteTour(id);
            alert("✅ Xóa Tour thành công!");
            loadTours();
        } catch (err) {
            alert(`❌ Lỗi xóa Tour: ${err.message || 'Vui lòng kiểm tra kết nối!'}`);
        }
    };

    const handleEditClick = (tour) => {
        console.log('✏️ Editing tour:', tour);
        setCurrentTour(tour);
        setIsModalOpen(true);
    };

    const handleAddClick = () => {
        setCurrentTour(null);
        setIsModalOpen(true);
    };

    const handleSave = async ({ id, data }) => {
        try {
            if (id) {
                await updateTour(id, data);
                alert("🎉 Cập nhật Tour thành công!");
            } else {
                await createTour(data);
                alert("✨ Thêm Tour mới thành công!");
            }

            setIsModalOpen(false);
            loadTours();
        } catch (err) {
            console.error('❌ Save error:', err);
            alert(`❌ Lỗi lưu Tour: ${err.message || "Lỗi không xác định."}`);
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
                    <p style={{ fontSize: '16px' }}>Đang tải danh sách tour...</p>
                </div>
            </Panel>
        );
    }

    if (error) {
        return (
            <Panel>
                <div style={{ padding: '60px', textAlign: 'center', color: '#ef4444' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
                    <p style={{ fontWeight: '600', fontSize: '18px', marginBottom: '20px' }}>{error}</p>
                    <button
                        onClick={loadTours}
                        style={{
                            padding: '10px 20px',
                            background: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '14px'
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
            {/* ========== HEADER ========== */}
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 24,
                paddingBottom: 16,
                borderBottom: "2px solid #e5e7eb",
            }}>
                <div>
                    <h2 style={{ fontSize: "1.875rem", fontWeight: 700, color: "#1f2937", marginBottom: 8 }}>
                        🌎 Quản Lý Danh Sách Tour
                    </h2>
                    <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>
                        Tổng số: <strong style={{ color: '#059669' }}>{tours.length}</strong> tour
                    </p>
                </div>
                <button
                    style={{
                        padding: "12px 20px",
                        borderRadius: 8,
                        backgroundColor: "#059669",
                        color: "white",
                        fontWeight: 600,
                        fontSize: '14px',
                        border: "none",
                        cursor: "pointer",
                        boxShadow: '0 2px 6px rgba(5,150,105,0.3)',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8
                    }}
                    onClick={handleAddClick}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                    <span style={{ fontSize: '18px' }}>➕</span>
                    <span>Thêm Tour Mới</span>
                </button>
            </div>

            {/* ========== TABLE ========== */}
            {tours.length > 0 ? (
                <div style={{
                    overflowX: "auto",
                    borderRadius: '12px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    border: '1px solid #e5e7eb'
                }}>
                    <table style={{
                        width: "100%",
                        borderCollapse: "separate",
                        borderSpacing: 0,
                        background: 'white'
                    }}>
                        <thead>
                            <tr style={{ backgroundColor: "#f3f4f6" }}>
                                <th style={headerStyle}>ID</th>
                                <th style={headerStyle}>Ảnh Bìa</th>
                                <th style={headerStyle}>Tên Tour</th>
                                <th style={headerStyle}>Loại</th>
                                <th style={headerStyle}>Thời lượng</th>
                                <th style={headerStyle}>Giá</th>
                                <th style={headerStyle}>Số người</th>
                                <th style={headerStyle}>Nội dung</th>
                                <th style={headerStyle}>Hành động</th>
                            </tr>
                        </thead>

                        <tbody>
                            {tours.map((tour, index) => (
                                <tr
                                    key={tour.id}
                                    style={{
                                        backgroundColor: index % 2 === 0 ? "white" : "#f9fafb",
                                        borderBottom: '1px solid #e5e7eb',
                                        transition: 'background-color 0.2s'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f0fdf4'}
                                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = index % 2 === 0 ? "white" : "#f9fafb"}
                                >
                                    <td style={cellStyle}>
                                        <span style={{
                                            padding: '4px 8px',
                                            background: '#e0e7ff',
                                            borderRadius: '4px',
                                            fontWeight: '600',
                                            fontSize: '12px',
                                            color: '#3730a3'
                                        }}>
                                            #{tour.id}
                                        </span>
                                    </td>

                                    {/* ✅ HIỂN THỊ ẢNH */}
                                    <td style={{ ...cellStyle, textAlign: "center" }}>
                                        {tour.coverImageUrl ? (
                                            <img
                                                src={tour.coverImageUrl}
                                                alt={tour.nameTour}
                                                style={{
                                                    width: 100,
                                                    height: 70,
                                                    objectFit: "cover",
                                                    borderRadius: 8,
                                                    border: "2px solid #e5e7eb",
                                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                                    transition: 'transform 0.2s'
                                                }}
                                                onError={(e) => {
                                                    console.error('❌ Image load failed:', tour.coverImageUrl);
                                                    e.target.src = 'https://via.placeholder.com/100x70?text=No+Image';
                                                    e.target.style.border = '2px dashed #ef4444';
                                                }}
                                                onLoad={() => console.log('✅ Image loaded:', tour.coverImageUrl)}
                                                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                            />
                                        ) : (
                                            <div style={{
                                                width: 100,
                                                height: 70,
                                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                borderRadius: 8,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '32px',
                                                border: '2px solid #e5e7eb'
                                            }}>
                                                🖼️
                                            </div>
                                        )}
                                    </td>

                                    <td style={cellStyle}>
                                        <div style={{ fontWeight: 600, color: '#1f2937', marginBottom: 4 }}>
                                            {tour.nameTour}
                                        </div>
                                    </td>

                                    <td style={cellStyle}>
                                        <span style={{
                                            padding: '4px 10px',
                                            background: '#dbeafe',
                                            color: '#1e40af',
                                            borderRadius: '6px',
                                            fontSize: '12px',
                                            fontWeight: '600'
                                        }}>
                                            {tour.tourType || 'N/A'}
                                        </span>
                                    </td>

                                    <td style={cellStyle}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                            <span style={{ fontSize: '14px' }}>⏱️</span>
                                            <span style={{ fontSize: '13px', color: '#4b5563' }}>
                                                {tour.duration || 'N/A'}
                                            </span>
                                        </div>
                                    </td>

                                    <td style={{ ...cellStyle, textAlign: "right" }}>
                                        <div style={{ fontWeight: 700, color: '#059669', fontSize: '15px' }}>
                                            {formatCurrency(tour.price)}
                                        </div>
                                    </td>

                                    <td style={{ ...cellStyle, textAlign: 'center' }}>
                                        <span style={{
                                            padding: '4px 10px',
                                            background: '#fef3c7',
                                            color: '#92400e',
                                            borderRadius: '6px',
                                            fontSize: '13px',
                                            fontWeight: '600'
                                        }}>
                                            👥 {tour.maxPeople || 0}
                                        </span>
                                    </td>

                                    <td style={{ ...cellStyle, maxWidth: 250 }}>
                                        <div style={{
                                            fontSize: '13px',
                                            color: '#6b7280',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            lineHeight: '1.4'
                                        }}>
                                            {tour.content || 'Không có mô tả'}
                                        </div>
                                    </td>

                                    <td style={cellStyle}>
                                        <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                                            <ActionButton
                                                icon="✏️"
                                                onClick={() => handleEditClick(tour)}
                                                color="#3b82f6"
                                                title="Chỉnh sửa"
                                            />
                                            <ActionButton
                                                icon="🗑️"
                                                onClick={() => handleDelete(tour.id)}
                                                color="#ef4444"
                                                title="Xóa"
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div style={{
                    padding: '80px 20px',
                    textAlign: 'center',
                    background: '#f9fafb',
                    borderRadius: '12px',
                    border: '2px dashed #d1d5db'
                }}>
                    <div style={{ fontSize: '64px', marginBottom: '16px' }}>🏝️</div>
                    <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                        Chưa có tour nào
                    </h3>
                    <p style={{ color: '#6b7280', marginBottom: '24px' }}>
                        Bắt đầu bằng cách thêm tour du lịch đầu tiên
                    </p>
                    <button
                        onClick={handleAddClick}
                        style={{
                            padding: '12px 24px',
                            background: '#059669',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: '600',
                            fontSize: '14px',
                            cursor: 'pointer',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}
                    >
                        ➕ Thêm Tour Ngay
                    </button>
                </div>
            )}

            {/* ========== MODAL ========== */}
            {isModalOpen && (
                <TourFormModal
                    tour={currentTour}
                    onSave={handleSave}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
        </Panel>
    );
}

// ========== STYLES ==========
const headerStyle = {
    padding: '16px 14px',
    textAlign: 'left',
    fontWeight: '700',
    fontSize: '13px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    color: '#4b5563',
    borderBottom: '2px solid #e5e7eb'
};

const cellStyle = {
    padding: '16px 14px',
    fontSize: '14px',
    color: '#374151',
    verticalAlign: 'middle'
};

/* =============================
      MODAL FORM TOUR
============================= */

function TourFormModal({ tour, onSave, onClose }) {
    const isEdit = !!tour;

    const [nameTour, setNameTour] = useState(tour?.nameTour || "");
    const [content, setContent] = useState(tour?.content || "");
    const [price, setPrice] = useState(tour?.price || 0);
    const [tourType, setTourType] = useState(tour?.tourType || "");
    const [duration, setDuration] = useState(tour?.duration || "");
    const [maxPeople, setMaxPeople] = useState(tour?.maxPeople || 0);
    const [timeline, setTimeline] = useState(tour?.timeline || "");
    const [coverImageFile, setCoverImageFile] = useState(null);
    const [coverImageUrl, setCoverImageUrl] = useState(tour?.coverImageUrl || "");

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setNameTour(tour?.nameTour || "");
        setContent(tour?.content || "");
        setPrice(tour?.price || 0);
        setTourType(tour?.tourType || "");
        setDuration(tour?.duration || "");
        setMaxPeople(tour?.maxPeople || 0);
        setTimeline(tour?.timeline || "");
        setCoverImageUrl(tour?.coverImageUrl || "");
        setCoverImageFile(null);
    }, [tour]);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!nameTour || !price || !duration) {
            alert("⚠️ Vui lòng điền đủ Tên Tour, Giá và Thời lượng!");
            return;
        }

        if (!coverImageFile && !isEdit) {
            alert("⚠️ Vui lòng chọn ảnh bìa cho Tour!");
            return;
        }

        const formData = new FormData();
        formData.append('NameTour', nameTour);
        formData.append('Content', content);
        formData.append('Price', parseInt(price, 10));
        formData.append('TourType', tourType);
        formData.append('Duration', duration);
        formData.append('MaxPeople', parseInt(maxPeople, 10));
        formData.append('Timeline', timeline);
        formData.append('GalleryImageUrls', tour?.galleryImageUrls || '');

        if (coverImageFile) {
            formData.append('coverImage', coverImageFile);
        }

        console.log('📤 FormData being sent:');
        for (let [key, value] of formData.entries()) {
            if (value instanceof File) {
                console.log(`  ${key}: File(${value.name}, ${value.size} bytes, ${value.type})`);
            } else {
                console.log(`  ${key}: "${value}"`);
            }
        }

        onSave({ id: isEdit ? tour.id : null, data: formData });
    };

    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.65)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 1000,
                padding: '20px',
                backdropFilter: 'blur(4px)'
            }}
            onClick={onClose}
        >
            <div
                style={{
                    background: "#fff",
                    padding: '32px',
                    width: '100%',
                    maxWidth: 650,
                    borderRadius: 16,
                    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)",
                    maxHeight: '90vh',
                    overflowY: 'auto'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 24,
                    paddingBottom: 16,
                    borderBottom: '2px solid #e5e7eb'
                }}>
                    <h3 style={{ fontSize: "1.625rem", fontWeight: 700, color: "#1f2937", margin: 0 }}>
                        {isEdit ? "✏️ Chỉnh Sửa Tour" : "✨ Thêm Tour Mới"}
                    </h3>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            fontSize: '24px',
                            cursor: 'pointer',
                            color: '#6b7280',
                            padding: '4px 8px',
                            lineHeight: 1
                        }}
                        title="Đóng"
                    >
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                        <div>
                            <Label>Tên tour *</Label>
                            <InputField
                                value={nameTour}
                                onChange={(e) => setNameTour(e.target.value)}
                                placeholder="VD: Tour Đà Lạt 3N2Đ"
                                required
                            />
                        </div>
                        <div>
                            <Label>Loại tour</Label>
                            <InputField
                                value={tourType}
                                onChange={(e) => setTourType(e.target.value)}
                                placeholder="VD: Nghỉ dưỡng, Mạo hiểm"
                            />
                        </div>
                        <div>
                            <Label>Thời lượng *</Label>
                            <InputField
                                value={duration}
                                onChange={(e) => setDuration(e.target.value)}
                                placeholder="VD: 3 Ngày 2 Đêm"
                                required
                            />
                        </div>
                        <div>
                            <Label>Giá (VNĐ) *</Label>
                            <InputField
                                type="number"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                placeholder="VD: 2500000"
                                required
                                min="0"
                            />
                        </div>
                        <div>
                            <Label>Số người tối đa</Label>
                            <InputField
                                type="number"
                                value={maxPeople}
                                onChange={(e) => setMaxPeople(e.target.value)}
                                placeholder="VD: 30"
                                min="1"
                            />
                        </div>

                        <div>
                            <Label>Ảnh Bìa {!isEdit && '*'}</Label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                        console.log('📎 File selected:', file.name, file.size, 'bytes');
                                        setCoverImageFile(file);
                                    }
                                }}
                                style={{
                                    width: "100%",
                                    padding: "10px 12px",
                                    marginBottom: 8,
                                    border: "2px dashed #d1d5db",
                                    borderRadius: 8,
                                    boxSizing: "border-box",
                                    fontSize: '13px',
                                    cursor: 'pointer',
                                    background: '#f9fafb'
                                }}
                                required={!isEdit}
                            />

                            {coverImageUrl && !coverImageFile && (
                                <div style={{
                                    fontSize: 12,
                                    color: '#6b7280',
                                    padding: '8px 12px',
                                    background: '#f3f4f6',
                                    borderRadius: 6,
                                    marginTop: 4
                                }}>
                                    <div style={{ marginBottom: 4 }}>📷 Ảnh hiện tại:</div>
                                    <img
                                        src={coverImageUrl}
                                        alt="Current"
                                        style={{
                                            width: '100%',
                                            maxHeight: 100,
                                            objectFit: 'cover',
                                            borderRadius: 6,
                                            border: '1px solid #d1d5db'
                                        }}
                                    />
                                </div>
                            )}

                            {coverImageFile && (
                                <div style={{
                                    fontSize: 12,
                                    color: '#059669',
                                    fontWeight: 600,
                                    padding: '8px 12px',
                                    background: '#d1fae5',
                                    borderRadius: 6,
                                    marginTop: 4
                                }}>
                                    ✅ Đã chọn: {coverImageFile.name} ({(coverImageFile.size / 1024).toFixed(1)} KB)
                                </div>
                            )}
                        </div>
                    </div>

                    <div style={{ marginTop: 16 }}>
                        <Label>Timeline (Hành trình)</Label>
                        <TextAreaField
                            value={timeline}
                            onChange={(e) => setTimeline(e.target.value)}
                            rows={3}
                            placeholder="VD: Ngày 1: Đà Lạt - Thác Datanla - Dinh Bảo Đại..."
                        />
                    </div>

                    <div style={{ marginTop: 12 }}>
                        <Label>Nội dung chi tiết</Label>
                        <TextAreaField
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            rows={4}
                            placeholder="Mô tả chi tiết về tour, điểm đến, hoạt động..."
                        />
                    </div>

                    <div style={{
                        marginTop: 30,
                        paddingTop: 20,
                        borderTop: "2px solid #e5e7eb",
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: 12
                    }}>
                        <button
                            type="button"
                            style={ButtonStyles.secondary}
                            onClick={onClose}
                        >
                            ❌ Hủy
                        </button>
                        <button
                            type="submit"
                            style={ButtonStyles.primary}
                        >
                            {isEdit ? "💾 Lưu Thay Đổi" : "✨ Thêm Tour"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

const Label = ({ children }) => (
    <label style={{
        display: "block",
        marginBottom: 8,
        fontWeight: 600,
        fontSize: "14px",
        color: "#374151"
    }}>
        {children}
    </label>
);

const InputField = (props) => (
    <input
        {...props}
        style={{
            width: "100%",
            padding: "11px 14px",
            marginBottom: 12,
            border: "1px solid #d1d5db",
            borderRadius: 8,
            fontSize: "14px",
            transition: "all 0.2s",
            boxSizing: "border-box",
            outline: 'none',
            ...(props.style || {})
        }}
        onFocus={(e) => {
            e.target.style.borderColor = '#059669';
            e.target.style.boxShadow = '0 0 0 3px rgba(5,150,105,0.1)';
        }}
        onBlur={(e) => {
            e.target.style.borderColor = '#d1d5db';
            e.target.style.boxShadow = 'none';
        }}
    />
);

const TextAreaField = (props) => (
    <textarea
        {...props}
        style={{
            width: "100%",
            padding: "11px 14px",
            marginBottom: 12,
            border: "1px solid #d1d5db",
            borderRadius: 8,
            fontSize: "14px",
            transition: "all 0.2s",
            boxSizing: "border-box",
            resize: "vertical",
            outline: 'none',
            fontFamily: 'inherit',
            lineHeight: 1.5,
            ...(props.style || {})
        }}
        onFocus={(e) => {
            e.target.style.borderColor = '#059669';
            e.target.style.boxShadow = '0 0 0 3px rgba(5,150,105,0.1)';
        }}
        onBlur={(e) => {
            e.target.style.borderColor = '#d1d5db';
            e.target.style.boxShadow = 'none';
        }}
    />
);

const ButtonStyles = {
    primary: {
        background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
        color: "white",
        fontWeight: 600,
        padding: "12px 24px",
        borderRadius: 8,
        border: "none",
        cursor: "pointer",
        fontSize: '14px',
        transition: "all 0.2s",
        boxShadow: '0 2px 6px rgba(5,150,105,0.3)'
    },
    secondary: {
        background: "#f3f4f6",
        color: "#374151",
        fontWeight: 600,
        padding: "12px 24px",
        borderRadius: 8,
        border: "1px solid #d1d5db",
        cursor: "pointer",
        fontSize: '14px',
        transition: "all 0.2s",
    }
};
