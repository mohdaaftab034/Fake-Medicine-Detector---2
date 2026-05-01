import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, Sparkles, ShieldCheck, FlaskConical } from 'lucide-react';
import toast from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext.jsx';
import { demoAccounts } from '../utils/mockData.js';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        toast.success('Login successful!');
        const account = demoAccounts.find((a) => a.email === formData.email);
        setTimeout(() => {
          if (account.role === 'admin') {
            navigate('/dashboard/admin');
          } else if (account.role === 'chemist') {
            navigate('/dashboard/chemist');
          } else {
            navigate('/dashboard/user');
          }
        }, 800);
      } else {
        toast.error(result.error || 'Login failed');
      }
    } catch (error) {
      toast.error('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  const demoLogin = async (email) => {
    const account = demoAccounts.find((a) => a.email === email);
    const result = await login(email, account.password);
    if (result.success) {
      toast.success(`Logged in as ${account.name}!`);
      setTimeout(() => {
        if (account.role === 'admin') {
          navigate('/dashboard/admin');
        } else if (account.role === 'chemist') {
          navigate('/dashboard/chemist');
        } else {
          navigate('/dashboard/user');
        }
      }, 800);
    }
  };

  return (
    <div className="mg-root min-h-screen flex items-center justify-center py-16 px-4">
      <div className="absolute inset-0 bg-bg-0">
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-accent/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-green/5 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-10 relative z-10"
      >
        <div className="hidden lg:flex flex-col justify-between py-8">
          <div>
            <span className="mg-badge mg-badge--green mb-6">
              <span className="mg-badge__dot" />
              Trusted AI Verification
            </span>
            <h2 className="mg-hero__headline text-left text-5xl mb-6">
              Scan smarter.<br />Stay safer.
            </h2>
            <p className="mg-hero__sub text-left m-0 max-w-md">
              MediGuard helps you verify medicines instantly and avoid counterfeit risks with multi-layered AI analysis.
            </p>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center gap-4 text-text-hi font-medium">
              <div className="p-2 bg-green-dim text-green rounded-lg shadow-sm">
                <ShieldCheck size={20} />
              </div>
              Secure account access
            </div>
            <div className="flex items-center gap-4 text-text-hi font-medium">
              <div className="p-2 bg-accent-glow text-accent rounded-lg shadow-sm">
                <FlaskConical size={20} />
              </div>
              Smart medicine authenticity checks
            </div>
          </div>
        </div>

        <div className="mg-card p-10 bg-bg-1/80 backdrop-blur-xl border-line-hi shadow-2xl">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-text-hi mb-2">Welcome Back</h1>
            <p className="text-text-md">Sign in to continue protecting your health</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 mb-8">
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
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mg-btn mg-btn--primary w-full justify-center py-5 text-lg shadow-glow"
            >
              {loading ? 'Logging in...' : 'Sign In'}
            </button>
          </form>

          <div className="mb-8 pt-8 border-t border-line">
            <p className="text-center text-[10px] uppercase tracking-widest text-text-lo font-bold mb-4">Quick Demo Access</p>
            <div className="grid grid-cols-3 gap-3">
              {demoAccounts.map((account) => (
                <button
                  key={account.id}
                  onClick={() => demoLogin(account.email)}
                  className="mg-btn mg-btn--ghost mg-btn--sm justify-center text-[10px] py-3"
                >
                  {account.role}
                </button>
              ))}
            </div>
          </div>

          <p className="text-center text-text-md text-sm">
            Don't have an account?{' '}
            <Link to="/register" className="text-accent hover:underline font-bold transition-all">
              Create one now
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
