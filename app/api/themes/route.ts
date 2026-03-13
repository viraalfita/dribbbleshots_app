import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { themeLibrary } from '@/lib/db/schema';

export async function GET() {
    try {
        const themes = await db.select().from(themeLibrary);
        return NextResponse.json({ success: true, themes });
    } catch (error) {
        console.error('Error fetching themes:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
