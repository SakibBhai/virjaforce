import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, phone, address, division, notes } = body;

    // Validation
    const errors: Record<string, string> = {};
    if (!name?.trim()) errors.name = 'নাম লিখুন';
    if (!phone?.trim()) errors.phone = 'ফোন নম্বর লিখুন';
    else if (!/^01[3-9]\d{8}$/.test(phone.trim()))
      errors.phone = 'সঠিক বাংলাদেশি নম্বর লিখুন (01XXXXXXXXX)';
    if (!address?.trim()) errors.address = 'ঠিকানা লিখুন';
    if (!division?.trim()) errors.division = 'বিভাগ নির্বাচন করুন';

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ success: false, errors }, { status: 400 });
    }

    const order = await db.order.create({
      data: {
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
        division: division.trim(),
        notes: notes?.trim() || '',
        amount: 1799,
        status: 'pending',
      },
    });

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        name: order.name,
        phone: order.phone,
        status: order.status,
        createdAt: order.createdAt,
      },
    });
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { success: false, errors: { general: 'অর্ডার তৈরি করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।' } },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const orders = await db.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const count = await db.order.count();

    return NextResponse.json({
      success: true,
      orders,
      total: count,
    });
  } catch (error) {
    console.error('Order fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
