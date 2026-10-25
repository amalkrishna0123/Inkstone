export interface StoryItem {
  id: string;
  title: string;
  category: string;
  watermarkText: string;
  mediaUrl: string;
  mediaType?: "image" | "video";
  caption?: string;
  likes: number;
  duration?: number; // duration in ms, default 5000ms
  postedAt: string;
}

export interface CustomerProfile {
  id: string;
  name: string;
  subtitle: string;
  email: string;
  avatarUrl?: string;
  stories: StoryItem[];
}

export interface WeekGroup {
  id: string;
  label: string;
  countLabel?: string;
  isNew?: boolean;
}

// Generates a reproducible avatar URL from an email using unavatar / dicebear
export function getAvatarFromEmail(email: string, fallbackSeed?: string): string {
  if (!email || !email.trim()) {
    const seed = fallbackSeed || "customer";
    return `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(seed)}&backgroundColor=ffea00,ffd500,fee180`;
  }
  const cleanEmail = email.trim().toLowerCase();
  // unavatar handles gravatar, google, github, and falls back gracefully
  return `https://unavatar.io/${encodeURIComponent(cleanEmail)}?fallback=https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(cleanEmail)}&backgroundColor=ffea00,ffd500,fee180`;
}

export const INITIAL_WEEKS: WeekGroup[] = [
  { id: "week-48", label: "Week 48", countLabel: "3 New", isNew: true },
  { id: "week-47", label: "Week 47" },
  { id: "week-46", label: "Week 46" },
];

export const INITIAL_CUSTOMERS: CustomerProfile[] = [
  {
    id: "cust-1",
    name: "Zordan Pawel",
    subtitle: "Zordan Pawel - #15",
    email: "zordan.pawel@nba.com",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
    stories: [
      {
        id: "story-1-1",
        title: "NBA Courtside Energy",
        category: "NBA",
        watermarkText: "ROCKET #15",
        mediaUrl: "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1200&q=85",
        caption: "Pre-game ritual with cold-pressed citrus fuel. Ready for the buzzer.",
        likes: 1248,
        postedAt: "2h ago",
      },
      {
        id: "story-1-2",
        title: "Matchday Routine",
        category: "ATHLETICS",
        watermarkText: "WARMUP DRILLS",
        mediaUrl: "https://images.unsplash.com/photo-1519766304817-4f37bda74a29?auto=format&fit=crop&w=1200&q=85",
        caption: "Focus, stamina, recovery. Day in, day out.",
        likes: 980,
        postedAt: "4h ago",
      },
      {
        id: "story-1-3",
        title: "Hydration Check",
        category: "WELLNESS",
        watermarkText: "CRYSTAL HYDRO",
        mediaUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=85",
        caption: "Zero artificial sugars, pure electrolyte refresh.",
        likes: 1420,
        postedAt: "6h ago",
      },
    ],
  },
  {
    id: "cust-2",
    name: "Elena Rostova",
    subtitle: "Streetball & Urban Art",
    email: "elena.rostova@streetart.io",
    avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80",
    stories: [
      {
        id: "story-2-1",
        title: "Graffiti & Alley Hoops",
        category: "STREETSTYLE",
        watermarkText: "URBAN CULTURE",
        mediaUrl: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=1200&q=85",
        caption: "The colorful graffiti court at 5th street. Painted basketball vibes.",
        likes: 2150,
        postedAt: "1d ago",
      },
      {
        id: "story-2-2",
        title: "Sunset Shootaround",
        category: "LIFESTYLE",
        watermarkText: "DOWNTOWN #04",
        mediaUrl: "https://images.unsplash.com/photo-1505666287802-931dc83948e9?auto=format&fit=crop&w=1200&q=85",
        caption: "Nothing beats crisp golden hour shots and chilled ginger elixir.",
        likes: 1890,
        postedAt: "1d ago",
      },
    ],
  },
  {
    id: "cust-3",
    name: "Marcus Vance",
    subtitle: "Runner & Marathoner",
    email: "marcus.vance@triathlon.org",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
    stories: [
      {
        id: "story-3-1",
        title: "Morning 15K Pace",
        category: "ENDURANCE",
        watermarkText: "SPEED DRIFT",
        mediaUrl: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=1200&q=85",
        caption: "Laced up in cyan sneakers. 15km in the bag before breakfast.",
        likes: 3102,
        postedAt: "2d ago",
      },
      {
        id: "story-3-2",
        title: "Recovery Lab",
        category: "RECOVERY",
        watermarkText: "PEAK FIT",
        mediaUrl: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=85",
        caption: "Stretching and electrolyte replenishment.",
        likes: 2470,
        postedAt: "3d ago",
      },
    ],
  },
  {
    id: "cust-4",
    name: "Maya Chen",
    subtitle: "Creative Director & Yogi",
    email: "maya.chen@designstudio.co",
    avatarUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=300&q=80",
    stories: [
      {
        id: "story-4-1",
        title: "Mindful Workspace",
        category: "MINDFUL",
        watermarkText: "BALANCE #08",
        mediaUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=85",
        caption: "Starting the studio morning with botanical tea and breathwork.",
        likes: 1740,
        postedAt: "3d ago",
      },
    ],
  },
];
