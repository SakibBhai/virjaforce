import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { Prisma } from '@prisma/client'

// GET - Return unique customers from orders for phone selection
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const division = searchParams.get('division')

    // Build where clause for order filtering
    const where: Prisma.OrderWhereInput = {}
    if (search) {
      where.OR = [
        { phone: { contains: search } },
        { name: { contains: search } },
      ]
    }
    if (division) {
      where.division = division
    }

    // Aggregate unique customers from orders
    const customers = await db.order.groupBy({
      by: ['phone'],
      where,
      _count: {
        id: true,
      },
      _max: {
        createdAt: true,
      },
      _sum: {
        amount: true,
      },
      orderBy: {
        _max: {
          createdAt: 'desc',
        },
      },
    })

    // For each customer, get their latest name and division
    const enrichedCustomers = await Promise.all(
      customers.map(async (customer) => {
        const latestOrder = await db.order.findFirst({
          where: { phone: customer.phone },
          orderBy: { createdAt: 'desc' },
          select: {
            name: true,
            division: true,
          },
        })

        return {
          phone: customer.phone,
          name: latestOrder?.name || '',
          orderCount: customer._count.id,
          lastOrderDate: customer._max.createdAt,
          totalSpent: customer._sum.amount || 0,
          division: latestOrder?.division || '',
        }
      })
    )

    // Get all unique divisions
    const divisions = await db.order.groupBy({
      by: ['division'],
      _count: true,
      orderBy: { _count: { phone: 'desc' } },
    })

    return NextResponse.json({
      success: true,
      customers: enrichedCustomers,
      divisions: divisions.map(d => d.division),
    })
  } catch (error) {
    console.error('Error fetching customers:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch customers' },
      { status: 500 }
    )
  }
}
