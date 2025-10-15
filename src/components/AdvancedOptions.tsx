import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Checkbox } from './ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Settings } from 'lucide-react';
import { platforms } from '@/constants/platforms';

interface AdvancedOptionsInterface {
  facebook: {
    groupId: string;
    publicPostsOnly: boolean;
    communityType: string[];
  };
  reddit: {
    selfPostsOnly: boolean;
    minScore: boolean;
    scoreThreshold: number;
    author: string;
  };
  tiktok: {
    hashtagTrends: string[];
    contentTypes: string[];
    soundTrends: boolean;
    challengeId: boolean;
    creatorCollabs: string[];
    creatorTier: string[];
    specificCreator: string;
    minEngagement: boolean;
    engagementThreshold: number;
    viralPatterns: string[];
    brandMentions: boolean;
    crossPlatformTrends: boolean;
    realTimeAlerts: boolean;
    strictRecency: boolean;
  };
  twitter: {
    verifiedOnly: boolean;
    hasMedia: boolean;
    emotionalContent: boolean;
    communityValidation: boolean;
    opinions: boolean;
    rants: boolean;
    experiences: boolean;
    searchLists: boolean;
    searchCommunities: boolean;
  };
  instagram: {
    linkInBio: boolean;
    swipeUp: boolean;
    reelsOnly: boolean;
  };
  linkedin: {
    publicPosts: boolean;
    pulseArticles: boolean;
    companyPosts: boolean;
    industrySpecific: boolean;
    roleBased: boolean;
    targetRole: string;
  };
  youtube: {
    commentsSearch: boolean;
    videoContent: boolean;
    channelSpecific: boolean;
    videoReactions: boolean;
    tutorialFeedback: boolean;
    productReviews: boolean;
    longTermReviews: boolean;
  };
}

interface AdvancedOptionsProps {
  showAdvancedModal: boolean;
  setShowAdvancedModal: (open: boolean) => void;
  selectedPlatformForAdvanced: string;
  advancedOptions: AdvancedOptionsInterface;
  setAdvancedOptions: React.Dispatch<React.SetStateAction<AdvancedOptionsInterface>>;
}

