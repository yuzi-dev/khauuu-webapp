"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ShareModal from "@/components/ShareModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  Star, 
  MapPin, 
  Clock, 
  Heart, 
  Send,
  DollarSign,
  MessageCircle,
  Reply,
  ThumbsUp
} from "lucide-react";

const dalBhatImage = "/assets/dal-bhat.jpg";
const momosImage = "/assets/momos.jpg";
const restaurantImage = "/assets/restaurant-interior.jpg";

const FoodDetail = () => {
  const params = useParams();
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const { toast } = useToast();

  // Mock data - in real app, this would come from API
  const food = {
    id: "1",
    name: "Dal Bhat",
    category: "Traditional Nepali",
    description: "A traditional Nepali meal consisting of steamed rice served with lentil soup, vegetable curry, pickles, and papad. This wholesome and nutritious meal is a staple in Nepali households and represents the heart of Nepali cuisine.",
    images: [dalBhatImage, momosImage],
    rating: 4.8,
    reviewCount: 1247,
    priceRange: "₹₹",
    origin: "Nepal",
    difficulty: "Medium",
    restaurant: {
      id: "1",
      name: "Himalayan Delights",
      cuisine: "Traditional Nepali",
      rating: 4.8,
      reviewCount: 245,
      priceRange: "₹₹",
      distance: "0.8 km",
      image: restaurantImage,
      address: "Thamel, Kathmandu",
      phone: "+977-1-4444444",
      openingHours: "10:00 AM - 10:00 PM"
    }
  };

  const formatReviewCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  const handleSave = () => {
    setIsFavorite(!isFavorite);
    toast({
      title: isFavorite ? "Food Removed" : "Food Saved!",
      description: isFavorite 
        ? "Food removed from your favorites" 
        : "Food saved to your favorites",
    });
  };

  const handleShare = () => {
    setShareModalOpen(true);
  };

  const handleRestaurantClick = () => {
    router.push(`/restaurant/${food.restaurant.id}`);
  };

  const shareItem = {
    id: food.id,
    type: 'food' as const,
    name: food.name,
    image: food.images[0],
    description: food.description,
    rating: food.rating,
    price: food.priceRange,
  };

  const comments = [
    {
      id: "1",
      userName: "Ramesh Thapa",
      avatar: "/assets/avatar1.jpg",
      rating: 5,
      date: "3 days ago",
      comment: "Absolutely authentic Dal Bhat! The combination of flavors reminds me of my grandmother's cooking. Perfect balance of spices and textures.",
      likes: 18,
      location: "Tried at Himalayan Delights",
      replies: [
        {
          id: "1-1",
          userName: "Sarah Johnson",
          avatar: "/assets/avatar2.jpg",
          date: "2 days ago",
          comment: "I totally agree! Which restaurant did you try it at?",
          likes: 3
        },
        {
          id: "1-2",
          userName: "Ramesh Thapa",
          avatar: "/assets/avatar1.jpg",
          date: "2 days ago",
          comment: "I tried it at Himalayan Delights in Thamel. Highly recommend!",
          likes: 5
        }
      ]
    },
    {
      id: "2", 
      userName: "Sarah Johnson",
      avatar: "/assets/avatar2.jpg",
      rating: 5,
      date: "1 week ago",
      comment: "As a tourist, this was my introduction to Nepali cuisine. The restaurant explained each component beautifully. Such a wholesome and satisfying meal!",
      likes: 12,
      location: "Tried at Traditional Kitchen",
      replies: [
        {
          id: "2-1",
          userName: "Bikash Gurung",
          avatar: "/assets/avatar3.jpg",
          date: "6 days ago",
          comment: "That's so wonderful! Did you try the pickles too? They're the best part!",
          likes: 2
        }
      ]
    },
    {
      id: "3",
      userName: "Bikash Gurung", 
      avatar: "/assets/avatar3.jpg",
      rating: 4,
      date: "2 weeks ago",
      comment: "Good traditional preparation, though I prefer it with more spice. The dal was perfectly cooked and the vegetables were fresh.",
      likes: 8,
      location: "Tried at Heritage Restaurant",
      replies: []
    }
  ];

  const similarFoods = [
    {
      id: "2",
      name: "Newari Khaja Set",
      category: "Traditional",
      rating: 4.7,
      reviewCount: 892,
      priceRange: "₹₹₹",
      image: dalBhatImage,
      restaurant: {
        name: "Heritage Kitchen",
        rating: 4.9
      }
    },
    {
      id: "3",
      name: "Thukpa",
      category: "Tibetan",
      rating: 4.5,
      reviewCount: 654,
      priceRange: "₹₹",
      image: momosImage,
      restaurant: {
        name: "Himalayan Cafe",
        rating: 4.6
      }
    },
    {
      id: "4",
      name: "Sel Roti",
      category: "Traditional Sweet",
      rating: 4.6,
      reviewCount: 423,
      priceRange: "₹",
      image: restaurantImage,
      restaurant: {
        name: "Sweet Corner",
        rating: 4.4
      }
    },
    {
      id: "5",
      name: "Gundruk",
      category: "Traditional",
      rating: 4.3,
      reviewCount: 321,
      priceRange: "₹₹",
      image: dalBhatImage,
      restaurant: {
        name: "Village Kitchen",
        rating: 4.5
      }
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-8 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Image Gallery */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8 rounded-xl overflow-hidden">
            <div>
              <img
                src={food.images[0]}
                alt={food.name}
                className="w-full h-64 lg:h-96 object-cover rounded-lg"
              />
            </div>
            <div className="space-y-4">
              <img
                src={food.images[1]}
                alt={`${food.name} preparation`}
                className="w-full h-44 lg:h-44 object-cover rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Food Header */}
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-foreground mb-2">{food.name}</h1>
                    <p className="text-lg text-muted-foreground mb-2">{food.category}</p>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Star className="w-5 h-5 fill-nepali-gold text-nepali-gold" />
                        <span className="font-semibold">{food.rating}</span>
                        <span className="text-muted-foreground">({formatReviewCount(food.reviewCount)} reviews)</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <DollarSign className="w-4 h-4" />
                        <span>{food.priceRange}</span>
                      </div>
                      <Badge variant="secondary">
                        <MapPin className="w-3 h-3 mr-1" />
                        {food.origin}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant={isFavorite ? "default" : "outline"}
                      size="icon"
                      onClick={handleSave}
                    >
                      <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                    </Button>
                    <Button variant="outline" size="icon" onClick={handleShare}>
                      <Send className="w-5 h-5" />
                    </Button>
                  </div>
                </div>

                <p className="text-muted-foreground mb-6">{food.description}</p>
              </div>

              {/* Restaurant Card */}
              <Card 
                className="p-4 cursor-pointer hover:shadow-lg transition-shadow border-primary/20"
                onClick={handleRestaurantClick}
              >
                <div className="flex items-center space-x-4">
                  <img
                    src={food.restaurant.image}
                    alt={food.restaurant.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{food.restaurant.name}</h3>
                    <p className="text-muted-foreground">{food.restaurant.cuisine}</p>
                    <div className="flex items-center space-x-4 mt-1">
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 fill-nepali-gold text-nepali-gold" />
                        <span className="text-sm font-medium">{food.restaurant.rating}</span>
                        <span className="text-sm text-muted-foreground">({food.restaurant.reviewCount} reviews)</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{food.restaurant.distance}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline">{food.restaurant.priceRange}</Badge>
                    <p className="text-xs text-muted-foreground mt-1">Click to view</p>
                  </div>
                </div>
              </Card>

              {/* Reviews Section */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">Comments & Reviews</h3>
                  <Button variant="hero">Write a Review</Button>
                </div>
                
                <div className="space-y-6">
                  {comments.map((comment) => (
                    <Card key={comment.id} className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white font-semibold">
                          {comment.userName[0]}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h4 className="font-semibold">{comment.userName}</h4>
                              <div className="flex items-center space-x-2">
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-4 h-4 ${i < comment.rating ? 'fill-nepali-gold text-nepali-gold' : 'text-muted-foreground'}`}
                                    />
                                  ))}
                                </div>
                                <span className="text-sm text-muted-foreground">{comment.date}</span>
                              </div>
                              <p className="text-xs text-primary mt-1">{comment.location}</p>
                            </div>
                          </div>
                          <p className="text-muted-foreground mb-3">{comment.comment}</p>
                          <div className="flex items-center space-x-4 text-sm">
                            <Button variant="ghost" size="sm" className="p-0 h-auto">
                              <ThumbsUp className="w-4 h-4 mr-1" />
                              {comment.likes}
                            </Button>
                            <Button variant="ghost" size="sm" className="p-0 h-auto">
                              <Reply className="w-4 h-4 mr-1" />
                              Reply
                            </Button>
                          </div>
                          
                          {/* Replies */}
                          {comment.replies.length > 0 && (
                            <div className="mt-4 space-y-3 pl-4 border-l-2 border-muted">
                              {comment.replies.map((reply) => (
                                <div key={reply.id} className="flex items-start space-x-3">
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-secondary to-secondary/80 flex items-center justify-center text-white text-sm font-semibold">
                                    {reply.userName[0]}
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-1">
                                      <h5 className="font-medium text-sm">{reply.userName}</h5>
                                      <span className="text-xs text-muted-foreground">{reply.date}</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-2">{reply.comment}</p>
                                    <div className="flex items-center space-x-3 text-xs">
                                      <Button variant="ghost" size="sm" className="p-0 h-auto text-xs">
                                        <ThumbsUp className="w-3 h-3 mr-1" />
                                        {reply.likes}
                                      </Button>
                                      <Button variant="ghost" size="sm" className="p-0 h-auto text-xs">
                                        <Reply className="w-3 h-3 mr-1" />
                                        Reply
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar - Similar Foods */}
            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="font-semibold text-lg mb-4">Similar Foods</h3>
                <div className="flex overflow-x-auto space-x-4 pb-2">
                  {similarFoods.map((similar) => (
                    <div 
                      key={similar.id} 
                      className="flex-shrink-0 w-48 cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => router.push(`/food/${similar.id}`)}
                    >
                      <Card className="overflow-hidden">
                        <div className="relative">
                          <img
                            src={similar.image}
                            alt={similar.name}
                            className="w-full h-32 object-cover"
                          />
                          <div className="absolute top-2 right-2">
                            <Badge variant="secondary" className="text-xs">
                              {similar.priceRange}
                            </Badge>
                          </div>
                        </div>
                        <CardContent className="p-3">
                          <h4 className="font-medium text-sm mb-1 truncate">{similar.name}</h4>
                          <p className="text-xs text-muted-foreground mb-2">{similar.category}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-1">
                              <Star className="w-3 h-3 fill-nepali-gold text-nepali-gold" />
                              <span className="text-xs font-medium">{similar.rating}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {formatReviewCount(similar.reviewCount)} reviews
                            </span>
                          </div>
                          <div className="mt-2 pt-2 border-t border-border">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-primary font-medium">
                                {similar.restaurant.name}
                              </span>
                              <div className="flex items-center space-x-1">
                                <Star className="w-2 h-2 fill-nepali-gold text-nepali-gold" />
                                <span className="text-xs">{similar.restaurant.rating}</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      
      {/* Share Modal */}
      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        item={shareItem}
      />
    </div>
  );
};

export default FoodDetail;