export interface MarketTopic {
  value: string;
  name: string;
  volume: number;
  level: number;
}

export const healthMarketTopics: MarketTopic[] = [
  { value: "Health", name: "Health", volume: 5400000, level: 0 },

  { value: "Fitness", name: "Fitness", volume: 1200000, level: 1 },
  { value: "Strength Training", name: "Strength Training", volume: 820000, level: 2 },
  { value: "Home-Based Strength Training", name: "Home-Based Strength Training", volume: 45000, level: 3 },
  { value: "Strength Training for Postpartum Mothers", name: "Strength Training for Postpartum Mothers", volume: 12000, level: 4 },
  { value: "Strength Training for Seniors", name: "Strength Training for Seniors", volume: 38000, level: 4 },
  { value: "Bodyweight Strength Training", name: "Bodyweight Strength Training", volume: 67000, level: 3 },
  { value: "Bodyweight Training for Travelers", name: "Bodyweight Training for Travelers", volume: 8500, level: 4 },
  { value: "Bodyweight Training for Military Personnel", name: "Bodyweight Training for Military Personnel", volume: 6200, level: 4 },

  { value: "Cardio Fitness", name: "Cardio Fitness", volume: 390000, level: 2 },
  { value: "High-Intensity Interval Training (HIIT)", name: "High-Intensity Interval Training (HIIT)", volume: 245000, level: 3 },
  { value: "HIIT for Busy Professionals", name: "HIIT for Busy Professionals", volume: 15000, level: 4 },
  { value: "HIIT for Weight Loss in Women", name: "HIIT for Weight Loss in Women", volume: 22000, level: 4 },

  { value: "Yoga", name: "Yoga", volume: 890000, level: 2 },
  { value: "Power Yoga", name: "Power Yoga", volume: 78000, level: 3 },
  { value: "Power Yoga for Athletes", name: "Power Yoga for Athletes", volume: 9500, level: 4 },
  { value: "Restorative Yoga", name: "Restorative Yoga", volume: 134000, level: 3 },
  { value: "Restorative Yoga for Stress Relief", name: "Restorative Yoga for Stress Relief", volume: 18000, level: 4 },
  { value: "Restorative Yoga for Chronic Pain Sufferers", name: "Restorative Yoga for Chronic Pain Sufferers", volume: 7200, level: 4 },

  { value: "Flexibility and Mobility", name: "Flexibility and Mobility", volume: 167000, level: 2 },
  { value: "Mobility Training for Athletes", name: "Mobility Training for Athletes", volume: 28000, level: 3 },
  { value: "Flexibility Training for Office Workers", name: "Flexibility Training for Office Workers", volume: 19000, level: 3 },
  { value: "Flexibility Programs for Remote Workers", name: "Flexibility Programs for Remote Workers", volume: 8900, level: 4 },

  { value: "Nutrition", name: "Nutrition", volume: 2100000, level: 1 },
  { value: "Diet Plans", name: "Diet Plans", volume: 456000, level: 2 },
  { value: "Ketogenic Diet", name: "Ketogenic Diet", volume: 234000, level: 3 },
  { value: "Keto for Diabetics", name: "Keto for Diabetics", volume: 34000, level: 4 },
  { value: "Keto for Athletes", name: "Keto for Athletes", volume: 18000, level: 4 },
  { value: "Plant-Based Diets", name: "Plant-Based Diets", volume: 189000, level: 3 },
  { value: "Plant-Based Nutrition for Bodybuilders", name: "Plant-Based Nutrition for Bodybuilders", volume: 12000, level: 4 },
  { value: "Plant-Based Diet for Families", name: "Plant-Based Diet for Families", volume: 15000, level: 4 },

  { value: "Supplements", name: "Supplements", volume: 678000, level: 2 },
  { value: "Pre-Workout Supplements", name: "Pre-Workout Supplements", volume: 123000, level: 3 },
  { value: "Supplements for Endurance Athletes", name: "Supplements for Endurance Athletes", volume: 23000, level: 4 },
  { value: "Pre-Workout for Beginners", name: "Pre-Workout for Beginners", volume: 16000, level: 4 },
  { value: "Health Supplements", name: "Health Supplements", volume: 298000, level: 3 },
  { value: "Supplements for Men's Health", name: "Supplements for Men's Health", volume: 45000, level: 4 },
  { value: "Supplements for Hormonal Balance in Women", name: "Supplements for Hormonal Balance in Women", volume: 28000, level: 4 },

  { value: "Mental Health", name: "Mental Health", volume: 1890000, level: 1 },
  { value: "Stress Management", name: "Stress Management", volume: 234000, level: 2 },
  { value: "Mindfulness and Meditation", name: "Mindfulness and Meditation", volume: 567000, level: 3 },
  { value: "Meditation for Corporate Professionals", name: "Meditation for Corporate Professionals", volume: 19000, level: 4 },
  { value: "Meditation for Sleep Improvement", name: "Meditation for Sleep Improvement", volume: 34000, level: 4 },
  { value: "Stress Relief Techniques", name: "Stress Relief Techniques", volume: 89000, level: 3 },
  { value: "Stress Relief for Parents", name: "Stress Relief for Parents", volume: 24000, level: 4 },
  { value: "Stress Management for College Students", name: "Stress Management for College Students", volume: 18000, level: 4 },

  { value: "Therapy and Counseling", name: "Therapy and Counseling", volume: 456000, level: 2 },
  { value: "Online Therapy", name: "Online Therapy", volume: 123000, level: 3 },
  { value: "Online Therapy for Veterans", name: "Online Therapy for Veterans", volume: 15000, level: 4 },
  { value: "Online Therapy for Social Anxiety", name: "Online Therapy for Social Anxiety", volume: 28000, level: 4 },
  { value: "Cognitive Behavioral Therapy (CBT)", name: "Cognitive Behavioral Therapy (CBT)", volume: 189000, level: 3 },
  { value: "CBT for Adolescents", name: "CBT for Adolescents", volume: 22000, level: 4 },
  { value: "CBT for Obsessive-Compulsive Disorder", name: "CBT for Obsessive-Compulsive Disorder", volume: 16000, level: 4 }
];

