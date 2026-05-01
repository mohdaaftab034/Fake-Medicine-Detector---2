import React, { useState, useContext, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Barcode, AlertTriangle, MapPin, Bell, BookOpen, ArrowRight, ArrowUpRight, Check } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { AppContext } from '../context/AppContext.jsx';
import { AuthContext } from '../context/AuthContext.jsx';
import { ROUTES } from '../utils/constants.js';

const CountUp = ({ end, suffix = '', duration = 2000 }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(end * eased));
      if (progress === 1) clearInterval(interval);
    }, 16);
    return () => clearInterval(interval);
  }, [inView, end, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
};

const Home = () => {
  const { activeAlerts } = useContext(AppContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/agent');
    }
  }, [user, navigate]);

  const features = [
    { icon: ShieldCheck, title: 'AI Scanner', description: 'Upload a photo — our model identifies counterfeits in under 3 seconds.', tag: 'Most Used' },
    { icon: Barcode, title: 'Batch Verify', description: 'Cross-reference batch numbers against manufacturer and CDSCO records.', tag: null },
    { icon: AlertTriangle, title: 'Report Fake', description: 'Flag suspicious medicines directly to regulatory authorities.', tag: null },
    { icon: MapPin, title: 'Find Chemist', description: 'Locate licensed, government-verified pharmacies near you.', tag: null },
    { icon: Bell, title: 'Safety Alerts', description: 'Real-time push notifications about recalled or counterfeit batches.', tag: 'Live' },
    { icon: BookOpen, title: 'Drug Database', description: 'Comprehensive library of authentic packaging, seals, and batch formats.', tag: null },
  ];

  const testimonials = [
    { initials: 'RK', name: 'Raj Kumar', city: 'Bengaluru', text: 'Caught a counterfeit paracetamol before giving it to my child. MediGuard literally saved lives in my household.' },
    { initials: 'PS', name: 'Priya Sharma', city: 'New Delhi', text: 'Simple, fast, accurate. I scan every purchase now. The peace of mind is worth it.' },
    { initials: 'AM', name: 'Ahmed Mohammed', city: 'Mumbai', text: 'Reported a fake batch through the app. CDSCO contacted me within 48 hours. This works.' },
  ];

  const stats = [
    { value: 25, suffix: '%', label: 'of Indian medicines are counterfeit', sub: 'WHO Estimate' },
    { value: 10000, suffix: '+', label: 'Medicines verified', sub: 'This month' },
    { value: 500, suffix: '+', label: 'Trusted chemists', sub: 'Nationwide' },
    { value: 28, suffix: '', label: 'States covered', sub: 'And growing' },
  ];

  return (
    <div className="mg-root">

      {/* ─── HERO ─────────────────────────────────────────────────── */}
      <section className="mg-hero">
        <div className="mg-hero__bg-grid" aria-hidden />
        <div className="mg-hero__blob mg-hero__blob--1" aria-hidden />
        <div className="mg-hero__blob mg-hero__blob--2" aria-hidden />

        <div className="mg-container mg-hero__inner">
          <motion.div
            className="mg-hero__eyebrow"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="mg-badge mg-badge--green">
              <span className="mg-badge__dot" />
              CDSCO Integrated Platform
            </span>
          </motion.div>

          <motion.h1
            className="mg-hero__headline"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            Is your medicine
            <br />
            <em className="mg-hero__headline--accent">real?</em>
          </motion.h1>

          <motion.p
            className="mg-hero__sub"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            MediGuard uses AI to verify the authenticity of medicines in seconds —
            protecting you, your family, and India's pharmaceutical supply chain.
          </motion.p>

          <motion.div
            className="mg-hero__actions"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <Link to={ROUTES.SCANNER} className="mg-btn mg-btn--primary">
              <ShieldCheck size={18} />
              Scan a Medicine
            </Link>
            <Link to={ROUTES.BATCH_VERIFY} className="mg-btn mg-btn--ghost">
              Verify Batch Number
              <ArrowRight size={16} />
            </Link>
          </motion.div>

          <motion.div
            className="mg-hero__trust"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            {['Free to use', 'No sign-up required', 'CDSCO verified data'].map((t) => (
              <span key={t} className="mg-hero__trust-item">
                <Check size={13} strokeWidth={2.5} />
                {t}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── STATS ────────────────────────────────────────────────── */}
      <section className="mg-stats">
        <div className="mg-container mg-stats__grid">
          {stats.map((s, i) => (
            <motion.div
              key={i}
              className="mg-stat"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="mg-stat__value">
                <CountUp end={s.value} suffix={s.suffix} />
              </p>
              <p className="mg-stat__label">{s.label}</p>
              <p className="mg-stat__sub">{s.sub}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── ALERT BANNER ─────────────────────────────────────────── */}
      {activeAlerts?.length > 0 && (
        <div className="mg-container">
          <Link to={ROUTES.ALERTS} className="mg-alert-banner">
            <div className="mg-alert-banner__left">
              <span className="mg-alert-banner__icon">
                <AlertTriangle size={16} />
              </span>
              <span>
                <strong>{activeAlerts.length} active alert{activeAlerts.length > 1 ? 's' : ''}:</strong>
                {' '}counterfeit batches detected in circulation.
              </span>
            </div>
            <span className="mg-alert-banner__cta">View Alerts <ArrowRight size={14} /></span>
          </Link>
        </div>
      )}

      {/* ─── FEATURES ─────────────────────────────────────────────── */}
      <section className="mg-features">
        <div className="mg-container">
          <div className="mg-section-header">
            <p className="mg-section-header__eyebrow">Platform</p>
            <h2 className="mg-section-header__title">Everything you need to stay safe</h2>
            <p className="mg-section-header__sub">Six tools. One mission: zero counterfeit medicines.</p>
          </div>

          <div className="mg-features__grid">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={i}
                  className="mg-feature-card"
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                >
                  {f.tag && <span className="mg-feature-card__tag">{f.tag}</span>}
                  <div className="mg-feature-card__icon">
                    <Icon size={22} strokeWidth={1.75} />
                  </div>
                  <h3 className="mg-feature-card__title">{f.title}</h3>
                  <p className="mg-feature-card__desc">{f.description}</p>
                  <span className="mg-feature-card__arrow">
                    <ArrowUpRight size={16} />
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─────────────────────────────────────────── */}
      <section className="mg-how">
        <div className="mg-container">
          <div className="mg-how__inner">
            <div className="mg-how__left">
              <p className="mg-section-header__eyebrow">How it works</p>
              <h2 className="mg-how__title">Three steps.<br />Total certainty.</h2>
              <p className="mg-how__sub">
                No medical expertise required. If it has a label,
                MediGuard can read it.
              </p>
              <Link to={ROUTES.SCANNER} className="mg-btn mg-btn--primary mg-how__cta">
                Try it now <ArrowRight size={16} />
              </Link>
            </div>

            <div className="mg-how__steps">
              {[
                { num: '01', title: 'Photograph the label', desc: 'Hold the medicine up and snap a photo, or upload one from your gallery.' },
                { num: '02', title: 'AI analysis', desc: 'Our model checks fonts, seals, batch codes, and manufacturer data in under 3s.' },
                { num: '03', title: 'Instant verdict', desc: 'Get a clear Genuine / Suspect result with a detailed confidence breakdown.' },
              ].map((step, i) => (
                <motion.div
                  key={i}
                  className="mg-step"
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.12, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                >
                  <span className="mg-step__num">{step.num}</span>
                  <div>
                    <h3 className="mg-step__title">{step.title}</h3>
                    <p className="mg-step__desc">{step.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── TEAM ─────────────────────────────────────────────────── */}
      <section className="mg-team">
        <div className="mg-container">
          <div className="mg-section-header">
            <p className="mg-section-header__eyebrow">The people</p>
            <h2 className="mg-section-header__title">Built by a team that cares</h2>
          </div>

          <div className="mg-team__grid">
            {[
              { name: 'Mohd Aaftab', role: 'Full Stack Developer', bio: 'Expert in building scalable end-to-end applications with modern tech stacks.', gradient: 'linear-gradient(135deg, #0d7377 0%, #14a085 100%)', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200&h=200' },
              { name: 'Shrishti Mishra', role: 'Team Lead', bio: 'Strategic leader focused on project management and ensuring top-notch delivery.', gradient: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200&h=200' },
              { name: 'Mayank Choudhery', role: 'Backend Developer', bio: 'Backend specialist with a passion for robust APIs and secure database architectures.', gradient: 'linear-gradient(135deg, #2d3436 0%, #636e72 100%)', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200&h=200' },
            ].map((m, i) => (
              <motion.div
                key={i}
                className="mg-team-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <div className="mg-team-card__avatar-wrap relative overflow-hidden rounded-xl mb-4 h-48 w-full">
                  <img src={m.image} alt={m.name} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500" />
                  <div className="absolute inset-0 bg-accent/10 mix-blend-multiply" />
                </div>
                <div className="mg-team-card__body">
                  <h3 className="mg-team-card__name text-xl font-bold">{m.name}</h3>
                  <p className="mg-team-card__role text-accent font-bold text-xs uppercase tracking-widest mt-1 mb-3">{m.role}</p>
                  <p className="mg-team-card__bio text-sm opacity-80 leading-relaxed">{m.bio}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─────────────────────────────────────────── */}
      <section className="mg-testimonials">
        <div className="mg-container">
          <div className="mg-section-header">
            <p className="mg-section-header__eyebrow">Stories</p>
            <h2 className="mg-section-header__title">Real people. Real impact.</h2>
          </div>

          <div className="mg-testimonials__grid">
            {testimonials.map((t, i) => (
              <motion.blockquote
                key={i}
                className="mg-testimonial"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <p className="mg-testimonial__text">"{t.text}"</p>
                <footer className="mg-testimonial__footer">
                  <div className="mg-testimonial__avatar">{t.initials}</div>
                  <div>
                    <p className="mg-testimonial__name">{t.name}</p>
                    <p className="mg-testimonial__city">{t.city}</p>
                  </div>
                </footer>
              </motion.blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ──────────────────────────────────────────────────── */}
      <section className="mg-cta">
        <div className="mg-container mg-cta__inner">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="mg-cta__title">Verify your next purchase.</h2>
            <p className="mg-cta__sub">It takes less time than reading the label. And it could save your life.</p>
            <div className="mg-hero__actions">
              <Link to={ROUTES.SCANNER} className="mg-btn mg-btn--primary">
                <ShieldCheck size={18} />
                Start Scanning — Free
              </Link>
              <Link to="/register" className="mg-btn mg-btn--ghost">
                Create an account
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
};

export default Home;