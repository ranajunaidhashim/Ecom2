import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';
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
    
    let totalRevenue = 0;
    let totalOrders = 0;

    // Only superadmin can see revenue and total orders count
    if (isSuperAdmin) {
      const revenueResult = await Order.aggregate([
        { $match: { status: { $in: ['paid', 'fulfilled'] } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]);
      totalRevenue = revenueResult[0]?.total || 0;
      totalOrders = await Order.countDocuments();
    }

    // Total Products
    const totalProducts = await Product.countDocuments();

    // Recent 5 Orders
    const rawRecentOrders = await Order.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // Sanitize recent orders using persistent order.masked flag:
    // If order.masked is true, regular admin receives status as 'pending'.
    // Super Admin receives authentic status.
    const recentOrders = rawRecentOrders.map((order) => sanitizeOrderForRole(order, isSuperAdmin));

    return NextResponse.json({
      role,
      isSuperAdmin,
      metrics: {
        ...(isSuperAdmin ? { totalRevenue, totalOrders } : {}),
        totalProducts,
      },
      recentOrders,
    });
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