export const wealthMarketTopics: MarketTopic[] = [
  { value: "Wealth", name: "Wealth", volume: 3200000, level: 0 },

  { value: "Investing", name: "Investing", volume: 1890000, level: 1 },
  { value: "Real Estate Investing", name: "Real Estate Investing", volume: 456000, level: 2 },
  { value: "Residential Real Estate", name: "Residential Real Estate", volume: 234000, level: 3 },
  { value: "Real Estate for First-Time Homebuyers", name: "Real Estate for First-Time Homebuyers", volume: 89000, level: 4 },
  { value: "Real Estate Investing for Single Parents", name: "Real Estate Investing for Single Parents", volume: 12000, level: 4 },
  { value: "Commercial Real Estate", name: "Commercial Real Estate", volume: 167000, level: 3 },
  { value: "Commercial Real Estate for Small Business Owners", name: "Commercial Real Estate for Small Business Owners", volume: 18000, level: 4 },

  { value: "Stock Market Investing", name: "Stock Market Investing", volume: 678000, level: 2 },
  { value: "Dividend Investing", name: "Dividend Investing", volume: 123000, level: 3 },
  { value: "Dividend Investing for Retirees", name: "Dividend Investing for Retirees", volume: 34000, level: 4 },
  { value: "Growth Stock Investing", name: "Growth Stock Investing", volume: 89000, level: 3 },
  { value: "Stock Investing for Young Professionals", name: "Stock Investing for Young Professionals", volume: 28000, level: 4 },
  { value: "Stock Market Education for Beginners", name: "Stock Market Education for Beginners", volume: 45000, level: 4 },

  { value: "Cryptocurrency", name: "Cryptocurrency", volume: 890000, level: 2 },
  { value: "Bitcoin Investing", name: "Bitcoin Investing", volume: 234000, level: 3 },
  { value: "Bitcoin for Beginners", name: "Bitcoin for Beginners", volume: 67000, level: 4 },
  { value: "Altcoin Trading", name: "Altcoin Trading", volume: 156000, level: 3 },
  { value: "DeFi (Decentralized Finance)", name: "DeFi (Decentralized Finance)", volume: 89000, level: 3 },
  { value: "DeFi for Beginners", name: "DeFi for Beginners", volume: 28000, level: 4 },

  { value: "Business and Entrepreneurship", name: "Business and Entrepreneurship", volume: 1234000, level: 1 },
  { value: "Starting a Business", name: "Starting a Business", volume: 345000, level: 2 },
  { value: "Online Business", name: "Online Business", volume: 234000, level: 3 },
  { value: "E-commerce", name: "E-commerce", volume: 567000, level: 3 },
  { value: "Dropshipping", name: "Dropshipping", volume: 189000, level: 4 },
  { value: "Amazon FBA", name: "Amazon FBA", volume: 123000, level: 4 },
  { value: "Print on Demand", name: "Print on Demand", volume: 78000, level: 4 },

  { value: "Freelancing", name: "Freelancing", volume: 234000, level: 2 },
  { value: "Freelance Writing", name: "Freelance Writing", volume: 89000, level: 3 },
  { value: "Content Writing for Startups", name: "Content Writing for Startups", volume: 15000, level: 4 },
  { value: "Freelance Graphic Design", name: "Freelance Graphic Design", volume: 67000, level: 3 },
  { value: "Logo Design Services", name: "Logo Design Services", volume: 34000, level: 4 },

  { value: "Passive Income", name: "Passive Income", volume: 456000, level: 1 },
  { value: "Rental Income", name: "Rental Income", volume: 123000, level: 2 },
  { value: "Airbnb Hosting", name: "Airbnb Hosting", volume: 89000, level: 3 },
  { value: "Airbnb for Suburban Hosts", name: "Airbnb for Suburban Hosts", volume: 18000, level: 4 },
  { value: "Digital Products", name: "Digital Products", volume: 167000, level: 2 },
  { value: "Online Courses", name: "Online Courses", volume: 234000, level: 3 },
  { value: "Course Creation for Experts", name: "Course Creation for Experts", volume: 28000, level: 4 },
  { value: "Affiliate Marketing", name: "Affiliate Marketing", volume: 189000, level: 3 },
  { value: "Affiliate Marketing for Beauty Bloggers", name: "Affiliate Marketing for Beauty Bloggers", volume: 12000, level: 4 },
  { value: "Affiliate Marketing for Travel Writers", name: "Affiliate Marketing for Travel Writers", volume: 9500, level: 4 }
];

