import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { gptAdmins } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { verifyToken, hashPassword } from '@/lib/auth';

// GET - List all admins (admin only)
export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: '未授权' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        const payload = verifyToken(token);

        if (!payload) {
            return NextResponse.json({ error: 'Token 无效或已过期' }, { status: 401 });
        }

        const admins = await db.select({
            id: gptAdmins.id,
            email: gptAdmins.email,
            createdAt: gptAdmins.createdAt,
        }).from(gptAdmins);

        return NextResponse.json({ admins });
    } catch (error) {
        console.error('Get admins error:', error);
        return NextResponse.json({ error: '获取数据失败' }, { status: 500 });
    }
}

// POST - Create new admin (admin only)
export async function POST(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: '未授权' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        const payload = verifyToken(token);

        if (!payload) {
            return NextResponse.json({ error: 'Token 无效或已过期' }, { status: 401 });
        }

        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json({ error: '邮箱和密码都是必填的' }, { status: 400 });
        }

        // Check if email already exists
        const existing = await db.select().from(gptAdmins).where(eq(gptAdmins.email, email));
        if (existing.length > 0) {
            return NextResponse.json({ error: '该邮箱已存在' }, { status: 400 });
        }

        const passwordHash = await hashPassword(password);

        const result = await db.insert(gptAdmins).values({
            email,
            passwordHash,
        }).returning();

        return NextResponse.json({
            success: true,
            admin: { id: result[0].id, email: result[0].email }
        });
    } catch (error) {
        console.error('Create admin error:', error);
        return NextResponse.json({ error: '创建失败' }, { status: 500 });
    }
}

// DELETE - Delete admin (admin only)
export async function DELETE(request: NextRequest) {
    try {
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

        // Prevent self-deletion
        if (parseInt(id) === payload.id) {
            return NextResponse.json({ error: '不能删除自己的账号' }, { status: 400 });
        }

        await db.delete(gptAdmins).where(eq(gptAdmins.id, parseInt(id)));

        return NextResponse.json({ success: true, message: '删除成功' });
    } catch (error) {
        console.error('Delete admin error:', error);
        return NextResponse.json({ error: '删除失败' }, { status: 500 });
    }
}
