import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register as registerApi } from '../../api/authApi';
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

function Field({ label, children }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

function Input({ onFocus, onBlur, ...props }) {
  return (
    <input
      style={inputStyle}
      onFocus={e => e.target.style.borderColor = '#6366f1'}
      onBlur={e => e.target.style.borderColor = '#e5e7eb'}
      {...props}
    />
  );
}

function Select({ ...props }) {
  return (
    <select
      style={{ ...inputStyle, background: '#fff' }}
      onFocus={e => e.target.style.borderColor = '#6366f1'}
      onBlur={e => e.target.style.borderColor = '#e5e7eb'}
      {...props}
    />
  );
}

export default function RegisterPage() {
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '',
    password: '', phone: '', role: 'Sender',
    vehicleType: '', city: '',
  });
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
      const payload = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
        phone: form.phone || null,
        role: form.role === 'Sender' ? 0 : 1,
        vehicleType: form.role === 'Carrier' ? form.vehicleType : null,
        city: form.role === 'Carrier' ? form.city : null,
      };
      const { data } = await registerApi(payload);
      login(
        { userId: data.userId, fullName: data.fullName, role: data.role },
        data.token
      );
      if (data.role === 'Sender') navigate('/sender');
      else navigate('/carrier');
    } catch (err) {
      setError(err.response?.data?.error ?? 'Kayıt yapılamadı.');
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
      padding: '32px 16px',
    }}>
      <div style={{
        width: 420,
        background: '#ffffff',
        borderRadius: 12,
        border: '1px solid #e5e7eb',
        padding: '36px 40px',
      }}>
        {/* Başlık */}
        <h1 style={{ fontSize: 20, fontWeight: 500, color: '#111827', margin: 0 }}>
          Hesap oluştur
        </h1>
        <p style={{ fontSize: 13, color: '#6b7280', marginTop: 6, marginBottom: 24 }}>
          Platforma katılmak için bilgilerinizi girin
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
          {/* Ad / Soyad */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Ad">
              <Input type="text" name="firstName" value={form.firstName} onChange={handleChange} required />
            </Field>
            <Field label="Soyad">
              <Input type="text" name="lastName" value={form.lastName} onChange={handleChange} required />
            </Field>
          </div>

          <Field label="E-posta">
            <Input type="email" name="email" value={form.email} onChange={handleChange} required placeholder="ornek@email.com" />
          </Field>

          <Field label="Şifre">
            <Input type="password" name="password" value={form.password} onChange={handleChange} required minLength={6} placeholder="••••••••" />
          </Field>

          <Field label="Telefon (opsiyonel)">
            <Input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="05XX XXX XX XX" />
          </Field>

          <Field label="Hesap Türü">
            <Select name="role" value={form.role} onChange={handleChange}>
              <option value="Sender">Gönderici</option>
              <option value="Carrier">Taşıyıcı</option>
            </Select>
          </Field>

          {form.role === 'Carrier' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Araç Tipi">
                <Select name="vehicleType" value={form.vehicleType} onChange={handleChange} required>
                  <option value="">Seçin</option>
                  <option value="Kamyonet">Kamyonet</option>
                  <option value="Kamyon">Kamyon</option>
                  <option value="TIR">TIR</option>
                </Select>
              </Field>
              <Field label="Şehir">
                <Input type="text" name="city" value={form.city} onChange={handleChange} required placeholder="İstanbul" />
              </Field>
            </div>
          )}

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
            {loading ? 'Kayıt yapılıyor...' : 'Kayıt Ol'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 13, color: '#6b7280', marginTop: 20, marginBottom: 0 }}>
          Zaten hesabın var mı?{' '}
          <Link to="/login" style={{ color: '#6366f1', textDecoration: 'none', fontWeight: 500 }}>
            Giriş Yap
          </Link>
        </p>
      </div>
    </div>
  );
}
