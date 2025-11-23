import React from 'react';

export default function StatusBadge({ status, size = 'md' }) {
    const statusConfig = {
        // Flood Reports
        'Pending': {
            icon: '⏳',
            label: 'Chờ duyệt',
            bg: '#fef3c7',
            text: '#92400e',
            border: '#f59e0b'
        },
        'Approved': {
            icon: '✅',
            label: 'Đã duyệt',
            bg: '#d1fae5',
            text: '#065f46',
            border: '#10b981'
        },
        'Rejected': {
            icon: '❌',
            label: 'Từ chối',
            bg: '#fee2e2',
            text: '#991b1b',
            border: '#ef4444'
        },

        // Water Levels
        'Low': {
            icon: '🟢',
            label: 'Thấp',
            bg: '#d1fae5',
            text: '#065f46',
            border: '#10b981'
        },
        'Medium': {
            icon: '🟡',
            label: 'Trung bình',
            bg: '#fef3c7',
            text: '#92400e',
            border: '#f59e0b'
        },
        'High': {
            icon: '🔴',
            label: 'Cao',
            bg: '#fee2e2',
            text: '#991b1b',
            border: '#ef4444'
        },
        'Dangerous': {
            icon: '🟣',
            label: 'Nguy hiểm',
            bg: '#fae8ff',
            text: '#701a75',
            border: '#a855f7'
        },
        'Unknown': {
            icon: '⚪',
            label: 'Chưa đánh giá',
            bg: '#f3f4f6',
            text: '#4b5563',
            border: '#9ca3af'
        },

        // Feedback Status
        'Processing': {
            icon: '🔄',
            label: 'Đang xử lý',
            bg: '#dbeafe',
            text: '#1e40af',
            border: '#3b82f6'
        },
        'Resolved': {
            icon: '✅',
            label: 'Đã giải quyết',
            bg: '#d1fae5',
            text: '#065f46',
            border: '#10b981'
        },

        // Ticket Status
        'Paid': {
            icon: '💳',
            label: 'Đã thanh toán',
            bg: '#d1fae5',
            text: '#065f46',
            border: '#10b981'
        },
        'Used': {
            icon: '✓',
            label: 'Đã sử dụng',
            bg: '#e0e7ff',
            text: '#3730a3',
            border: '#6366f1'
        },
        'Cancelled': {
            icon: '🚫',
            label: 'Đã hủy',
            bg: '#f3f4f6',
            text: '#4b5563',
            border: '#9ca3af'
        },
        'Expired': {
            icon: '⏰',
            label: 'Hết hạn',
            bg: '#fee2e2',
            text: '#991b1b',
            border: '#ef4444'
        },

        // Bus Route Status
        'Active': {
            icon: '✅',
            label: 'Hoạt động',
            bg: '#d1fae5',
            text: '#065f46',
            border: '#10b981'
        },
        'Inactive': {
            icon: '⏸️',
            label: 'Ngừng hoạt động',
            bg: '#f3f4f6',
            text: '#4b5563',
            border: '#9ca3af'
        },
        'Maintenance': {
            icon: '🔧',
            label: 'Bảo trì',
            bg: '#fef3c7',
            text: '#92400e',
            border: '#f59e0b'
        },

        // Bus Schedule
        'Scheduled': {
            icon: '📅',
            label: 'Đã lên lịch',
            bg: '#dbeafe',
            text: '#1e40af',
            border: '#3b82f6'
        },
        'Running': {
            icon: '🚌',
            label: 'Đang chạy',
            bg: '#d1fae5',
            text: '#065f46',
            border: '#10b981'
        },
        'Completed': {
            icon: '✓',
            label: 'Hoàn thành',
            bg: '#e0e7ff',
            text: '#3730a3',
            border: '#6366f1'
        }
    };

    const config = statusConfig[status] || {
        icon: '❔',
        label: status,
        bg: '#f3f4f6',
        text: '#4b5563',
        border: '#9ca3af'
    };

    const sizeStyles = {
        sm: {
            padding: '4px 10px',
            fontSize: '11px',
            iconSize: '12px',
            gap: '4px'
        },
        md: {
            padding: '6px 14px',
            fontSize: '13px',
            iconSize: '14px',
            gap: '6px'
        },
        lg: {
            padding: '8px 16px',
            fontSize: '14px',
            iconSize: '16px',
            gap: '8px'
        }
    };

    const currentSize = sizeStyles[size];

    return (
        <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: currentSize.gap,
            padding: currentSize.padding,
            background: config.bg,
            color: config.text,
            border: `1.5px solid ${config.border}`,
            borderRadius: '8px',
            fontSize: currentSize.fontSize,
            fontWeight: '600',
            letterSpacing: '0.3px',
            whiteSpace: 'nowrap',
            transition: 'all 0.2s ease',
            boxShadow: `0 2px 4px ${config.border}15`,
        }}>
            <span style={{ fontSize: currentSize.iconSize }}>{config.icon}</span>
            <span>{config.label}</span>
        </span>
    );
}