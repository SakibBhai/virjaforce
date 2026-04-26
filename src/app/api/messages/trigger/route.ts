import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

interface TriggerBody {
  orderId: string
  newStatus: string
}

// POST - Trigger automation check when order status changes
export async function POST(request: NextRequest) {
  try {
    const body: TriggerBody = await request.json()
    const { orderId, newStatus } = body

    // Validate required fields
    if (!orderId || typeof orderId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Order ID is required' },
        { status: 400 }
      )
    }

    if (!newStatus || typeof newStatus !== 'string') {
      return NextResponse.json(
        { success: false, error: 'New status is required' },
        { status: 400 }
      )
    }

    // Find the order
    const order = await db.order.findUnique({
      where: { id: orderId },
    })

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      )
    }

    // Find matching automations for this trigger
    const automations = await db.messageAutomation.findMany({
      where: {
        isActive: true,
        triggerType: 'status_change',
        triggerValue: newStatus,
      },
      include: {
        template: true,
      },
    })

    if (automations.length === 0) {
      return NextResponse.json({
        success: true,
        messagesSent: 0,
        message: 'No matching automations found for this status change',
      })
    }

    const createdMessages = []
    let messagesSent = 0

    for (const automation of automations) {
      // Build message content from template
      let messageContent = automation.template.content

      // Replace template variables
      messageContent = messageContent.replace(/\{name\}/g, order.name)
      messageContent = messageContent.replace(/\{phone\}/g, order.phone)
      messageContent = messageContent.replace(/\{order_id\}/g, order.id)
      messageContent = messageContent.replace(/\{status\}/g, newStatus)
      messageContent = messageContent.replace(/\{amount\}/g, String(order.amount))
      messageContent = messageContent.replace(/\{address\}/g, order.address)
      messageContent = messageContent.replace(/\{division\}/g, order.division)

      const now = new Date()
      const scheduledAt = automation.delayMinutes > 0
        ? new Date(now.getTime() + automation.delayMinutes * 60 * 1000)
        : null

      const msg = await db.message.create({
        data: {
          phone: order.phone,
          customerName: order.name,
          message: messageContent,
          templateName: automation.template.name,
          type: 'automation',
          orderId: order.id,
          status: scheduledAt ? 'pending' : 'sent',
          scheduledAt,
          sentAt: scheduledAt ? null : now,
        },
      })

      createdMessages.push(msg)

      if (!scheduledAt) {
        messagesSent++
      }
    }

    return NextResponse.json({
      success: true,
      messagesSent,
      scheduled: createdMessages.length - messagesSent,
      automationCount: automations.length,
      messages: createdMessages,
    })
  } catch (error) {
    console.error('Error triggering automation:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to trigger automation' },
      { status: 500 }
    )
  }
}
