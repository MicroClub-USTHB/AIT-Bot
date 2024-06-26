declare interface PackageData {
  name: string;
  description: string;
  version: string;
  keywords: string[];
  url: string;
  icon: string;
}

declare interface GithubRepository {
  name: string;
  description: string | null;
  url: string;
  stars: number;
  forks: number;
  issues: number;
  username: string;
  creationDate: Date;
  firstPush: Date;
  lastUpdate: Date;
  license: string | null;
  languages:
    | {
        name: string;
        percentage: number;
      }[]
    | null;
}

declare interface GithubUser {
  username: string;
  name: string | null;
  bio: string | null;
  url: string;
  avatar: string;
  followers: number;
  following: number;
  repositories: number;
  creationDate: Date;
  starred: number | null;
  stars: number | null;
}

declare interface w3schoolsData {
  title: string;
  description: string;
  url: string;
  highlight: string | null;
  snippet?: string;
}

declare interface PrayerTime {
  state: string;
  country: string;
  prayers: {
    Fajr: string;
    Sunrise: string;
    Dhuhr: string;
    Asr: string;
    Maghrib: string;
    Isha: string;
  };
}

export { PackageData, w3schoolsData, GithubRepository, GithubUser, PrayerTime };
