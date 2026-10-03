import { describe, it, expect, vi, beforeEach } from 'vitest';
import { formatAddress, formatTxHash, formatTimestamp, formatRelativeTime, isVerdictStale } from './client';

describe('genlayer/client utilities', () => {
  describe('formatAddress', () => {
    it('formats address correctly', () => {
      expect(formatAddress('0x1234567890abcdef1234567890abcdef12345678')).toBe('0x1234...5678');
    });

    it('handles empty string', () => {
      expect(formatAddress('')).toBe('');
    });

    it('uses custom char count', () => {
      const result = formatAddress('0x1234567890abcdef1234567890abcdef12345678', 6);
      expect(result).toContain('0x123456');
      expect(result).toContain('5678');
    });
  });

  describe('formatTxHash', () => {
    it('formats transaction hash correctly', () => {
      const result = formatTxHash('0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef');
      expect(result).toContain('0x123456');
      expect(result).toContain('cdef');
    });

    it('handles empty string', () => {
      expect(formatTxHash('')).toBe('');
    });
  });

  describe('formatTimestamp', () => {
    it('formats unix timestamp to readable date', () => {
      const timestamp = 1704067200; // 2024-01-01 00:00:00 UTC
      const result = formatTimestamp(timestamp);
      expect(result).toContain('2024');
      // Locale-independent check - just verify it contains year
      expect(result).toContain('2024');
    });
  });

  describe('formatRelativeTime', () => {
    beforeEach(() => {
      vi.setSystemTime(new Date('2024-01-01T12:00:00.000Z'));
    });

    it('shows "just now" for recent timestamps', () => {
      const now = Date.now() / 1000;
      expect(formatRelativeTime(now)).toBe('just now');
    });

    it('shows minutes ago', () => {
      const fiveMinutesAgo = Date.now() / 1000 - 300;
      expect(formatRelativeTime(fiveMinutesAgo)).toBe('5m ago');
    });

    it('shows hours ago', () => {
      const twoHoursAgo = Date.now() / 1000 - 7200;
      expect(formatRelativeTime(twoHoursAgo)).toBe('2h ago');
    });

    it('shows days ago', () => {
      const threeDaysAgo = Date.now() / 1000 - 259200;
      expect(formatRelativeTime(threeDaysAgo)).toBe('3d ago');
    });
  });

  describe('isVerdictStale', () => {
    beforeEach(() => {
      vi.setSystemTime(new Date('2024-01-01T12:00:00.000Z'));
    });

    it('returns true for zero timestamp', () => {
      expect(isVerdictStale(0, 10)).toBe(true);
    });

    it('returns true for old timestamp', () => {
      const oldTimestamp = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
      expect(isVerdictStale(oldTimestamp, 10)).toBe(true);
    });

    it('returns false for recent timestamp', () => {
      const recentTimestamp = Math.floor(Date.now() / 1000) - 300; // 5 minutes ago
      expect(isVerdictStale(recentTimestamp, 10)).toBe(false);
    });
  });
});