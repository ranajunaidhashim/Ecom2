import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Order from '@/models/Order';
import { getAdminRole } from '@/lib/admin-auth';
import { sanitizeOrderForRole } from '@/lib/settings';

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    await dbConnect();
    const role = await getAdminRole();
    if (!role) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const isSuperAdmin = role === 'superadmin';

    const order = await Order.findById(id).populate('items.productId').lean();
    if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    return NextResponse.json({
      success: true,
      order: sanitizeOrderForRole(order, isSuperAdmin),
    });
  } catch (error) {
    console.error('Failed to get order:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  try {
    const { id } = await params;
    await dbConnect();
    const role = await getAdminRole();
    if (!role) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const isSuperAdmin = role === 'superadmin';

    const { status } = await req.json();

    if (!['pending', 'paid', 'fulfilled', 'cancelled'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Only update status without modifying the order's existing persistent masked property
    const order = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate('items.productId').lean();
    
    if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    return NextResponse.json({
      success: true,
      order: sanitizeOrderForRole(order, isSuperAdmin),
    });
  } catch (error) {
    console.error('Failed to update order:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
