
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import ProductCard from "../components/ProductCard";
import { Button } from "@/components/ui/button";
import { Leaf, Search, ArrowRight } from "lucide-react";

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [ecoAlternatives, setEcoAlternatives] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Fetch featured products
        const featuredResponse = await fetch("http://localhost:5000/api/products/featured");
        const featuredData = await featuredResponse.json();
        setFeaturedProducts(featuredData);

        // Fetch eco alternatives (high-rated products)
        const ecoResponse = await fetch("http://localhost:5000/api/products/eco-alternatives");
        const ecoData = await ecoResponse.json();
        setEcoAlternatives(ecoData);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleSearch = (query) => {
    navigate(`/products?search=${encodeURIComponent(query)}`);
  };

  const handleFormSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      handleSearch(searchQuery);
    }
  };

  return (
    <Layout onSearch={handleSearch}>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-eco-green/90 to-eco-light-green/90 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="md:flex md:items-center md:justify-between">
            <div className="md:w-1/2 md:pr-8">
              <h1 className="text-4xl sm:text-5xl font-bold mb-4">
                Shop Smart, Shop Sustainable
              </h1>
              <p className="text-lg mb-8">
                Find eco-friendly alternatives to everyday products and make a positive impact on our planet.
              </p>
              <form onSubmit={handleFormSearch} className="relative max-w-md">
                <input
                  type="text"
                  placeholder="Search for sustainable products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full py-3 px-5 pr-14 rounded-full text-eco-charcoal focus:outline-none focus:ring-2 focus:ring-white/50"
                />
                <button
                  type="submit"
                  className="absolute right-1 top-1 bg-eco-green p-2 rounded-full text-white"
                >
                  <Search className="h-5 w-5" />
                </button>
              </form>
            </div>
            <div className="mt-10 md:mt-0 md:w-1/2 flex justify-center">
              <div className="bg-white/10 p-6 rounded-lg backdrop-blur-sm max-w-xs">
                <div className="flex items-center mb-4">
                  <Leaf className="h-10 w-10 text-white" />
                  <div className="ml-4">
                    <h3 className="font-bold">Our Impact</h3>
                    <p className="text-sm opacity-90">Together we can make a difference</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-white/20 rounded-lg p-3">
                    <p className="font-semibold">2,500+</p>
                    <p className="text-sm opacity-90">Eco-friendly products</p>
                  </div>
                  <div className="bg-white/20 rounded-lg p-3">
                    <p className="font-semibold">10,000+</p>
                    <p className="text-sm opacity-90">Happy customers</p>
                  </div>
                  <div className="bg-white/20 rounded-lg p-3">
                    <p className="font-semibold">50+</p>
                    <p className="text-sm opacity-90">Sustainable brands</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-eco-charcoal">Featured Products</h2>
            <Button
              variant="ghost"
              onClick={() => navigate("/products")}
              className="text-eco-green hover:text-eco-green/90 flex items-center"
            >
              View All <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-80 bg-gray-200 rounded-md animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Sustainable Alternatives */}
      <section className="py-12 bg-eco-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-eco-charcoal mb-2">Eco-Friendly Alternatives</h2>
            <p className="text-gray-600">Better choices for a healthier planet</p>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-80 bg-gray-300 rounded-md animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {ecoAlternatives.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Eco-friendly Categories */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-eco-charcoal mb-8">Shop by Category</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <div 
              className="relative rounded-lg overflow-hidden h-48 cursor-pointer"
              onClick={() => navigate("/products?category=clothing")}
            >
              <img 
                src="https://images.unsplash.com/photo-1523381210434-271e8be1f52b" 
                alt="Sustainable Clothing" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-eco-green/30 hover:bg-eco-green/40 transition-colors flex items-center justify-center">
                <h3 className="text-white text-xl font-bold bg-eco-green/70 px-4 py-2 rounded">
                  Eco-Friendly Clothing
                </h3>
              </div>
            </div>
            <div 
              className="relative rounded-lg overflow-hidden h-48 cursor-pointer"
              onClick={() => navigate("/products?category=home")}
            >
              <img 
                src="https://images.unsplash.com/photo-1523575166472-a83a0ed1d522" 
                alt="Sustainable Home" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-eco-green/30 hover:bg-eco-green/40 transition-colors flex items-center justify-center">
                <h3 className="text-white text-xl font-bold bg-eco-green/70 px-4 py-2 rounded">
                  Sustainable Home
                </h3>
              </div>
            </div>
            <div 
              className="relative rounded-lg overflow-hidden h-48 cursor-pointer"
              onClick={() => navigate("/products?category=beauty")}
            >
              <img 
                src="https://images.unsplash.com/photo-1526947425960-945c6e72858f" 
                alt="Natural Beauty" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-eco-green/30 hover:bg-eco-green/40 transition-colors flex items-center justify-center">
                <h3 className="text-white text-xl font-bold bg-eco-green/70 px-4 py-2 rounded">
                  Natural Beauty
                </h3>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Home;
