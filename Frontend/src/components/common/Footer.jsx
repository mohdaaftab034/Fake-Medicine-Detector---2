import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Mail, MapPin, Phone, ArrowUpRight } from 'lucide-react';
import { CDSCO_HELPLINE, ROUTES } from '../../utils/constants.js';

const Footer = () => {
  const year = new Date().getFullYear();

  const cols = [
    {
      title: 'Platform',
      links: [
        { label: 'Scanner', to: ROUTES.SCANNER },
        { label: 'Batch Verify', to: ROUTES.BATCH_VERIFY },
        { label: 'Report Fake Medicine', to: ROUTES.REPORT_FAKE },
        { label: 'Medicine Info', to: ROUTES.MEDICINE_INFO },
        { label: 'Find Chemist', to: ROUTES.NEARBY_CHEMIST },
        { label: 'Safety Alerts', to: ROUTES.ALERTS },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'Our Mission', to: '#' },
        { label: 'How it Works', to: '#' },
        { label: 'Team', to: '#' },
        { label: 'Blog', to: '#' },
        { label: 'Documentation', to: '#' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacy Policy', to: '#' },
        { label: 'Terms of Service', to: '#' },
        { label: 'Cookie Policy', to: '#' },
        { label: 'Disclaimer', to: '#' },
      ],
    },
  ];

  return (
    <footer className="mg-footer">
      <div className="mg-container">

        {/* Top strip */}
        <div className="mg-footer__top">
          <div className="mg-footer__brand">
            <div className="mg-footer__logo">
              <div className="mg-nav__logo-icon">
                <Shield size={18} />
              </div>
              <span className="mg-nav__logo-text">MediGuard</span>
            </div>
            <p className="mg-footer__tagline">
              AI-powered counterfeit medicine detection.
              <br />
              Protecting India's pharmaceutical supply.
            </p>
            <div className="mg-footer__contact-items">
              <a href={`tel:${CDSCO_HELPLINE}`} className="mg-footer__contact-item">
                <Phone size={14} />
                {CDSCO_HELPLINE}
              </a>
              <a href="mailto:support@mediguard.in" className="mg-footer__contact-item">
                <Mail size={14} />
                support@mediguard.in
              </a>
              <span className="mg-footer__contact-item">
                <MapPin size={14} />
                New Delhi, India
              </span>
            </div>
          </div>

          <div className="mg-footer__cols">
            {cols.map((col) => (
              <div key={col.title} className="mg-footer__col">
                <h4 className="mg-footer__col-title">{col.title}</h4>
                <ul className="mg-footer__col-list">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link to={link.to} className="mg-footer__link">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Helpline banner */}
        <div className="mg-footer__helpline">
          <div className="mg-footer__helpline-left">
            <span className="mg-badge mg-badge--red">
              <span className="mg-badge__dot" />
              CDSCO Helpline
            </span>
            <p className="mg-footer__helpline-text">
              Found a suspicious medicine? Report it directly to India's Central Drugs Standard Control Organisation.
            </p>
          </div>
          <a href={`tel:${CDSCO_HELPLINE}`} className="mg-btn mg-btn--primary mg-footer__helpline-btn">
            Call {CDSCO_HELPLINE}
            <ArrowUpRight size={15} />
          </a>
        </div>

        {/* Bottom */}
        <div className="mg-footer__bottom">
          <p className="mg-footer__copy">
            © {year} MediGuard. All rights reserved. Built for Hack4Good 2025.
          </p>
          <div className="mg-footer__bottom-links">
            <a href="#" className="mg-footer__link">Privacy</a>
            <a href="#" className="mg-footer__link">Terms</a>
            <a href="#" className="mg-footer__link">Cookies</a>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;