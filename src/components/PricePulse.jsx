import React, { useState, useEffect, useRef } from 'react';

/**
 * PricePulse component
 * Briefly flashes a background color when value changes
 */
export default function PricePulse({ value, children, className = "" }) {
    const [pulseClass, setPulseClass] = useState("");
    const prevValue = useRef(value);

    useEffect(() => {
        if (value !== prevValue.current && value !== undefined && prevValue.current !== undefined) {
            const isUp = parseFloat(value) > parseFloat(prevValue.current);
            setPulseClass(isUp ? "price-pulse-up" : "price-pulse-down");

            const timer = setTimeout(() => {
                setPulseClass("");
            }, 800);

            prevValue.current = value;
            return () => clearTimeout(timer);
        }
        prevValue.current = value;
    }, [value]);

    return (
        <span className={`${className} ${pulseClass}`}>
            {children || value}
        </span>
    );
}
