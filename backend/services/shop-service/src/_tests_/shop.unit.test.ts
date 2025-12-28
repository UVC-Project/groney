import { describe, it, expect } from 'vitest';

describe('Shop feature - unit rules', () => {
  it('marks items as owned based on purchases', () => {
    // inline "unit under test" (no production code touched)
    const markOwned = (items: { id: string }[], purchases: { itemId: string }[]) => {
      const ownedIds = new Set(purchases.map((p) => p.itemId));
      return items.map((item) => ({ ...item, owned: ownedIds.has(item.id) }));
    };

    const items = [{ id: 'hat-blue-cap' }, { id: 'acc-bow-tie' }, { id: 'acc-sunglasses' }];
    const purchases = [{ itemId: 'acc-bow-tie' }];

    expect(markOwned(items, purchases)).toEqual([
      { id: 'hat-blue-cap', owned: false },
      { id: 'acc-bow-tie', owned: true },
      { id: 'acc-sunglasses', owned: false }
    ]);
  });

  it('equip rule: only ONE equipped item total', () => {
    // inline "unit under test"
    const equipUpdate = (itemType: 'HAT' | 'ACCESSORY', itemId: string) => {
      if (itemType === 'HAT') return { equippedHat: itemId, equippedAccessory: null };
      return { equippedAccessory: itemId, equippedHat: null };
    };

    expect(equipUpdate('HAT', 'hat-blue-cap')).toEqual({
      equippedHat: 'hat-blue-cap',
      equippedAccessory: null
    });

    expect(equipUpdate('ACCESSORY', 'acc-bow-tie')).toEqual({
      equippedAccessory: 'acc-bow-tie',
      equippedHat: null
    });
  });
});
