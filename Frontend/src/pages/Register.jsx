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
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 right-0 w-72 h-72 bg-primary/15 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -left-16 w-80 h-80 bg-warning/15 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg bg-bg-secondary rounded-2xl border border-border-color p-8 shadow-xl relative"
      >
        <div className="text-center mb-8">
          <motion.div
            className="inline-flex p-3 rounded-2xl bg-primary/10"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <UserCheck className="w-8 h-8 text-primary" />
          </motion.div>
          <h1 className="text-3xl font-bold text-text-primary mt-4 mb-2">Create Account</h1>
          <p className="text-text-secondary">Choose your role and join MediGuard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-text-primary font-medium mb-2">Role</label>
            <div className="grid grid-cols-3 gap-2 p-1 rounded-xl bg-bg-primary border border-border-color">
              {roleTabs.map((role) => {
                const isActive = formData.role === role.value;
                const Icon = role.icon;
                return (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, role: role.value }))}
                    className={`rounded-lg px-2 py-3 transition-all text-center border ${
                      isActive
                        ? 'bg-primary/15 border-primary/40 text-primary'
                        : 'border-transparent text-text-secondary hover:text-text-primary hover:bg-bg-secondary'
                    }`}
                  >
                    <Icon size={16} className="mx-auto mb-1" />
                    <span className="text-xs font-semibold">{role.label}</span>
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-text-secondary mt-2">
              {roleTabs.find((role) => role.value === formData.role)?.hint}
            </p>
          </div>

          <div>
            <label className="block text-text-primary font-medium mb-2">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-3 text-primary w-5 h-5" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-bg-primary border border-border-color text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="Your full name"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-text-primary font-medium mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-primary w-5 h-5" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-bg-primary border border-border-color text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="your@email.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-text-primary font-medium mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-primary w-5 h-5" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-bg-primary border border-border-color text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="Min 8 characters"
                required
                minLength="8"
              />
            </div>
          </div>

          {formData.role === 'chemist' && (
            <div>
              <label className="block text-text-primary font-medium mb-2">License Number</label>
              <input
                type="text"
                name="licenseNumber"
                value={formData.licenseNumber}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-bg-primary border border-border-color text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="DL/2024/0001"
                required
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-primary to-secondary text-bg-primary font-semibold py-3 rounded-xl hover:opacity-95 transition-all duration-300 disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>

          <p className="text-center text-text-secondary pt-2">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:text-secondary font-semibold">
              Sign in
            </Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
};

export default Register;
