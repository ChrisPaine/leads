import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';

interface NicheIdeasModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectNiche: (niche: string) => void;
}

interface NicheItem {
  value: string;
  label: string;
  volume: string;
  indent: number;
  isCategory?: boolean;
}

// Organized niches by category from the Categories.txt file with full hierarchy
const healthNiches: NicheItem[] = [
  { value: 'Fitness', label: 'Fitness', volume: '', indent: 0, isCategory: true },
  { value: 'Strength Training', label: 'Strength Training', volume: '', indent: 1, isCategory: true },
  { value: 'Strength Training for Postpartum Mothers', label: 'Strength Training for Postpartum Mothers', volume: '2.4K', indent: 2 },
  { value: 'Strength Training for Seniors', label: 'Strength Training for Seniors', volume: '8.1K', indent: 2 },
  { value: 'Bodyweight Strength Training', label: 'Bodyweight Strength Training', volume: '', indent: 1, isCategory: true },
  { value: 'Bodyweight Training for Travelers', label: 'Bodyweight Training for Travelers', volume: '1.2K', indent: 2 },
  { value: 'Bodyweight Training for Military Personnel', label: 'Bodyweight Training for Military Personnel', volume: '3.1K', indent: 2 },
  { value: 'Cardio Fitness', label: 'Cardio Fitness', volume: '', indent: 1, isCategory: true },
  { value: 'High-Intensity Interval Training (HIIT)', label: 'High-Intensity Interval Training (HIIT)', volume: '', indent: 2, isCategory: true },
  { value: 'HIIT for Busy Professionals', label: 'HIIT for Busy Professionals', volume: '3.6K', indent: 3 },
  { value: 'HIIT for Weight Loss in Women', label: 'HIIT for Weight Loss in Women', volume: '5.4K', indent: 3 },
  { value: 'Yoga', label: 'Yoga', volume: '', indent: 1, isCategory: true },
  { value: 'Power Yoga', label: 'Power Yoga', volume: '', indent: 2, isCategory: true },
  { value: 'Power Yoga for Athletes', label: 'Power Yoga for Athletes', volume: '2.9K', indent: 3 },
  { value: 'Restorative Yoga', label: 'Restorative Yoga', volume: '', indent: 2, isCategory: true },
  { value: 'Restorative Yoga for Stress Relief', label: 'Restorative Yoga for Stress Relief', volume: '4.2K', indent: 3 },
  { value: 'Restorative Yoga for Chronic Pain Sufferers', label: 'Restorative Yoga for Chronic Pain Sufferers', volume: '1.8K', indent: 3 },
  { value: 'Flexibility and Mobility', label: 'Flexibility and Mobility', volume: '', indent: 1, isCategory: true },
  { value: 'Mobility Training for Athletes', label: 'Mobility Training for Athletes', volume: '3.4K', indent: 2 },
  { value: 'Flexibility Training for Office Workers', label: 'Flexibility Training for Office Workers', volume: '2.1K', indent: 2 },
  { value: 'Flexibility Programs for Remote Workers', label: 'Flexibility Programs for Remote Workers', volume: '1.9K', indent: 2 },

  { value: 'Nutrition', label: 'Nutrition', volume: '', indent: 0, isCategory: true },
  { value: 'Diet Plans', label: 'Diet Plans', volume: '', indent: 1, isCategory: true },
  { value: 'Ketogenic Diet', label: 'Ketogenic Diet', volume: '', indent: 2, isCategory: true },
  { value: 'Keto for Diabetics', label: 'Keto for Diabetics', volume: '6.8K', indent: 3 },
  { value: 'Keto for Athletes', label: 'Keto for Athletes', volume: '4.5K', indent: 3 },
  { value: 'Plant-Based Diets', label: 'Plant-Based Diets', volume: '', indent: 2, isCategory: true },
  { value: 'Plant-Based Nutrition for Bodybuilders', label: 'Plant-Based Nutrition for Bodybuilders', volume: '3.2K', indent: 3 },
  { value: 'Plant-Based Diet for Families', label: 'Plant-Based Diet for Families', volume: '5.7K', indent: 3 },
  { value: 'Supplements', label: 'Supplements', volume: '', indent: 1, isCategory: true },
  { value: 'Pre-Workout Supplements', label: 'Pre-Workout Supplements', volume: '', indent: 2, isCategory: true },
  { value: 'Supplements for Endurance Athletes', label: 'Supplements for Endurance Athletes', volume: '5.8K', indent: 3 },
  { value: 'Pre-Workout for Beginners', label: 'Pre-Workout for Beginners', volume: '4.3K', indent: 3 },
  { value: 'Health Supplements', label: 'Health Supplements', volume: '', indent: 2, isCategory: true },
  { value: 'Supplements for Men\'s Health', label: 'Supplements for Men\'s Health', volume: '9.2K', indent: 3 },
  { value: 'Supplements for Hormonal Balance in Women', label: 'Supplements for Hormonal Balance in Women', volume: '7.3K', indent: 3 },

  { value: 'Mental Health', label: 'Mental Health', volume: '', indent: 0, isCategory: true },
  { value: 'Stress Management', label: 'Stress Management', volume: '', indent: 1, isCategory: true },
  { value: 'Mindfulness and Meditation', label: 'Mindfulness and Meditation', volume: '', indent: 2, isCategory: true },
  { value: 'Meditation for Corporate Professionals', label: 'Meditation for Corporate Professionals', volume: '4.1K', indent: 3 },
  { value: 'Meditation for Sleep Improvement', label: 'Meditation for Sleep Improvement', volume: '8.9K', indent: 3 },
  { value: 'Stress Relief Techniques', label: 'Stress Relief Techniques', volume: '', indent: 2, isCategory: true },
  { value: 'Stress Relief for Parents', label: 'Stress Relief for Parents', volume: '6.4K', indent: 3 },
  { value: 'Stress Management for College Students', label: 'Stress Management for College Students', volume: '5.2K', indent: 3 },
  { value: 'Therapy and Counseling', label: 'Therapy and Counseling', volume: '', indent: 1, isCategory: true },
  { value: 'Online Therapy', label: 'Online Therapy', volume: '', indent: 2, isCategory: true },
  { value: 'Online Therapy for Veterans', label: 'Online Therapy for Veterans', volume: '2.7K', indent: 3 },
  { value: 'Online Therapy for Social Anxiety', label: 'Online Therapy for Social Anxiety', volume: '4.1K', indent: 3 },
  { value: 'Cognitive Behavioral Therapy (CBT)', label: 'Cognitive Behavioral Therapy (CBT)', volume: '', indent: 2, isCategory: true },
  { value: 'CBT for Adolescents', label: 'CBT for Adolescents', volume: '3.5K', indent: 3 },
  { value: 'CBT for Obsessive-Compulsive Disorder', label: 'CBT for Obsessive-Compulsive Disorder', volume: '4.8K', indent: 3 },

  { value: 'Preventative Health', label: 'Preventative Health', volume: '', indent: 0, isCategory: true },
  { value: 'Immunity Boosting', label: 'Immunity Boosting', volume: '', indent: 1, isCategory: true },
  { value: 'Immunity Programs for Children', label: 'Immunity Programs for Children', volume: '3.7K', indent: 2 },
  { value: 'Immunity Boosting for Travelers', label: 'Immunity Boosting for Travelers', volume: '2.9K', indent: 2 },
  { value: 'Longevity and Anti-Aging', label: 'Longevity and Anti-Aging', volume: '', indent: 1, isCategory: true },
  { value: 'Anti-Aging for Women Over 50', label: 'Anti-Aging for Women Over 50', volume: '12.3K', indent: 2 },
  { value: 'Longevity Coaching for Executives', label: 'Longevity Coaching for Executives', volume: '4.6K', indent: 2 },
  { value: 'Sleep Health', label: 'Sleep Health', volume: '', indent: 1, isCategory: true },
  { value: 'Sleep Optimization for Athletes', label: 'Sleep Optimization for Athletes', volume: '1.9K', indent: 2 },
  { value: 'Sleep Coaching for Busy Entrepreneurs', label: 'Sleep Coaching for Busy Entrepreneurs', volume: '2.8K', indent: 2 },

  { value: 'Alternative Medicine', label: 'Alternative Medicine', volume: '', indent: 0, isCategory: true },
  { value: 'Herbal Medicine', label: 'Herbal Medicine', volume: '', indent: 1, isCategory: true },
  { value: 'Herbal Remedies for Skin Conditions', label: 'Herbal Remedies for Skin Conditions', volume: '6.4K', indent: 2 },
  { value: 'Herbal Medicine for Digestive Health', label: 'Herbal Medicine for Digestive Health', volume: '5.1K', indent: 2 },
  { value: 'Acupuncture', label: 'Acupuncture', volume: '', indent: 1, isCategory: true },
  { value: 'Acupuncture for Chronic Pain Relief', label: 'Acupuncture for Chronic Pain Relief', volume: '5.6K', indent: 2 },
  { value: 'Acupuncture for Fertility Issues', label: 'Acupuncture for Fertility Issues', volume: '4.2K', indent: 2 },
  { value: 'Aromatherapy', label: 'Aromatherapy', volume: '', indent: 1, isCategory: true },
  { value: 'Aromatherapy for Anxiety Reduction', label: 'Aromatherapy for Anxiety Reduction', volume: '7.1K', indent: 2 },
  { value: 'Aromatherapy for Insomnia', label: 'Aromatherapy for Insomnia', volume: '5.9K', indent: 2 },

  { value: 'Physical Therapy and Rehabilitation', label: 'Physical Therapy and Rehabilitation', volume: '', indent: 0, isCategory: true },
  { value: 'Injury Rehabilitation', label: 'Injury Rehabilitation', volume: '', indent: 1, isCategory: true },
  { value: 'Post-Surgery Rehabilitation for Athletes', label: 'Post-Surgery Rehabilitation for Athletes', volume: '3.8K', indent: 2 },
  { value: 'Rehabilitation for Workplace Injuries', label: 'Rehabilitation for Workplace Injuries', volume: '4.5K', indent: 2 },
  { value: 'Chronic Pain Management', label: 'Chronic Pain Management', volume: '', indent: 1, isCategory: true },
  { value: 'Pain Management for Arthritis Patients', label: 'Pain Management for Arthritis Patients', volume: '11.4K', indent: 2 },
  { value: 'Pain Relief for Long-Distance Runners', label: 'Pain Relief for Long-Distance Runners', volume: '3.2K', indent: 2 },
  { value: 'Mobility Recovery', label: 'Mobility Recovery', volume: '', indent: 1, isCategory: true },
  { value: 'Mobility Recovery for Seniors', label: 'Mobility Recovery for Seniors', volume: '6.7K', indent: 2 },
  { value: 'Mobility Training After Car Accidents', label: 'Mobility Training After Car Accidents', volume: '2.4K', indent: 2 },

  { value: 'Specialized Health Services', label: 'Specialized Health Services', volume: '', indent: 0, isCategory: true },
  { value: 'Women\'s Health', label: 'Women\'s Health', volume: '', indent: 1, isCategory: true },
  { value: 'Fertility Counseling', label: 'Fertility Counseling', volume: '', indent: 2, isCategory: true },
  { value: 'Fertility Counseling for Older Women', label: 'Fertility Counseling for Older Women', volume: '3.8K', indent: 3 },
  { value: 'Fertility Counseling for Same-Sex Couples', label: 'Fertility Counseling for Same-Sex Couples', volume: '2.1K', indent: 3 },
  { value: 'Menopause Support', label: 'Menopause Support', volume: '', indent: 2, isCategory: true },
  { value: 'Menopause Coaching for Professional Women', label: 'Menopause Coaching for Professional Women', volume: '6.9K', indent: 3 },
  { value: 'Men\'s Health', label: 'Men\'s Health', volume: '', indent: 1, isCategory: true },
  { value: 'Prostate Health', label: 'Prostate Health', volume: '', indent: 2, isCategory: true },
  { value: 'Prostate Care for Men Over 50', label: 'Prostate Care for Men Over 50', volume: '8.5K', indent: 3 },
  { value: 'Prostate Health Awareness for Young Men', label: 'Prostate Health Awareness for Young Men', volume: '3.9K', indent: 3 },
  { value: 'Testosterone Optimization', label: 'Testosterone Optimization', volume: '', indent: 2, isCategory: true },
  { value: 'Testosterone Therapy for Athletes', label: 'Testosterone Therapy for Athletes', volume: '9.1K', indent: 3 },
  { value: 'Natural Testosterone Boosting for Men in Their 40s', label: 'Natural Testosterone Boosting for Men in Their 40s', volume: '14.2K', indent: 3 },
  { value: 'Pediatric Health', label: 'Pediatric Health', volume: '', indent: 1, isCategory: true },
  { value: 'Child Nutrition', label: 'Child Nutrition', volume: '', indent: 2, isCategory: true },
  { value: 'Nutrition for Kids with Allergies', label: 'Nutrition for Kids with Allergies', volume: '5.3K', indent: 3 },
  { value: 'Nutrition Coaching for Picky Eaters', label: 'Nutrition Coaching for Picky Eaters', volume: '7.2K', indent: 3 },
  { value: 'Childhood Obesity Prevention', label: 'Childhood Obesity Prevention', volume: '', indent: 2, isCategory: true },
  { value: 'Obesity Prevention Programs for Schools', label: 'Obesity Prevention Programs for Schools', volume: '3.8K', indent: 3 },
  { value: 'Coaching for Parents on Childhood Obesity', label: 'Coaching for Parents on Childhood Obesity', volume: '4.7K', indent: 3 },
  { value: 'Senior Health', label: 'Senior Health', volume: '', indent: 1, isCategory: true },
  { value: 'Aging in Place', label: 'Aging in Place', volume: '', indent: 2, isCategory: true },
  { value: 'Home Modifications for Seniors', label: 'Home Modifications for Seniors', volume: '5.4K', indent: 3 },
  { value: 'Senior Support Services for Aging in Place', label: 'Senior Support Services for Aging in Place', volume: '4.1K', indent: 3 },
  { value: 'Assisted Living Alternatives', label: 'Assisted Living Alternatives', volume: '', indent: 2, isCategory: true },
  { value: 'Alternative Housing Solutions for Seniors', label: 'Alternative Housing Solutions for Seniors', volume: '3.6K', indent: 3 },
  { value: 'Co-Living for Active Seniors', label: 'Co-Living for Active Seniors', volume: '2.8K', indent: 3 },
  { value: 'Senior Fitness', label: 'Senior Fitness', volume: '', indent: 2, isCategory: true },
  { value: 'Fitness Programs for Seniors with Limited Mobility', label: 'Fitness Programs for Seniors with Limited Mobility', volume: '9.8K', indent: 3 },
  { value: 'Water Aerobics for Seniors', label: 'Water Aerobics for Seniors', volume: '6.3K', indent: 3 },
];

