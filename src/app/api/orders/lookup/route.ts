import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone')?.trim();

    if (!phone) {
      return NextResponse.json(
        { success: false, error: 'ফোন নম্বর দিন।' },
        { status: 400 }
      );
    }

    const orders = await db.order.findMany({
      where: { phone },
      orderBy: { createdAt: 'desc' },
    });

    const totalSpent = orders.reduce((sum, o) => sum + o.amount, 0);
    const totalQty = orders.reduce((sum, o) => sum + o.quantity, 0);

    return NextResponse.json({
      success: true,
      orders,
      count: orders.length,
      totalSpent,
      totalQty,
      customer: orders.length > 0 ? {
        name: orders[0].name,
        phone: orders[0].phone,
        division: orders[0].division,
        firstOrderDate: orders[orders.length - 1].createdAt,
        lastOrderDate: orders[0].createdAt,
      } : null,
    });
  } catch (error) {
    console.error('Order lookup error:', error);
    return NextResponse.json(
      { success: false, error: 'অর্ডার খুঁজতে সমস্যা হয়েছে।' },
      { status: 500 }
    );
  }
}
