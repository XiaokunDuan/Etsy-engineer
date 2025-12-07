export interface EtsyListingData {
  title: string;
  description: string;
  category: string;
  primaryColor: string;
  secondaryColor: string;
  primaryFabric: string;
  occasion: string;
  style: string;
  tags: string[];
  materials: string[];
  priceEstimate: string;
  holiday: string;
}

export interface CopyFieldProps {
  label: string;
  value: string;
  multiline?: boolean;
  helperText?: string;
}
