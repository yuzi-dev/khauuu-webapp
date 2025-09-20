"use client";

import RestaurantCard from "./RestaurantCard";
import { Button } from "@/components/ui/button";
import { ArrowRight, Heart, Send } from "lucide-react";
import ShareModal from "@/components/ShareModal";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
const momosImage = "/assets/momos.jpg";
const dalBhatImage = "/assets/dal-bhat.jpg";
const restaurantImage = "/assets/restaurant-interior.jpg";

const FeaturedSection = () => {
  const [savedDishes, setSavedDishes] = useState<string[]>([]);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const { toast } = useToast();
  const featuredRestaurants = [
    {
      id: "1",
      name: "Himalayan Delights",
      cuisine: "Traditional Nepali",
      rating: 4.8,
      reviewCount: 245,
      priceRange: "₹₹",
      distance: "0.8 km",
      image: dalBhatImage,
      isOpen: true,
      deliveryTime: "25-35 min",
      tags: ["Vegetarian Friendly", "Family Style", "Authentic"]
    },
    {
      id: "2",
      name: "Momo Palace",
      cuisine: "Tibetan • Nepali",
      rating: 4.6,
      reviewCount: 189,
      priceRange: "₹",
      distance: "1.2 km",
      image: momosImage,
      isOpen: true,
      deliveryTime: "15-25 min",
      tags: ["Quick Bite", "Street Food", "Popular"]
    },
    {
      id: "3",
      name: "Heritage Kitchen",
      cuisine: "Newari • Traditional",
      rating: 4.9,
      reviewCount: 312,
      priceRange: "₹₹₹",
      distance: "2.1 km",
      image: restaurantImage,
      isOpen: false,
      deliveryTime: "35-45 min",
      tags: ["Fine Dining", "Cultural", "Special Occasion"]
    }
  ];

  const popularDishes = [
    { 
      id: "1", 
      name: "Dal Bhat", 
      image: dalBhatImage, 
      description: "Traditional Nepali meal with lentils, rice, and vegetables",
      restaurant: {
        name: "Himalayan Delights",
        rating: 4.8,
        id: "rest-1"
      }
    },
    { 
      id: "2", 
      name: "Momos", 
      image: momosImage, 
      description: "Steamed dumplings with various fillings",
      restaurant: {
        name: "Momo Palace",
        rating: 4.6,
        id: "rest-2"
      }
    },
    { 
      id: "3", 
      name: "Newari Khaja", 
      image: restaurantImage, 
      description: "Traditional Newari feast with multiple dishes",
      restaurant: {
        name: "Heritage Kitchen",
        rating: 4.9,
        id: "rest-3"
      }
    },
  ];

  const handleSaveDish = (dishId: string) => {
    setSavedDishes(prev => {
      const isAlreadySaved = prev.includes(dishId);
      const newSavedDishes = isAlreadySaved 
        ? prev.filter(id => id !== dishId)
        : [...prev, dishId];
      
      toast({
        title: isAlreadySaved ? "Dish Removed" : "Dish Saved!",
        description: isAlreadySaved 
          ? "Dish removed from your favorites" 
          : "Dish saved to your favorites",
      });
      
      return newSavedDishes;
    });
  };

  const handleRestaurantClick = (restaurantId: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    // Navigate to restaurant page
    window.location.href = `/restaurant/${restaurantId}`;
  };

  const handleShareDish = (dish: any) => {
    setSelectedItem({
      id: dish.id,
      type: 'food',
      name: dish.name,
      image: dish.image,
      description: dish.description,
    });
    setShareModalOpen(true);
  };

  return (
    <section className="py-16 bg-warm-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Featured Restaurants */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">Featured Restaurants</h2>
              <p className="text-muted-foreground">Discover the best local favorites in your area</p>
            </div>
            <Button variant="hero">
              View All
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
            {featuredRestaurants.map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>
        </div>

        {/* Popular Dishes */}
        <div>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">Popular Nepali Dishes</h2>
            <p className="text-muted-foreground">Explore authentic flavors loved by locals</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {popularDishes.map((dish, index) => (
              <div key={dish.id} className="group cursor-pointer animate-slide-up" style={{ animationDelay: `${index * 0.2}s` }}>
                <div className="relative overflow-hidden rounded-xl shadow-card group-hover:shadow-warm transition-all duration-300">
                  <img
                    src={dish.image}
                    alt={dish.name}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent"></div>
                  
                  {/* Action Buttons */}
                  <div className="absolute top-3 right-3 flex space-x-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className={`bg-background/80 hover:bg-background ${savedDishes.includes(dish.id) ? 'text-red-500' : 'text-white'}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSaveDish(dish.id);
                      }}
                    >
                      <Heart className={`w-4 h-4 ${savedDishes.includes(dish.id) ? 'fill-current' : ''}`} />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="bg-background/80 hover:bg-background text-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShareDish(dish);
                      }}
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="absolute bottom-4 left-4 text-primary-foreground">
                    <h3 className="text-xl font-bold mb-1">{dish.name}</h3>
                    <div 
                      className="text-primary-foreground/80 hover:text-primary-foreground cursor-pointer flex items-center space-x-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRestaurantClick(dish.restaurant.id, e);
                      }}
                    >
                      <span>{dish.restaurant.name}</span>
                      <div className="flex items-center space-x-1">
                        <span className="text-xs">★ {dish.restaurant.rating}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Share Modal */}
      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        item={selectedItem}
      />
    </section>
  );
};

export default FeaturedSection;