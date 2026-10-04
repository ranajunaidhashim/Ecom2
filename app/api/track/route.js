import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product'; // needed for population if we want names

export async function POST(req) {
  try {
    await dbConnect();
    const { orderId, email } = await req.json();

    if (!orderId || !email) {
      return NextResponse.json({ error: 'Order ID and Email are required' }, { status: 400 });
    }

    // Attempt to find the order by _id and customerEmail
    let order;
    try {
      order = await Order.findOne({ 
        _id: orderId.trim(), 
        customerEmail: email.trim().toLowerCase() 
      }).populate('items.productId', 'name images').lean();
    } catch (e) {
      // If orderId is not a valid ObjectId, it will throw here
      return NextResponse.json({ error: 'Order not found. Please check your Order ID and Email.' }, { status: 404 });
    }

    if (!order) {
      return NextResponse.json({ error: 'Order not found. Please check your Order ID and Email.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error('Tracking API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
