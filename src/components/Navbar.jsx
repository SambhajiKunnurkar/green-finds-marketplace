import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShoppingCart, User, Menu, X, Search, Leaf } from "lucide-react";

const Navbar = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { currentUser, logout } = useAuth();
  const { cartItemCount } = useCart();
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <Leaf className="h-8 w-8 text-eco-green" />
              <span className="ml-2 text-xl font-bold text-eco-green">EcoCart</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center flex-grow max-w-md mx-4">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search eco-friendly products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-full pr-10"
                />
                <button
                  type="submit"
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                >
                  <Search className="h-5 w-5 text-gray-400" />
                </button>
              </div>
            </form>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <Link to="/products" className="text-eco-charcoal hover:text-eco-green">
              Products
            </Link>
            {currentUser && (
              <Link to="/cart" className="relative">
                <ShoppingCart className="h-6 w-6 text-eco-charcoal hover:text-eco-green" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-eco-green text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </Link>
            )}
            {currentUser ? (
              <div className="flex items-center space-x-4">
                <Link to="/profile" className="text-eco-charcoal hover:text-eco-green">
                  <User className="h-6 w-6" />
                </Link>
                <Button
                  variant="ghost"
                  className="text-eco-charcoal hover:text-eco-green"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </div>
            ) : (
              <Link to="/login">
                <Button variant="ghost" className="text-eco-charcoal hover:text-eco-green">
                  Login
                </Button>
              </Link>
            )}
          </div>

          <div className="md:hidden flex items-center">
            {currentUser && (
              <Link to="/cart" className="relative mr-4">
                <ShoppingCart className="h-6 w-6 text-eco-charcoal" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-eco-green text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </Link>
            )}
            <button
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-eco-charcoal hover:text-eco-green focus:outline-none"
            >
              {mobileMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-4 pt-2 pb-3 space-y-3 sm:px-6">
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search eco-friendly products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-full pr-10"
                />
                <button
                  type="submit"
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                >
                  <Search className="h-5 w-5 text-gray-400" />
                </button>
              </div>
            </form>

            <Link
              to="/products"
              className="block px-3 py-2 rounded-md text-base font-medium text-eco-charcoal hover:text-eco-green"
              onClick={() => setMobileMenuOpen(false)}
            >
              Products
            </Link>

            {currentUser ? (
              <>
                <Link
                  to="/profile"
                  className="block px-3 py-2 rounded-md text-base font-medium text-eco-charcoal hover:text-eco-green"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Profile
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-eco-charcoal hover:text-eco-green"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="block px-3 py-2 rounded-md text-base font-medium text-eco-charcoal hover:text-eco-green"
                onClick={() => setMobileMenuOpen(false)}
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
