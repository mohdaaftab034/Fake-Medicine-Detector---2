import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Barcode, AlertTriangle, MapPin, Bell, BookOpen, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { AppContext } from '../context/AppContext.jsx';
import { ROUTES } from '../utils/constants.js';

const Home = () => {
  const { activeAlerts } = useContext(AppContext);
  const [counts, setCounts] = useState({
    fakePercentage: 0,
    verified: 0,
    chemists: 0,
    states: 0,
  });

  // Count up animation
  React.useEffect(() => {
    const duration = 2000;
    const startTime = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      setCounts({
        fakePercentage: Math.floor(25 * progress),
        verified: Math.floor(10000 * progress),
        chemists: Math.floor(500 * progress),
        states: Math.floor(48 * progress),
      });

      if (progress === 1) clearInterval(interval);
    }, 16);

    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: ShieldCheck,
      title: 'Scanner',
      description: 'Scan medicine photos to instantly verify authenticity',
    },
    {
      icon: Barcode,
      title: 'Batch Verify',
      description: 'Verify medicines using batch numbers and manufacturer data',
    },
    {
      icon: AlertTriangle,
      title: 'Report Fake',
      description: 'Report fake medicines directly to CDSCO authorities',
    },
    {
      icon: MapPin,
      title: 'Find Chemist',
      description: 'Locate verified and trusted chemist shops near you',
    },
    {
      icon: Bell,
      title: 'Real-time Alerts',
      description: 'Get notified about fake medicine batches in your area',
    },
    {
      icon: BookOpen,
      title: 'Medicine Info',
      description: 'Learn how to identify genuine medicines and spot counterfeits',
    },
  ];

  const testimonials = [
    {
      initials: 'RK',
      name: 'Raj Kumar',
      city: 'Bangalore',
      text: 'MediGuard helped me identify a counterfeit medicine I bought. Reported it immediately!',
    },
    {
      initials: 'PS',
      name: 'Priya Sharma',
      city: 'Delhi',
      text: 'The app is super easy to use. Scan, verify, done! Highly recommended for everyone.',
    },
    {
      initials: 'AM',
      name: 'Ahmed Mohammed',
      city: 'Mumbai',
      text: 'Finally a trusted way to verify medicines. Peace of mind for my family!',
    },
  ];

  const steps = [
    { icon: '📱', title: 'Upload Photo', description: 'Take a photo of your medicine' },
    { icon: '🤖', title: 'AI Analyzes', description: 'AI scans and analyzes the medicine' },
    { icon: '✅', title: 'Get Result', description: 'Instant verification result' },
  ];

  return (
    <div className="space-y-0">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-bg-primary via-bg-secondary to-bg-primary">
        {/* Animated Background */}
        <div className="absolute inset-0">
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-primary/10"
              style={{
                width: Math.random() * 100 + 50 + 'px',
                height: Math.random() * 100 + 50 + 'px',
                left: Math.random() * 100 + '%',
                top: Math.random() * 100 + '%',
              }}
              animate={{
                y: [0, -50, 0],
                opacity: [0.1, 0.3, 0.1],
              }}
              transition={{
                duration: Math.random() * 5 + 10,
                repeat: Infinity,
              }}
            />
          ))}
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 py-20 text-center space-y-8">
          {/* Main Headline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-4"
          >
            <h1 className="text-5xl md:text-7xl font-bold text-text-primary leading-tight">
              Is Your Medicine <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Real?</span>
            </h1>
            <div className="h-1 w-32 bg-gradient-to-r from-primary to-secondary rounded-full mx-auto animate-pulse-glow"></div>
          </motion.div>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl text-text-secondary max-w-2xl mx-auto"
          >
            Scan. Verify. Stay Safe. AI-powered fake medicine detection for every Indian.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col md:flex-row gap-4 justify-center items-center pt-4"
          >
            <Link to={ROUTES.SCANNER} className="btn-primary glow-pulse flex items-center gap-2">
              <ShieldCheck size={20} />
              Scan Medicine
            </Link>
            <Link to={ROUTES.BATCH_VERIFY} className="btn-secondary">
              Verify Batch Number
            </Link>
            <Link to={ROUTES.REPORT_FAKE} className="btn-danger">
              Report Fake Medicine
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-bg-secondary border-y border-border-color">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { value: counts.fakePercentage, suffix: '%', label: 'Medicines Are Fake' },
              { value: counts.verified, suffix: '+', label: 'Medicines Verified' },
              { value: counts.chemists, suffix: '+', label: 'Chemists Blacklisted' },
              { value: counts.states, suffix: '', label: 'States Covered' },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="card text-center space-y-2"
              >
                <p className="text-4xl font-bold text-primary">
                  {stat.value}
                  <span className="text-primary">{stat.suffix}</span>
                </p>
                <p className="text-text-secondary text-sm">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-bg-primary">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-primary mb-16">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.2 }}
                className="relative text-center space-y-4"
              >
                <div className="text-6xl">{step.icon}</div>
                <h3 className="text-xl font-semibold text-text-primary">{step.title}</h3>
                <p className="text-text-secondary">{step.description}</p>
                {idx < steps.length - 1 && (
                  <div className="hidden md:flex absolute -right-4 top-1/2 transform -translate-y-1/2">
                    <ArrowRight className="text-primary" size={24} />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-bg-secondary">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-primary mb-16">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="card space-y-4"
                >
                  <div className="p-3 rounded-lg bg-primary/20 w-fit">
                    <Icon size={24} className="text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-text-primary">{feature.title}</h3>
                  <p className="text-text-secondary">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-bg-primary">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-primary mb-16">What Users Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="card space-y-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center font-bold text-bg-primary">
                    {testimonial.initials}
                  </div>
                  <div>
                    <p className="font-semibold text-text-primary">{testimonial.name}</p>
                    <p className="text-text-secondary text-sm">{testimonial.city}</p>
                  </div>
                </div>
                <p className="text-text-secondary italic">"{testimonial.text}"</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Alert Banner */}
      {activeAlerts.length > 0 && (
        <section className="py-6 bg-danger/10 border-t border-b border-danger/30">
          <div className="max-w-6xl mx-auto px-4">
            <Link
              to={ROUTES.ALERTS}
              className="flex items-center justify-between p-4 rounded-lg bg-danger/20 border border-danger/30 hover:bg-danger/30 transition-smooth"
            >
              <div className="flex items-center gap-3">
                <AlertTriangle className="text-danger animate-pulse" size={24} />
                <div>
                  <p className="font-semibold text-danger">Active Alert!</p>
                  <p className="text-danger/80 text-sm">{activeAlerts.length} fake medicine batches detected</p>
                </div>
              </div>
              <ArrowRight className="text-danger" size={20} />
            </Link>
          </div>
        </section>
      )}

      {/* CTA Final */}
      <section className="py-20 bg-gradient-to-r from-primary/20 to-secondary/20 border-t border-border-color">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-8">
          <h2 className="text-4xl font-bold text-text-primary">
            Protect Your Health Today
          </h2>
          <p className="text-lg text-text-secondary">
            Join thousands of Indians using MediGuard to stay safe from counterfeit medicines
          </p>
          <Link to={ROUTES.SCANNER} className="btn-primary glow-pulse inline-flex items-center gap-2">
            <ShieldCheck size={20} />
            Start Scanning Now
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
