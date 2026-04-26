import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { Prisma } from '@prisma/client'

// Bangladesh phone format: 01XXXXXXXXX (11 digits starting with 01)
const BD_PHONE_REGEX = /^01[3-9]\d{8}$/

interface SendMessageBody {
  phones: string[]
  message: string
  templateName?: string
  scheduledAt?: string
  type?: 'manual' | 'scheduled' | 'automation'
  customerNames?: string[]
  orderIds?: string[]
}

// POST - Send WhatsApp messages
export async function POST(request: NextRequest) {
  try {
    const body: SendMessageBody = await request.json()
    const { phones, message, templateName, scheduledAt, type, customerNames, orderIds } = body

    // Validate phones
    if (!phones || !Array.isArray(phones) || phones.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one phone number is required' },
        { status: 400 }
      )
    }

    const invalidPhones = phones.filter(p => !BD_PHONE_REGEX.test(p))
    if (invalidPhones.length > 0) {
      return NextResponse.json(
        { success: false, error: `Invalid Bangladesh phone numbers: ${invalidPhones.join(', ')}` },
        { status: 400 }
      )
    }

    // Validate message
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Message content is required' },
        { status: 400 }
      )
    }

    // Validate scheduledAt if provided
    let scheduledDate: Date | null = null
    if (scheduledAt) {
      scheduledDate = new Date(scheduledAt)
      if (isNaN(scheduledDate.getTime())) {
        return NextResponse.json(
          { success: false, error: 'Invalid scheduled date format' },
          { status: 400 }
        )
      }
      if (scheduledDate <= new Date()) {
        return NextResponse.json(
          { success: false, error: 'Scheduled date must be in the future' },
          { status: 400 }
        )
      }
    }

    const messageType = type || (scheduledAt ? 'scheduled' : 'manual')
    const now = new Date()
    const createdMessages = []
    let sentCount = 0
    let scheduledCount = 0

    for (let i = 0; i < phones.length; i++) {
      const phone = phones[i]
      const customerName = customerNames?.[i] || ''
      const orderId = orderIds?.[i] || ''

      const messageData: Prisma.MessageCreateInput = {
        phone,
        customerName,
        message: message.trim(),
        templateName: templateName || '',
        type: messageType,
        orderId,
        status: scheduledDate ? 'pending' : 'sent',
        scheduledAt: scheduledDate || null,
        sentAt: scheduledDate ? null : now,
      }

      // If orderId is provided, link to order
      if (orderId) {
        const msg = await db.message.create({
          data: {
            phone,
            customerName,
            message: message.trim(),
            templateName: templateName || '',
            type: messageType,
            orderId,
            status: scheduledDate ? 'pending' : 'sent',
            scheduledAt: scheduledDate || null,
            sentAt: scheduledDate ? null : now,
            order: orderId ? { connect: { id: orderId } } : undefined,
          },
        })
        createdMessages.push(msg)
      } else {
        const msg = await db.message.create({ data: messageData })
        createdMessages.push(msg)
      }

      if (scheduledDate) {
        scheduledCount++
      } else {
        sentCount++
      }
    }

    return NextResponse.json({
      success: true,
      sent: sentCount,
      scheduled: scheduledCount,
      messages: createdMessages,
    })
  } catch (error) {
    console.error('Error sending messages:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to send messages' },
      { status: 500 }
    )
  }
}

// GET - List messages with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    const skip = (page - 1) * limit

    // Build where clause
    const where: Prisma.MessageWhereInput = {}

    if (status) {
      where.status = status
    }

    if (type) {
      where.type = type
    }

    if (search) {
      where.OR = [
        { phone: { contains: search } },
        { customerName: { contains: search } },
        { message: { contains: search } },
        { templateName: { contains: search } },
      ]
    }

    if (dateFrom || dateTo) {
      where.createdAt = {}
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom)
      }
      if (dateTo) {
        // Set to end of day
        const endDate = new Date(dateTo)
        endDate.setHours(23, 59, 59, 999)
        where.createdAt.lte = endDate
      }
    }

    const [messages, total] = await Promise.all([
      db.message.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.message.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      messages,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error listing messages:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to list messages' },
      { status: 500 }
    )
  }
}