const wealthNiches: NicheItem[] = [
  { value: 'Investing', label: 'Investing', volume: '', indent: 0, isCategory: true },
  { value: 'Real Estate Investing', label: 'Real Estate Investing', volume: '', indent: 1, isCategory: true },
  { value: 'Residential Real Estate', label: 'Residential Real Estate', volume: '', indent: 2, isCategory: true },
  { value: 'Real Estate for First-Time Homebuyers', label: 'Real Estate for First-Time Homebuyers', volume: '18.5K', indent: 3 },
  { value: 'Real Estate Investing for Single Parents', label: 'Real Estate Investing for Single Parents', volume: '2.4K', indent: 3 },
  { value: 'Commercial Real Estate', label: 'Commercial Real Estate', volume: '', indent: 2, isCategory: true },
  { value: 'Commercial Real Estate for Small Business Owners', label: 'Commercial Real Estate for Small Business Owners', volume: '7.9K', indent: 3 },
  { value: 'Stock Market Investing', label: 'Stock Market Investing', volume: '', indent: 1, isCategory: true },
  { value: 'Dividend Investing', label: 'Dividend Investing', volume: '', indent: 2, isCategory: true },
  { value: 'Dividend Investing for Retirees', label: 'Dividend Investing for Retirees', volume: '11.2K', indent: 3 },
  { value: 'Growth Stock Investing', label: 'Growth Stock Investing', volume: '', indent: 2, isCategory: true },
  { value: 'Stock Investing for Young Professionals', label: 'Stock Investing for Young Professionals', volume: '8.6K', indent: 3 },
  { value: 'Stock Market Education for Beginners', label: 'Stock Market Education for Beginners', volume: '13.4K', indent: 3 },
  { value: 'Cryptocurrency', label: 'Cryptocurrency', volume: '', indent: 1, isCategory: true },
  { value: 'Bitcoin Trading', label: 'Bitcoin Trading', volume: '', indent: 2, isCategory: true },
  { value: 'Bitcoin for Entrepreneurs', label: 'Bitcoin for Entrepreneurs', volume: '6.3K', indent: 3 },
  { value: 'Bitcoin for Freelancers', label: 'Bitcoin for Freelancers', volume: '4.1K', indent: 3 },
  { value: 'NFT Investments', label: 'NFT Investments', volume: '', indent: 2, isCategory: true },
  { value: 'NFT Collecting for Art Enthusiasts', label: 'NFT Collecting for Art Enthusiasts', volume: '5.7K', indent: 3 },
  { value: 'NFT Investing for Gamers', label: 'NFT Investing for Gamers', volume: '4.2K', indent: 3 },

  { value: 'Personal Finance', label: 'Personal Finance', volume: '', indent: 0, isCategory: true },
  { value: 'Budgeting', label: 'Budgeting', volume: '', indent: 1, isCategory: true },
  { value: 'Budgeting for Families', label: 'Budgeting for Families', volume: '15.4K', indent: 2 },
  { value: 'Budgeting for College Students', label: 'Budgeting for College Students', volume: '9.8K', indent: 2 },
  { value: 'Debt Management', label: 'Debt Management', volume: '', indent: 1, isCategory: true },
  { value: 'Debt Relief for High-Income Professionals', label: 'Debt Relief for High-Income Professionals', volume: '7.2K', indent: 2 },
  { value: 'Debt Consolidation for Millennials', label: 'Debt Consolidation for Millennials', volume: '12.6K', indent: 2 },
  { value: 'Saving and Emergency Funds', label: 'Saving and Emergency Funds', volume: '', indent: 1, isCategory: true },
  { value: 'Saving Strategies for Freelancers', label: 'Saving Strategies for Freelancers', volume: '6.9K', indent: 2 },
  { value: 'Emergency Fund Building for Single Parents', label: 'Emergency Fund Building for Single Parents', volume: '5.8K', indent: 2 },

  { value: 'Business Development', label: 'Business Development', volume: '', indent: 0, isCategory: true },
  { value: 'Online Businesses', label: 'Online Businesses', volume: '', indent: 1, isCategory: true },
  { value: 'E-commerce', label: 'E-commerce', volume: '', indent: 2, isCategory: true },
  { value: 'E-commerce for Craft Businesses', label: 'E-commerce for Craft Businesses', volume: '4.3K', indent: 3 },
  { value: 'E-commerce for Fitness Trainers', label: 'E-commerce for Fitness Trainers', volume: '3.1K', indent: 3 },
  { value: 'Dropshipping', label: 'Dropshipping', volume: '', indent: 2, isCategory: true },
  { value: 'Dropshipping for Fashion Accessories', label: 'Dropshipping for Fashion Accessories', volume: '8.4K', indent: 3 },
  { value: 'Dropshipping for Eco-Friendly Products', label: 'Dropshipping for Eco-Friendly Products', volume: '5.2K', indent: 3 },
  { value: 'Freelancing', label: 'Freelancing', volume: '', indent: 1, isCategory: true },
  { value: 'Freelancing for Writers', label: 'Freelancing for Writers', volume: '14.7K', indent: 2 },
  { value: 'Freelancing for Graphic Designers', label: 'Freelancing for Graphic Designers', volume: '11.3K', indent: 2 },
  { value: 'Consulting', label: 'Consulting', volume: '', indent: 1, isCategory: true },
  { value: 'Financial Consulting for Startups', label: 'Financial Consulting for Startups', volume: '6.8K', indent: 2 },
  { value: 'Leadership Consulting for Nonprofits', label: 'Leadership Consulting for Nonprofits', volume: '4.9K', indent: 2 },

  { value: 'Entrepreneurship', label: 'Entrepreneurship', volume: '', indent: 0, isCategory: true },
  { value: 'Social Entrepreneurship', label: 'Social Entrepreneurship', volume: '', indent: 1, isCategory: true },
  { value: 'Social Enterprise for Sustainability', label: 'Social Enterprise for Sustainability', volume: '5.6K', indent: 2 },
  { value: 'Social Enterprise for Education Access', label: 'Social Enterprise for Education Access', volume: '4.3K', indent: 2 },
  { value: 'Tech Startups', label: 'Tech Startups', volume: '', indent: 1, isCategory: true },
  { value: 'Tech Startups for Healthcare Solutions', label: 'Tech Startups for Healthcare Solutions', volume: '8.2K', indent: 2 },
  { value: 'AI-Based Startups for E-commerce', label: 'AI-Based Startups for E-commerce', volume: '7.1K', indent: 2 },
  { value: 'Franchise Ownership', label: 'Franchise Ownership', volume: '', indent: 1, isCategory: true },
  { value: 'Franchises in the Fitness Industry', label: 'Franchises in the Fitness Industry', volume: '9.4K', indent: 2 },
  { value: 'Franchises for Pet Care Services', label: 'Franchises for Pet Care Services', volume: '6.7K', indent: 2 },

  { value: 'Career Development', label: 'Career Development', volume: '', indent: 0, isCategory: true },
  { value: 'Career Coaching', label: 'Career Coaching', volume: '', indent: 1, isCategory: true },
  { value: 'Career Transition Coaching for Mid-Level Professionals', label: 'Career Transition Coaching for Mid-Level Professionals', volume: '9.5K', indent: 2 },
  { value: 'Career Coaching for Recent Graduates', label: 'Career Coaching for Recent Graduates', volume: '7.1K', indent: 2 },
  { value: 'Skill Development', label: 'Skill Development', volume: '', indent: 1, isCategory: true },
  { value: 'Public Speaking for Executives', label: 'Public Speaking for Executives', volume: '5.4K', indent: 2 },
  { value: 'Negotiation Skills for Women', label: 'Negotiation Skills for Women', volume: '6.8K', indent: 2 },
  { value: 'Leadership Development', label: 'Leadership Development', volume: '', indent: 1, isCategory: true },
  { value: 'Leadership Coaching for Women in STEM', label: 'Leadership Coaching for Women in STEM', volume: '4.9K', indent: 2 },
  { value: 'Leadership Development for Nonprofit Leaders', label: 'Leadership Development for Nonprofit Leaders', volume: '5.3K', indent: 2 },

  { value: 'Passive Income', label: 'Passive Income', volume: '', indent: 0, isCategory: true },
  { value: 'Rental Properties', label: 'Rental Properties', volume: '', indent: 1, isCategory: true },
  { value: 'Vacation Rental Properties for Families', label: 'Vacation Rental Properties for Families', volume: '16.2K', indent: 2 },
  { value: 'Long-Term Rentals in College Towns', label: 'Long-Term Rentals in College Towns', volume: '8.7K', indent: 2 },
  { value: 'Digital Products', label: 'Digital Products', volume: '', indent: 1, isCategory: true },
  { value: 'Creating Online Courses for Educators', label: 'Creating Online Courses for Educators', volume: '13.8K', indent: 2 },
  { value: 'Selling E-books for Health Enthusiasts', label: 'Selling E-books for Health Enthusiasts', volume: '9.3K', indent: 2 },
  { value: 'Affiliate Marketing', label: 'Affiliate Marketing', volume: '', indent: 1, isCategory: true },
  { value: 'Affiliate Marketing for Beauty Bloggers', label: 'Affiliate Marketing for Beauty Bloggers', volume: '7.6K', indent: 2 },
  { value: 'Affiliate Marketing for Travel Writers', label: 'Affiliate Marketing for Travel Writers', volume: '6.4K', indent: 2 },

  { value: 'Retirement Planning', label: 'Retirement Planning', volume: '', indent: 0, isCategory: true },
  { value: 'Early Retirement', label: 'Early Retirement', volume: '', indent: 1, isCategory: true },
  { value: 'Retirement Planning for Tech Workers', label: 'Retirement Planning for Tech Workers', volume: '5.3K', indent: 2 },
  { value: 'Early Retirement Strategies for Firefighters', label: 'Early Retirement Strategies for Firefighters', volume: '4.1K', indent: 2 },
  { value: 'Pension Planning', label: 'Pension Planning', volume: '', indent: 1, isCategory: true },
  { value: 'Pension Strategies for Government Employees', label: 'Pension Strategies for Government Employees', volume: '7.8K', indent: 2 },
  { value: 'Pension Management for Military Veterans', label: 'Pension Management for Military Veterans', volume: '6.2K', indent: 2 },
  { value: 'Financial Independence', label: 'Financial Independence', volume: '', indent: 1, isCategory: true },
  { value: 'Financial Independence for Freelancers', label: 'Financial Independence for Freelancers', volume: '9.7K', indent: 2 },
  { value: 'FIRE (Financial Independence Retire Early) Coaching for Digital Nomads', label: 'FIRE (Financial Independence Retire Early) Coaching for Digital Nomads', volume: '8.9K', indent: 2 },

  { value: 'Tax Strategies', label: 'Tax Strategies', volume: '', indent: 0, isCategory: true },
  { value: 'Small Business Taxation', label: 'Small Business Taxation', volume: '', indent: 1, isCategory: true },
  { value: 'Tax Planning for Online Entrepreneurs', label: 'Tax Planning for Online Entrepreneurs', volume: '6.2K', indent: 2 },
  { value: 'Tax Strategies for Small Business Owners with Multiple Income Streams', label: 'Tax Strategies for Small Business Owners with Multiple Income Streams', volume: '8.4K', indent: 2 },
  { value: 'Personal Taxation', label: 'Personal Taxation', volume: '', indent: 1, isCategory: true },
  { value: 'Tax Strategies for High-Income Earners', label: 'Tax Strategies for High-Income Earners', volume: '11.3K', indent: 2 },
  { value: 'Tax Planning for Remote Workers', label: 'Tax Planning for Remote Workers', volume: '7.9K', indent: 2 },
  { value: 'Tax Relief', label: 'Tax Relief', volume: '', indent: 1, isCategory: true },
  { value: 'Tax Relief for Families with Special Needs Children', label: 'Tax Relief for Families with Special Needs Children', volume: '5.6K', indent: 2 },
  { value: 'Tax Planning for Newlyweds', label: 'Tax Planning for Newlyweds', volume: '4.8K', indent: 2 },

  { value: 'Wealth Preservation', label: 'Wealth Preservation', volume: '', indent: 0, isCategory: true },
  { value: 'Estate Planning', label: 'Estate Planning', volume: '', indent: 1, isCategory: true },
  { value: 'Estate Planning for Families with Special Needs Children', label: 'Estate Planning for Families with Special Needs Children', volume: '6.4K', indent: 2 },
  { value: 'Estate Planning for High-Net-Worth Individuals', label: 'Estate Planning for High-Net-Worth Individuals', volume: '9.1K', indent: 2 },
  { value: 'Asset Protection', label: 'Asset Protection', volume: '', indent: 1, isCategory: true },
  { value: 'Asset Protection for Real Estate Investors', label: 'Asset Protection for Real Estate Investors', volume: '7.4K', indent: 2 },
  { value: 'Asset Protection for Small Business Owners', label: 'Asset Protection for Small Business Owners', volume: '8.6K', indent: 2 },
  { value: 'Insurance Planning', label: 'Insurance Planning', volume: '', indent: 1, isCategory: true },
  { value: 'Life Insurance Strategies for Young Parents', label: 'Life Insurance Strategies for Young Parents', volume: '10.2K', indent: 2 },
  { value: 'Insurance Solutions for Entrepreneurs', label: 'Insurance Solutions for Entrepreneurs', volume: '7.8K', indent: 2 },
];

