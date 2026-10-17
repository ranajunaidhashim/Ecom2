import { dbConnect } from '@/lib/db';
import Setting from '@/models/Setting';

export const SETTING_KEYS = {
  MASK_PAID_ORDERS: 'mask_paid_orders_as_pending',
};

export async function getSetting(key, defaultValue = false) {
  try {
    await dbConnect();
    const doc = await Setting.findOne({ key }).lean();
    if (!doc || doc.value === undefined || doc.value === null) {
      return defaultValue;
    }
    return doc.value;
  } catch (error) {
    console.error(`[Settings] Failed to fetch setting '${key}':`, error);
    return defaultValue;
  }
}

export async function setSetting(key, value, description = '') {
  try {
    await dbConnect();
    const doc = await Setting.findOneAndUpdate(
      { key },
      { key, value, description },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();
    return doc.value;
  } catch (error) {
    console.error(`[Settings] Failed to update setting '${key}':`, error);
    throw error;
  }
}

/**
 * Returns true if the global toggle for masking paid orders is currently active.
 */
export async function isMaskPaidOrdersActive() {
  return Boolean(await getSetting(SETTING_KEYS.MASK_PAID_ORDERS, false));
}

/**
 * Sanitizes an order object based on the caller's role and the persistent `order.masked` property.
 * - Super Admin always receives the authentic status and masked indicator.
 * - Regular Admin receives `status: 'pending'` whenever `order.masked === true`, regardless of global toggle.
 * - Strip `masked` property for Regular Admin to prevent alternative inference.
 */
export function sanitizeOrderForRole(order, isSuperAdmin) {
  if (!order) return order;
  if (isSuperAdmin) {
    return order;
  }

  const plain = typeof order.toObject === 'function' ? order.toObject() : { ...order };

  if (plain.masked) {
    plain.status = 'pending';
  }

  // Ensure regular admin cannot see or infer the masked flag
  delete plain.masked;
  return plain;
}
