import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Discount from '@/models/Discount';

export async function POST(req) {
  try {
    await dbConnect();
    const { code, subtotal } = await req.json();

    if (!code) {
      return NextResponse.json({ error: 'Discount code is required' }, { status: 400 });
    }

    const discount = await Discount.findOne({ code: code.toUpperCase(), isActive: true });
    
    if (!discount) {
      return NextResponse.json({ error: 'Invalid or expired discount code' }, { status: 400 });
    }

    let discountAmount = 0;
    if (discount.discountType === 'percentage') {
      discountAmount = (subtotal * discount.value) / 100;
    } else if (discount.discountType === 'fixed') {
      discountAmount = discount.value;
    }

    // Ensure we don't discount more than the subtotal
    if (discountAmount > subtotal) {
      discountAmount = subtotal;
    }

    return NextResponse.json({
      code: discount.code,
      type: discount.discountType,
      value: discount.value,
      discountAmount
    });
  } catch (error) {
    console.error('Discount validation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
