"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Clock, Heart, TrendingUp, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import ShareModal from "@/components/ShareModal";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
const momosImage = "/assets/momos.jpg";
const dalBhatImage = "/assets/dal-bhat.jpg";
const restaurantImage = "/assets/restaurant-interior.jpg";

const PopularFoodsSection = () => {
  const router = useRouter();
  const [savedFoods, setSavedFoods] = useState<string[]>([]);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedFood, setSelectedFood] = useState<any>(null);
  const { toast } = useToast();

  // Helper function to format review count
  const formatReviewCount = (count: number) => {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + 'm';
    } else if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'k';
    }
    return count.toString();
  };

  const popularFoods = [
    {
      id: "1",
      name: "Dal Bhat",
      description: "Traditional Nepali meal with lentils, rice, and vegetables",
      rating: 4.8,
      reviewCount: 1254,
      priceRange: "Rs. 250",
      image: dalBhatImage,
      restaurant: {
        name: "Himalayan Delights",
        rating: 4.7,
        id: "rest-1"
      },
      category: "Traditional",
      tags: ["Vegetarian", "Healthy", "Traditional"]
    },
    {
      id: "2", 
      name: "Momos",
      description: "Steamed dumplings with various fillings",
      rating: 4.7,
      reviewCount: 892,
      priceRange: "Rs. 120",
      image: momosImage,
      restaurant: {
        name: "Momo Palace",
        rating: 4.6,
        id: "rest-2"
      },
      category: "Street Food",
      tags: ["Popular", "Quick Bite", "Street Food"]
    },
    {
      id: "3",
      name: "Newari Khaja",
      description: "Traditional Newari feast with multiple dishes",
      rating: 4.9,
      reviewCount: 456,
      priceRange: "Rs. 400",
      image: restaurantImage,
      restaurant: {
        name: "Heritage Kitchen",
        rating: 4.9,
        id: "rest-3"
      },
      category: "Cultural",
      tags: ["Cultural", "Special", "Traditional"]
    }
  ];

  const handleFoodClick = (foodId: string) => {
    // Navigate to a food detail page or restaurants serving this food
    router.push(`/food/${foodId}`);
  };

  const handleRestaurantClick = (restaurantId: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    router.push(`/restaurant/${restaurantId}`);
  };

  const handleSave = (foodId: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setSavedFoods(prev => {
      const isAlreadySaved = prev.includes(foodId);
      const newSavedFoods = isAlreadySaved 
        ? prev.filter(id => id !== foodId)
        : [...prev, foodId];
      
      toast({
        title: isAlreadySaved ? "Food Removed" : "Food Saved!",
        description: isAlreadySaved 
          ? "Food removed from your favorites" 
          : "Food saved to your favorites",
      });
      
      return newSavedFoods;
    });
  };

  const handleShare = (food: any, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setSelectedFood({
      id: food.id,
      type: 'food',
      name: food.name,
      image: food.image,
      description: food.description,
      rating: food.rating,
      price: food.priceRange,
    });
    setShareModalOpen(true);
  };

  return (
    <section className="py-16 bg-gradient-to-br from-warm-cream to-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-4">Popular Nepali Foods</h2>
          <p className="text-lg text-muted-foreground">Discover the most loved dishes in Nepali cuisine</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {popularFoods.map((food, index) => (
            <Card 
              key={food.id}
              className="group hover:shadow-warm transition-all duration-300 hover:-translate-y-2 bg-gradient-card border-primary/10 cursor-pointer animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => handleFoodClick(food.id)}
            >
              <div className="relative overflow-hidden rounded-t-lg">
                <img
                  src={food.image}
                  alt={food.name}
                  className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute top-4 left-4">
                  <Badge variant="default" className="bg-primary text-primary-foreground">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Trending
                  </Badge>
                </div>
                <div className="absolute top-4 right-4">
                  <Badge variant="secondary" className="bg-background/90 text-foreground">
                    {food.category}
                  </Badge>
                </div>
                
                {/* Save Button */}
                <div className="absolute top-14 right-4">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={`bg-background/80 hover:bg-background transition-colors ${savedFoods.includes(food.id) ? 'text-red-500' : 'text-gray-600'}`}
                    onClick={(e) => handleSave(food.id, e)}
                  >
                    <Heart className={`w-4 h-4 ${savedFoods.includes(food.id) ? 'fill-current' : ''}`} />
                  </Button>
                </div>
              </div>

              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-bold text-xl text-foreground group-hover:text-primary transition-colors">
                    {food.name}
                  </h3>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 fill-nepali-gold text-nepali-gold" />
                    <span className="font-semibold text-foreground">{food.rating}</span>
                    <span className="text-muted-foreground text-sm">({formatReviewCount(food.reviewCount)})</span>
                  </div>
                </div>

                <p className="text-muted-foreground mb-4 line-clamp-2">{food.description}</p>

                <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                  <span className="font-semibold text-primary">{food.priceRange}</span>
                </div>

                <div className="flex flex-wrap gap-1 mb-4">
                  {food.tags.map((tag, tagIndex) => (
                    <Badge key={tagIndex} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <div 
                    className="text-sm text-primary hover:text-primary/80 cursor-pointer font-medium flex items-center space-x-1"
                    onClick={(e) => handleRestaurantClick(food.restaurant.id, e)}
                  >
                    <span>{food.restaurant.name}</span>
                    <div className="flex items-center space-x-1">
                      <Star className="w-3 h-3 fill-nepali-gold text-nepali-gold" />
                      <span className="text-xs">{food.restaurant.rating}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-muted-foreground hover:text-primary"
                      onClick={(e) => handleShare(food, e)}
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFoodClick(food.id);
                      }}
                    >
                      Explore
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button variant="hero" size="lg">
            View All Popular Foods
          </Button>
        </div>
      </div>
      
      {/* Share Modal */}
      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        item={selectedFood}
      />
    </section>
  );
};

export default PopularFoodsSection;