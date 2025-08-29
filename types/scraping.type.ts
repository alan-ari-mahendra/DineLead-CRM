export interface ScrapingData {
  id: string;
  scrapingJobId: string;
  name: string;
  email: Email;
  address: string;
  phone: string;
  website: Email;
  source: string;
  industry: Industry[];
  rating: number;
  reviewCount: number;
  hasBeenAdded: boolean;
}

export enum Email {
  Empty = "-",
}

export enum Industry {
  Establishment = "establishment",
  Food = "food",
  PointOfInterest = "point_of_interest",
  Restaurant = "restaurant",
}
