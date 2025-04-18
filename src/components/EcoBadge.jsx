
import { Award, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const EcoBadge = ({ rating, className, showDetails = false }) => {
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

  const getRatingInfo = (rating) => {
    switch (rating) {
      case "A":
        return {
          icon: <CheckCircle className="w-4 h-4 mr-1" />,
          label: "Excellent",
          description: "Made with sustainable materials and ethical practices"
        };
      case "B":
        return {
          icon: <CheckCircle className="w-4 h-4 mr-1" />,
          label: "Good",
          description: "Mostly sustainable with some room for improvement"
        };
      case "C":
        return {
          icon: <Award className="w-4 h-4 mr-1" />,
          label: "Average",
          description: "Some sustainable practices but needs improvement"
        };
      case "D":
        return {
          icon: <AlertTriangle className="w-4 h-4 mr-1" />,
          label: "Below Average",
          description: "Limited sustainable practices"
        };
      default:
        return {
          icon: <XCircle className="w-4 h-4 mr-1" />,
          label: "Poor",
          description: "Lacks sustainable practices, consider alternatives"
        };
    }
  };

  const ratingInfo = getRatingInfo(rating);

  return (
    <div className={cn("flex flex-col", className)}>
      <span className={`eco-rating ${getEcoRatingClass(rating)}`}>
        <Award size={16} /> {rating}
      </span>
      
      {showDetails && (
        <div className="mt-2 text-sm">
          <div className="flex items-center font-medium">
            {ratingInfo.icon} {ratingInfo.label}
          </div>
          {ratingInfo.description && (
            <p className="text-gray-600 mt-1">{ratingInfo.description}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default EcoBadge;
