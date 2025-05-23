
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "../components/Layout";
import EcoBadge from "../components/EcoBadge";
import ProductCard from "../components/ProductCard";
import { useCart } from "../contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingCart, Plus, Minus, Leaf, Truck, Check, RefreshCw, ArrowRight } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [alternatives, setAlternatives] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [usingMockData, setUsingMockData] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        // Create AbortController for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        // Try to fetch using the proxy first (relative URL)
        let productResponse;
        let productData;
        let usedProxy = false;

        try {
          productResponse = await fetch(`/api/products/${id}`, {
            signal: controller.signal
          });
          
          if (productResponse.ok) {
            productData = await productResponse.json();
            usedProxy = true;
          } else {
            throw new Error(`Server returned ${productResponse.status}`);
          }
        } catch (proxyError) {
          console.log("Proxy fetch failed, trying direct URL", proxyError);
          
          // If proxy fails, try direct URL as fallback
          productResponse = await fetch(`http://localhost:5000/api/products/${id}`, {
            signal: controller.signal
          });
          
          if (!productResponse.ok) {
            throw new Error(`Server returned ${productResponse.status}: ${productResponse.statusText}`);
          }
          
          productData = await productResponse.json();
        }
        
        clearTimeout(timeoutId);
        
        // If we got here, we successfully fetched the product
        setProduct(productData);
        setUsingMockData(false);

        // Fetch eco-friendly alternatives
        if (productData.ecoRating === "D" || productData.ecoRating === "F") {
          try {
            const alternativesUrl = usedProxy 
              ? `/api/products/alternatives/${id}`
              : `http://localhost:5000/api/products/alternatives/${id}`;
              
            const alternativesResponse = await fetch(alternativesUrl);
            
            if (alternativesResponse.ok) {
              const alternativesData = await alternativesResponse.json();
              setAlternatives(alternativesData);
            } else {
              throw new Error(`Failed to fetch alternatives`);
            }
          } catch (alternativesError) {
            console.error("Error fetching alternatives:", alternativesError);
            // Not setting mock alternatives yet, we'll handle this case below
          }
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        
        // Use mock data as fallback
        if (id.startsWith('mock')) {
          // Parse the mock ID to get the index
          const mockIndex = parseInt(id.replace('mock', ''), 10) - 1;
          const mockProducts = [
            {
              _id: "mock1",
              name: "Bamboo Toothbrush",
              price: 4.99,
              brand: "EcoSmile",
              category: "Home",
              description: "Biodegradable toothbrush with bamboo handle and BPA-free bristles",
              ecoRating: "A",
              image: "https://images.unsplash.com/photo-1550159930-40066082a4fc?auto=format&fit=crop&q=80&w=600"
            },
            {
              _id: "mock2",
              name: "Reusable Water Bottle",
              price: 24.99,
              brand: "HydroEarth",
              category: "Home",
              description: "Insulated stainless steel water bottle that keeps drinks cold for 24 hours",
              ecoRating: "A",
              image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&q=80&w=600"
            },
            {
              _id: "mock3",
              name: "Organic Cotton Tote",
              price: 15.99,
              brand: "EarthCarry",
              category: "Clothing",
              description: "Durable organic cotton tote bag, perfect alternative to plastic bags",
              ecoRating: "A",
              image: "https://images.unsplash.com/photo-1591373032221-eb3dd08d1977?auto=format&fit=crop&q=80&w=600"
            },
            {
              _id: "mock4",
              name: "Beeswax Food Wraps",
              price: 18.50,
              brand: "TerraCycle",
              category: "Food",
              description: "Reusable food wraps made with organic cotton, beeswax, and plant oils",
              ecoRating: "A",
              image: "https://images.unsplash.com/photo-1611404056121-707b12f4d56c?auto=format&fit=crop&q=80&w=600"
            },
            {
              _id: "mock5",
              name: "Natural Face Cleanser",
              price: 12.99,
              brand: "NaturalBeauty",
              category: "Beauty",
              description: "Gentle, eco-friendly face cleanser with all-natural ingredients",
              ecoRating: "B",
              image: "https://images.unsplash.com/photo-1570194065650-d99fb4bedf8a?auto=format&fit=crop&q=80&w=600"
            },
            {
              _id: "mock6",
              name: "Solar Phone Charger",
              price: 34.95,
              brand: "EcoTech",
              category: "Electronics",
              description: "Portable solar panel for charging your devices on the go",
              ecoRating: "A",
              image: "https://images.unsplash.com/photo-1594131431273-8c47d2a8f5c5?auto=format&fit=crop&q=80&w=600"
            }
          ];
          
          // Get the mock product or default to the first one if index is invalid
          const mockProduct = mockIndex >= 0 && mockIndex < mockProducts.length 
            ? mockProducts[mockIndex] 
            : mockProducts[0];
            
          setProduct(mockProduct);
          
          // Set some mock alternatives
          if (mockProduct.ecoRating === "D" || mockProduct.ecoRating === "F") {
            setAlternatives(mockProducts.filter(p => 
              p._id !== mockProduct._id && 
              (p.ecoRating === "A" || p.ecoRating === "B") &&
              p.category === mockProduct.category
            ).slice(0, 3));
          } else {
            // For products with good ratings, just show some other products
            setAlternatives(mockProducts.filter(p => p._id !== mockProduct._id).slice(0, 6));
          }
        } else {
          // If not a mock ID, create a generic mock product
          setProduct({
            _id: id,
            name: "Sample Product",
            price: 19.99,
            brand: "EcoBrand",
            category: "Home",
            description: "This is a sample product description for demonstration purposes.",
            ecoRating: "B",
            image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=600"
          });
          
          // Set some generic alternatives
          setAlternatives([
            {
              _id: "alt1",
              name: "Alternative Product 1",
              price: 24.99,
              brand: "GreenBrand",
              category: "Home",
              description: "An eco-friendly alternative.",
              ecoRating: "A",
              image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600"
            },
            {
              _id: "alt2",
              name: "Alternative Product 2",
              price: 22.50,
              brand: "EcoBrand",
              category: "Home",
              description: "Another eco-friendly option.",
              ecoRating: "A",
              image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=600"
            }
          ]);
        }
        
        setUsingMockData(true);
        
        // Show toast notification about using demo data
        toast({
          title: "Demo Mode Active",
          description: "Using sample product data for demonstration purposes.",
          duration: 5000,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
    // Reset scroll position when product ID changes
    window.scrollTo(0, 0);
  }, [id, toast]);

  const increaseQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decreaseQuantity = () => {
    setQuantity(prev => (prev > 1 ? prev - 1 : 1));
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
      
      // Show confirmation toast
      toast({
        title: "Added to Cart",
        description: `${quantity} × ${product.name} added to your cart.`,
        duration: 3000,
      });
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse">
            <div className="md:flex md:gap-8">
              <div className="md:w-1/2 h-96 bg-gray-200 rounded-lg"></div>
              <div className="md:w-1/2 mt-8 md:mt-0">
                <div className="h-8 bg-gray-200 rounded w-2/3 mb-4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-8"></div>
                <div className="h-10 bg-gray-200 rounded w-full mb-4"></div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h2 className="text-2xl font-bold text-eco-charcoal mb-4">Product Not Found</h2>
          <p className="mb-6 text-gray-600">The product you're looking for doesn't exist or has been removed.</p>
          <Link to="/products">
            <Button>Browse All Products</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumbs */}
        <div className="mb-6 text-sm text-gray-500">
          <Link to="/" className="hover:text-eco-green">Home</Link> {" / "}
          <Link to="/products" className="hover:text-eco-green">Products</Link> {" / "}
          {product.category && (
            <>
              <Link 
                to={`/products?category=${product.category.toLowerCase()}`} 
                className="hover:text-eco-green"
              >
                {product.category}
              </Link> {" / "}
            </>
          )}
          <span className="text-eco-charcoal">{product.name}</span>
        </div>

        {usingMockData && (
          <div className="mb-6 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center">
            <Leaf className="h-5 w-5 text-amber-500 mr-2" />
            <p className="text-sm text-amber-700">
              Demo Mode: Using sample product data for demonstration purposes.
            </p>
          </div>
        )}

        <div className="md:flex md:gap-8 mb-12">
          {/* Product Image */}
          <div className="md:w-1/2 mb-8 md:mb-0">
            <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-auto object-cover aspect-square"
              />
            </div>
          </div>

          {/* Product Info */}
          <div className="md:w-1/2">
            <h1 className="text-3xl font-bold text-eco-charcoal mb-2">{product.name}</h1>
            <div className="flex items-center mb-4">
              <p className="text-xl font-semibold text-eco-charcoal mr-4">
                ${product.price.toFixed(2)}
              </p>
              <EcoBadge rating={product.ecoRating} />
            </div>
            
            <p className="text-gray-600 mb-6">{product.description}</p>
            
            <div className="mb-6">
              <p className="font-medium text-eco-charcoal mb-2">Brand: <span className="font-normal">{product.brand}</span></p>
              {product.category && (
                <p className="font-medium text-eco-charcoal">Category: <span className="font-normal">{product.category}</span></p>
              )}
            </div>
            
            {/* Sustainability Info */}
            <div className="bg-eco-cream p-4 rounded-lg mb-6">
              <div className="flex items-start mb-2">
                <Leaf className="h-5 w-5 text-eco-green mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-eco-charcoal">Sustainability Rating</h3>
                  <EcoBadge rating={product.ecoRating} showDetails={true} className="mt-2" />
                </div>
              </div>
            </div>
            
            {/* Quantity Selector */}
            <div className="flex items-center mb-6">
              <span className="text-eco-charcoal mr-4">Quantity:</span>
              <div className="flex items-center border border-gray-300 rounded">
                <button
                  onClick={decreaseQuantity}
                  className="py-2 px-3 text-gray-600 hover:text-eco-green"
                  disabled={quantity === 1}
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="py-2 px-4 border-x border-gray-300">{quantity}</span>
                <button
                  onClick={increaseQuantity}
                  className="py-2 px-3 text-gray-600 hover:text-eco-green"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            {/* Add to Cart Button */}
            <Button 
              onClick={handleAddToCart}
              className="w-full bg-eco-green hover:bg-eco-green/90 mb-6"
              size="lg"
            >
              <ShoppingCart className="h-5 w-5 mr-2" /> Add to Cart
            </Button>
            
            {/* Shipping & Returns */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center">
                <Truck className="h-4 w-4 text-eco-green mr-2" />
                <span>Free shipping over $50</span>
              </div>
              <div className="flex items-center">
                <Check className="h-4 w-4 text-eco-green mr-2" />
                <span>Secure checkout</span>
              </div>
              <div className="flex items-center">
                <RefreshCw className="h-4 w-4 text-eco-green mr-2" />
                <span>30-day returns</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Product Details Tabs */}
        <div className="mb-12">
          <Tabs defaultValue="details">
            <TabsList className="w-full justify-start border-b">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="sustainability">Sustainability</TabsTrigger>
              <TabsTrigger value="shipping">Shipping & Returns</TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="py-4">
              <div className="prose max-w-none">
                <h3 className="text-lg font-medium text-eco-charcoal mb-3">Product Details</h3>
                <p className="text-gray-600 mb-4">{product.description}</p>
                <ul className="list-disc pl-5 space-y-2 text-gray-600">
                  <li>Material: Recycled polyester, Organic cotton</li>
                  <li>Care: Machine wash cold, hang to dry</li>
                  <li>Dimensions: 12" x 8" x 4"</li>
                  <li>Weight: 0.5 lbs</li>
                </ul>
              </div>
            </TabsContent>
            <TabsContent value="sustainability" className="py-4">
              <div className="prose max-w-none">
                <h3 className="text-lg font-medium text-eco-charcoal mb-3">Sustainability Information</h3>
                <p className="text-gray-600 mb-4">
                  This product has earned an eco-rating of <strong>{product.ecoRating}</strong> based on our comprehensive
                  sustainability assessment.
                </p>
                <h4 className="font-medium text-eco-charcoal mt-4 mb-2">Materials</h4>
                <p className="text-gray-600 mb-2">
                  {product.ecoRating === "A" || product.ecoRating === "B"
                    ? "Made with sustainable and/or recycled materials that have a lower environmental impact."
                    : "Contains some conventional materials that have a higher environmental footprint."}
                </p>
                <h4 className="font-medium text-eco-charcoal mt-4 mb-2">Manufacturing</h4>
                <p className="text-gray-600 mb-2">
                  {product.ecoRating === "A" || product.ecoRating === "B"
                    ? "Produced in facilities with strong environmental and labor standards."
                    : "Manufactured using conventional processes that may have higher resource consumption."}
                </p>
                <h4 className="font-medium text-eco-charcoal mt-4 mb-2">Brand Commitment</h4>
                <p className="text-gray-600">
                  {product.ecoRating === "A" || product.ecoRating === "B"
                    ? `${product.brand} demonstrates a strong commitment to sustainability across their business practices.`
                    : `${product.brand} is working to improve their sustainability practices.`}
                </p>
              </div>
            </TabsContent>
            <TabsContent value="shipping" className="py-4">
              <div className="prose max-w-none">
                <h3 className="text-lg font-medium text-eco-charcoal mb-3">Shipping Information</h3>
                <p className="text-gray-600 mb-4">
                  We use eco-friendly packaging materials and carbon-neutral shipping options whenever possible.
                </p>
                <ul className="list-disc pl-5 space-y-2 text-gray-600 mb-6">
                  <li>Standard Shipping: 3-5 business days</li>
                  <li>Express Shipping: 1-2 business days</li>
                  <li>Free standard shipping on orders over $50</li>
                </ul>
                
                <h3 className="text-lg font-medium text-eco-charcoal mb-3">Returns & Exchanges</h3>
                <p className="text-gray-600 mb-4">
                  Not satisfied with your purchase? We offer a hassle-free 30-day return policy.
                </p>
                <ul className="list-disc pl-5 space-y-2 text-gray-600">
                  <li>Items must be in original condition with tags attached</li>
                  <li>Return shipping is free for exchanges</li>
                  <li>Refunds are processed within 5-7 business days</li>
                </ul>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Eco-Friendly Alternatives Section */}
        {(product.ecoRating === "D" || product.ecoRating === "F") && alternatives.length > 0 && (
          <div className="bg-eco-cream rounded-lg p-6 mb-12">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <Leaf className="h-6 w-6 text-eco-green mr-2" />
                <h2 className="text-xl font-bold text-eco-charcoal">Greener Alternatives</h2>
              </div>
              <Link to="/products?rating=a,b" className="text-eco-green hover:text-eco-green/90 flex items-center text-sm font-medium">
                View all eco-friendly options <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            <p className="text-gray-600 mb-6">
              We found some more sustainable alternatives with better eco-ratings that you might like.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {alternatives.slice(0, 3).map((alternative) => (
                <ProductCard key={alternative._id} product={alternative} />
              ))}
            </div>
          </div>
        )}
        
        {/* You Might Also Like Section */}
        {alternatives.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-bold text-eco-charcoal mb-6">You Might Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {/* Show up to 4 alternatives */}
              {alternatives.slice(0, 4).map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ProductDetail;
