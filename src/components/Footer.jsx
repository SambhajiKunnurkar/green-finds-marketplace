
import { Leaf, Facebook, Twitter, Instagram, Mail } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-eco-green/15 border-t border-gray-200">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center">
              <Leaf className="h-8 w-8 text-eco-green" />
              <span className="ml-2 text-xl font-bold text-eco-green">EcoCart</span>
            </div>
            <p className="text-sm text-gray-600">
              Making sustainable shopping simple and accessible for everyone.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-eco-green hover:text-eco-brown">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-eco-green hover:text-eco-brown">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-eco-green hover:text-eco-brown">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-eco-charcoal tracking-wider uppercase">Shop</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="/products" className="text-sm text-gray-600 hover:text-eco-green">
                  All Products
                </Link>
              </li>
              <li>
                <Link to="/products?category=clothing" className="text-sm text-gray-600 hover:text-eco-green">
                  Eco Clothing
                </Link>
              </li>
              <li>
                <Link to="/products?category=home" className="text-sm text-gray-600 hover:text-eco-green">
                  Home Goods
                </Link>
              </li>
              <li>
                <Link to="/products?category=beauty" className="text-sm text-gray-600 hover:text-eco-green">
                  Sustainable Beauty
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-eco-charcoal tracking-wider uppercase">Company</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <a href="#" className="text-sm text-gray-600 hover:text-eco-green">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-600 hover:text-eco-green">
                  Sustainability Pledge
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-600 hover:text-eco-green">
                  Our Rating System
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-600 hover:text-eco-green">
                  Careers
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-eco-charcoal tracking-wider uppercase">Help</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <a href="#" className="text-sm text-gray-600 hover:text-eco-green">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-600 hover:text-eco-green">
                  FAQs
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-600 hover:text-eco-green">
                  Shipping Information
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-600 hover:text-eco-green">
                  Returns Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-gray-200 pt-8">
          <p className="text-sm text-gray-500 text-center">
            &copy; {new Date().getFullYear()} EcoCart. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
