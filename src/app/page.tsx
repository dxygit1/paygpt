'use client';

import { useState } from 'react';

export default function Home() {
  const [accountName, setAccountName] = useState('');
  const [sessionData, setSessionData] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!accountName.trim()) {
      setMessage({ type: 'error', text: '请输入账号名称' });
      return;
    }

    if (!sessionData.trim()) {
      setMessage({ type: 'error', text: '请粘贴 Session JSON 数据' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountName, sessionData }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: '🎉 提交成功！您的 Token 已保存。' });
        setAccountName('');
        setSessionData('');
      } else {
        setMessage({ type: 'error', text: data.error || '提交失败' });
      }
    } catch {
      setMessage({ type: 'error', text: '网络错误，请稍后重试' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <header className="header">
        <div className="logo">
          <div className="logo-icon">🔑</div>
          <span>GPT<span style={{ color: 'var(--primary)' }}>Token</span></span>
        </div>
        <a href="/admin" className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '14px' }}>
          🔐 管理员入口
        </a>
      </header>

      <main className="page-container">
        <div className="title-section">
          <span className="badge badge-primary">🛡️ 安全提交</span>
          <h1 style={{ marginTop: '16px' }}>提交 ChatGPT Token</h1>
          <p>请按照以下步骤获取并提交您的 ChatGPT 访问 Token</p>
        </div>

        <div className="card" style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <span style={{ fontSize: '24px' }}>🔐</span>
            <h3 style={{ fontSize: '18px', fontWeight: '600' }}>如何获取 Token?</h3>
          </div>

          <div className="step-list">
            <div className="step-item">
              <div className="step-indicator">1</div>
              <div className="step-content">
                <div className="step-text">确保已登录 <strong>ChatGPT 官网</strong></div>
              </div>
            </div>

            <div className="step-item">
              <div className="step-indicator">2</div>
              <div className="step-content">
                <div className="step-text">新标签页打开以下地址：</div>
                <a
                  href="https://chatgpt.com/api/auth/session"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="step-url"
                >
                  https://chatgpt.com/api/auth/session
                </a>
              </div>
            </div>

            <div className="step-item">
              <div className="step-indicator">3</div>
              <div className="step-content">
                <div className="step-text">
                  复制页面上<strong style={{ color: 'var(--primary)' }}>全部 JSON 数据</strong>：
                </div>
                <div style={{ marginTop: '8px' }}>
                  <span className="kbd">Ctrl+A</span>
                  <span style={{ margin: '0 6px', color: 'var(--text-muted)' }}>全选 →</span>
                  <span className="kbd">Ctrl+C</span>
                  <span style={{ margin: '0 6px', color: 'var(--text-muted)' }}>复制</span>
                  <span style={{ color: 'var(--warning)', fontSize: '13px' }}>(Mac 用 ⌘)</span>
                </div>
              </div>
            </div>

            <div className="step-item">
              <div className="step-indicator">4</div>
              <div className="step-content">
                <div className="step-text">
                  粘贴到下方输入框 <span className="kbd">Ctrl+V</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="card">
            <div className="input-group">
              <label className="input-label">
                👤 您的账号名称
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="请输入您的账号名称（用于识别）"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label className="input-label">
                📋 Session JSON 数据
              </label>
              <textarea
                className="input-field"
                placeholder='粘贴完整 JSON 数据（包含 accessToken、user 等字段）'
                rows={6}
                value={sessionData}
                onChange={(e) => setSessionData(e.target.value)}
              />
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '8px' }}>
                💡 Token 仅用于本次充值，<strong style={{ color: 'var(--danger)' }}>充值成功后会自动删除</strong>，保障您的账号安全
              </p>
            </div>

            {message && (
              <div className={`alert alert-${message.type}`} style={{ marginBottom: '20px' }}>
                {message.text}
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
                  提交中...
                </>
              ) : (
                <>
                  ✓ 提交 Token
                </>
              )}
            </button>
          </div>
        </form>

        <div className="alert alert-warning" style={{ marginTop: '24px' }}>
          <span style={{ fontSize: '20px' }}>⚠️</span>
          <div>
            <strong>重要提醒</strong>
            <p style={{ marginTop: '4px', fontSize: '13px' }}>
              请务必确认您的 ChatGPT Plus 订阅已经到期或从未充值过，否则无法进行充值。
              如果您的订阅仍在有效期内，请等待到期后再购买。
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
