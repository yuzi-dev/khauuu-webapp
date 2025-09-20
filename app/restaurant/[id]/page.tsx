"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Star, Heart, Send, MapPin, Phone, Globe, Clock, DollarSign, Wifi, Car, CreditCard, Users, ThumbsUp, Reply, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ShareModal from '@/components/ShareModal';

// Import images
import restaurantImage from '/public/assets/restaurant-interior.jpg';
import momosImage from '/public/assets/momos.jpg';
import dalBhatImage from '/public/assets/dal-bhat.jpg';

const RestaurantDetail = () => {
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [showMenuImages, setShowMenuImages] = useState(false);

  // Mock restaurant data
  const restaurant = {
    id: "1",
    name: "Himalayan Delights",
    cuisine: "Traditional Nepali • Tibetan",
    rating: 4.8,
    reviewCount: 234,
    priceRange: "₹₹",
    isOpen: true,
    description: "Experience authentic Nepali and Tibetan cuisine in the heart of Thamel. Our family-owned restaurant has been serving traditional dishes for over 20 years, using recipes passed down through generations.",
    address: "Thamel, Kathmandu, Nepal",
    phone: "+977-1-4441234",
    website: "www.himalayandelights.com",
    openingHours: "10:00 AM - 10:00 PM",
    images: [
      restaurantImage,
      momosImage,
      dalBhatImage,
      restaurantImage
    ],
    amenities: ["WiFi", "Parking", "Card Payment", "Family Friendly"],
    specialties: ["Dal Bhat", "Momos", "Thukpa", "Gundruk", "Sel Roti"],
    menu: [
      {
        category: "Main Dishes",
        items: [
          {
            name: "Traditional Dal Bhat",
            description: "Lentil soup with rice, vegetables, and pickles",
            price: "₹350"
          },
          {
            name: "Chicken Curry",
            description: "Spicy chicken curry with traditional spices",
            price: "₹450"
          },
          {
            name: "Mutton Sekuwa",
            description: "Grilled mutton with Nepali spices",
            price: "₹650"
          }
        ]
      },
      {
        category: "Appetizers",
        items: [
          {
            name: "Chicken Momos (10 pcs)",
            description: "Steamed dumplings with chicken filling",
            price: "₹280"
          },
          {
            name: "Veg Momos (10 pcs)",
            description: "Steamed dumplings with vegetable filling",
            price: "₹220"
          },
          {
            name: "Chatamari",
            description: "Nepali pizza with toppings",
            price: "₹180"
          }
        ]
      },
      {
        category: "Beverages",
        items: [
          {
            name: "Butter Tea",
            description: "Traditional Tibetan butter tea",
            price: "₹120"
          },
          {
            name: "Lassi",
            description: "Sweet or salty yogurt drink",
            price: "₹80"
          },
          {
            name: "Chiya",
            description: "Nepali milk tea",
            price: "₹50"
          }
        ]
      }
    ],
    menuImages: [
      restaurantImage,
      momosImage,
      dalBhatImage
    ]
  };

  // Mock reviews data
  const reviews = [
    {
      id: "1",
      userName: "Sarah Johnson",
      avatar: "/assets/avatar1.jpg",
      rating: 5,
      date: "2 days ago",
      comment: "Amazing authentic Nepali food! The dal bhat was incredible and the service was excellent. The atmosphere really makes you feel like you're in Nepal. Highly recommend!",
      likes: 12,
      location: "Tried at Himalayan Delights",
      replies: [
        {
          id: "1-1",
          userName: "Restaurant Owner",
          avatar: "/assets/restaurant-avatar.jpg",
          date: "1 day ago",
          comment: "Thank you so much for your kind words! We're delighted you enjoyed your experience.",
          likes: 3
        }
      ]
    },
    {
      id: "2",
      userName: "John Smith",
      avatar: "/assets/avatar2.jpg",
      rating: 4,
      date: "1 week ago", 
      comment: "Great atmosphere and delicious food. The momos were fantastic. Only reason for 4 stars is the wait time was a bit long.",
      likes: 8,
      location: "Tried at Himalayan Delights",
      replies: []
    },
    {
      id: "3",
      userName: "Sita Rai",
      avatar: "/assets/avatar3.jpg",
      rating: 5,
      date: "2 weeks ago",
      comment: "Best traditional food in Thamel! The staff is very friendly and the portions are generous. Will definitely come back.",
      likes: 15,
      location: "Tried at Himalayan Delights",
      replies: []
    }
  ];

  const similarRestaurants = [
    {
      id: "2",
      name: "Momo Palace",
      category: "Tibetan • Nepali",
      rating: 4.6,
      reviewCount: 189,
      priceRange: "₹",
      image: momosImage,
      restaurant: {
        name: "Momo Palace",
        rating: 4.6
      }
    },
    {
      id: "3",
      name: "Heritage Kitchen",
      category: "Newari • Traditional",
      rating: 4.9,
      reviewCount: 312,
      priceRange: "₹₹₹",
      image: restaurantImage,
      restaurant: {
        name: "Heritage Kitchen",
        rating: 4.9
      }
    },
    {
      id: "4",
      name: "Yak & Yeti",
      category: "International • Nepali",
      rating: 4.7,
      reviewCount: 156,
      priceRange: "₹₹₹",
      image: dalBhatImage,
      restaurant: {
        name: "Yak & Yeti",
        rating: 4.7
      }
    },
    {
      id: "5",
      name: "Traditional Kitchen",
      category: "Traditional Nepali",
      rating: 4.5,
      reviewCount: 234,
      priceRange: "₹₹",
      image: restaurantImage,
      restaurant: {
        name: "Traditional Kitchen",
        rating: 4.5
      }
    },
    {
      id: "6",
      name: "Everest Dining",
      category: "Mountain Cuisine",
      rating: 4.8,
      reviewCount: 298,
      priceRange: "₹₹₹",
      image: dalBhatImage,
      restaurant: {
        name: "Everest Dining",
        rating: 4.8
      }
    }
  ];

  const formatReviewCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  const handleSave = () => {
    setIsFavorite(!isFavorite);
    toast({
      title: isFavorite ? "Restaurant Removed" : "Restaurant Saved!",
      description: isFavorite 
        ? "Restaurant removed from your favorites" 
        : "Restaurant saved to your favorites",
    });
  };

  const handleShare = () => {
    setShareModalOpen(true);
  };

  const handleMenuPhotos = () => {
    setShowMenuImages(!showMenuImages);
    toast({
      title: showMenuImages ? "Menu Photos Hidden" : "Menu Photos Shown",
      description: showMenuImages 
        ? "Switched back to text menu" 
        : "Now showing menu photo gallery",
    });
  };

  const shareItem = {
    id: restaurant.id,
    type: 'restaurant' as const,
    name: restaurant.name,
    image: restaurant.images[0],
    description: `${restaurant.cuisine} • ${restaurant.address}`,
    rating: restaurant.rating,
    price: restaurant.priceRange,
    location: restaurant.address,
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-8 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Image Gallery */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8 rounded-xl overflow-hidden">
            <div className="lg:col-span-2">
              <img
                src={restaurant.images[0]}
                alt={restaurant.name}
                className="w-full h-64 lg:h-96 object-cover"
              />
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
              {restaurant.images.slice(1).map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`${restaurant.name} ${index + 2}`}
                  className="w-full h-32 lg:h-[11.5rem] object-cover rounded-lg"
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Restaurant Header */}
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-foreground mb-2">{restaurant.name}</h1>
                    <p className="text-lg text-muted-foreground mb-2">{restaurant.cuisine}</p>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Star className="w-5 h-5 fill-nepali-gold text-nepali-gold" />
                        <span className="font-semibold">{restaurant.rating}</span>
                        <span className="text-muted-foreground">({restaurant.reviewCount} reviews)</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <DollarSign className="w-4 h-4" />
                        <span>{restaurant.priceRange}</span>
                      </div>
                      <Badge variant={restaurant.isOpen ? "default" : "secondary"}>
                        {restaurant.isOpen ? "Open" : "Closed"}
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

                <p className="text-muted-foreground mb-4">{restaurant.description}</p>

                {/* Amenities */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {restaurant.amenities.map((amenity, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                      {amenity === "WiFi" && <Wifi className="w-3 h-3" />}
                      {amenity === "Parking" && <Car className="w-3 h-3" />}
                      {amenity === "Card Payment" && <CreditCard className="w-3 h-3" />}
                      {amenity === "Family Friendly" && <Users className="w-3 h-3" />}
                      <span>{amenity}</span>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Info Section */}
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4">Restaurant Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">Contact Information</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-primary" />
                        <span>{restaurant.phone}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Globe className="w-4 h-4 text-primary" />
                        <span>{restaurant.website}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-primary" />
                        <span>{restaurant.address}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Opening Hours</h4>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-primary" />
                      <span>{restaurant.openingHours}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="font-semibold mb-2">Specialties</h4>
                  <div className="flex flex-wrap gap-2">
                    {restaurant.specialties.map((specialty, index) => (
                      <Badge key={index} variant="outline">{specialty}</Badge>
                    ))}
                  </div>
                </div>
              </Card>

              {/* Menu Section */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold">Menu</h3>
                  <Button
                    variant={showMenuImages ? "default" : "outline"}
                    size="sm"
                    onClick={handleMenuPhotos}
                    className="flex items-center space-x-2"
                  >
                    <ImageIcon className="w-4 h-4" />
                    <span>{showMenuImages ? "Hide Menu Photos" : "Menu Photos"}</span>
                  </Button>
                </div>

                <div className="max-h-96 overflow-y-auto border rounded-lg p-4">
                  {showMenuImages ? (
                    // Menu Images View
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold mb-3">Menu Gallery</h4>
                      <div className="grid grid-cols-1 gap-4">
                        {restaurant.menuImages.map((menuImage, index) => (
                          <div key={index} className="relative">
                            <img
                              src={menuImage || restaurantImage}
                              alt={`Menu Page ${index + 1}`}
                              className="w-full h-auto max-h-96 object-contain rounded-lg border shadow-sm"
                            />
                            <div className="absolute top-2 left-2">
                              <Badge variant="secondary">Page {index + 1}</Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    // Text Menu View
                    <div className="space-y-6">
                      {restaurant.menu.map((category, categoryIndex) => (
                        <div key={categoryIndex}>
                          <h4 className="text-lg font-semibold mb-3">{category.category}</h4>
                          <div className="space-y-3">
                            {category.items.map((item, itemIndex) => (
                               <div key={itemIndex} className="p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                                 <h5 className="font-semibold mb-1">{item.name}</h5>
                                 <p className="text-muted-foreground text-sm mb-2">{item.description}</p>
                                 <p className="text-lg font-bold text-primary">{item.price}</p>
                               </div>
                             ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>

              {/* Reviews Section */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold">Comments & Reviews</h3>
                  <Button variant="hero">Write a Review</Button>
                </div>
                
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b border-border pb-6 last:border-b-0">
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white font-semibold">
                          {review.userName[0]}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h4 className="font-semibold">{review.userName}</h4>
                              <div className="flex items-center space-x-2">
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-4 h-4 ${i < review.rating ? 'fill-nepali-gold text-nepali-gold' : 'text-muted-foreground'}`}
                                    />
                                  ))}
                                </div>
                                <span className="text-sm text-muted-foreground">{review.date}</span>
                              </div>
                            </div>
                          </div>
                          <p className="text-muted-foreground mb-3">{review.comment}</p>
                          <div className="flex items-center space-x-4 text-sm">
                            <Button variant="ghost" size="sm" className="flex items-center space-x-1">
                              <ThumbsUp className="w-3 h-3" />
                              <span>Helpful ({review.likes})</span>
                            </Button>
                            <Button variant="ghost" size="sm" className="flex items-center space-x-1">
                              <Reply className="w-3 h-3" />
                              <span>Reply</span>
                            </Button>
                          </div>

                          {/* Replies */}
                          {review.replies && review.replies.length > 0 && (
                            <div className="mt-4 ml-4 space-y-3">
                              {review.replies.map((reply) => (
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
                                    <Button variant="ghost" size="sm" className="flex items-center space-x-1 text-xs">
                                      <ThumbsUp className="w-3 h-3" />
                                      <span>Helpful ({reply.likes})</span>
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="font-semibold text-lg mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Button variant="hero" className="w-full">
                    <a href={`https://maps.google.com/?q=${restaurant.address}`} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4" />
                      <span>Get Directions</span>
                    </a>
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Phone className="w-4 h-4" />
                    Call Restaurant
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsShareModalOpen(true)}
                    className="flex items-center gap-2"
                  >
                    <Send className="w-5 h-5" />
                    Share
                  </Button>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="font-semibold text-lg mb-4">Similar Restaurants</h3>
                <div className="flex overflow-x-auto space-x-4 pb-2">
                  {similarRestaurants.map((similar) => (
                    <div 
                      key={similar.id} 
                      className="flex-shrink-0 w-48 cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => router.push(`/restaurant/${similar.id}`)}
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
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        item={shareItem}
      />
    </div>
  );
};

export default RestaurantDetail;