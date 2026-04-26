import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'orderCount'; // orderCount, totalSpent, lastOrder
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Get all orders grouped by phone
    const allOrders = await db.order.findMany({
      orderBy: { createdAt: 'desc' },
    });

    // Group by phone number
    const customerMap = new Map<
      string,
      {
        phone: string;
        name: string;
        division: string;
        address: string;
        orderCount: number;
        totalSpent: number;
        totalQty: number;
        lastOrderDate: string;
        firstOrderDate: string;
        statuses: Record<string, number>;
        orders: {
          id: string;
          status: string;
          quantity: number;
          amount: number;
          createdAt: string;
        }[];
      }
    >();

    for (const order of allOrders) {
      const existing = customerMap.get(order.phone);

      if (existing) {
        existing.orderCount++;
        existing.totalSpent += order.amount;
        existing.totalQty += order.quantity;
        existing.statuses[order.status] = (existing.statuses[order.status] || 0) + 1;
        existing.orders.push({
          id: order.id,
          status: order.status,
          quantity: order.quantity,
          amount: order.amount,
          createdAt: order.createdAt.toISOString(),
        });
        // lastOrderDate is already the latest since we ordered by desc
        // firstOrderDate stays the same
      } else {
        customerMap.set(order.phone, {
          phone: order.phone,
          name: order.name,
          division: order.division,
          address: order.address,
          orderCount: 1,
          totalSpent: order.amount,
          totalQty: order.quantity,
          lastOrderDate: order.createdAt.toISOString(),
          firstOrderDate: order.createdAt.toISOString(),
          statuses: { [order.status]: 1 },
          orders: [
            {
              id: order.id,
              status: order.status,
              quantity: order.quantity,
              amount: order.amount,
              createdAt: order.createdAt.toISOString(),
            },
          ],
        });
      }
    }

    // Convert to array
    let customers = Array.from(customerMap.values());

    // Update firstOrderDate (it should be the earliest)
    for (const customer of customers) {
      if (customer.orders.length > 0) {
        const dates = customer.orders.map((o) => new Date(o.createdAt).getTime());
        customer.firstOrderDate = new Date(Math.min(...dates)).toISOString();
        customer.lastOrderDate = new Date(Math.max(...dates)).toISOString();
      }
    }

    // Filter by search
    if (search) {
      const q = search.toLowerCase();
      customers = customers.filter(
        (c) =>
          c.phone.includes(q) ||
          c.name.toLowerCase().includes(q) ||
          c.division.toLowerCase().includes(q)
      );
    }

    // Sort
    customers.sort((a, b) => {
      const dir = sortOrder === 'desc' ? -1 : 1;
      switch (sortBy) {
        case 'totalSpent':
          return (a.totalSpent - b.totalSpent) * dir;
        case 'lastOrder':
          return (new Date(a.lastOrderDate).getTime() - new Date(b.lastOrderDate).getTime()) * dir;
        case 'orderCount':
        default:
          return (a.orderCount - b.orderCount) * dir;
      }
    });

    // Summary stats
    const totalCustomers = customers.length;
    const repeatCustomers = customers.filter((c) => c.orderCount > 1).length;
    const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);
    const avgOrderPerCustomer = totalCustomers > 0 ? (customers.reduce((s, c) => s + c.orderCount, 0) / totalCustomers).toFixed(1) : '0';

    return NextResponse.json({
      success: true,
      customers,
      summary: {
        totalCustomers,
        repeatCustomers,
        totalRevenue,
        avgOrderPerCustomer,
      },
    });
  } catch (error) {
    console.error('Customer analytics error:', error);
    return NextResponse.json(
      { success: false, error: 'গ্রাহক তথ্য আনতে সমস্যা হয়েছে।' },
      { status: 500 }
    );
  }
}
