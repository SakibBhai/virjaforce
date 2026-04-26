import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

interface UpdateAutomationBody {
  name?: string
  triggerType?: string
  triggerValue?: string
  templateId?: string
  isActive?: boolean
  delayMinutes?: number
}

// PATCH - Toggle/update automation
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existing = await db.messageAutomation.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Automation not found' },
        { status: 404 }
      )
    }

    const body: UpdateAutomationBody = await request.json()

    // If templateId is being updated, validate it exists
    if (body.templateId && body.templateId !== existing.templateId) {
      const template = await db.messageTemplate.findUnique({
        where: { id: body.templateId },
      })
      if (!template) {
        return NextResponse.json(
          { success: false, error: 'Referenced template not found' },
          { status: 404 }
        )
      }
    }

    const automation = await db.messageAutomation.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name.trim() }),
        ...(body.triggerType !== undefined && { triggerType: body.triggerType }),
        ...(body.triggerValue !== undefined && { triggerValue: body.triggerValue }),
        ...(body.templateId !== undefined && { templateId: body.templateId }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
        ...(body.delayMinutes !== undefined && { delayMinutes: body.delayMinutes }),
      },
      include: {
        template: true,
      },
    })

    return NextResponse.json({ success: true, automation })
  } catch (error) {
    console.error('Error updating automation:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update automation' },
      { status: 500 }
    )
  }
}

// DELETE - Delete automation
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existing = await db.messageAutomation.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Automation not found' },
        { status: 404 }
      )
    }

    await db.messageAutomation.delete({ where: { id } })

    return NextResponse.json({
      success: true,
      message: 'Automation deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting automation:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete automation' },
      { status: 500 }
    )
  }
}
