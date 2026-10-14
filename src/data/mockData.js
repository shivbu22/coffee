export const CATEGORIES = [
  { id: 'nightout', name: 'Nightout Buddy', icon: 'Moon', count: 240, rate: '₹2,000/hr', desc: 'Late night drives, midnight street food, safe night companion' },
  { id: 'movie', name: 'Movie Buddy', icon: 'Film', count: 310, rate: '₹1,000/hr', desc: 'Never watch solo; multiplex, popcorn & post-movie film talks' },
  { id: 'shopping', name: 'Shopping Buddy', icon: 'ShoppingBag', count: 195, rate: '₹1,000/hr', desc: 'Honest style advice, flea market walks, mall partner' },
  { id: 'clubbing', name: 'Clubbing Buddy', icon: 'Sparkles', count: 180, rate: '₹2,000/hr', desc: 'Dance floor energy, safe clubbing companion, nightlife guide' },
  { id: 'travel', name: 'Travel Buddy', icon: 'Compass', count: 420, rate: '₹1,500/hr', desc: 'Weekend road trips, hill stations & shared travel experiences' },
  { id: 'cafe', name: 'Cafe Buddy', icon: 'Coffee', count: 380, rate: '₹500/hr', desc: 'Specialty coffee trails, deep conversations & chill downtime' },
  { id: 'fitness', name: 'Fitness Buddy', icon: 'Dumbbell', count: 290, rate: '₹1,000/hr', desc: 'Gym spots, morning runs & workout accountability partner' },
  { id: 'gaming', name: 'Gaming Buddy', icon: 'Laptop', count: 215, rate: '₹1,000/hr', desc: 'LAN parties, gaming cafes & console co-op gaming partner' },
  { id: 'dance', name: 'Dance Buddy', icon: 'Flame', count: 165, rate: '₹1,000/hr', desc: 'Salsa, garba, workshops & confident dance floor partner' },
  { id: 'driving', name: 'Driving Buddy', icon: 'Compass', count: 140, rate: '₹1,000/hr', desc: 'Highway partner, navigation assistance & scenic road trips' },
  { id: 'photography', name: 'Photography Buddy', icon: 'Camera', count: 175, rate: '₹2,000/hr', desc: 'Aesthetic photo walks, street portraits & social content' },
  { id: 'city', name: 'City Explorer Buddy', icon: 'MapPin', count: 320, rate: '₹1,000/hr', desc: 'Heritage walks, hidden architectural gems & local food spots' },
  { id: 'intern', name: 'Intern Buddy', icon: 'Briefcase', count: 130, rate: '₹300/hr', desc: 'Quick local errands, event assistance & logistics runner' },
  { id: 'interview', name: 'Interview Buddy', icon: 'Briefcase', count: 155, rate: '₹500/hr', desc: 'Mock interview practice, HR drill feedback & confidence prep' },
  { id: 'study', name: 'Study & Co-work Buddy', icon: 'Laptop', count: 260, rate: '₹400/hr', desc: 'Library deep-work, coworking cafes & exam sprint focus' },
  { id: 'carpool', name: 'Car Pooling Buddy', icon: 'Users', count: 190, rate: '₹300/trip', desc: 'Safe shared rides, verified daily office commutes' }
];

export const PLATFORM_STATS = {
  onlineBuddies: 1327,
  totalBuddies: '1M+',
  connectionsMade: '200K+',
  trustRating: '4.9★',
  citiesCovered: '400+'
};

