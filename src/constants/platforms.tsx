import React from 'react';
import { MessageSquare, Users, Camera, Globe, Briefcase, Play, TrendingUp, Home } from 'lucide-react';
import discordIcon from '@/assets/discord-icon.png';

export interface Platform {
  id: string;
  name: string;
  site: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

export const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
  </svg>
);

export const TwitterIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

export const DiscordIcon = ({ className }: { className?: string }) => (
  <img src={discordIcon} alt="Discord" className={className} />
);

export const platforms: Platform[] = [
  {
    id: 'discord',
    name: 'Discord',
    site: '(site:discord.com OR site:discord.gg OR site:discordapp.com/channels)',
    icon: DiscordIcon,
    color: 'text-research-blue-dark'
  },
  {
    id: 'facebook',
    name: 'Facebook',
    site: 'site:facebook.com',
    icon: Users,
    color: 'text-research-blue-dark'
  },
  {
    id: 'industry-forums',
    name: 'Industry Forums',
    site: '(site:stackoverflow.com OR site:dev.to OR site:hackernews.com OR site:warriorforum.com OR site:blackhatworld.com OR site:indiehackers.com OR site:quora.com OR site:producthunt.com) intext:("biggest challenge" OR "struggling with" OR "need help" OR "frustrated" OR "pain point")',
    icon: Users,
    color: 'text-research-blue-dark'
  },
  {
    id: 'instagram',
    name: 'Instagram',
    site: 'site:instagram.com',
    icon: Camera,
    color: 'text-research-blue-dark'
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    site: 'site:linkedin.com',
    icon: Briefcase,
    color: 'text-research-blue-dark'
  },
  {
    id: 'nextdoor',
    name: 'Nextdoor',
    site: 'site:nextdoor.com',
    icon: Home,
    color: 'text-research-blue-dark'
  },
  {
    id: 'reddit',
    name: 'Reddit',
    site: 'site:reddit.com',
    icon: MessageSquare,
    color: 'text-research-blue-dark'
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    site: 'site:tiktok.com',
    icon: TikTokIcon,
    color: 'text-research-blue-dark'
  },
  {
    id: 'twitter',
    name: 'Twitter',
    site: 'site:twitter.com',
    icon: TwitterIcon,
    color: 'text-research-blue-dark'
  },
  {
    id: 'youtube',
    name: 'YouTube',
    site: 'site:youtube.com',
    icon: Play,
    color: 'text-research-accent'
  },
  {
    id: 'google-trends',
    name: 'Google Trends',
    site: '',
    icon: TrendingUp,
    color: 'text-research-blue-dark'
  }
];

export const platformDescriptions: Record<string, string> = {
  discord: 'Chat and voice platform for communities',
  facebook: 'Social networking platform',
  instagram: 'Photo and video sharing platform',
  linkedin: 'Professional networking platform',
  nextdoor: 'Neighborhood social network',
  reddit: 'Discussion forums and communities',
  tiktok: 'Short-form video platform',
  twitter: 'Microblogging and social news platform',
  youtube: 'Video sharing platform',
  'industry-forums': 'Technical and business discussion forums'
};

export const platformNames: Record<string, string> = {
  discord: 'Discord',
  facebook: 'Facebook',
  reddit: 'Reddit',
  'google-trends': 'Google Trends',
  google: 'Google',
  twitter: 'Twitter',
  linkedin: 'LinkedIn',
  instagram: 'Instagram',
  youtube: 'YouTube',
  tiktok: 'TikTok',
  'industry-forums': 'Industry Forums'
};

// Platform access tiers (matching pricing page)
export const PLATFORM_TIERS = {
  FREE: ['reddit', 'youtube', 'twitter', 'facebook', 'industry-forums'], // Free users get 5 platforms to try
  STARTER: ['reddit', 'youtube', 'twitter'], // $9.99 - 3 platforms
  PROFESSIONAL: ['reddit', 'youtube', 'twitter', 'linkedin', 'facebook', 'tiktok'], // $19.99 - 6 platforms
  AGENCY: ['reddit', 'youtube', 'twitter', 'linkedin', 'facebook', 'tiktok', 'discord', 'industry-forums', 'instagram', 'nextdoor', 'google-trends'], // $29.99 - All 11 platforms
} as const;

// Helper to get allowed platforms based on subscription tier
export const getAllowedPlatforms = (
  isPro: boolean,
  isPremium: boolean,
  isEnterprise: boolean,
  isAdmin: boolean,
  subscriptionTier?: string,
  hasCredits?: boolean
): string[] => {
  // Admin gets everything
  if (isAdmin) return PLATFORM_TIERS.AGENCY;

  // Enterprise gets everything
  if (isEnterprise) return PLATFORM_TIERS.AGENCY;

  // Check specific subscription tier
  if (subscriptionTier === 'agency' || isPro) return PLATFORM_TIERS.AGENCY;
  if (subscriptionTier === 'professional' || isPremium) return PLATFORM_TIERS.PROFESSIONAL;
  if (subscriptionTier === 'starter') return PLATFORM_TIERS.STARTER;

  // Credit pack users get Starter tier access (Reddit, YouTube, Twitter)
  if (hasCredits) return PLATFORM_TIERS.STARTER;

  // Free tier
  return PLATFORM_TIERS.FREE;
};
