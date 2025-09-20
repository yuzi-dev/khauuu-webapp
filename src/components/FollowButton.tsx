'use client'

import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { useFollow } from '@/hooks/useFollow'
import { useAuth } from '@/contexts/AuthContext'
import { UserPlus, UserMinus, Users, Loader2, Clock } from 'lucide-react'

interface FollowButtonProps {
  userId: string
  variant?: 'default' | 'outline' | 'ghost' | 'secondary'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  showText?: boolean
  className?: string
  onFollowChange?: (isFollowing: boolean) => void
}

export default function FollowButton({
  userId,
  variant = 'default',
  size = 'default',
  showText = true,
  className = '',
  onFollowChange
}: FollowButtonProps) {
  const { session } = useAuth()
  const { 
    isLoading, 
    followStatus, 
    followUser, 
    unfollowUser, 
    getFollowStatus 
  } = useFollow(session)
  
  const [localLoading, setLocalLoading] = useState(false)

  useEffect(() => {
    if (userId) {
      getFollowStatus(userId)
    }
  }, [userId, getFollowStatus])

  const handleFollowToggle = async () => {
    if (!followStatus || followStatus.is_self) return

    setLocalLoading(true)
    try {
      let success = false
      if (followStatus.is_following) {
        success = await unfollowUser(userId)
      } else {
        success = await followUser(userId)
      }

      if (success && onFollowChange) {
        onFollowChange(!followStatus.is_following)
      }
    } finally {
      setLocalLoading(false)
    }
  }

  if (!followStatus) {
    return (
      <Button 
        variant={variant} 
        size={size} 
        disabled 
        className={className}
      >
        <Loader2 className="h-4 w-4 animate-spin" />
        {showText && size !== 'icon' && <span className="ml-2">Loading...</span>}
      </Button>
    )
  }

  if (followStatus.is_self) {
    return null
  }

  const isFollowing = followStatus.is_following
  const isPending = followStatus.is_pending
  const isMutual = followStatus.is_mutual
  const loading = isLoading || localLoading

  const getButtonContent = () => {
    if (loading) {
      return (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          {showText && size !== 'icon' && (
            <span className="ml-2">
              {isFollowing ? 'Unfollowing...' : 'Following...'}
            </span>
          )}
        </>
      )
    }

    if (isPending) {
      return (
        <>
          <Clock className="h-4 w-4" />
          {showText && size !== 'icon' && <span className="ml-2">Requested</span>}
        </>
      )
    }

    if (isMutual) {
      return (
        <>
          <Users className="h-4 w-4" />
          {showText && size !== 'icon' && <span className="ml-2">Friends</span>}
        </>
      )
    }

    if (isFollowing) {
      return (
        <>
          <UserMinus className="h-4 w-4" />
          {showText && size !== 'icon' && <span className="ml-2">Unfollow</span>}
        </>
      )
    }

    return (
      <>
        <UserPlus className="h-4 w-4" />
        {showText && size !== 'icon' && <span className="ml-2">Follow</span>}
      </>
    )
  }

  const getButtonVariant = () => {
    if (isPending) return 'secondary'
    if (isMutual) return 'secondary'
    if (isFollowing) return 'outline'
    return variant
  }

  return (
    <Button
      variant={getButtonVariant()}
      size={size}
      onClick={handleFollowToggle}
      disabled={loading}
      className={className}
    >
      {getButtonContent()}
    </Button>
  )
}