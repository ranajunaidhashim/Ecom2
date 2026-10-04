import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Discount from '@/models/Discount';

export async function PATCH(req, { params }) {
  try {
    const { id } = await params;
    await dbConnect();
    const body = await req.json();

    const discount = await Discount.findByIdAndUpdate(
      id,
      { isActive: body.isActive },
      { new: true }
    );
    
    if (!discount) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, discount });
  } catch (error) {
    console.error('Failed to update discount:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = await params;
    await dbConnect();
    const discount = await Discount.findByIdAndDelete(id);
    if (!discount) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete discount:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
