import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { Prisma } from '@prisma/client'

interface CreateTemplateBody {
  name: string
  category?: string
  content: string
  variables?: string
  isActive?: boolean
}

// POST - Create template
export async function POST(request: NextRequest) {
  try {
    const body: CreateTemplateBody = await request.json()
    const { name, category, content, variables, isActive } = body

    // Validate required fields
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Template name is required' },
        { status: 400 }
      )
    }

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Template content is required' },
        { status: 400 }
      )
    }

    // Check for duplicate name
    const existing = await db.messageTemplate.findUnique({
      where: { name: name.trim() },
    })

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'A template with this name already exists' },
        { status: 409 }
      )
    }

    const template = await db.messageTemplate.create({
      data: {
        name: name.trim(),
        category: category || 'general',
        content: content.trim(),
        variables: variables || '',
        isActive: isActive !== undefined ? isActive : true,
      },
    })

    return NextResponse.json({ success: true, template }, { status: 201 })
  } catch (error) {
    console.error('Error creating template:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create template' },
      { status: 500 }
    )
  }
}

// GET - List templates
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    const where: Prisma.MessageTemplateWhereInput = {}
    if (category) {
      where.category = category
    }

    const templates = await db.messageTemplate.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { automations: true },
        },
      },
    })

    return NextResponse.json({ success: true, templates })
  } catch (error) {
    console.error('Error listing templates:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to list templates' },
      { status: 500 }
    )
  }
}
