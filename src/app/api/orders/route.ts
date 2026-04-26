import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, phone, address, division, notes, quantity } = body;

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

    const qty = Math.max(1, Math.min(10, parseInt(String(quantity)) || 1));
    const unitPrice = 1799;
    const totalAmount = unitPrice * qty;

    const order = await db.order.create({
      data: {
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
        division: division.trim(),
        notes: notes?.trim() || '',
        quantity: qty,
        amount: totalAmount,
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
        amount: order.amount,
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '50')));

    const where: Record<string, unknown> = {};

    if (status && status !== 'all') {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { phone: { contains: search } },
        { id: { contains: search } },
      ];
    }

    const [orders, total, statusCounts] = await Promise.all([
      db.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.order.count({ where }),
      db.order.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
    ]);

    const revenue = await db.order.aggregate({
      _sum: { amount: true },
      where: status && status !== 'all' ? { status } : undefined,
    });

    return NextResponse.json({
      success: true,
      orders,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      statusCounts: statusCounts.reduce<Record<string, number>>((acc, item) => {
        acc[item.status] = item._count.status;
        return acc;
      }, {}),
      totalRevenue: revenue._sum.amount || 0,
    });
  } catch (error) {
    console.error('Order fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
