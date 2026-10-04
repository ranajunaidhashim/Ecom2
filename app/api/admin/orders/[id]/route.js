import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Order from '@/models/Order';

export async function PATCH(req, { params }) {
  try {
    const { id } = await params;
    await dbConnect();
    const { status } = await req.json();

    if (!['pending', 'paid', 'fulfilled', 'cancelled'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    
    if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error('Failed to update order:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
