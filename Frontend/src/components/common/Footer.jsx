import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Mail, MapPin, Phone, Facebook, Twitter, Linkedin, Github } from 'lucide-react';
import { CDSCO_HELPLINE, ROUTES } from '../../utils/constants.js';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: 'About MediGuard',
      links: [
        { label: 'Our Mission', href: '#' },
        { label: 'How It Works', href: '#' },
        { label: 'Technology', href: '#' },
        { label: 'Team', href: '#' },
      ],
    },
    {
      title: 'Quick Links',
      links: [
        { label: 'Scanner', href: ROUTES.SCANNER },
        { label: 'Batch Verify', href: ROUTES.BATCH_VERIFY },
        { label: 'Report Fake', href: ROUTES.REPORT_FAKE },
        { label: 'Medicine Info', href: ROUTES.MEDICINE_INFO },
      ],
    },
    {
      title: 'Resources',
      links: [
        { label: 'FAQ', href: '#' },
        { label: 'Blog', href: '#' },
        { label: 'Safety Tips', href: '#' },
        { label: 'Documentation', href: '#' },
      ],
    },
    {
      title: 'Contact',
      items: [
        { icon: Phone, text: CDSCO_HELPLINE, href: `tel:${CDSCO_HELPLINE}` },
        { icon: Mail, text: 'support@mediguard.in', href: 'mailto:support@mediguard.in' },
        { icon: MapPin, text: 'New Delhi, India', href: '#' },
      ],
    },
  ];

  return (
    <footer className="bg-bg-secondary border-t border-border-color">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-r from-primary to-secondary">
                <Shield size={20} className="text-bg-primary" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                MediGuard
              </span>
            </div>
            <p className="text-text-secondary text-sm leading-relaxed">
              AI-powered fake medicine detection platform making India's medicine supply safer.
            </p>
            {/* Social Links */}
            <div className="flex gap-3 pt-4">
              <a
                href="#"
                className="p-2 rounded-lg bg-bg-primary hover:bg-primary/20 text-primary transition-smooth"
              >
                <Facebook size={18} />
              </a>
              <a
                href="#"
                className="p-2 rounded-lg bg-bg-primary hover:bg-primary/20 text-primary transition-smooth"
              >
                <Twitter size={18} />
              </a>
              <a
                href="#"
                className="p-2 rounded-lg bg-bg-primary hover:bg-primary/20 text-primary transition-smooth"
              >
                <Linkedin size={18} />
              </a>
              <a
                href="#"
                className="p-2 rounded-lg bg-bg-primary hover:bg-primary/20 text-primary transition-smooth"
              >
                <Github size={18} />
              </a>
            </div>
          </div>

          {/* Links Sections */}
          {footerSections.slice(0, 3).map((section) => (
            <div key={section.title}>
              <h3 className="font-semibold text-primary mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-text-secondary text-sm hover:text-primary transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact Section */}
          <div>
            <h3 className="font-semibold text-primary mb-4">Contact</h3>
            <div className="space-y-3">
              {footerSections[3].items.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <a
                    key={idx}
                    href={item.href}
                    className="flex items-center gap-3 text-text-secondary text-sm hover:text-primary transition-colors group"
                  >
                    <Icon size={16} className="text-primary group-hover:scale-110 transition-transform" />
                    <span>{item.text}</span>
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border-color my-8"></div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-text-secondary text-sm">
          <p>
            © {currentYear} MediGuard. All rights reserved. | Built for Hack4Good 2025
          </p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-primary transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              Terms of Service
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              Cookie Policy
            </a>
          </div>
        </div>

        {/* Helpline Banner */}
        <div className="mt-8 p-4 rounded-lg bg-bg-primary border border-primary/30 flex items-center justify-between">
          <div>
            <p className="text-text-secondary text-sm">Report harmful medicines to CDSCO</p>
            <p className="text-primary font-semibold">Helpline: {CDSCO_HELPLINE}</p>
          </div>
          <a href={`tel:${CDSCO_HELPLINE}`} className="btn-primary">
            Call Now
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