export const TESTIMONIALS = [
  {
    id: 't_1',
    name: 'Meera Kapoor',
    city: 'Mumbai',
    role: 'Client • Bandra West',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces',
    category: 'Movie & Cafe Buddy',
    text: 'Moved to Bandra last month and didn’t have company for late-night cinema screenings. Booked a Movie Buddy in 10 minutes—super safe, polite, and great post-movie coffee conversation!'
  },
  {
    id: 't_2',
    name: 'Rahul Sinha',
    city: 'Bengaluru',
    role: 'Companion Buddy • Koramangala',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces',
    category: 'Gaming & Fitness Buddy',
    text: 'I earn ₹18,000+ each month just accompanying people for gym workouts and weekend gaming cafe sessions. Payouts via UPI are instant and reliable.'
  },
  {
    id: 't_3',
    name: 'Divya Nair',
    city: 'Delhi NCR',
    role: 'Client • Hauz Khas',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&h=200&fit=crop&crop=faces',
    category: 'Shopping & Style Buddy',
    text: 'Shopping at Sarojini Nagar and Khan Market is so much more fun with an honest style companion. Felt 100% comfortable because of the Aadhaar badge.'
  },
  {
    id: 't_4',
    name: 'Arjun Mehta',
    city: 'Pune',
    role: 'Companion Buddy • Viman Nagar',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&crop=faces',
    category: 'Travel & Nightout Buddy',
    text: 'Joined as a travel buddy for weekend road trips to Lonavala and Mahabaleshwar. Met incredible people and got paid on time with zero hassle.'
  }
];

export const CITIES = [
  'All Cities', 'Bengaluru', 'Mumbai', 'Delhi NCR', 'Pune', 'Hyderabad', 'Kolkata', 'Goa', 'Chennai', 'Jaipur'
];

export const INITIAL_COMPANIONS = [
  {
    id: 'comp_1',
    name: 'Priya Sharma',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=faces',
    city: 'Bengaluru',
    area: 'Indiranagar & Koramangala',
    hourlyRate: 450,
    tripRate: 2000,
    rating: 4.9,
    reviewsCount: 38,
    isStar: true,
    isAadhaarVerified: true,
    isOnline: true,
    bio: 'Passionate specialty coffee explorer and amateur street photographer. Love discovering cozy cafes, bookshops, and weekend art exhibitions.',
    services: ['Cafe & Dining Buddy', 'City Explorer & Guide', 'Study & Co-working Buddy'],
    languages: ['English', 'Hindi', 'Kannada'],
    completedHangouts: 54
  },
  {
    id: 'comp_2',
    name: 'Arjun Mehta',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=faces',
    city: 'Mumbai',
    area: 'Bandra & Lower Parel',
    hourlyRate: 600,
    tripRate: 2800,
    rating: 4.85,
    reviewsCount: 42,
    isStar: false,
    isAadhaarVerified: true,
    isOnline: true,
    bio: 'Certified calisthenics trainer & music enthusiast. Looking to help people stay committed to workout goals or check out techno gigs in the city.',
    services: ['Gym & Fitness Partner', 'Nightout & Clubbing', 'Travel & Roadtrip Buddy'],
    languages: ['English', 'Hindi', 'Gujarati'],
    completedHangouts: 61
  },
  {
    id: 'comp_3',
    name: 'Ananya Sen',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=faces',
    city: 'Goa',
    area: 'Anjuna & Panjim',
    hourlyRate: 500,
    tripRate: 2500,
    rating: 5.0,
    reviewsCount: 29,
    isStar: true,
    isAadhaarVerified: true,
    isOnline: false,
    bio: 'Digital nomad and coastal wanderer. Up for beach sunsets, acoustic jam sessions, secret cliff trails, and vegan cafes.',
    services: ['Travel & Roadtrip Buddy', 'Cafe & Dining Buddy', 'City Explorer & Guide'],
    languages: ['English', 'Bengali', 'Hindi'],
    completedHangouts: 43
  },
  {
    id: 'comp_4',
    name: 'Kabir Kapoor',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=faces',
    city: 'Delhi NCR',
    area: 'Hauz Khas & CyberHub',
    hourlyRate: 400,
    tripRate: 1800,
    rating: 4.75,
    reviewsCount: 24,
    isStar: false,
    isAadhaarVerified: true,
    isOnline: true,
    bio: 'Huge cinephile and stand-up comedy regular. Never miss a late-night IMAX show or food trail in Chandni Chowk.',
    services: ['Movie & Concert Companion', 'Cafe & Dining Buddy', 'City Explorer & Guide'],
    languages: ['English', 'Hindi', 'Punjabi'],
    completedHangouts: 31
  },
  {
    id: 'comp_5',
    name: 'Meera Nair',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop&crop=faces',
    city: 'Hyderabad',
    area: 'Jubilee Hills & Hitec City',
    hourlyRate: 550,
    tripRate: 2200,
    rating: 4.95,
    reviewsCount: 33,
    isStar: true,
    isAadhaarVerified: true,
    isOnline: true,
    bio: 'Tech founder & bibliophile. Enjoy coworking sprints at third-wave coffee roasters, deep philosophical chats, and badminton on weekends.',
    services: ['Study & Co-working Buddy', 'Cafe & Dining Buddy', 'Gym & Fitness Partner'],
    languages: ['English', 'Hindi', 'Malayalam', 'Telugu'],
    completedHangouts: 49
  },
  {
    id: 'comp_6',
    name: 'Vikram Rathore',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=faces',
    city: 'Pune',
    area: 'Koregaon Park & Viman Nagar',
    hourlyRate: 480,
    tripRate: 2200,
    rating: 4.88,
    reviewsCount: 19,
    isStar: false,
    isAadhaarVerified: true,
    isOnline: false,
    bio: 'Roadtrip enthusiast with 50,000+ km of highway driving experience. Always ready for Lonavala monsoon drives and weekend camping.',
    services: ['Travel & Roadtrip Buddy', 'Nightout & Clubbing', 'Movie & Concert Companion'],
    languages: ['English', 'Hindi', 'Marathi'],
    completedHangouts: 27
  }
];

