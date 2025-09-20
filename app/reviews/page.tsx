"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Star, 
  ThumbsUp, 
  MessageCircle, 
  Filter,
  Search,
  Plus,
  Calendar,
  TrendingUp
} from "lucide-react";

const dalBhatImage = "/assets/dal-bhat.jpg";
const momosImage = "/assets/momos.jpg";
const restaurantImage = "/assets/restaurant-interior.jpg";

const Reviews = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [showWriteReview, setShowWriteReview] = useState(false);

  const reviews = [
    {
      id: "1",
      userName: "Priya Sharma",
      userAvatar: "P",
      restaurantName: "Himalayan Delights",
      restaurantImage: dalBhatImage,
      rating: 5,
      date: "2 days ago",
      comment: "Absolutely amazing food! The dal bhat was perfectly cooked and the service was excellent. The ambiance is very traditional and authentic. Highly recommend this place for anyone looking for genuine Nepali cuisine. The portions are generous and the flavors are just incredible.",
      helpfulCount: 12,
      isHelpful: false,
      images: [dalBhatImage],
      tags: ["Authentic", "Great Service", "Traditional"]
    },
    {
      id: "2",
      userName: "John Smith",
      userAvatar: "J",
      restaurantName: "Momo Palace",
      restaurantImage: momosImage,
      rating: 4,
      date: "1 week ago",
      comment: "Great atmosphere and delicious food. The momos were fantastic - perfectly steamed and the filling was very flavorful. Only reason for 4 stars is the wait time was a bit long during peak hours. But definitely worth the wait!",
      helpfulCount: 8,
      isHelpful: true,
      images: [momosImage],
      tags: ["Quick Bite", "Tasty", "Busy"]
    },
    {
      id: "3",
      userName: "Sita Rai",
      userAvatar: "S",
      restaurantName: "Heritage Kitchen",
      restaurantImage: restaurantImage,
      rating: 5,
      date: "2 weeks ago",
      comment: "Best traditional food in Thamel! The staff is very friendly and the portions are generous. The Newari khaja set was outstanding with so many different flavors. The cultural decorations add to the authentic dining experience. Will definitely come back with family.",
      helpfulCount: 15,
      isHelpful: false,
      images: [restaurantImage],
      tags: ["Family Friendly", "Cultural", "Generous Portions"]
    },
    {
      id: "4",
      userName: "Michael Johnson",
      userAvatar: "M",
      restaurantName: "Yak & Yeti",
      restaurantImage: restaurantImage,
      rating: 4,
      date: "3 weeks ago",
      comment: "Excellent international cuisine with a Nepali twist. The hotel restaurant provides a luxurious dining experience. Service is top-notch and the presentation is beautiful. Prices are on the higher side but justified by the quality.",
      helpfulCount: 6,
      isHelpful: true,
      images: [],
      tags: ["Luxury", "International", "Hotel"]
    },
    {
      id: "5",
      userName: "Anita Gurung",
      userAvatar: "A",
      restaurantName: "Momo Palace",
      restaurantImage: momosImage,
      rating: 5,
      date: "1 month ago",
      comment: "The best momos in Kathmandu! I've tried many places but this one stands out. The chutney is amazing and the momos are always fresh and hot. Great value for money. The staff is also very welcoming.",
      helpfulCount: 20,
      isHelpful: false,
      images: [momosImage],
      tags: ["Best Value", "Fresh", "Welcoming Staff"]
    }
  ];

  const trendingRestaurants = [
    { name: "Himalayan Delights", reviewCount: 245, avgRating: 4.8 },
    { name: "Momo Palace", reviewCount: 189, avgRating: 4.6 },
    { name: "Heritage Kitchen", reviewCount: 312, avgRating: 4.9 },
    { name: "Yak & Yeti", reviewCount: 456, avgRating: 4.7 }
  ];

  const filters = ["all", "5-star", "4-star", "recent", "helpful"];

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = review.restaurantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.comment.toLowerCase().includes(searchTerm.toLowerCase());
    
    switch (selectedFilter) {
      case "5-star":
        return matchesSearch && review.rating === 5;
      case "4-star":
        return matchesSearch && review.rating === 4;
      case "recent":
        return matchesSearch && (review.date.includes("day") || review.date.includes("week"));
      case "helpful":
        return matchesSearch && review.helpfulCount >= 10;
      default:
        return matchesSearch;
    }
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-8 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">Restaurant Reviews</h1>
            <p className="text-muted-foreground">Discover honest reviews from fellow food enthusiasts</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3 space-y-6">
              {/* Search and Filters */}
              <Card className="p-6">
                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                    <Input
                      placeholder="Search reviews by restaurant or content..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button 
                    variant="hero"
                    onClick={() => setShowWriteReview(true)}
                  >
                    <Plus className="w-4 h-4" />
                    Write Review
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {filters.map(filter => (
                    <Badge
                      key={filter}
                      variant={selectedFilter === filter ? "default" : "secondary"}
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                      onClick={() => setSelectedFilter(filter)}
                    >
                      <Filter className="w-3 h-3 mr-1" />
                      {filter === "all" ? "All Reviews" : 
                       filter === "5-star" ? "5 Star" :
                       filter === "4-star" ? "4 Star" :
                       filter === "recent" ? "Recent" : "Most Helpful"}
                    </Badge>
                  ))}
                </div>
              </Card>

              {/* Write Review Modal */}
              {showWriteReview && (
                <Card className="p-6 border-primary/20 bg-gradient-card">
                  <CardHeader className="px-0 pt-0">
                    <CardTitle className="flex items-center justify-between">
                      Write a Review
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setShowWriteReview(false)}
                      >
                        ✕
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-0 pb-0">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Restaurant</label>
                        <Input placeholder="Search for a restaurant..." />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Rating</label>
                        <div className="flex space-x-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} className="w-6 h-6 text-muted-foreground hover:text-nepali-gold cursor-pointer" />
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Your Review</label>
                        <Textarea 
                          placeholder="Share your experience..."
                          rows={4}
                        />
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="hero">Submit Review</Button>
                        <Button variant="outline" onClick={() => setShowWriteReview(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Reviews List */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold">
                    {filteredReviews.length} Reviews Found
                  </h2>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">Sort by:</span>
                    <Button variant="outline" size="sm">Most Recent</Button>
                  </div>
                </div>

                {filteredReviews.map((review) => (
                  <Card key={review.id} className="hover:shadow-card transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        {/* Restaurant Image */}
                        <img
                          src={review.restaurantImage}
                          alt={review.restaurantName}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        
                        <div className="flex-1">
                          {/* Header */}
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold text-lg text-primary hover:underline cursor-pointer">
                                {review.restaurantName}
                              </h3>
                              <div className="flex items-center space-x-2 mb-1">
                                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold">
                                  {review.userAvatar}
                                </div>
                                <span className="font-medium">{review.userName}</span>
                                <span className="text-muted-foreground">•</span>
                                <span className="text-muted-foreground text-sm">{review.date}</span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${i < review.rating ? 'fill-nepali-gold text-nepali-gold' : 'text-muted-foreground'}`}
                                />
                              ))}
                            </div>
                          </div>

                          {/* Review Content */}
                          <p className="text-muted-foreground mb-3 leading-relaxed">{review.comment}</p>

                          {/* Review Images */}
                          {review.images.length > 0 && (
                            <div className="flex space-x-2 mb-3">
                              {review.images.map((image, index) => (
                                <img
                                  key={index}
                                  src={image}
                                  alt="Review"
                                  className="w-20 h-20 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                                />
                              ))}
                            </div>
                          )}

                          {/* Tags */}
                          <div className="flex flex-wrap gap-1 mb-3">
                            {review.tags.map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>

                          {/* Actions */}
                          <div className="flex items-center space-x-4">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className={review.isHelpful ? "text-primary" : ""}
                            >
                              <ThumbsUp className="w-4 h-4 mr-1" />
                              Helpful ({review.helpfulCount})
                            </Button>
                            <Button variant="ghost" size="sm">
                              <MessageCircle className="w-4 h-4 mr-1" />
                              Reply
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="font-semibold text-lg mb-4 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-primary" />
                  Trending Restaurants
                </h3>
                <div className="space-y-3">
                  {trendingRestaurants.map((restaurant, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                      <div>
                        <h4 className="font-medium">{restaurant.name}</h4>
                        <p className="text-sm text-muted-foreground">{restaurant.reviewCount} reviews</p>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 fill-nepali-gold text-nepali-gold" />
                        <span className="text-sm font-medium">{restaurant.avgRating}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="font-semibold text-lg mb-4 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-primary" />
                  Review Guidelines
                </h3>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>• Be honest and helpful in your reviews</p>
                  <p>• Include details about food, service, and ambiance</p>
                  <p>• Add photos to make your review more valuable</p>
                  <p>• Be respectful to restaurants and other reviewers</p>
                  <p>• Update your review if your experience changes</p>
                </div>
              </Card>

              <Card className="p-6 bg-gradient-card border-primary/20">
                <h3 className="font-semibold text-lg mb-2">Share Your Experience</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Help others discover great food by sharing your honest reviews
                </p>
                <Button variant="hero" className="w-full">
                  <Plus className="w-4 h-4 mr-1" />
                  Write Your First Review
                </Button>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Reviews;