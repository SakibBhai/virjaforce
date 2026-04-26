import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

interface UpdateTemplateBody {
  name?: string
  category?: string
  content?: string
  variables?: string
  isActive?: boolean
}

// PATCH - Update template
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existing = await db.messageTemplate.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Template not found' },
        { status: 404 }
      )
    }

    const body: UpdateTemplateBody = await request.json()

    // If name is being updated, check for duplicates
    if (body.name && body.name.trim() !== existing.name) {
      const duplicate = await db.messageTemplate.findUnique({
        where: { name: body.name.trim() },
      })
      if (duplicate) {
        return NextResponse.json(
          { success: false, error: 'A template with this name already exists' },
          { status: 409 }
        )
      }
    }

    const template = await db.messageTemplate.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name.trim() }),
        ...(body.category !== undefined && { category: body.category }),
        ...(body.content !== undefined && { content: body.content.trim() }),
        ...(body.variables !== undefined && { variables: body.variables }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
      },
    })

    return NextResponse.json({ success: true, template })
  } catch (error) {
    console.error('Error updating template:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update template' },
      { status: 500 }
    )
  }
}

// DELETE - Delete template (check if used by automations)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existing = await db.messageTemplate.findUnique({
      where: { id },
      include: {
        automations: true,
      },
    })

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Template not found' },
        { status: 404 }
      )
    }

    // Check if template is used by any automations
    if (existing.automations.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot delete template: it is used by ${existing.automations.length} automation(s). Please remove the automations first.`,
          automationCount: existing.automations.length,
        },
        { status: 409 }
      )
    }

    await db.messageTemplate.delete({ where: { id } })

    return NextResponse.json({
      success: true,
      message: 'Template deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting template:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete template' },
      { status: 500 }
    )
  }
}