export const INITIAL_REQUESTS = [
  {
    id: 'req_101',
    authorName: 'Rohan Varma',
    authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop&crop=faces',
    authorCity: 'Bengaluru',
    postedAs: 'client',
    serviceCategory: 'Gym & Fitness Partner',
    title: 'Need a dedicated gym buddy for morning 7 AM strength & HIIT sessions',
    description: 'Looking for an energetic workout partner to hit the Indiranagar Cult gym every weekday morning. Need someone who can spot bench presses, push high intensity intervals, and keep motivation on point! Positive vibes only.',
    budget: 450,
    billingType: 'hourly',
    timeAgo: '12m ago',
    upvotes: 16,
    isUpvoted: false,
    chatStatus: 'none', // 'none' | 'pending' | 'accepted'
    roomId: null
  },
  {
    id: 'req_102',
    authorName: 'Sanya Mukherjee',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=faces',
    authorCity: 'Mumbai',
    postedAs: 'client',
    serviceCategory: 'Cafe & Dining Buddy',
    title: 'Looking for a fellow coffee lover to explore artisan roasteries in Bandra',
    description: 'Visiting Mumbai for 3 days and want to try out Subko, Blue Tokai, and Veronica’s. Would love a local companion who enjoys specialty pour-overs, good conversations about design/books, and photography!',
    budget: 600,
    billingType: 'trip',
    timeAgo: '45m ago',
    upvotes: 28,
    isUpvoted: true,
    chatStatus: 'pending',
    roomId: null
  },
  {
    id: 'req_103',
    authorName: 'Devansh Roy',
    authorAvatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&h=200&fit=crop&crop=faces',
    authorCity: 'Delhi NCR',
    postedAs: 'client',
    serviceCategory: 'Movie & Concert Companion',
    title: 'Have an extra ticket for Coldplay tribute night at CyberHub, need companion',
    description: 'Booked front row access at the acoustic live stage this Saturday night. Friends bailed out last minute. Looking for an upbeat, music-loving buddy to sing along and enjoy dinner afterwards. Expenses covered!',
    budget: 800,
    billingType: 'trip',
    timeAgo: '2h ago',
    upvotes: 34,
    isUpvoted: false,
    chatStatus: 'accepted',
    roomId: 'room_1'
  },
  {
    id: 'req_104',
    authorName: 'Aaditya Rao',
    authorAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&h=200&fit=crop&crop=faces',
    authorCity: 'Goa',
    postedAs: 'buddy',
    serviceCategory: 'Travel & Roadtrip Buddy',
    title: 'Certified scuba diver offering guided South Goa sunset coastal ride',
    description: 'Offering half-day companion trips across Cola beach and Cabo de Rama cliffs on dual Royal Enfields. Know the secret tide pools, fresh seafood shacks, and best photography vantage points.',
    budget: 1500,
    billingType: 'trip',
    timeAgo: '3h ago',
    upvotes: 49,
    isUpvoted: false,
    chatStatus: 'none',
    roomId: null
  }
];

