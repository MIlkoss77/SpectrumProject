import React from 'react';

export default function Skeleton({ className = '', style = {}, variant = 'rect' }) {
    const baseStyle = {
        borderRadius: variant === 'circle' ? '50%' : '12px',
        overflow: 'hidden',
        minHeight: '1em',
        ...style
    };

    return (
        <div
            className={`skeleton-primitive skeleton-shimmer ${className}`}
            style={baseStyle}
        />
    );
}

