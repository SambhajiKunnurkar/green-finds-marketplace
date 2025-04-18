
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Layout from "../components/Layout";
import ProductCard from "../components/ProductCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { FilterX, SlidersHorizontal } from "lucide-react";

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter states
  const [priceRange, setPriceRange] = useState([0, 200]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedRatings, setSelectedRatings] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  
  // Available filter options
  const categories = ["Clothing", "Home", "Beauty", "Food", "Electronics"];
  const ecoRatings = ["A", "B", "C", "D", "F"];
  const brands = ["EcoWear", "GreenHome", "NaturalBeauty", "OrganicPlus", "TerraCycle"];

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      
      const searchQuery = searchParams.get("search") || "";
      const categoryFilter = searchParams.get("category") || "";
      
      try {
        // Build the query string based on search parameters
        let url = "http://localhost:5000/api/products?";
        
        if (searchQuery) {
          url += `search=${encodeURIComponent(searchQuery)}&`;
        }
        
        if (categoryFilter) {
          url += `category=${encodeURIComponent(categoryFilter)}&`;
        }
        
        const response = await fetch(url);
        const data = await response.json();
        setProducts(data);
        
        // If there's a category in the URL, select it in the filter
        if (categoryFilter) {
          setSelectedCategories([categoryFilter.toLowerCase()]);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [searchParams]);
  
  const handleSearch = (query) => {
    // Update the search parameter in the URL
    const newParams = new URLSearchParams(searchParams);
    if (query) {
      newParams.set("search", query);
    } else {
      newParams.delete("search");
    }
    setSearchParams(newParams);
  };
  
  const clearFilters = () => {
    setPriceRange([0, 200]);
    setSelectedCategories([]);
    setSelectedRatings([]);
    setSelectedBrands([]);
    
    // Clear URL parameters except for search
    const newParams = new URLSearchParams();
    const searchQuery = searchParams.get("search");
    if (searchQuery) {
      newParams.set("search", searchQuery);
    }
    setSearchParams(newParams);
  };
  
  const toggleCategory = (category) => {
    setSelectedCategories(prev => {
      const lowercase = category.toLowerCase();
      if (prev.includes(lowercase)) {
        return prev.filter(c => c !== lowercase);
      } else {
        return [...prev, lowercase];
      }
    });
    
    // Update URL if needed
    const newParams = new URLSearchParams(searchParams);
    if (selectedCategories.length === 0) {
      newParams.delete("category");
    } else {
      newParams.set("category", selectedCategories.join(","));
    }
    setSearchParams(newParams);
  };
  
  const toggleRating = (rating) => {
    setSelectedRatings(prev => {
      if (prev.includes(rating)) {
        return prev.filter(r => r !== rating);
      } else {
        return [...prev, rating];
      }
    });
  };
  
  const toggleBrand = (brand) => {
    setSelectedBrands(prev => {
      if (prev.includes(brand)) {
        return prev.filter(b => b !== brand);
      } else {
        return [...prev, brand];
      }
    });
  };
  
  // Apply all filters to products
  const filteredProducts = products.filter(product => {
    // Price filter
    if (product.price < priceRange[0] || product.price > priceRange[1]) {
      return false;
    }
    
    // Category filter
    if (selectedCategories.length > 0 && !selectedCategories.includes(product.category.toLowerCase())) {
      return false;
    }
    
    // Rating filter
    if (selectedRatings.length > 0 && !selectedRatings.includes(product.ecoRating)) {
      return false;
    }
    
    // Brand filter
    if (selectedBrands.length > 0 && !selectedBrands.includes(product.brand)) {
      return false;
    }
    
    return true;
  });
  
  return (
    <Layout onSearch={handleSearch}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-eco-charcoal mb-4">Sustainable Products</h1>
          
          <div className="flex items-center justify-between">
            <p className="text-gray-600">
              {filteredProducts.length} eco-friendly products
            </p>
            <Button 
              variant="outline" 
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden flex items-center"
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              {showFilters ? "Hide Filters" : "Show Filters"}
            </Button>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-8">
          {/* Filters Sidebar - Always visible on desktop, toggleable on mobile */}
          <div className={`md:w-1/4 ${showFilters ? 'block' : 'hidden md:block'}`}>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-eco-charcoal">Filters</h2>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearFilters}
                  className="text-sm flex items-center text-gray-500 hover:text-eco-green"
                >
                  <FilterX className="h-4 w-4 mr-1" /> Clear
                </Button>
              </div>
              
              {/* Price Range */}
              <div className="mb-6">
                <h3 className="font-medium mb-3 text-eco-charcoal">Price Range</h3>
                <Slider
                  defaultValue={[0, 200]}
                  max={200}
                  step={5}
                  value={priceRange}
                  onValueChange={(value) => setPriceRange(value)}
                  className="mb-2"
                />
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>${priceRange[0]}</span>
                  <span>${priceRange[1]}</span>
                </div>
              </div>
              
              {/* Categories */}
              <div className="mb-6">
                <h3 className="font-medium mb-3 text-eco-charcoal">Categories</h3>
                <div className="space-y-2">
                  {categories.map(category => (
                    <div key={category} className="flex items-center">
                      <Checkbox 
                        id={`category-${category}`}
                        checked={selectedCategories.includes(category.toLowerCase())}
                        onCheckedChange={() => toggleCategory(category)}
                      />
                      <label 
                        htmlFor={`category-${category}`}
                        className="ml-2 text-sm text-gray-600 cursor-pointer"
                      >
                        {category}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Eco Rating */}
              <div className="mb-6">
                <h3 className="font-medium mb-3 text-eco-charcoal">Eco Rating</h3>
                <div className="space-y-2">
                  {ecoRatings.map(rating => (
                    <div key={rating} className="flex items-center">
                      <Checkbox 
                        id={`rating-${rating}`}
                        checked={selectedRatings.includes(rating)}
                        onCheckedChange={() => toggleRating(rating)}
                      />
                      <label 
                        htmlFor={`rating-${rating}`}
                        className="ml-2 text-sm text-gray-600 cursor-pointer"
                      >
                        {rating}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Brands */}
              <div>
                <h3 className="font-medium mb-3 text-eco-charcoal">Brands</h3>
                <div className="space-y-2">
                  {brands.map(brand => (
                    <div key={brand} className="flex items-center">
                      <Checkbox 
                        id={`brand-${brand}`}
                        checked={selectedBrands.includes(brand)}
                        onCheckedChange={() => toggleBrand(brand)}
                      />
                      <label 
                        htmlFor={`brand-${brand}`}
                        className="ml-2 text-sm text-gray-600 cursor-pointer"
                      >
                        {brand}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Products Grid */}
          <div className="md:w-3/4">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="h-80 bg-gray-200 rounded-md animate-pulse"></div>
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-eco-charcoal mb-2">No products found</h3>
                <p className="text-gray-600 mb-6">Try adjusting your filters or search query</p>
                <Button onClick={clearFilters}>Clear All Filters</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Products;
