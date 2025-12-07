import React, { useState, useEffect } from 'react';
import { uploadEventBanner } from '../services/api'; // ✅ SỬA: Import uploadEventBanner
import '../styles/EventBannerForm.css';

export default function EventBannerForm({ banner, onSubmit, onCancel }) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        imageUrl: '',
    });

    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [errors, setErrors] = useState({});

    // ✅ Helper: Tạo full URL cho preview
    const getFullImageUrl = (url) => {
        if (!url) return '';
        if (url.startsWith('http://') || url.startsWith('https://')) {
            return url;
        }
        return `http://localhost:5000${url.startsWith('/') ? '' : '/'}${url}`;
    };

    useEffect(() => {
        if (banner) {
            setFormData({
                title: banner.title || '',
                description: banner.description || '',
                imageUrl: banner.imageUrl || '',
            });
            setPreviewUrl(getFullImageUrl(banner.imageUrl) || '');
        }
    }, [banner]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                alert('❌ File quá lớn! Vui lòng chọn file nhỏ hơn 10MB');
                return;
            }

            if (!file.type.startsWith('image/')) {
                alert('❌ Vui lòng chọn file ảnh!');
                return;
            }

            setSelectedFile(file);

            // Local preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUploadImage = async () => {
        if (!selectedFile) {
            alert('❌ Vui lòng chọn ảnh trước!');
            return;
        }

        setIsUploading(true);
        try {
            console.log('📤 Uploading event banner:', selectedFile.name);

            // ✅ SỬA: Dùng uploadEventBanner thay vì uploadImage
            const relativeUrl = await uploadEventBanner(selectedFile);

            console.log('✅ Upload success, URL:', relativeUrl);

            // ✅ Lưu relative path vào formData
            setFormData(prev => ({ ...prev, imageUrl: relativeUrl }));

            // ✅ Set preview với full URL
            setPreviewUrl(getFullImageUrl(relativeUrl));

            alert('✅ Upload banner thành công!');
            setSelectedFile(null);
        } catch (error) {
            console.error('❌ Upload error:', error);
            alert('❌ Upload thất bại: ' + (error.response?.data?.message || error.message));
        } finally {
            setIsUploading(false);
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Tiêu đề không được để trống';
        } else if (formData.title.trim().length < 5) {
            newErrors.title = 'Tiêu đề phải có ít nhất 5 ký tự';
        }

        if (!formData.imageUrl.trim()) {
            newErrors.imageUrl = 'Vui lòng upload ảnh banner';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validate()) {
            return;
        }

        console.log('📤 Submitting form data:', formData);
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="event-form">
            {/* Image Upload Section */}
            <div className="form-group">
                <label className="form-label required">Ảnh Banner</label>

                <div className="image-upload-section">
                    {/* Preview */}
                    <div className="image-preview" style={{ height: '200px' }}>
                        {previewUrl ? (
                            <img
                                src={previewUrl}
                                alt="Preview"
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    borderRadius: '8px'
                                }}
                                onError={(e) => {
                                    console.error('❌ Image load error:', previewUrl);
                                    e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>';
                                }}
                            />
                        ) : (
                            <div className="image-placeholder">
                                <span style={{ fontSize: '48px' }}>🖼️</span>
                                <p>Chưa có ảnh</p>
                                <small style={{ color: '#9ca3af', fontSize: '12px' }}>
                                    Khuyến nghị: 1920x600px, tối đa 10MB
                                </small>
                            </div>
                        )}
                    </div>

                    {/* Upload Controls */}
                    <div className="upload-controls">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            id="file-input"
                            style={{ display: 'none' }}
                        />

                        <label htmlFor="file-input" className="btn btn-secondary">
                            📁 Chọn ảnh banner
                        </label>

                        {selectedFile && (
                            <button
                                type="button"
                                onClick={handleUploadImage}
                                disabled={isUploading}
                                className="btn btn-primary"
                            >
                                {isUploading ? '⏳ Đang upload...' : '☁️ Upload lên server'}
                            </button>
                        )}
                    </div>

                    {selectedFile && (
                        <p className="file-info">
                            📎 Đã chọn: <strong>{selectedFile.name}</strong> ({(selectedFile.size / 1024).toFixed(1)} KB)
                        </p>
                    )}

                    {formData.imageUrl && !selectedFile && (
                        <div className="success-message">
                            ✅ Đã có ảnh banner: <code>{formData.imageUrl}</code>
                        </div>
                    )}

                    {errors.imageUrl && (
                        <p className="error-message">{errors.imageUrl}</p>
                    )}
                </div>
            </div>

            {/* Title */}
            <div className="form-group">
                <label className="form-label required">Tiêu đề Banner</label>
                <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="VD: Sự kiện mùa hè 2024 - Giảm giá 50%"
                    className={`form-input ${errors.title ? 'error' : ''}`}
                    maxLength={200}
                />
                {errors.title && (
                    <p className="error-message">{errors.title}</p>
                )}
            </div>

            {/* Description */}
            <div className="form-group">
                <label className="form-label">Mô tả (tuỳ chọn)</label>
                <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Mô tả chi tiết về banner..."
                    rows="4"
                    className="form-input"
                    maxLength={500}
                />
                <small style={{ color: '#6b7280', fontSize: '12px' }}>
                    {formData.description.length}/500 ký tự
                </small>
            </div>

            {/* Action Buttons */}
            <div className="form-actions">
                <button
                    type="button"
                    onClick={onCancel}
                    className="btn btn-secondary"
                >
                    Hủy
                </button>
                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isUploading}
                >
                    {banner ? '💾 Cập nhật Banner' : '➕ Tạo Banner mới'}
                </button>
            </div>
        </form>
    );
}