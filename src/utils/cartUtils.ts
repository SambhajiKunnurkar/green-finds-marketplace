
// export const API_BASE_URL = "http://localhost:5000/api";
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


// Helper function to check if a response is JSON
export const isJsonResponse = (response: Response): boolean => {
  const contentType = response.headers.get('content-type');
  return !!contentType && contentType.includes('application/json');
};

// Cart reducer actions and types
export type CartItem = {
  product: {
    _id: string;
    name: string;
    price: number;
  };
  quantity: number;
};

export type CartAction = 
  | { type: "INITIALIZE"; payload: CartItem[] }
  | { type: "ADD_ITEM"; payload: CartItem }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "UPDATE_QUANTITY"; payload: { productId: string; quantity: number } }
  | { type: "CLEAR_CART" };

export const cartReducer = (state: CartItem[], action: CartAction): CartItem[] => {
  switch (action.type) {
    case "INITIALIZE":
      return action.payload;
    case "ADD_ITEM":
      const itemExists = state.find(item => item.product._id === action.payload.product._id);
      if (itemExists) {
        return state.map(item => 
          item.product._id === action.payload.product._id 
            ? { ...item, quantity: item.quantity + action.payload.quantity } 
            : item
        );
      }
      return [...state, action.payload];
    case "REMOVE_ITEM":
      return state.filter(item => item.product._id !== action.payload);
    case "UPDATE_QUANTITY":
      return state.map(item => 
        item.product._id === action.payload.productId 
          ? { ...item, quantity: action.payload.quantity } 
          : item
      );
    case "CLEAR_CART":
      return [];
    default:
      return state;
  }
};