const relationshipNiches: NicheItem[] = [
  { value: 'Romantic Relationships', label: 'Romantic Relationships', volume: '', indent: 0, isCategory: true },
  { value: 'Dating', label: 'Dating', volume: '', indent: 1, isCategory: true },
  { value: 'Online Dating', label: 'Online Dating', volume: '', indent: 2, isCategory: true },
  { value: 'Dating for Introverted Professionals', label: 'Dating for Introverted Professionals', volume: '8.7K', indent: 3 },
  { value: 'Speed Dating', label: 'Speed Dating', volume: '', indent: 2, isCategory: true },
  { value: 'Speed Dating for Busy Professionals', label: 'Speed Dating for Busy Professionals', volume: '3.4K', indent: 3 },
  { value: 'Speed Dating for Divorcees', label: 'Speed Dating for Divorcees', volume: '2.1K', indent: 3 },
  { value: 'Relationship Coaching', label: 'Relationship Coaching', volume: '', indent: 1, isCategory: true },
  { value: 'Marriage Coaching', label: 'Marriage Coaching', volume: '', indent: 2, isCategory: true },
  { value: 'Coaching for Newlyweds', label: 'Coaching for Newlyweds', volume: '5.8K', indent: 3 },
  { value: 'Coaching for Couples with Kids', label: 'Coaching for Couples with Kids', volume: '6.9K', indent: 3 },
  { value: 'Breakup Recovery', label: 'Breakup Recovery', volume: '', indent: 2, isCategory: true },
  { value: 'Breakup Coaching for Men', label: 'Breakup Coaching for Men', volume: '4.2K', indent: 3 },
  { value: 'Breakup Support for Middle-Aged Women', label: 'Breakup Support for Middle-Aged Women', volume: '3.7K', indent: 3 },

  { value: 'Family Relationships', label: 'Family Relationships', volume: '', indent: 0, isCategory: true },
  { value: 'Parenting', label: 'Parenting', volume: '', indent: 1, isCategory: true },
  { value: 'Single Parenting', label: 'Single Parenting', volume: '', indent: 2, isCategory: true },
  { value: 'Parenting Tips for Single Dads', label: 'Parenting Tips for Single Dads', volume: '7.3K', indent: 3 },
  { value: 'Single Parent Support for Moms', label: 'Single Parent Support for Moms', volume: '9.4K', indent: 3 },
  { value: 'Co-Parenting', label: 'Co-Parenting', volume: '', indent: 2, isCategory: true },
  { value: 'Co-Parenting Strategies for Divorced Couples', label: 'Co-Parenting Strategies for Divorced Couples', volume: '11.6K', indent: 3 },
  { value: 'Co-Parenting for International Families', label: 'Co-Parenting for International Families', volume: '2.8K', indent: 3 },
  { value: 'Sibling Relationships', label: 'Sibling Relationships', volume: '', indent: 1, isCategory: true },
  { value: 'Sibling Rivalry Management', label: 'Sibling Rivalry Management', volume: '6.5K', indent: 2 },
  { value: 'Sibling Bond Strengthening for Adults', label: 'Sibling Bond Strengthening for Adults', volume: '4.8K', indent: 2 },

  { value: 'Friendships and Social Connections', label: 'Friendships and Social Connections', volume: '', indent: 0, isCategory: true },
  { value: 'Building Friendships', label: 'Building Friendships', volume: '', indent: 1, isCategory: true },
  { value: 'Friendship Building for New Moms', label: 'Friendship Building for New Moms', volume: '5.1K', indent: 2 },
  { value: 'Friendship Support for Digital Nomads', label: 'Friendship Support for Digital Nomads', volume: '3.9K', indent: 2 },
  { value: 'Networking', label: 'Networking', volume: '', indent: 1, isCategory: true },
  { value: 'Professional Networking for Women in Tech', label: 'Professional Networking for Women in Tech', volume: '7.8K', indent: 2 },
  { value: 'Networking Strategies for Entrepreneurs', label: 'Networking Strategies for Entrepreneurs', volume: '9.2K', indent: 2 },
  { value: 'Social Skills', label: 'Social Skills', volume: '', indent: 1, isCategory: true },
  { value: 'Social Skills Training for Introverts', label: 'Social Skills Training for Introverts', volume: '8.4K', indent: 2 },
  { value: 'Social Confidence Building for Teens', label: 'Social Confidence Building for Teens', volume: '6.7K', indent: 2 },

  { value: 'Workplace Relationships', label: 'Workplace Relationships', volume: '', indent: 0, isCategory: true },
  { value: 'Team Building', label: 'Team Building', volume: '', indent: 1, isCategory: true },
  { value: 'Team Building Activities for Remote Teams', label: 'Team Building Activities for Remote Teams', volume: '12.3K', indent: 2 },
  { value: 'Team Bonding for Corporate Employees', label: 'Team Bonding for Corporate Employees', volume: '8.9K', indent: 2 },
  { value: 'Conflict Resolution', label: 'Conflict Resolution', volume: '', indent: 1, isCategory: true },
  { value: 'Conflict Resolution for Small Businesses', label: 'Conflict Resolution for Small Businesses', volume: '5.6K', indent: 2 },
  { value: 'Workplace Mediation for Corporate Teams', label: 'Workplace Mediation for Corporate Teams', volume: '4.9K', indent: 2 },
  { value: 'Employee Engagement', label: 'Employee Engagement', volume: '', indent: 1, isCategory: true },
  { value: 'Engagement Strategies for Tech Startups', label: 'Engagement Strategies for Tech Startups', volume: '7.4K', indent: 2 },
  { value: 'Employee Recognition Programs for Large Corporations', label: 'Employee Recognition Programs for Large Corporations', volume: '9.6K', indent: 2 },

  { value: 'Community and Group Relationships', label: 'Community and Group Relationships', volume: '', indent: 0, isCategory: true },
  { value: 'Support Groups', label: 'Support Groups', volume: '', indent: 1, isCategory: true },
  { value: 'Support Groups for Cancer Survivors', label: 'Support Groups for Cancer Survivors', volume: '7.2K', indent: 2 },
  { value: 'Support Groups for Parents of Children with Special Needs', label: 'Support Groups for Parents of Children with Special Needs', volume: '8.1K', indent: 2 },
  { value: 'Volunteering and Community Service', label: 'Volunteering and Community Service', volume: '', indent: 1, isCategory: true },
  { value: 'Volunteering Opportunities for Retirees', label: 'Volunteering Opportunities for Retirees', volume: '6.3K', indent: 2 },
  { value: 'Community Service Programs for High School Students', label: 'Community Service Programs for High School Students', volume: '5.7K', indent: 2 },
  { value: 'Group Hobbies and Interests', label: 'Group Hobbies and Interests', volume: '', indent: 1, isCategory: true },
  { value: 'Group Hiking for Adventure Enthusiasts', label: 'Group Hiking for Adventure Enthusiasts', volume: '4.9K', indent: 2 },
  { value: 'Book Clubs for Personal Development Enthusiasts', label: 'Book Clubs for Personal Development Enthusiasts', volume: '6.2K', indent: 2 },

  { value: 'Parenting Support', label: 'Parenting Support', volume: '', indent: 0, isCategory: true },
  { value: 'Parenting Education', label: 'Parenting Education', volume: '', indent: 1, isCategory: true },
  { value: 'Parenting Skills for New Fathers', label: 'Parenting Skills for New Fathers', volume: '9.8K', indent: 2 },
  { value: 'Positive Parenting Strategies for Teenagers', label: 'Positive Parenting Strategies for Teenagers', volume: '11.4K', indent: 2 },
  { value: 'Special Needs Parenting', label: 'Special Needs Parenting', volume: '', indent: 1, isCategory: true },
  { value: 'Autism Parenting Support', label: 'Autism Parenting Support', volume: '', indent: 2, isCategory: true },
  { value: 'Coaching for Parents of Children with Autism', label: 'Coaching for Parents of Children with Autism', volume: '13.7K', indent: 3 },
  { value: 'Autism Support for Siblings', label: 'Autism Support for Siblings', volume: '5.9K', indent: 3 },
  { value: 'ADHD Parenting', label: 'ADHD Parenting', volume: '', indent: 2, isCategory: true },
  { value: 'ADHD Parenting Coaching for School-Age Children', label: 'ADHD Parenting Coaching for School-Age Children', volume: '10.2K', indent: 3 },
  { value: 'ADHD Support for Teenagers', label: 'ADHD Support for Teenagers', volume: '7.8K', indent: 3 },

  { value: 'Personal Development in Relationships', label: 'Personal Development in Relationships', volume: '', indent: 0, isCategory: true },
  { value: 'Emotional Intelligence', label: 'Emotional Intelligence', volume: '', indent: 1, isCategory: true },
  { value: 'Emotional Intelligence Training for Leaders', label: 'Emotional Intelligence Training for Leaders', volume: '8.9K', indent: 2 },
  { value: 'Emotional Intelligence Coaching for Teenagers', label: 'Emotional Intelligence Coaching for Teenagers', volume: '5.4K', indent: 2 },
  { value: 'Conflict Management', label: 'Conflict Management', volume: '', indent: 1, isCategory: true },
  { value: 'Conflict Management for Couples', label: 'Conflict Management for Couples', volume: '7.6K', indent: 2 },
  { value: 'Conflict Resolution Skills for College Students', label: 'Conflict Resolution Skills for College Students', volume: '6.1K', indent: 2 },
  { value: 'Communication Skills', label: 'Communication Skills', volume: '', indent: 1, isCategory: true },
  { value: 'Communication Coaching for Couples', label: 'Communication Coaching for Couples', volume: '9.1K', indent: 2 },
  { value: 'Assertiveness Training for Women in Relationships', label: 'Assertiveness Training for Women in Relationships', volume: '6.8K', indent: 2 },

  { value: 'Digital Relationships', label: 'Digital Relationships', volume: '', indent: 0, isCategory: true },
  { value: 'Online Friendships', label: 'Online Friendships', volume: '', indent: 1, isCategory: true },
  { value: 'Friendship Building for Remote Workers', label: 'Friendship Building for Remote Workers', volume: '7.3K', indent: 2 },
  { value: 'Virtual Friendship Support for Isolated Seniors', label: 'Virtual Friendship Support for Isolated Seniors', volume: '4.6K', indent: 2 },
  { value: 'Social Media Influence', label: 'Social Media Influence', volume: '', indent: 1, isCategory: true },
  { value: 'Building Personal Brand Relationships on Social Media', label: 'Building Personal Brand Relationships on Social Media', volume: '10.4K', indent: 2 },
  { value: 'Social Media Networking for Entrepreneurs', label: 'Social Media Networking for Entrepreneurs', volume: '8.7K', indent: 2 },
  { value: 'Digital Etiquette', label: 'Digital Etiquette', volume: '', indent: 1, isCategory: true },
  { value: 'Digital Communication Skills for Teens', label: 'Digital Communication Skills for Teens', volume: '5.8K', indent: 2 },
  { value: 'Digital Etiquette Training for Corporate Employees', label: 'Digital Etiquette Training for Corporate Employees', volume: '6.9K', indent: 2 },
];