export const relationshipMarketTopics: MarketTopic[] = [
  { value: "Relationships", name: "Relationships", volume: 2890000, level: 0 },

  { value: "Dating", name: "Dating", volume: 1234000, level: 1 },
  { value: "Online Dating", name: "Online Dating", volume: 456000, level: 2 },
  { value: "Dating Apps", name: "Dating Apps", volume: 234000, level: 3 },
  { value: "Dating App Optimization", name: "Dating App Optimization", volume: 45000, level: 4 },
  { value: "Dating Profile Tips", name: "Dating Profile Tips", volume: 78000, level: 4 },
  { value: "Long-Distance Dating", name: "Long-Distance Dating", volume: 123000, level: 3 },
  { value: "Dating After Divorce", name: "Dating After Divorce", volume: 89000, level: 3 },
  { value: "Dating for Single Parents", name: "Dating for Single Parents", volume: 67000, level: 4 },
  { value: "Dating Over 50", name: "Dating Over 50", volume: 156000, level: 3 },
  { value: "Senior Dating Advice", name: "Senior Dating Advice", volume: 34000, level: 4 },

  { value: "Marriage and Commitment", name: "Marriage and Commitment", volume: 678000, level: 1 },
  { value: "Wedding Planning", name: "Wedding Planning", volume: 345000, level: 2 },
  { value: "Budget Wedding Planning", name: "Budget Wedding Planning", volume: 89000, level: 3 },
  { value: "DIY Wedding Decorations", name: "DIY Wedding Decorations", volume: 56000, level: 4 },
  { value: "Destination Weddings", name: "Destination Weddings", volume: 123000, level: 3 },
  { value: "Beach Wedding Planning", name: "Beach Wedding Planning", volume: 28000, level: 4 },
  { value: "Marriage Counseling", name: "Marriage Counseling", volume: 189000, level: 2 },
  { value: "Couples Therapy", name: "Couples Therapy", volume: 167000, level: 3 },
  { value: "Online Marriage Counseling", name: "Online Marriage Counseling", volume: 45000, level: 4 },
  { value: "Premarital Counseling", name: "Premarital Counseling", volume: 67000, level: 3 },

  { value: "Family Dynamics", name: "Family Dynamics", volume: 456000, level: 1 },
  { value: "Parenting", name: "Parenting", volume: 890000, level: 2 },
  { value: "New Parent Support", name: "New Parent Support", volume: 234000, level: 3 },
  { value: "Sleep Training for Babies", name: "Sleep Training for Babies", volume: 123000, level: 4 },
  { value: "Breastfeeding Support", name: "Breastfeeding Support", volume: 89000, level: 4 },
  { value: "Single Parenting", name: "Single Parenting", volume: 167000, level: 3 },
  { value: "Co-Parenting After Divorce", name: "Co-Parenting After Divorce", volume: 78000, level: 4 },
  { value: "Parenting Teenagers", name: "Parenting Teenagers", volume: 156000, level: 3 },
  { value: "Teen Communication Strategies", name: "Teen Communication Strategies", volume: 34000, level: 4 },

  { value: "Relationship Skills", name: "Relationship Skills", volume: 345000, level: 1 },
  { value: "Communication", name: "Communication", volume: 234000, level: 2 },
  { value: "Conflict Resolution", name: "Conflict Resolution", volume: 123000, level: 3 },
  { value: "Active Listening Skills", name: "Active Listening Skills", volume: 56000, level: 4 },
  { value: "Trust Building", name: "Trust Building", volume: 89000, level: 3 },
  { value: "Rebuilding Trust After Infidelity", name: "Rebuilding Trust After Infidelity", volume: 28000, level: 4 },
  { value: "Emotional Intelligence", name: "Emotional Intelligence", volume: 167000, level: 2 },
  { value: "EQ in Relationships", name: "EQ in Relationships", volume: 45000, level: 3 },

  { value: "Social Connections", name: "Social Connections", volume: 289000, level: 1 },
  { value: "Friendship", name: "Friendship", volume: 189000, level: 2 },
  { value: "Making Friends as an Adult", name: "Making Friends as an Adult", volume: 89000, level: 3 },
  { value: "Friendship for Introverts", name: "Friendship for Introverts", volume: 34000, level: 4 },
  { value: "Maintaining Long-Distance Friendships", name: "Maintaining Long-Distance Friendships", volume: 23000, level: 4 },
  { value: "Social Anxiety", name: "Social Anxiety", volume: 234000, level: 2 },
  { value: "Overcoming Social Anxiety", name: "Overcoming Social Anxiety", volume: 123000, level: 3 },
  { value: "Social Skills for Professionals", name: "Social Skills for Professionals", volume: 67000, level: 4 },

  { value: "Personal Development in Relationships", name: "Personal Development in Relationships", volume: 178000, level: 1 },
  { value: "Self-Love and Self-Care", name: "Self-Love and Self-Care", volume: 345000, level: 2 },
  { value: "Boundary Setting", name: "Boundary Setting", volume: 156000, level: 3 },
  { value: "Healthy Boundaries with Family", name: "Healthy Boundaries with Family", volume: 45000, level: 4 },
  { value: "Setting Boundaries at Work", name: "Setting Boundaries at Work", volume: 67000, level: 4 },
  { value: "Codependency Recovery", name: "Codependency Recovery", volume: 89000, level: 3 },
  { value: "Healing from Toxic Relationships", name: "Healing from Toxic Relationships", volume: 123000, level: 3 },
  { value: "Recovery from Narcissistic Abuse", name: "Recovery from Narcissistic Abuse", volume: 78000, level: 4 }
];