export const INITIAL_CHATS = [
  {
    id: 'room_1',
    participant: {
      name: 'Priya Sharma',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&crop=faces',
      city: 'Bengaluru',
      area: 'Indiranagar',
      rating: 4.9,
      hourlyRate: 450,
      completedHangouts: 54,
      isOnline: true,
      role: 'buddy'
    },
    unreadCount: 1,
    lastMessageTime: '10:35 AM',
    messages: [
      {
        id: 'm1',
        sender: 'other',
        text: 'Hey! Saw your request for the specialty coffee trail in Indiranagar. I know 3 amazing spots with Ethiopian pour-overs! ☕',
        time: '10:30 AM',
        isRead: true
      },
      {
        id: 'm2',
        sender: 'me',
        text: 'Awesome! That sounds perfect. Are you free this Saturday around 3 PM?',
        time: '10:32 AM',
        isRead: true
      },
      {
        id: 'm3',
        sender: 'other',
        text: 'Yes! Saturday 3 PM works nicely. Let me send you a booking proposal so we can lock it in.',
        time: '10:34 AM',
        isRead: true
      },
      {
        id: 'm4',
        sender: 'other',
        isOffer: true,
        offerData: {
          offerId: 'off_901',
          title: 'Indiranagar Specialty Coffee Trail (2 Hours)',
          amount: 800,
          billingType: 'trip',
          hours: 2,
          venue: 'Third Wave Coffee, 12th Main Indiranagar',
          dateTime: 'Sat, Oct 18 • 3:00 PM - 5:00 PM',
          terms: 'Includes visiting 2 roasteries, guide through bean profiles, and high-res cafe portrait photos.',
          status: 'pending' // 'pending' | 'accepted' | 'declined'
        },
        time: '10:35 AM',
        isRead: false
      }
    ]
  },
  {
    id: 'room_2',
    participant: {
      name: 'Arjun Mehta',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&crop=faces',
      city: 'Mumbai',
      area: 'Bandra West',
      rating: 4.85,
      hourlyRate: 600,
      completedHangouts: 61,
      isOnline: false,
      role: 'buddy'
    },
    unreadCount: 0,
    lastMessageTime: 'Yesterday',
    messages: [
      {
        id: 'm20',
        sender: 'me',
        text: 'Hey Arjun, do you also train at the Bandra gym in the evenings?',
        time: 'Yesterday 6:15 PM',
        isRead: true
      },
      {
        id: 'm21',
        sender: 'other',
        text: 'Yes! Tuesday and Thursday 7 PM are my standard slots. We can sync up for leg day this week.',
        time: 'Yesterday 6:40 PM',
        isRead: true
      }
    ]
  },
  {
    id: 'room_3',
    participant: {
      name: 'Ananya Sen',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces',
      city: 'Goa',
      area: 'Anjuna & Vagator',
      rating: 5.0,
      hourlyRate: 500,
      completedHangouts: 29,
      isOnline: true,
      role: 'buddy'
    },
    unreadCount: 0,
    lastMessageTime: 'Oct 12',
    messages: [
      {
        id: 'm30',
        sender: 'other',
        text: 'Hey! Ready for the Vagator cliff sunset photowalk this Sunday?',
        time: 'Oct 12, 4:10 PM',
        isRead: true
      },
      {
        id: 'm31',
        sender: 'other',
        isOffer: true,
        offerData: {
          offerId: 'off_902',
          title: 'Sunset Cliffs & Beach Cafe Photowalk',
          amount: 1000,
          billingType: 'trip',
          hours: 2,
          venue: 'Vagator Hilltop Cafe, Goa',
          dateTime: 'Sun, Oct 19 • 5:00 PM - 7:00 PM',
          terms: 'Sunset photography at cliffs, drink at Hilltop, guide through hidden North Goa trails.',
          status: 'accepted'
        },
        time: 'Oct 12, 4:15 PM',
        isRead: true
      },
      {
        id: 'm32',
        sender: 'me',
        text: 'Accepted! Escrow payment locked. See you at the cliff cafe.',
        time: 'Oct 12, 4:18 PM',
        isRead: true
      }
    ]
  },
  {
    id: 'room_4',
    participant: {
      name: 'Divya Nair',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&h=200&fit=crop&crop=faces',
      city: 'Delhi NCR',
      area: 'Hauz Khas',
      rating: 4.95,
      hourlyRate: 500,
      completedHangouts: 44,
      isOnline: false,
      role: 'buddy'
    },
    unreadCount: 0,
    lastMessageTime: 'Oct 10',
    messages: [
      {
        id: 'm40',
        sender: 'other',
        text: 'Hey! Saw you were looking for someone to check out the French cinema festival at India Habitat Centre!',
        time: 'Oct 10, 11:20 AM',
        isRead: true
      },
      {
        id: 'm41',
        sender: 'me',
        text: 'Yes! Would love to have company for the Saturday screening.',
        time: 'Oct 10, 11:45 AM',
        isRead: true
      }
    ]
  }
];

