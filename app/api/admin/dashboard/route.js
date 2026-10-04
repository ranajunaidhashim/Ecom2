import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';

export async function GET() {
  try {
    await dbConnect();
    
    // Total Revenue (only paid or fulfilled orders)
    const revenueResult = await Order.aggregate([
      { $match: { status: { $in: ['paid', 'fulfilled'] } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    // Total Orders
    const totalOrders = await Order.countDocuments();

    // Total Products
    const totalProducts = await Product.countDocuments();

    // Recent 5 Orders
    const recentOrders = await Order.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    return NextResponse.json({
      metrics: {
        totalRevenue,
        totalOrders,
        totalProducts,
      },
      recentOrders,
    });
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
