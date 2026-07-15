import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

interface CreateAutomationBody {
  name: string
  triggerType?: string
  triggerValue?: string
  templateId: string
  isActive?: boolean
  delayMinutes?: number
}

// POST - Create automation rule
export async function POST(request: NextRequest) {
  try {
    const body: CreateAutomationBody = await request.json()
    const { name, triggerType, triggerValue, templateId, isActive, delayMinutes } = body

    // Validate required fields
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Automation name is required' },
        { status: 400 }
      )
    }

    if (!templateId || typeof templateId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Template ID is required' },
        { status: 400 }
      )
    }

    // Validate that template exists
    const template = await db.messageTemplate.findUnique({
      where: { id: templateId },
    })

    if (!template) {
      return NextResponse.json(
        { success: false, error: 'Referenced template not found' },
        { status: 404 }
      )
    }

    const automation = await db.messageAutomation.create({
      data: {
        name: name.trim(),
        triggerType: triggerType || 'status_change',
        triggerValue: triggerValue || '',
        templateId,
        isActive: isActive !== undefined ? isActive : true,
        delayMinutes: delayMinutes || 0,
      },
      include: {
        template: true,
      },
    })

    return NextResponse.json({ success: true, automation }, { status: 201 })
  } catch (error) {
    console.error('Error creating automation:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create automation' },
      { status: 500 }
    )
  }
}

// GET - List automations with template info
export async function GET() {
  try {
    const automations = await db.messageAutomation.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        template: true,
      },
    })

    return NextResponse.json({ success: true, automations })
  } catch (error) {
    console.error('Error listing automations:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to list automations' },
      { status: 500 }
    )
  }
}
