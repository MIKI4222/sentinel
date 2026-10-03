// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
function files(dir: string): string[] { return readdirSync(dir, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? files(join(dir, entry.name)) : [join(dir, entry.name)]); }
describe('SDK regression guard', () => {
  it('never reintroduces ABI-style contract wrappers', () => {
    for (const file of [...files('src'), ...files('scripts')].filter(file => /\.[tj]sx?$/.test(file))) {
      expect(readFileSync(file, 'utf8'), file).not.toMatch(/\.contract\s*\(|contract\.(?:read|write)/);
    }
  });
});
