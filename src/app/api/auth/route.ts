import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { gptAdmins } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { verifyPassword, generateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json(
                { error: '邮箱和密码都是必填的' },
                { status: 400 }
            );
        }

        // Find admin by email
        const admins = await db.select().from(gptAdmins).where(eq(gptAdmins.email, email));

        if (admins.length === 0) {
            return NextResponse.json(
                { error: '邮箱或密码错误' },
                { status: 401 }
            );
        }

        const admin = admins[0];

        // Verify password
        const isValid = await verifyPassword(password, admin.passwordHash);

        if (!isValid) {
            return NextResponse.json(
                { error: '邮箱或密码错误' },
                { status: 401 }
            );
        }

        // Generate JWT token
        const token = generateToken({ id: admin.id, email: admin.email });

        return NextResponse.json({
            success: true,
            token,
            admin: {
                id: admin.id,
                email: admin.email,
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: '登录失败，请稍后重试' },
            { status: 500 }
        );
    }
}
