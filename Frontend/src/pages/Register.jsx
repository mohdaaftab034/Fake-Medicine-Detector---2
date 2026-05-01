import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Lock, UserCheck, UserCircle2, Store, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext.jsx';

const roleTabs = [
  { value: 'public', label: 'Public', icon: UserCircle2, hint: 'For consumers and families' },
  { value: 'chemist', label: 'Chemist', icon: Store, hint: 'For pharmacies and stores' },
  { value: 'admin', label: 'Admin', icon: Shield, hint: 'For regulator access' },
];

const Register = () => {
  const navigate = useNavigate();
  const { register } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'public',
    licenseNumber: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.name || !formData.email || !formData.password) {
        toast.error('Please fill all required fields');
        setLoading(false);
        return;
      }

      if (formData.role === 'chemist' && !formData.licenseNumber) {
        toast.error('License number is required for chemists');
        setLoading(false);
        return;
      }

      const result = await register(formData);
      if (result.success) {
        toast.success('Registration successful! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      }
    } catch (error) {
      toast.error('An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mg-root min-h-screen flex items-center justify-center py-16 px-4">
      <div className="absolute inset-0 bg-bg-0">
        <div className="absolute top-0 left-0 w-1/3 h-1/3 bg-accent/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-1/3 h-1/3 bg-amber/5 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg bg-bg-1/80 backdrop-blur-xl border-line-hi p-10 rounded-[2.5rem] shadow-2xl relative z-10"
      >
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-text-hi mb-2">Create Account</h1>
          <p className="text-text-md">Choose your role and join the MediGuard network</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-xs font-bold text-text-lo uppercase tracking-widest px-1 mb-3 block">Account Type</label>
            <div className="grid grid-cols-3 gap-2 p-2 rounded-2xl bg-bg-2 border border-line">
              {roleTabs.map((role) => {
                const isActive = formData.role === role.value;
                const Icon = role.icon;
                return (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, role: role.value }))}
                    className={`rounded-xl px-2 py-4 transition-all text-center border ${
                      isActive
                        ? 'bg-bg-1 border-line-hi text-accent shadow-sm'
                        : 'border-transparent text-text-lo hover:text-text-md'
                    }`}
                  >
                    <Icon size={20} className="mx-auto mb-2" />
                    <span className="text-[10px] font-black uppercase tracking-widest leading-none">{role.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-text-lo uppercase tracking-widest px-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-text-lo w-5 h-5" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input-field pl-12 py-4"
                placeholder="John Doe"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-text-lo uppercase tracking-widest px-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-lo w-5 h-5" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input-field pl-12 py-4"
                placeholder="name@example.com"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-text-lo uppercase tracking-widest px-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-lo w-5 h-5" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="input-field pl-12 py-4"
                placeholder="Min. 8 characters"
                required
                minLength="8"
              />
            </div>
          </div>

          {formData.role === 'chemist' && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-lo uppercase tracking-widest px-1">License Number</label>
              <input
                type="text"
                name="licenseNumber"
                value={formData.licenseNumber}
                onChange={handleChange}
                className="input-field py-4 px-5"
                placeholder="DL/2024/0001"
                required
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mg-btn mg-btn--primary w-full justify-center py-5 text-lg shadow-glow mt-4"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>

          <p className="text-center text-text-md text-sm pt-4 border-t border-line">
            Already have an account?{' '}
            <Link to="/login" className="text-accent hover:underline font-bold transition-all">
              Sign In
            </Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
};

export default Register;
