import { describe, it, expect } from 'vitest';
import { historyReducer, loadHistory, STORAGE_KEY, type TransactionRecord } from './transactions';
const record: TransactionRecord = { id: '1', operation: 'health_check', stage: 'awaiting_signature', status: 'pending', startTime: 1, finalized: false };
describe('immutable history', () => {
  it('adds a record at start', () => expect(historyReducer([], { type: 'start', record })).toEqual([record]));
  it('never mutates old records', () => {
    Object.freeze(record); const old = Object.freeze([record]);
    const next = historyReducer([...old], { type: 'patch', id: '1', patch: { status: 'accepted' } });
    expect(record.status).toBe('pending'); expect(next[0].status).toBe('accepted'); expect(next[0]).not.toBe(record);
  });
  it('keeps latest 50', () => {
    let history: TransactionRecord[] = [];
    for (let i = 0; i < 60; i++) history = historyReducer(history, { type: 'start', record: { ...record, id: String(i) } });
    expect(history).toHaveLength(50); expect(history[0].id).toBe('59');
  });
  it('restores valid pending records for actual recovery polling', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([record])); expect(loadHistory()).toEqual([record]);
  });
});
