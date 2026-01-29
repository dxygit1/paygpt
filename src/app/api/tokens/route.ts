import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { gptTokens } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';
import { verifyToken } from '@/lib/auth';

// POST - Public submission (no auth required)
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { accountName, sessionData } = body;

        if (!accountName || !sessionData) {
            return NextResponse.json(
                { error: '账号名称和 Session 数据都是必填的' },
                { status: 400 }
            );
        }

        // Try to extract accessToken from session data
        let accessToken = null;
        try {
            const parsed = JSON.parse(sessionData);
            accessToken = parsed.accessToken || null;
        } catch {
            // sessionData might not be valid JSON, that's okay
        }

        const result = await db.insert(gptTokens).values({
            accountName,
            sessionData, // Store exactly as received
            accessToken,
        }).returning();

        return NextResponse.json({
            success: true,
            message: '提交成功！',
            id: result[0].id
        });
    } catch (error) {
        console.error('Token submission error:', error);
        return NextResponse.json(
            { error: '提交失败，请稍后重试' },
            { status: 500 }
        );
    }
}

// GET - Admin only, list all tokens
export async function GET(request: NextRequest) {
    try {
        // Check authorization
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: '未授权' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        const payload = verifyToken(token);

        if (!payload) {
            return NextResponse.json({ error: 'Token 无效或已过期' }, { status: 401 });
        }

        const tokens = await db.select().from(gptTokens).orderBy(desc(gptTokens.createdAt));

        return NextResponse.json({ tokens });
    } catch (error) {
        console.error('Get tokens error:', error);
        return NextResponse.json(
            { error: '获取数据失败' },
            { status: 500 }
        );
    }
}

// DELETE - Admin only, delete a token
export async function DELETE(request: NextRequest) {
    try {
        // Check authorization
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: '未授权' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        const payload = verifyToken(token);

        if (!payload) {
            return NextResponse.json({ error: 'Token 无效或已过期' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: '缺少 ID 参数' }, { status: 400 });
        }

        await db.delete(gptTokens).where(eq(gptTokens.id, parseInt(id)));

        return NextResponse.json({ success: true, message: '删除成功' });
    } catch (error) {
        console.error('Delete token error:', error);
        return NextResponse.json(
            { error: '删除失败' },
            { status: 500 }
        );
    }
}
