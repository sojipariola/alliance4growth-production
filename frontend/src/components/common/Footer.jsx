import { FaFacebook, FaTwitter, FaInstagram, FaEnvelope, FaPhone } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-primary text-white mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-heading font-semibold mb-4">Alliance4Growth Forth Valley</h3>
            <p className="text-sm opacity-90">
              Building stronger communities through family and men's wellness.
            </p>
          </div>
          
          <div>
            <h3 className="text-xl font-heading font-semibold mb-4">Contact</h3>
            <div className="space-y-2 text-sm">
              <p><FaEnvelope className="inline mr-2" /> info@alliance4growth.org</p>
              <p><FaPhone className="inline mr-2" /> +44 7310975602</p>
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-heading font-semibold mb-4">Follow Us</h3>
            <div className="flex space-x-4 text-2xl">
              <a href="#" className="hover:text-secondary transition-colors">
                <FaFacebook />
              </a>
              <a href="#" className="hover:text-secondary transition-colors">
                <FaTwitter />
              </a>
              <a href="#" className="hover:text-secondary transition-colors">
                <FaInstagram />
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-white border-opacity-20 mt-6 pt-6 text-center text-sm opacity-75">
          © 2024 Alliance4Growth Forth Valley. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
