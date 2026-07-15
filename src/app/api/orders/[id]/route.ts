import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

const VALID_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { success: false, error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` },
        { status: 400 }
      );
    }

    const existingOrder = await db.order.findUnique({ where: { id } });
    if (!existingOrder) {
      return NextResponse.json(
        { success: false, error: 'অর্ডার পাওয়া যায়নি।' },
        { status: 404 }
      );
    }

    const order = await db.order.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error('Order update error:', error);
    return NextResponse.json(
      { success: false, error: 'অর্ডার আপডেট করতে সমস্যা হয়েছে।' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existingOrder = await db.order.findUnique({ where: { id } });
    if (!existingOrder) {
      return NextResponse.json(
        { success: false, error: 'অর্ডার পাওয়া যায়নি।' },
        { status: 404 }
      );
    }

    await db.order.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'অর্ডার মুছে ফেলা হয়েছে।' });
  } catch (error) {
    console.error('Order delete error:', error);
    return NextResponse.json(
      { success: false, error: 'অর্ডার মুছতে সমস্যা হয়েছে।' },
      { status: 500 }
    );
  }
}