const AdvancedOptions: React.FC<AdvancedOptionsProps> = ({
  showAdvancedModal,
  setShowAdvancedModal,
  selectedPlatformForAdvanced,
  advancedOptions,
  setAdvancedOptions,
}) => {
  return (
    <Dialog open={showAdvancedModal} onOpenChange={setShowAdvancedModal}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-research-blue" />
            Advanced Options: {platforms.find(p => p.id === selectedPlatformForAdvanced)?.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Facebook Advanced Options */}
          {selectedPlatformForAdvanced === 'facebook' && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Group ID (optional)</Label>
                <Input
                  placeholder="Enter Facebook group ID"
                  value={advancedOptions.facebook.groupId}
                  onChange={(e) => setAdvancedOptions(prev => ({
                    ...prev,
                    facebook: { ...prev.facebook, groupId: e.target.value }
                  }))}
                  className="mt-1"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="fb-public"
                  checked={advancedOptions.facebook.publicPostsOnly}
                  onCheckedChange={(checked) => setAdvancedOptions(prev => ({
                    ...prev,
                    facebook: { ...prev.facebook, publicPostsOnly: !!checked }
                  }))}
                />
                <Label htmlFor="fb-public" className="text-sm">Public posts only</Label>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">Community Focus</Label>
                <div className="grid grid-cols-2 gap-2">
                  {['support', 'community help', 'beginners', 'newbies'].map(type => (
                    <label key={type} className="flex items-center space-x-2 text-sm">
                      <Checkbox
                        checked={advancedOptions.facebook.communityType.includes(type)}
                        onCheckedChange={(checked) => {
                          setAdvancedOptions(prev => ({
                            ...prev,
                            facebook: {
                              ...prev.facebook,
                              communityType: checked
                                ? [...prev.facebook.communityType, type]
                                : prev.facebook.communityType.filter(t => t !== type)
                            }
                          }));
                        }}
                      />
                      <span>{type}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Reddit Advanced Options */}
          {selectedPlatformForAdvanced === 'reddit' && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="reddit-self"
                  checked={advancedOptions.reddit.selfPostsOnly}
                  onCheckedChange={(checked) => setAdvancedOptions(prev => ({
                    ...prev,
                    reddit: { ...prev.reddit, selfPostsOnly: !!checked }
                  }))}
                />
                <Label htmlFor="reddit-self" className="text-sm">Self posts only</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="reddit-score"
                  checked={advancedOptions.reddit.minScore}
                  onCheckedChange={(checked) => setAdvancedOptions(prev => ({
                    ...prev,
                    reddit: { ...prev.reddit, minScore: !!checked }
                  }))}
                />
                <Label htmlFor="reddit-score" className="text-sm">High engagement posts (score ≥ {advancedOptions.reddit.scoreThreshold})</Label>
              </div>

              {advancedOptions.reddit.minScore && (
                <div>
                  <Label className="text-sm font-medium">Score Threshold</Label>
                  <Input
                    type="number"
                    min="1"
                    value={advancedOptions.reddit.scoreThreshold}
                    onChange={(e) => setAdvancedOptions(prev => ({
                      ...prev,
                      reddit: { ...prev.reddit, scoreThreshold: parseInt(e.target.value) || 50 }
                    }))}
                    className="mt-1"
                  />
                </div>
              )}

              <div>
                <Label className="text-sm font-medium">Author Search (optional)</Label>
                <Input
                  placeholder="Enter Reddit username"
                  value={advancedOptions.reddit.author}
                  onChange={(e) => setAdvancedOptions(prev => ({
                    ...prev,
                    reddit: { ...prev.reddit, author: e.target.value }
                  }))}
                  className="mt-1"
                />
              </div>
            </div>
          )}

          {/* Twitter Advanced Options */}
          {selectedPlatformForAdvanced === 'twitter' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                {[
                  { key: 'emotionalContent', label: 'Emotional content (struggling, frustrated, wish I knew)' },
                  { key: 'communityValidation', label: 'Community validation (anyone else, am I the only one)' },
                  { key: 'opinions', label: 'Opinions & hot takes (unpopular opinion, hot take)' },
                  { key: 'rants', label: 'Rants & venting (no links)' },
                  { key: 'experiences', label: 'Experience sharing (with native video)' },
                  { key: 'verifiedOnly', label: 'Verified accounts only' },
                  { key: 'hasMedia', label: 'Posts with media only' }
                ].map(option => (
                  <div key={option.key} className="flex items-center space-x-2">
                    <Checkbox
                      checked={advancedOptions.twitter[option.key as keyof typeof advancedOptions.twitter] as boolean}
                      onCheckedChange={(checked) => setAdvancedOptions(prev => ({
                        ...prev,
                        twitter: { ...prev.twitter, [option.key]: !!checked }
                      }))}
                    />
                    <Label className="text-sm">{option.label}</Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Instagram Advanced Options */}
          {selectedPlatformForAdvanced === 'instagram' && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="ig-link-bio"
                  checked={advancedOptions.instagram.linkInBio}
                  onCheckedChange={(checked) => setAdvancedOptions(prev => ({
                    ...prev,
                    instagram: { ...prev.instagram, linkInBio: !!checked }
                  }))}
                />
                <Label htmlFor="ig-link-bio" className="text-sm">Link in bio posts with struggle keywords</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="ig-swipe-up"
                  checked={advancedOptions.instagram.swipeUp}
                  onCheckedChange={(checked) => setAdvancedOptions(prev => ({
                    ...prev,
                    instagram: { ...prev.instagram, swipeUp: !!checked }
                  }))}
                />
                <Label htmlFor="ig-swipe-up" className="text-sm">Swipe up posts with authenticity keywords</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="ig-reels"
                  checked={advancedOptions.instagram.reelsOnly}
                  onCheckedChange={(checked) => setAdvancedOptions(prev => ({
                    ...prev,
                    instagram: { ...prev.instagram, reelsOnly: !!checked }
                  }))}
                />
                <Label htmlFor="ig-reels" className="text-sm">Reels only with relatable phrases</Label>
              </div>
            </div>
          )}

          {/* LinkedIn Advanced Options */}
          {selectedPlatformForAdvanced === 'linkedin' && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="linkedin-posts"
                  checked={advancedOptions.linkedin.publicPosts}
                  onCheckedChange={(checked) => setAdvancedOptions(prev => ({
                    ...prev,
                    linkedin: { ...prev.linkedin, publicPosts: !!checked }
                  }))}
                />
                <Label htmlFor="linkedin-posts" className="text-sm">Public posts with struggle language</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="linkedin-pulse"
                  checked={advancedOptions.linkedin.pulseArticles}
                  onCheckedChange={(checked) => setAdvancedOptions(prev => ({
                    ...prev,
                    linkedin: { ...prev.linkedin, pulseArticles: !!checked }
                  }))}
                />
                <Label htmlFor="linkedin-pulse" className="text-sm">Pulse articles with opinions</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="linkedin-company"
                  checked={advancedOptions.linkedin.companyPosts}
                  onCheckedChange={(checked) => setAdvancedOptions(prev => ({
                    ...prev,
                    linkedin: { ...prev.linkedin, companyPosts: !!checked }
                  }))}
                />
                <Label htmlFor="linkedin-company" className="text-sm">Company page feedback & reviews</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="linkedin-industry"
                  checked={advancedOptions.linkedin.industrySpecific}
                  onCheckedChange={(checked) => setAdvancedOptions(prev => ({
                    ...prev,
                    linkedin: { ...prev.linkedin, industrySpecific: !!checked }
                  }))}
                />
                <Label htmlFor="linkedin-industry" className="text-sm">Industry-specific pain points</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="linkedin-role"
                  checked={advancedOptions.linkedin.roleBased}
                  onCheckedChange={(checked) => setAdvancedOptions(prev => ({
                    ...prev,
                    linkedin: { ...prev.linkedin, roleBased: !!checked }
                  }))}
                />
                <Label htmlFor="linkedin-role" className="text-sm">Role-based research</Label>
              </div>

              {advancedOptions.linkedin.roleBased && (
                <div>
                  <Label className="text-sm font-medium">Target Role</Label>
                  <Select
                    value={advancedOptions.linkedin.targetRole}
                    onValueChange={(value) => setAdvancedOptions(prev => ({
                      ...prev,
                      linkedin: { ...prev.linkedin, targetRole: value }
                    }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CEO">CEO</SelectItem>
                      <SelectItem value="founder">Founder</SelectItem>
                      <SelectItem value="marketing manager">Marketing Manager</SelectItem>
                      <SelectItem value="product manager">Product Manager</SelectItem>
                      <SelectItem value="sales manager">Sales Manager</SelectItem>
                      <SelectItem value="CTO">CTO</SelectItem>
                      <SelectItem value="CMO">CMO</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}

          {/* TikTok Advanced Options */}
          {selectedPlatformForAdvanced === 'tiktok' && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">Hashtag Trends</Label>
                <div className="grid grid-cols-2 gap-2">
                  {['fyp', 'viral', 'trending', 'foryou', 'foryoupage', 'trend', 'popular', 'explore'].map(tag => (
                    <label key={tag} className="flex items-center space-x-2 text-sm">
                      <Checkbox
                        checked={advancedOptions.tiktok.hashtagTrends.includes(tag)}
                        onCheckedChange={(checked) => {
                          setAdvancedOptions(prev => ({
                            ...prev,
                            tiktok: {
                              ...prev.tiktok,
                              hashtagTrends: checked
                                ? [...prev.tiktok.hashtagTrends, tag]
                                : prev.tiktok.hashtagTrends.filter(t => t !== tag)
                            }
                          }));
                        }}
                      />
                      <span>#{tag}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">Content Types</Label>
                <div className="grid grid-cols-2 gap-2">
                  {['dance', 'comedy', 'educational', 'cooking', 'beauty', 'fitness', 'life hacks', 'review'].map(type => (
                    <label key={type} className="flex items-center space-x-2 text-sm">
                      <Checkbox
                        checked={advancedOptions.tiktok.contentTypes.includes(type)}
                        onCheckedChange={(checked) => {
                          setAdvancedOptions(prev => ({
                            ...prev,
                            tiktok: {
                              ...prev.tiktok,
                              contentTypes: checked
                                ? [...prev.tiktok.contentTypes, type]
                                : prev.tiktok.contentTypes.filter(t => t !== type)
                            }
                          }));
                        }}
                      />
                      <span>{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">Creator Collaborations</Label>
                <div className="grid grid-cols-2 gap-2">
                  {['duet', 'stitch', 'collaboration', 'collab'].map(collab => (
                    <label key={collab} className="flex items-center space-x-2 text-sm">
                      <Checkbox
                        checked={advancedOptions.tiktok.creatorCollabs.includes(collab)}
                        onCheckedChange={(checked) => {
                          setAdvancedOptions(prev => ({
                            ...prev,
                            tiktok: {
                              ...prev.tiktok,
                              creatorCollabs: checked
                                ? [...prev.tiktok.creatorCollabs, collab]
                                : prev.tiktok.creatorCollabs.filter(c => c !== collab)
                            }
                          }));
                        }}
                      />
                      <span>{collab}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">Creator Tiers</Label>
                <div className="grid grid-cols-2 gap-2">
                  {['micro influencer', 'macro influencer', 'celebrity', 'brand ambassador'].map(tier => (
                    <label key={tier} className="flex items-center space-x-2 text-sm">
                      <Checkbox
                        checked={advancedOptions.tiktok.creatorTier.includes(tier)}
                        onCheckedChange={(checked) => {
                          setAdvancedOptions(prev => ({
                            ...prev,
                            tiktok: {
                              ...prev.tiktok,
                              creatorTier: checked
                                ? [...prev.tiktok.creatorTier, tier]
                                : prev.tiktok.creatorTier.filter(t => t !== tier)
                            }
                          }));
                        }}
                      />
                      <span>{tier}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Specific Creator (optional)</Label>
                <Input
                  placeholder="Enter creator username (without @)"
                  value={advancedOptions.tiktok.specificCreator}
                  onChange={(e) => setAdvancedOptions(prev => ({
                    ...prev,
                    tiktok: { ...prev.tiktok, specificCreator: e.target.value }
                  }))}
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">Viral Patterns</Label>
                <div className="grid grid-cols-2 gap-2">
                  {['went viral', 'blew up', 'viral moment', 'trending now'].map(pattern => (
                    <label key={pattern} className="flex items-center space-x-2 text-sm">
                      <Checkbox
                        checked={advancedOptions.tiktok.viralPatterns.includes(pattern)}
                        onCheckedChange={(checked) => {
                          setAdvancedOptions(prev => ({
                            ...prev,
                            tiktok: {
                              ...prev.tiktok,
                              viralPatterns: checked
                                ? [...prev.tiktok.viralPatterns, pattern]
                                : prev.tiktok.viralPatterns.filter(p => p !== pattern)
                            }
                          }));
                        }}
                      />
                      <span>{pattern}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* YouTube Advanced Options */}
          {selectedPlatformForAdvanced === 'youtube' && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="youtube-channel"
                  checked={advancedOptions.youtube.channelSpecific}
                  onCheckedChange={(checked) => setAdvancedOptions(prev => ({
                    ...prev,
                    youtube: { ...prev.youtube, channelSpecific: !!checked }
                  }))}
                />
                <Label htmlFor="youtube-channel" className="text-sm">Channel-specific honest reviews</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="youtube-reactions"
                  checked={advancedOptions.youtube.videoReactions}
                  onCheckedChange={(checked) => setAdvancedOptions(prev => ({
                    ...prev,
                    youtube: { ...prev.youtube, videoReactions: !!checked }
                  }))}
                />
                <Label htmlFor="youtube-reactions" className="text-sm">Strong video reactions (game changer, scam, etc.)</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="youtube-tutorial"
                  checked={advancedOptions.youtube.tutorialFeedback}
                  onCheckedChange={(checked) => setAdvancedOptions(prev => ({
                    ...prev,
                    youtube: { ...prev.youtube, tutorialFeedback: !!checked }
                  }))}
                />
                <Label htmlFor="youtube-tutorial" className="text-sm">Tutorial feedback (worked/didn't work)</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="youtube-reviews"
                  checked={advancedOptions.youtube.productReviews}
                  onCheckedChange={(checked) => setAdvancedOptions(prev => ({
                    ...prev,
                    youtube: { ...prev.youtube, productReviews: !!checked }
                  }))}
                />
                <Label htmlFor="youtube-reviews" className="text-sm">Product reviews with time usage</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="youtube-longterm"
                  checked={advancedOptions.youtube.longTermReviews}
                  onCheckedChange={(checked) => setAdvancedOptions(prev => ({
                    ...prev,
                    youtube: { ...prev.youtube, longTermReviews: !!checked }
                  }))}
                />
                <Label htmlFor="youtube-longterm" className="text-sm">Long-term reviews (6 months, 1 year later)</Label>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdvancedOptions;
