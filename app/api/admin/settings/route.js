import { NextResponse } from 'next/server';
import { getAdminRole } from '@/lib/admin-auth';
import { isMaskPaidOrdersActive, setSetting, SETTING_KEYS } from '@/lib/settings';

export async function GET() {
  try {
    const role = await getAdminRole();
    if (role !== 'superadmin') {
      return NextResponse.json(
        { error: 'Forbidden. Super Admin access required.' },
        { status: 403 }
      );
    }

    const maskPaidOrders = await isMaskPaidOrdersActive();
    return NextResponse.json({
      success: true,
      maskPaidOrders,
    });
  } catch (error) {
    console.error('[API Settings GET] Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const role = await getAdminRole();
    if (role !== 'superadmin') {
      return NextResponse.json(
        { error: 'Forbidden. Super Admin access required.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const enabled = Boolean(body.maskPaidOrders);

    await setSetting(
      SETTING_KEYS.MASK_PAID_ORDERS,
      enabled,
      'When enabled, new orders placed will be marked with masked: true'
    );

    return NextResponse.json({
      success: true,
      maskPaidOrders: enabled,
    });
  } catch (error) {
    console.error('[API Settings POST] Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
