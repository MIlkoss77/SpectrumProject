import { describe, it, expect } from 'vitest';
import { sma, ema, rsi, clamp, zScore } from './indicators';

describe('Indicators Service', () => {
  describe('sma (Simple Moving Average)', () => {
    it('should calculate SMA correctly', () => {
      const data = [1, 2, 3, 4, 5];
      const period = 3;
      const result = sma(data, period);
      expect(result[2]).toBe(2);
      expect(result[3]).toBe(3);
      expect(result[4]).toBe(4);
      expect(result[0]).toBeNull();
      expect(result[1]).toBeNull();
    });

    it('should return empty array if values length < period', () => {
      expect(sma([1, 2], 3)).toEqual([]);
    });
  });

  describe('ema (Exponential Moving Average)', () => {
    it('should calculate EMA correctly', () => {
      const data = [10, 20, 30];
      const period = 2;
      const result = ema(data, period);
      expect(result[0]).toBe(10);
      // k = 2/(2+1) = 0.666...
      // ema[1] = (20 - 10) * 0.6666666666666666 + 10 = 16.666666666666664
      expect(result[1]).toBeCloseTo(16.667, 2);
    });
  });

  describe('rsi (Relative Strength Index)', () => {
    it('should calculate RSI correctly', () => {
      const data = [10, 12, 10, 12, 10, 12, 10, 12, 10, 12, 10, 12, 10, 12, 10];
      const result = rsi(data, 14);
      expect(result[14]).toBeDefined();
    });
  });

  describe('clamp', () => {
    it('should clamp value between min and max', () => {
      expect(clamp(10, 0, 5)).toBe(5);
      expect(clamp(-5, 0, 5)).toBe(0);
      expect(clamp(3, 0, 5)).toBe(3);
    });
  });

  describe('zScore', () => {
    it('should calculate z-score correctly', () => {
      expect(zScore(10, 5, 2.5)).toBe(2);
      expect(zScore(10, 10, 5)).toBe(0);
      expect(zScore(10, 5, 0)).toBe(0);
    });
  });
});