export const INITIAL_KYC_REQUESTS = [
  {
    id: 'kyc_1',
    userName: 'Tanmay Joshi',
    email: 'tanmay.j@gmail.com',
    phone: '+91 98201 44821',
    city: 'Pune',
    aadhaarNumber: 'XXXX-XXXX-4819',
    frontImage: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=500&h=300&fit=crop',
    backImage: 'https://images.unsplash.com/photo-1568667256549-094345857637?w=500&h=300&fit=crop',
    submittedAt: 'Today at 02:15 AM',
    status: 'pending'
  },
  {
    id: 'kyc_2',
    userName: 'Pooja Hegde',
    email: 'pooja.h99@outlook.com',
    phone: '+91 94480 12890',
    city: 'Bengaluru',
    aadhaarNumber: 'XXXX-XXXX-9932',
    frontImage: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=500&h=300&fit=crop',
    backImage: 'https://images.unsplash.com/photo-1568667256549-094345857637?w=500&h=300&fit=crop',
    submittedAt: 'Yesterday at 04:30 PM',
    status: 'verified'
  }
];

export const SUBSCRIPTION_PLANS = [
  {
    tier: 'daily_basic',
    name: '1-Day Basic Pass',
    price: 9,
    originalPrice: 49,
    validity: '24 Hours',
    tag: 'TRIAL',
    tagColor: 'var(--color-emerald)',
    features: [
      'Unlimited Feed Browsing',
      'Send up to 3 Connection Requests',
      'Verified Badge visibility for 24h',
      'Direct chat access once accepted'
    ],
    popular: false
  },
  {
    tier: 'weekly_basic',
    name: '7-Day Explorer',
    price: 49,
    originalPrice: 299,
    validity: '7 Days',
    tag: 'MOST POPULAR',
    tagColor: 'var(--color-primary)',
    features: [
      'Unlimited In-Feed Connection Requests',
      'Propose Custom Rates on Client Requests',
      'Priority Matching in your City',
      'WhatsApp / SMS instant alerts',
      'Full Access to In-Chat Negotiations'
    ],
    popular: true
  },
  {
    tier: 'basic',
    name: 'Monthly Pro',
    price: 299,
    originalPrice: 999,
    validity: '30 Days',
    tag: 'VALUE',
    tagColor: 'var(--color-rose)',
    features: [
      'Everything in 7-Day Explorer',
      'Priority Search Algorithm Boost',
      'Identity Vault Verified Shield',
      'Zero Commission on In-Chat Quotes',
      'Access to Exclusive Hangout Events'
    ],
    popular: false
  },
  {
    tier: 'star_member',
    name: 'Star Member VIP',
    price: 999,
    originalPrice: 2499,
    validity: '90 Days',
    tag: 'ELITE',
    tagColor: 'var(--color-gold)',
    features: [
      'Gold Star Spotlight Badge on Profile',
      'Top placement on City Companion Feed',
      'Unlimited requests & custom offers',
      'Dedicated 24/7 VIP Concierge Support',
      'Private Invite-Only Travel & Dining Clubs'
    ],
    popular: false
  }
];

