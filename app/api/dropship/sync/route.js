import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Product from '@/models/Product';
import { applyPricing } from '@/lib/pricing';

export const runtime = 'nodejs';

/**
 * POST /api/dropship/sync
 * Import/refresh products from a supplier.
 *
 * Body: { source: 'dsers' | 'cj', payload: <DSers JSON> | <CJ product> , pricingRule? }
 *
 * Auth: send header  x-admin-secret: <ADMIN_API_SECRET>
 */
export async function POST(req) {
  if (req.headers.get('x-admin-secret') !== process.env.ADMIN_API_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { source, payload, pricingRule = { type: 'multiplier', value: 2 } } =
    await req.json();

  await dbConnect();

  const normalized =
    source === 'dsers'
      ? normalizeDsers(payload, pricingRule)
      : source === 'cj'
      ? normalizeCj(payload, pricingRule)
      : null;

  if (!normalized) {
    return NextResponse.json({ error: 'Unknown source' }, { status: 400 });
  }

  // Upsert by (source, supplier.externalId) so re-syncs update in place.
  const doc = await Product.findOneAndUpdate(
    { source, 'supplier.externalId': normalized.supplier.externalId },
    { $set: { ...normalized, lastSyncedAt: new Date() } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return NextResponse.json({ ok: true, productId: doc._id, variants: doc.variants.length });
}

const KNOWN_CATEGORIES = ['cosmetics', 'dental', 'toys'];

function normalizeCategory(raw) {
  const c = String(raw || '').toLowerCase();
  return KNOWN_CATEGORIES.find((k) => c.includes(k)) || 'other';
}

/** DSers exports AliExpress products in this rough shape. */
function normalizeDsers(p, pricingRule) {
  const variants = (p.variants || []).map((v) => {
    const cost = Number(v.cost ?? v.price ?? 0);
    const label = (v.options || []).map((o) => o.value).join(' / ') || 'Default';
    return {
      label,
      sku: v.sku || `${p.productId}-${label}`,
      costPrice: cost,
      price: applyPricing(cost, pricingRule),
      stock: Number(v.stock ?? 0),
      imageUrl: v.image || null, // supplier CDN URL only
    };
  });

  return {
    name: p.title,
    slug: slugify(p.title, p.productId),
    description: p.description || '',
    images: p.images || [],
    source: 'dsers',
    supplier: {
      name: 'AliExpress',
      externalId: String(p.productId),
      productUrl: p.url,
    },
    pricingRule,
    variants,
    category: normalizeCategory(p.category),
    tags: p.tags || [],
  };
}

/** CJ Dropshipping product API shape. */
function normalizeCj(p, pricingRule) {
  const variants = (p.variants || p.productVariants || []).map((v) => {
    const cost = Number(v.variantSellPrice ?? v.price ?? 0);
    return {
      label: v.variantKey || v.variantName || 'Default',
      sku: v.variantSku || v.vid,
      costPrice: cost,
      price: applyPricing(cost, pricingRule),
      stock: Number(v.variantStandardStock ?? v.stock ?? 0),
      imageUrl: v.variantImage || null,
    };
  });

  return {
    name: p.productNameEn || p.productName,
    slug: slugify(p.productNameEn || p.productName, p.pid),
    description: p.description || '',
    images: p.productImageSet || (p.productImage ? [p.productImage] : []),
    source: 'cj',
    supplier: {
      name: 'CJ Dropshipping',
      externalId: String(p.pid),
      productUrl: p.productUrl,
    },
    pricingRule,
    variants,
    category: normalizeCategory(p.categoryName),
    tags: [],
  };
}

function slugify(title, id) {
  return (
    String(title || 'product')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 60) + `-${id}`
  );
}
