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
    <div className="space-y-0 overflow-x-hidden">
      {/* Hero Section - Redesigned for Minimalist & Interactive Look */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-bg-primary">
        {/* Dynamic Background Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/20 rounded-full blur-[120px] animate-pulse" />
          
          {/* Interactive Floating Particles */}
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-primary/40 rounded-full"
              initial={{ x: Math.random() * 100 + '%', y: Math.random() * 100 + '%' }}
              animate={{
                y: [0, -100, 0],
                opacity: [0.2, 0.8, 0.2],
                scale: [1, 1.5, 1]
              }}
              transition={{
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          ))}
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "circOut" }}
          >
            <span className="inline-block px-4 py-1.5 mb-6 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-[0.2em]">
              AI-Powered Safety
            </span>
            <h1 className="text-6xl md:text-8xl font-black text-text-primary tracking-tight leading-[0.9] mb-8">
              Verify your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_auto] animate-gradient-flow">Medicine.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-text-secondary max-w-xl mx-auto mb-10 leading-relaxed font-medium">
              The smartest way to ensure your health. <br className="hidden md:block" />
              One scan. Instant results. Total peace of mind.
            </p>

            <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to={ROUTES.SCANNER} className="px-10 py-5 bg-primary text-white rounded-2xl font-bold text-lg shadow-2xl shadow-primary/30 flex items-center gap-3 group">
                  <ShieldCheck size={24} />
                  Start Scanning
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
              
              <Link to={ROUTES.BATCH_VERIFY} className="px-8 py-5 bg-bg-secondary text-text-primary border border-border-color rounded-2xl font-bold hover:bg-bg-primary transition-all">
                Verify Batch
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          animate={{ y: [0, 10, 0] }} 
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-text-secondary/40"
        >
          <div className="w-6 h-10 border-2 border-current rounded-full flex justify-center p-1">
            <div className="w-1 h-2 bg-current rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-bg-primary relative">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { value: counts.fakePercentage, suffix: '%', label: 'Counterfeit Drugs' },
              { value: counts.verified, suffix: '+', label: 'Medicines Scanned' },
              { value: counts.chemists, suffix: '+', label: 'Verified Chemists' },
              { value: counts.states, suffix: '', label: 'Active Regions' },
            ].map((stat, idx) => (
              <div key={idx} className="text-center group">
                <p className="text-5xl font-black text-text-primary mb-2 group-hover:text-primary transition-colors">
                  {stat.value}{stat.suffix}
                </p>
                <div className="h-1 w-12 bg-primary/30 mx-auto rounded-full mb-3" />
                <p className="text-text-secondary text-xs font-bold uppercase tracking-widest">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Meet Our Team Section - NEW */}
      <section className="py-24 bg-bg-secondary relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px]" />
        
        <div className="max-w-6xl mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-text-primary mb-4">Meet Our Team</h2>
            <div className="h-1.5 w-24 bg-gradient-to-r from-primary to-secondary mx-auto rounded-full" />
            <p className="text-text-secondary mt-6 max-w-lg mx-auto">
              The dedicated innovators behind MediGuard, working to build a safer pharmaceutical ecosystem for India.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                name: 'Aaftab Ansari', 
                role: 'Technical Lead', 
                bio: 'Visionary leader with 5+ years in health-tech and system architecture.',
                color: 'from-blue-500 to-indigo-600',
                icon: '🚀'
              },
              { 
                name: 'Sarah Chen', 
                role: 'Frontend Developer', 
                bio: 'UI/UX enthusiast dedicated to creating seamless, premium user experiences.',
                color: 'from-pink-500 to-rose-600',
                icon: '🎨'
              },
              { 
                name: 'David Miller', 
                role: 'Backend Developer', 
                bio: 'Security expert focused on building robust and scalable AI infrastructures.',
                color: 'from-emerald-500 to-teal-600',
                icon: '⚙️'
              }
            ].map((member, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -10 }}
                className="bg-bg-primary p-8 rounded-[2.5rem] border border-border-color shadow-xl hover:shadow-2xl transition-all group"
              >
                <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${member.color} flex items-center justify-center text-3xl mb-6 shadow-lg transform group-hover:rotate-6 transition-transform`}>
                  {member.icon}
                </div>
                <h3 className="text-2xl font-bold text-text-primary mb-1">{member.name}</h3>
                <p className="text-primary font-bold text-sm uppercase tracking-widest mb-4">{member.role}</p>
                <p className="text-text-secondary text-sm leading-relaxed">{member.bio}</p>
                
                <div className="mt-6 flex gap-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full bg-bg-secondary border border-border-color flex items-center justify-center text-text-secondary hover:text-primary transition-colors cursor-pointer">
                      <div className="w-1.5 h-1.5 bg-current rounded-full" />
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-bg-primary">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
            <div className="max-w-md">
              <h2 className="text-4xl font-black text-text-primary mb-4">Users trust us</h2>
              <p className="text-text-secondary leading-relaxed">Join thousands of people who use MediGuard every day to verify their medications.</p>
            </div>
            <div className="flex gap-2">
              <div className="p-4 rounded-full bg-bg-secondary border border-border-color text-text-secondary">
                <ArrowRight className="rotate-180" />
              </div>
              <div className="p-4 rounded-full bg-primary text-white shadow-lg shadow-primary/30">
                <ArrowRight />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="card-glass p-8 rounded-[2rem] border border-border-color space-y-6"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-primary to-secondary flex items-center justify-center font-bold text-white text-xl">
                    {testimonial.initials}
                  </div>
                  <div>
                    <p className="font-bold text-text-primary text-lg">{testimonial.name}</p>
                    <p className="text-text-secondary text-sm font-medium">{testimonial.city}</p>
                  </div>
                </div>
                <p className="text-text-secondary text-lg leading-relaxed italic">"{testimonial.text}"</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Alert Banner */}
      {activeAlerts.length > 0 && (
        <section className="py-6 px-4">
          <div className="max-w-6xl mx-auto">
            <Link
              to={ROUTES.ALERTS}
              className="flex items-center justify-between p-6 rounded-[2rem] bg-danger/10 border border-danger/30 hover:bg-danger/20 transition-all group"
            >
              <div className="flex items-center gap-5">
                <div className="p-3 rounded-2xl bg-danger text-white animate-pulse">
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <p className="font-black text-danger text-xl uppercase tracking-tight">Active Safety Alerts</p>
                  <p className="text-danger/70 font-medium">{activeAlerts.length} counterfeit batches detected in circulation.</p>
                </div>
              </div>
              <div className="w-12 h-12 rounded-full border border-danger/30 flex items-center justify-center text-danger group-hover:bg-danger group-hover:text-white transition-all">
                <ArrowRight />
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* CTA Final */}
      <section className="py-32 bg-bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10 space-y-10">
          <h2 className="text-5xl md:text-6xl font-black text-text-primary tracking-tighter">
            Ready to secure <br className="md:hidden" /> your health?
          </h2>
          <div className="flex flex-col sm:flex-row gap-5 justify-center">
            <Link to={ROUTES.SCANNER} className="px-10 py-5 bg-primary text-white rounded-2xl font-bold text-lg shadow-2xl shadow-primary/30 flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all">
              <ShieldCheck size={24} />
              Verify Now
            </Link>
            <Link to="/register" className="px-10 py-5 bg-bg-secondary text-text-primary border border-border-color rounded-2xl font-bold text-lg hover:bg-bg-primary transition-all">
              Create Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
