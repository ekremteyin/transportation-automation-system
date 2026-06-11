import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login as loginApi } from '../../api/authApi';
import { useAuth } from '../../context/AuthContext';

const inputStyle = {
  width: '100%',
  padding: '9px 12px',
  fontSize: 14,
  border: '1px solid #e5e7eb',
  borderRadius: 6,
  outline: 'none',
  boxSizing: 'border-box',
  color: '#111827',
  transition: 'border-color 0.15s',
};

const labelStyle = {
  display: 'block',
  fontSize: 13,
  fontWeight: 500,
  color: '#374151',
  marginBottom: 5,
};

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = e =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await loginApi(form);
      login(
        { userId: data.userId, fullName: data.fullName, role: data.role },
        data.token
      );
      if (data.role === 'Sender') navigate('/sender');
      else if (data.role === 'Carrier') navigate('/carrier');
      else navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.error ?? 'Giriş yapılamadı.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0f172a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        width: 380,
        background: '#ffffff',
        borderRadius: 12,
        border: '1px solid #e5e7eb',
        padding: '36px 40px',
      }}>
        {/* Başlık */}
        <h1 style={{ fontSize: 20, fontWeight: 500, color: '#111827', margin: 0 }}>
          Giriş yap
        </h1>
        <p style={{ fontSize: 13, color: '#6b7280', marginTop: 6, marginBottom: 24 }}>
          Hesabınıza erişmek için bilgilerinizi girin
        </p>

        {/* Hata */}
        {error && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#b91c1c',
            fontSize: 13,
            borderRadius: 6,
            padding: '10px 12px',
            marginBottom: 16,
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={labelStyle}>E-posta</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="ornek@email.com"
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = '#6366f1'}
              onBlur={e => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>

          <div>
            <label style={labelStyle}>Şifre</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              placeholder="••••••••"
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = '#6366f1'}
              onBlur={e => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '10px 0',
              marginTop: 8,
              background: loading ? '#a5b4fc' : '#6366f1',
              color: '#ffffff',
              fontSize: 14,
              fontWeight: 500,
              border: 'none',
              borderRadius: 6,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => { if (!loading) e.target.style.background = '#4f46e5'; }}
            onMouseLeave={e => { if (!loading) e.target.style.background = '#6366f1'; }}
          >
            {loading ? 'Giriş yapılıyor...' : 'Giriş yap'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 13, color: '#6b7280', marginTop: 20, marginBottom: 0 }}>
          Hesabın yok mu?{' '}
          <Link to="/register" style={{ color: '#6366f1', textDecoration: 'none', fontWeight: 500 }}>
            Kayıt Ol
          </Link>
        </p>
      </div>
    </div>
  );
}
