import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-neutral-50 border-t border-neutral-100 py-12 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-neutral-900 flex items-center justify-center text-white text-xs font-bold">
            EN
          </div>
          <span className="text-lg font-bold tracking-tight text-neutral-900">
            EventNest
          </span>
        </div>
        <p className="text-neutral-500 text-sm">
          © 2026 EventNest. All rights reserved.
        </p>
        <div className="flex gap-6 text-sm font-medium text-neutral-600">
          <a href="#" className="hover:text-neutral-900 transition-colors">
            Privacy Policy
          </a>
          <a href="#" className="hover:text-neutral-900 transition-colors">
            Terms of Service
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
