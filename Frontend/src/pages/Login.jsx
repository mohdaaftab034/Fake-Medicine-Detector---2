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
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 -left-20 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -right-12 w-80 h-80 bg-success/20 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-6 relative"
      >
        <div className="hidden lg:flex card-glass flex-col justify-between">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-sm font-semibold mb-6">
              <Sparkles size={16} /> Trusted AI Verification
            </div>
            <h2 className="text-4xl font-bold text-text-primary leading-tight mb-4">
              Scan smarter.
              <br />
              Stay safer.
            </h2>
            <p className="text-text-secondary max-w-md">
              MediGuard helps you verify medicines instantly and avoid counterfeit risks with AI-powered analysis.
            </p>
          </div>
          <div className="space-y-3 mt-10">
            <div className="flex items-center gap-3 text-text-primary">
              <ShieldCheck size={18} className="text-success" /> Secure account access
            </div>
            <div className="flex items-center gap-3 text-text-primary">
              <FlaskConical size={18} className="text-primary" /> Smart medicine authenticity checks
            </div>
          </div>
        </div>

        <div className="bg-bg-secondary rounded-2xl border border-border-color p-8 shadow-xl">
          <div className="text-center mb-8">
            <motion.div
              className="inline-flex p-3 rounded-2xl bg-primary/10"
              animate={{ rotate: [0, 8, -8, 0] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            >
              <LogIn className="w-8 h-8 text-primary" />
            </motion.div>
            <h1 className="text-3xl font-bold text-text-primary mt-4 mb-2">Welcome Back</h1>
            <p className="text-text-secondary">Sign in to continue protecting your family</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 mb-6">
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
                  placeholder="Enter your email"
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
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary to-secondary text-bg-primary font-semibold py-3 rounded-xl hover:opacity-95 transition-all duration-300 disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Sign In'}
            </button>
          </form>

          <div className="mb-6">
            <p className="text-center text-text-secondary text-sm mb-3">Quick Demo Login</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {demoAccounts.map((account) => (
                <button
                  key={account.id}
                  onClick={() => demoLogin(account.email)}
                  className="px-3 py-2 rounded-lg border border-primary/30 text-primary hover:bg-primary/10 text-sm transition-all duration-200"
                >
                  {account.role}
                </button>
              ))}
            </div>
          </div>

          <p className="text-center text-text-secondary">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary hover:text-secondary font-semibold">
              Register here
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
