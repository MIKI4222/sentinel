import '@testing-library/jest-dom';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Vitest 2 can inherit Node's unavailable native localStorage instead of jsdom's.
// Use an isolated, synchronous Storage implementation for all test environments.
// This affects tests only; production browser storage is unchanged.
class TestStorage implements Storage {
  private readonly values = new Map<string, string>();

  get length(): number {
    return this.values.size;
  }

  clear(): void {
    this.values.clear();
  }

  getItem(key: string): string | null {
    return this.values.get(String(key)) ?? null;
  }

  key(index: number): string | null {
    return Array.from(this.values.keys())[index] ?? null;
  }

  removeItem(key: string): void {
    this.values.delete(String(key));
  }

  setItem(key: string, value: string): void {
    this.values.set(String(key), String(value));
  }
}

const storage = new TestStorage();

// Define the property without reading Node's native localStorage getter.
Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  enumerable: true,
  writable: true,
  value: storage,
});

if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'localStorage', {
    configurable: true,
    enumerable: true,
    writable: true,
    value: storage,
  });
}

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  storage.clear();
});
