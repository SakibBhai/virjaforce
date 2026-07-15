import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, age, city, text, stars, weeks, youtubeUrl, isVideo, isFeatured } = body;

    const errors: Record<string, string> = {};
    if (!name?.trim()) errors.name = 'নাম লিখুন';
    if (!text?.trim()) errors.text = 'রিভিউ লিখুন';
    if (!city?.trim()) errors.city = 'শহর লিখুন';

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ success: false, errors }, { status: 400 });
    }

    const review = await db.review.create({
      data: {
        name: name.trim(),
        age: age || 0,
        city: city.trim(),
        text: text.trim(),
        stars: stars || 5,
        weeks: weeks || 0,
        youtubeUrl: youtubeUrl?.trim() || '',
        isVideo: isVideo || false,
        isFeatured: isFeatured || false,
      },
    });

    return NextResponse.json({ success: true, review });
  } catch (error) {
    console.error('Review creation error:', error);
    return NextResponse.json(
      { success: false, errors: { general: 'রিভিউ তৈরি করতে সমস্যা হয়েছে।' } },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const reviews = await db.review.findMany({
      orderBy: [
        { isFeatured: 'desc' },
        { createdAt: 'desc' },
      ],
      take: 20,
    });

    return NextResponse.json({ success: true, reviews });
  } catch (error) {
    console.error('Review fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}