export const INDIAN_STATES = [
  'Andhra Pradesh',
  'Assam',
  'Bihar',
  'Chandigarh',
  'Chhattisgarh',
  'Delhi NCR',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu & Kashmir',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Tamil Nadu',
  'Telangana',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal'
];

export const DEFAULT_BUDDY_PROFILE = {
  id: 'buddy_self',
  name: 'Priya Sharma',
  phone: '+91 98765 43210',
  gender: 'female',
  avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&h=500&fit=crop&crop=faces',
  city: 'Bengaluru',
  state: 'Karnataka',
  pincode: '560038',
  role: 'both', // 'buddy' | 'client' | 'both'
  isOnline: true,
  isAadhaarVerified: true,
  aadhaarNumber: 'XXXX-XXXX-8921',
  aadhaarStatus: 'verified', // 'verified' | 'pending' | 'unverified'
  bio: 'Specialty coffee enthusiast, amateur street photographer & heritage walker in Bengaluru. Love discovering quiet roasteries, contemporary art shows, and indie bookshops. Friendly, polite, and always happy to recommend great spots!',
  hourlyRate: 450,
  services: [
    { name: 'Cafe & Dining Buddy', rate: 450, desc: 'Artisan cafes, brunch trails, pour-over tasting & relaxing conversations' },
    { name: 'City Explorer & Guide', rate: 550, desc: 'Heritage walks, Cubbon park tours, flea markets & hidden architectural gems' },
    { name: 'Study & Co-working Buddy', rate: 400, desc: 'Quiet library deep-work, coworking cafes & accountability sessions' }
  ],
  languages: ['English', 'Hindi', 'Kannada'],
  socialLinks: {
    instagram: 'priyacoffee_blr',
    facebook: 'priyasharma.blr',
    linkedin: 'priya-sharma-blr',
    twitter: 'priyasharmablr'
  },
  metrics: {
    totalEarned: 18450,
    hourlyAvg: 480,
    completedTrips: 34,
    rating: 4.92,
    reviewsCount: 28,
    acceptanceRate: '96%'
  },
  membership: {
    planName: '7-Day Explorer Active',
    expiresIn: '5 Days',
    validUntil: 'Oct 19, 2026',
    tier: 'weekly_basic'
  },
  recentBookings: [
    { id: 'b_1', clientName: 'Rohan Varma', city: 'Bengaluru', service: 'Cafe & Dining Buddy', date: 'Yesterday, 4:30 PM', amount: 900, status: 'Completed', rating: 5.0 },
    { id: 'b_2', clientName: 'Sneha Patel', city: 'Bengaluru', service: 'City Explorer & Guide', date: 'Oct 11, 2026', amount: 1650, status: 'Completed', rating: 5.0 },
    { id: 'b_3', clientName: 'Vikram Joshi', city: 'Bengaluru', service: 'Study & Co-working Buddy', date: 'Tomorrow, 10:00 AM', amount: 800, status: 'Scheduled', rating: null }
  ],
  reviews: [
    { id: 'rev_1', author: 'Rohan V.', rating: 5, date: 'Yesterday', text: 'Priya was fantastic! Took me to the best pour-over cafe in Indiranagar. Very knowledgeable and polite.' },
    { id: 'rev_2', author: 'Sneha P.', rating: 5, date: '3 days ago', text: 'Awesome heritage walk companion. Felt completely safe, relaxed, and had wonderful conversations.' },
    { id: 'rev_3', author: 'Aditi K.', rating: 5, date: 'Last week', text: 'Great study buddy at Church Street Social. Super focused and supportive.' }
  ]
};

