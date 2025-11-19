import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';
import leafLogo from 'figma:asset/1412fa805ffd9f4d2e9213ed47a1296a51bb48e3.png';

interface FooterProps {
  onNavigate: (page: string) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 flex items-center justify-center">
                <img
                  alt="Sahay Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-white flex items-baseline">
                <span style={{ fontSize: '1.3em' }}>S</span>
                <span>ahay</span>
              </span>
            </div>
            <p className="text-sm">
              Making volunteering accessible, one hour at a time. Join our community and make a difference today.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <button 
                  onClick={() => onNavigate('home')}
                  className="hover:text-blue-400 transition-colors"
                >
                  Home
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('opportunities')}
                  className="hover:text-blue-400 transition-colors"
                >
                  Opportunities
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('celebration')}
                  className="hover:text-blue-400 transition-colors"
                >
                  Celebrate
                </button>
              </li>
              {/* <li>
                <button 
                  onClick={() => onNavigate('about')}
                  className="hover:text-blue-400 transition-colors"
                >
                  About Us
                </button>
              </li> */}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>hello@sahay.org</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>+91 9091111111</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>Dronacharya Groups of Institutions</span>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="text-white mb-4">Follow Us</h3>
            <div className="flex gap-4">
              <a href="#" className="hover:text-blue-400 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-blue-400 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-blue-400 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-blue-400 transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
          <p>&copy; 2025 Sahay. All rights reserved. Made with ❤️ for volunteers everywhere.</p>
        </div>
      </div>
    </footer>
  );
}