export const NicheIdeasModal: React.FC<NicheIdeasModalProps> = ({
  open,
  onOpenChange,
  onSelectNiche,
}) => {
  const handleSelectNiche = (nicheValue: string) => {
    // Pass the clean niche value to parent
    onSelectNiche(nicheValue);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogClose>
        <DialogHeader>
          <DialogTitle className="text-2xl">3 Evergreen Markets</DialogTitle>
          <DialogDescription className="text-base pt-2">
            People are always spending money in:
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Health Category */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-lg">💚</span>
              </div>
              <Label className="text-lg font-semibold">Health</Label>
            </div>
            <Select onValueChange={handleSelectNiche}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a health niche..." />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {healthNiches.map((niche) => {
                  const indentSpaces = '    '.repeat(niche.indent); // 4 spaces per indent level

                  if (niche.isCategory) {
                    return (
                      <div key={niche.value} className="px-2 py-1.5 text-xs font-semibold text-muted-foreground" style={{ fontFamily: 'monospace' }}>
                        {indentSpaces}{niche.label}
                      </div>
                    );
                  }
                  const displayText = `${indentSpaces}${niche.label} • ${niche.volume}/mo`;
                  return (
                    <SelectItem key={niche.value} value={niche.value} style={{ fontFamily: 'monospace' }}>
                      {displayText}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Wealth Category */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                <span className="text-lg">💰</span>
              </div>
              <Label className="text-lg font-semibold">Wealth</Label>
            </div>
            <Select onValueChange={handleSelectNiche}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a wealth niche..." />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {wealthNiches.map((niche) => {
                  const indentSpaces = '    '.repeat(niche.indent); // 4 spaces per indent level

                  if (niche.isCategory) {
                    return (
                      <div key={niche.value} className="px-2 py-1.5 text-xs font-semibold text-muted-foreground" style={{ fontFamily: 'monospace' }}>
                        {indentSpaces}{niche.label}
                      </div>
                    );
                  }
                  const displayText = `${indentSpaces}${niche.label} • ${niche.volume}/mo`;
                  return (
                    <SelectItem key={niche.value} value={niche.value} style={{ fontFamily: 'monospace' }}>
                      {displayText}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Relationships Category */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center">
                <span className="text-lg">❤️</span>
              </div>
              <Label className="text-lg font-semibold">Relationships</Label>
            </div>
            <Select onValueChange={handleSelectNiche}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a relationship niche..." />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {relationshipNiches.map((niche) => {
                  const indentSpaces = '    '.repeat(niche.indent); // 4 spaces per indent level

                  if (niche.isCategory) {
                    return (
                      <div key={niche.value} className="px-2 py-1.5 text-xs font-semibold text-muted-foreground" style={{ fontFamily: 'monospace' }}>
                        {indentSpaces}{niche.label}
                      </div>
                    );
                  }
                  const displayText = `${indentSpaces}${niche.label} • ${niche.volume}/mo`;
                  return (
                    <SelectItem key={niche.value} value={niche.value} style={{ fontFamily: 'monospace' }}>
                      {displayText}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="pt-4 border-t space-y-3">
          <div className="text-xs text-muted-foreground">
            💡 Search volume estimates are based on Google Trends data
          </div>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
