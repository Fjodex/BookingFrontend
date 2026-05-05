export interface Item {
  id: string;

  // Basic
  name: string;
  details: string;

  // Product Content
  productDescription?: string;
  productSpecification?: string;

  // Media
  youtubeVideoId?: string;

  // Image (already converted to data URL)
  imageData: string[];
  imageAspect: number;

  // Rental
  pricePerDay: number;
  color: string;
  isActive: boolean;
}