export const INITIAL_DASHBOARD_DATA = {
  activeHangout: {
    id: 'hang_live_101',
    activityTitle: 'Specialty Coffee Roastery Tasting',
    category: 'Cafe & Dining Buddy',
    partnerName: 'Rohan Varma',
    partnerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=faces',
    partnerRole: 'client',
    venue: 'Blue Tokai Roasters, 12th Main Indiranagar, Bengaluru',
    scheduledTime: 'Today • 05:30 PM - 07:30 PM',
    status: 'in_progress', // 'in_progress' | 'upcoming' | 'completed'
    handshakePin: '4892',
    handshakeVerified: true,
    safetyTimerMinutesRemaining: 42,
    escrowAmount: 900,
    escrowStatus: 'held_in_vault',
    emergencyContact: '+91 98201 44821 (Guardian Active)',
    liveSafeBeaconActive: true
  },
  upcomingBookings: [
    {
      id: 'book_201',
      title: 'Cubbon Park Morning Walk & Jogging Partner',
      category: 'Gym & Fitness Partner',
      partnerName: 'Arjun Mehta',
      partnerAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=faces',
      partnerCity: 'Bengaluru',
      venue: 'Cubbon Park Queen Victoria Gate',
      dateTime: 'Tomorrow, Oct 15 • 07:00 AM (2h)',
      amount: 1100,
      status: 'confirmed',
      handshakePin: '7319',
      escrowStatus: 'Escrow Locked'
    },
    {
      id: 'book_202',
      title: 'Church Street Book Hunt & Artisan Bakery Walk',
      category: 'City Explorer & Guide',
      partnerName: 'Sneha Patel',
      partnerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=faces',
      partnerCity: 'Bengaluru',
      venue: 'Blossom Book House, Church St',
      dateTime: 'Friday, Oct 17 • 04:00 PM (3h)',
      amount: 1650,
      status: 'confirmed',
      handshakePin: '2904',
      escrowStatus: 'Escrow Locked'
    },
    {
      id: 'book_203',
      title: 'National Gallery of Modern Art (NGMA) Tour',
      category: 'City Explorer & Guide',
      partnerName: 'Aditi Kulkarni',
      partnerAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop&crop=faces',
      partnerCity: 'Bengaluru',
      venue: 'NGMA, Palace Road, Vasanth Nagar',
      dateTime: 'Sunday, Oct 19 • 11:30 AM (2.5h)',
      amount: 1375,
      status: 'pending_quote_approval',
      handshakePin: '8841',
      escrowStatus: 'Awaiting Acceptance'
    }
  ],
  wallet: {
    availableBalance: 4850,
    inEscrow: 2750,
    totalLifetimeEarned: 23200,
    upiId: 'priya.sharma@okhdfcbank',
    autoWithdraw: true,
    lastSettlementDate: 'Yesterday, 11:40 PM',
    transactions: [
      { id: 'tx_101', date: 'Today, 02:30 PM', title: 'Escrow Deposit: Rohan V. Coffee Session', amount: 900, type: 'credit', status: 'Held in Escrow' },
      { id: 'tx_102', date: 'Yesterday, 11:40 PM', title: 'IMPS Bank Transfer to HDFC Bank (UPI)', amount: -2500, type: 'debit', status: 'Settled to Bank (Ref: 9812401)' },
      { id: 'tx_103', date: 'Oct 12, 2026', title: 'Completed Hangout: Sneha P. Heritage Walk', amount: 1650, type: 'credit', status: 'Unlocked & Transferred' },
      { id: 'tx_104', date: 'Oct 10, 2026', title: 'IMPS Bank Transfer to HDFC Bank (UPI)', amount: -3200, type: 'debit', status: 'Settled to Bank (Ref: 9801442)' },
      { id: 'tx_105', date: 'Oct 08, 2026', title: 'Completed Hangout: Vikram J. Library Sprint', amount: 800, type: 'credit', status: 'Unlocked & Transferred' }
    ]
  },
  safetyEnclave: {
    aadhaarStatus: 'AUDITED & ACTIVE',
    aadhaarRef: 'UIDAI-ENCLAVE-560038-2026',
    vaultStorage: 'AES-256 Cold Storage Enclave',
    emergencyContactName: 'Vikram Sharma (Family Guardian)',
    emergencyContactPhone: '+91 98201 44821',
    sosDispatchReady: true,
    lastAuditTimestamp: 'Oct 02, 2026 • Tier 1 Cleared'
  }
};

