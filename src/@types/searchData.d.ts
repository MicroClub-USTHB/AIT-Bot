declare interface PackageData {
  name: string;
  description: string;
  version: string;
  keywords: string[];
  url: string;
  icon: string;
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

export { PackageData, w3schoolsData, PrayerTime };
