import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Order from '@/models/Order';
import { getAdminRole } from '@/lib/admin-auth';
import { sanitizeOrderForRole } from '@/lib/settings';

export async function GET() {
  try {
    await dbConnect();
    const role = await getAdminRole();
    if (!role) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const isSuperAdmin = role === 'superadmin';

    const orders = await Order.find({}).populate('items.productId').sort({ createdAt: -1 }).lean();

    // Sanitize orders based on persistent order.masked flag:
    // - Regular admin sees 'pending' if order.masked is true, regardless of global toggle.
    // - Regular admin sees actual status if order.masked is false.
    // - Super Admin always sees authentic status regardless of masked flag or toggle.
    const sanitizedOrders = orders.map((order) => sanitizeOrderForRole(order, isSuperAdmin));

    return NextResponse.json({
      orders: sanitizedOrders,
      isSuperAdmin,
    });
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
