
import { Link } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ShoppingCart, Award } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";

const ProductCard = ({ product }) => {
  // Add a fallback empty object if useCart() returns undefined
  const { addToCart } = useCart() || {};
  const { isAuthenticated } = useAuth() || {};

  const getEcoRatingClass = (rating) => {
    switch (rating) {
      case "A":
        return "eco-rating-a";
      case "B":
        return "eco-rating-b";
      case "C":
        return "eco-rating-c";
      case "D":
        return "eco-rating-d";
      default:
        return "eco-rating-f";
    }
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!addToCart) {
      toast.error("Cart functionality is currently unavailable");
      console.error("useCart() returned undefined - CartContext may not be properly provided");
      return;
    }
    
    if (!isAuthenticated) {
      toast.error("Please log in to add items to cart");
      return;
    }
    
    addToCart(product, 1);
  };

  return (
    <Card className="overflow-hidden h-full flex flex-col transition-all duration-200 hover:shadow-md">
      <Link to={`/products/${product._id}`} className="flex-grow">
        <div className="relative aspect-square overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
          <div className="absolute top-2 right-2">
            <span className={`eco-rating ${getEcoRatingClass(product.ecoRating)}`}>
              <Award size={16} /> {product.ecoRating}
            </span>
          </div>
        </div>
        <CardContent className="p-4">
          <h3 className="font-medium text-base">{product.name}</h3>
          <div className="flex justify-between items-center mt-2">
            <p className="font-semibold text-lg">${product.price.toFixed(2)}</p>
            <p className="text-sm text-gray-500">{product.brand}</p>
          </div>
          <p className="text-sm text-gray-600 mt-2 line-clamp-2">{product.description}</p>
        </CardContent>
      </Link>
      <CardFooter className="p-4 pt-0">
        <Button 
          onClick={handleAddToCart}
          className="w-full bg-eco-green hover:bg-eco-green/90"
        >
          <ShoppingCart className="h-4 w-4 mr-2" /> Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