export const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif_1',
    type: 'booking',
    title: 'Counter-Offer Accepted & Escrow Locked',
    message: 'Rohan Varma accepted your proposed rate of ₹900 for Specialty Coffee Roastery Tasting. Handshake PIN: 4892.',
    timeAgo: '12m ago',
    timestamp: 'Today, 02:30 PM',
    isRead: false,
    actorName: 'Rohan Varma',
    actorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop&crop=faces',
    actionLabel: 'View Session',
    targetTab: 'dashboard',
    badge: 'Dual PIN Ready',
    priority: 'high'
  },
  {
    id: 'notif_2',
    type: 'chat',
    title: 'New Message from Sneha Patel',
    message: '"Hey Priya, looking forward to the Church Street book hunt tomorrow! Let me know if 4 PM still works."',
    timeAgo: '35m ago',
    timestamp: 'Today, 02:07 PM',
    isRead: false,
    actorName: 'Sneha Patel',
    actorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces',
    actionLabel: 'Reply in Chat',
    targetTab: 'chats',
    targetRoomId: 'room_1',
    badge: 'Unread Chat',
    priority: 'normal'
  },
  {
    id: 'notif_3',
    type: 'escrow',
    title: 'RBI Escrow Payout Released',
    message: '₹1,650 has been settled to your verified primary UPI account (priya.sharma@okhdfcbank) via IMPS instant payout.',
    timeAgo: '2h ago',
    timestamp: 'Today, 12:40 PM',
    isRead: true,
    actorName: 'FindCo Escrow',
    actorAvatar: null,
    actionLabel: 'View Financial Ledger',
    targetTab: 'dashboard',
    badge: 'IMPS Settled',
    priority: 'normal'
  },
  {
    id: 'notif_4',
    type: 'security',
    title: 'Aadhaar Identity Enclave Verification',
    message: 'Your biometric verification credential (UIDAI-ENCLAVE-560038-2026) has been re-audited and confirmed secure under AES-256 HSM storage.',
    timeAgo: '1d ago',
    timestamp: 'Yesterday, 10:15 AM',
    isRead: true,
    actorName: 'Security Vault',
    actorAvatar: null,
    actionLabel: 'Audit Security Vault',
    targetTab: 'vault',
    badge: '100% Audited',
    priority: 'normal'
  },
  {
    id: 'notif_5',
    type: 'booking',
    title: 'New Booking Request Received',
    message: 'Aditi Kulkarni requested a companion session for NGMA Art Tour (2.5h) with an offered budget of ₹1,375.',
    timeAgo: '2d ago',
    timestamp: 'Oct 12, 06:15 PM',
    isRead: true,
    actorName: 'Aditi Kulkarni',
    actorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&h=200&fit=crop&crop=faces',
    actionLabel: 'Review Request',
    targetTab: 'dashboard',
    badge: 'Quote Pending',
    priority: 'normal'
  }
];

