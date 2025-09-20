"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import FollowButton from "@/components/FollowButton";
import FollowStats from "@/components/FollowStats";
import { useFollow } from "@/hooks/useFollow";
import { 
  Grid3X3, 
  Bookmark, 
  MoreHorizontal,
  Heart,
  MessageCircle,
  Send,
  Share,
  MapPin,
  Calendar,
  Star,
  ArrowLeft
} from "lucide-react";

interface Profile {
  user_id: string;
  username: string;
  full_name: string;
  bio: string;
  avatar_url: string;
  location: string;
  website: string;
  is_private: boolean;
  followers_count: number;
  following_count: number;
  created_at: string;
}

interface Review {
  id: string;
  rating: number;
  review_text: string;
  review_images: string[];
  created_at: string;
  restaurant_id: string;
  food_id: string;
  likes_count: number;
  comments_count: number;
}

interface SavedItem {
  id: string;
  item_type: 'restaurant' | 'food';
  item_id: string;
  created_at: string;
}

export default function UserProfile() {
  const { user, session } = useAuth();
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const userId = params?.id as string;
  const { followStatus, getFollowStatus } = useFollow(session);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("posts");

  useEffect(() => {
    if (userId) {
      fetchProfile();
      getFollowStatus(userId);
    }
  }, [userId, user, getFollowStatus]);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`/api/users?id=${userId}`, {
        headers: session?.access_token ? {
          'Authorization': `Bearer ${session.access_token}`
        } : {}
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data.user);
        setReviews(data.reviews || []);
        setSavedItems(data.savedItems || []);
      } else {
        toast({
          title: "Error",
          description: "Failed to load profile",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading profile...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile not found</h2>
            <p className="text-gray-600 mb-4">The user you're looking for doesn't exist.</p>
            <Button onClick={() => router.back()} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const isOwnProfile = user?.id === userId;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={profile.avatar_url} alt={profile.username} />
              <AvatarFallback className="text-2xl">
                {profile.full_name?.charAt(0) || profile.username?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{profile.full_name || profile.username}</h1>
                  <p className="text-gray-600">@{profile.username}</p>
                </div>
                
                {!isOwnProfile && user && (
                  <div className="flex gap-2">
                    <FollowButton 
                      userId={userId}
                      onFollowChange={fetchProfile}
                    />
                    <Button variant="outline" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="flex gap-6 mb-4">
                <div className="text-center">
                  <div className="font-bold text-lg">{reviews.length}</div>
                  <div className="text-gray-600 text-sm">Posts</div>
                </div>
                <FollowStats 
                  userId={userId}
                  followersCount={profile.followers_count || 0}
                  followingCount={profile.following_count || 0}
                />
              </div>
              
              {profile.bio && (
                <p className="text-gray-700 mb-2">{profile.bio}</p>
              )}
              
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                {profile.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {profile.location}
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Joined {new Date(profile.created_at).toLocaleDateString('en-US', { 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </div>
              </div>
              
              {profile.is_private && (
                <Badge variant="secondary" className="mt-2">
                  Private Account
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="posts" className="flex items-center gap-2">
              <Grid3X3 className="h-4 w-4" />
              Posts
            </TabsTrigger>
            {isOwnProfile && (
              <TabsTrigger value="saved" className="flex items-center gap-2">
                <Bookmark className="h-4 w-4" />
                Saved
              </TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="posts" className="mt-6">
            {profile.is_private && !isOwnProfile && !followStatus?.is_following ? (
              <div className="text-center py-12">
                <div className="text-gray-500 mb-4">This account is private</div>
                <p className="text-gray-400">Follow to see their posts</p>
              </div>
            ) : reviews.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reviews.map((review) => (
                  <div key={review.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                    {review.review_images && review.review_images.length > 0 && (
                      <div className="aspect-square bg-gray-200">
                        <img 
                          src={review.review_images[0]} 
                          alt="Review" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="p-4">
                      <div className="flex items-center gap-1 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                          />
                        ))}
                      </div>
                      {review.review_text && (
                        <p className="text-gray-700 text-sm mb-3 line-clamp-3">{review.review_text}</p>
                      )}
                      <div className="flex items-center justify-between text-gray-500 text-sm">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Heart className="h-4 w-4" />
                            {review.likes_count}
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageCircle className="h-4 w-4" />
                            {review.comments_count}
                          </div>
                        </div>
                        <div>
                          {new Date(review.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Grid3X3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <div className="text-gray-500 mb-2">No posts yet</div>
                <p className="text-gray-400">
                  {isOwnProfile ? "Share your first food experience!" : "No posts to show"}
                </p>
              </div>
            )}
          </TabsContent>
          
          {isOwnProfile && (
            <TabsContent value="saved" className="mt-6">
              {savedItems.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {savedItems.map((item) => (
                    <div key={item.id} className="bg-white rounded-lg shadow-sm p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Badge variant="outline" className="mb-2">
                            {item.item_type}
                          </Badge>
                          <p className="text-sm text-gray-600">
                            Saved {new Date(item.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Bookmark className="h-5 w-5 text-orange-500 fill-current" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Bookmark className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <div className="text-gray-500 mb-2">No saved items</div>
                  <p className="text-gray-400">Items you save will appear here</p>
                </div>
              )}
            </TabsContent>
          )}
        </Tabs>
      </div>
      
      <Footer />
    </div>
  );
}