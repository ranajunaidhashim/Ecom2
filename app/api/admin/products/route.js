import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Product from '@/models/Product';

function slugify(name) {
  return String(name || 'product')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
}

export async function GET() {
  try {
    await dbConnect();
    const products = await Product.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ products });
  } catch (error) {
    console.error('Failed to list products:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();

    if (!body.name || !body.description || !body.variants || !body.variants.length) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newProduct = await Product.create({
      name: body.name,
      slug: `${slugify(body.name)}-${Date.now().toString(36)}`,
      description: body.description,
      category: body.category || 'other',
      shippingCost: body.shippingCost !== undefined ? body.shippingCost : 0,
      images: body.images || [],
      variants: body.variants,
      tags: body.tags || [],
      source: body.source || 'manual',
      supplier: body.supplier || undefined,
    });

    return NextResponse.json({ success: true, product: newProduct }, { status: 201 });
  } catch (error) {
    console.error('Failed to create product:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
