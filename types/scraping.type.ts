export interface ScrapingData {
  id: string;
  scrapingJobId: string;
  name: string;
  email: string;
  address: string;
  phone: string;
  website: string;
  source: string;
  industry: string[];
  rating: number;
  reviewCount: number;
  hasBeenAdded: boolean;
}
