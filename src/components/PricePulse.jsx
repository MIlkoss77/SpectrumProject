import React, { useState, useEffect, useRef } from 'react';

/**
 * PricePulse component
 * Flashes background + subtle glow when value changes (green=up, red=down)
 */
export default function PricePulse({ value, children, className = "" }) {
    const [pulseClass, setPulseClass] = useState("");
    const [glowStyle, setGlowStyle] = useState({});
    const prevValue = useRef(value);

    useEffect(() => {
        if (value !== prevValue.current && value !== undefined && prevValue.current !== undefined) {
            const isUp = parseFloat(value) > parseFloat(prevValue.current);
            setPulseClass(isUp ? "price-pulse-up" : "price-pulse-down");
            setGlowStyle({
                boxShadow: isUp
                    ? '0 0 12px rgba(0, 227, 150, 0.3), inset 0 0 8px rgba(0, 227, 150, 0.05)'
                    : '0 0 12px rgba(255, 69, 96, 0.3), inset 0 0 8px rgba(255, 69, 96, 0.05)',
                borderRadius: '4px',
                transition: 'box-shadow 0.4s ease-out',
            });

            const timer = setTimeout(() => {
                setPulseClass("");
                setGlowStyle({ boxShadow: 'none', transition: 'box-shadow 0.6s ease-out' });
            }, 800);

            prevValue.current = value;
            return () => clearTimeout(timer);
        }
        prevValue.current = value;
    }, [value]);

    return (
        <span className={`${className} ${pulseClass}`} style={glowStyle}>
            {children || value}
        </span>
    );
}

