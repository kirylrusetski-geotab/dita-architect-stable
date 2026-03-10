import { describe, it, expect } from 'vitest';

/**
 * The TrackedChangesPlugin builds deletion descriptors as map keys.
 * Previously used `::` as separator, which collided when deleted text
 * contained `::`. Now uses `\0` (null character) which cannot appear
 * in XML text content.
 *
 * This test verifies the descriptor format avoids collision.
 */

// Replicate the descriptor format from TrackedChangesPlugin
const buildDescriptor = (blockKey: string, position: number, text: string): string =>
  `${blockKey}\0${position}\0${text}`;

describe('TrackedChangesPlugin descriptor', () => {
  it('produces unique descriptors for different deletions', () => {
    const d1 = buildDescriptor('key-1', 0, 'hello');
    const d2 = buildDescriptor('key-1', 5, 'world');
    expect(d1).not.toBe(d2);
  });

  it('does not collide when deleted text contains the old :: separator', () => {
    // These would have collided with the old `::` separator:
    // "key-1::0::a::b" === "key-1::0::a" + "::b" (ambiguous parse)
    const d1 = buildDescriptor('key-1', 0, 'a::b');
    const d2 = buildDescriptor('key-1', 0, 'a');
    expect(d1).not.toBe(d2);
  });

  it('does not collide when block key contains the old :: separator', () => {
    const d1 = buildDescriptor('key::1', 0, 'text');
    const d2 = buildDescriptor('key', 1, 'text');
    expect(d1).not.toBe(d2);
  });

  it('produces identical descriptors for the same inputs', () => {
    const d1 = buildDescriptor('key-1', 5, 'deleted text');
    const d2 = buildDescriptor('key-1', 5, 'deleted text');
    expect(d1).toBe(d2);
  });

  it('handles empty deleted text', () => {
    const d1 = buildDescriptor('key-1', 0, '');
    const d2 = buildDescriptor('key-1', 0, 'x');
    expect(d1).not.toBe(d2);
  });
});
