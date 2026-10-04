import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Discount from '@/models/Discount';

export async function GET() {
  try {
    await dbConnect();
    const discounts = await Discount.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ discounts });
  } catch (error) {
    console.error('Failed to fetch discounts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();
    
    if (!body.code || !body.discountType || !body.value) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const existing = await Discount.findOne({ code: body.code });
    if (existing) {
      return NextResponse.json({ error: 'Discount code already exists' }, { status: 400 });
    }

    const discount = await Discount.create({
      code: body.code,
      discountType: body.discountType,
      value: body.value,
      isActive: true,
    });

    return NextResponse.json({ success: true, discount }, { status: 201 });
  } catch (error) {
    console.error('Failed to create discount:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
