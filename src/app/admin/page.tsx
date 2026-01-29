'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [checking, setChecking] = useState(true);
    const [error, setError] = useState('');
    const router = useRouter();

    // Check if already logged in
    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (token) {
            router.push('/admin/dashboard');
        } else {
            setChecking(false);
        }
    }, [router]);

    // Show loading while checking auth status
    if (checking) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
                <div className="spinner" style={{ width: '40px', height: '40px', borderWidth: '3px', borderTopColor: 'var(--primary)' }}></div>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !password) {
            setError('请输入邮箱和密码');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('adminToken', data.token);
                localStorage.setItem('adminEmail', data.admin.email);
                router.push('/admin/dashboard');
            } else {
                setError(data.error || '登录失败');
            }
        } catch {
            setError('网络错误，请稍后重试');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <header className="header">
                <a href="/" className="logo" style={{ textDecoration: 'none' }}>
                    <div className="logo-icon">🔑</div>
                    <span>GPT<span style={{ color: 'var(--primary)' }}>Token</span></span>
                </a>
                <span className="badge badge-primary">管理后台</span>
            </header>

            <main className="page-container" style={{ maxWidth: '440px' }}>
                <div className="title-section">
                    <h1>管理员登录</h1>
                    <p>请使用管理员账号登录</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="card">
                        <div className="input-group">
                            <label className="input-label">📧 邮箱</label>
                            <input
                                type="email"
                                className="input-field"
                                placeholder="请输入管理员邮箱"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                autoComplete="email"
                            />
                        </div>

                        <div className="input-group">
                            <label className="input-label">🔒 密码</label>
                            <input
                                type="password"
                                className="input-field"
                                placeholder="请输入密码"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete="current-password"
                            />
                        </div>

                        {error && (
                            <div className="alert alert-error" style={{ marginBottom: '20px' }}>
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                            style={{ width: '100%', padding: '16px' }}
                        >
                            {loading ? (
                                <>
                                    <div className="spinner"></div>
                                    登录中...
                                </>
                            ) : (
                                '登 录'
                            )}
                        </button>
                    </div>
                </form>

                <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px', color: 'var(--text-muted)' }}>
                    暂不开放注册，如需账号请联系管理员
                </p>
            </main>
        </>
    );
}
