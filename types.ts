export interface EtsyListingData {
  description: string;
  primaryColor: string;
  secondaryColor: string;
  primaryFabric: string;
  occasion: string;
  materials: string[];
  holiday: string;
}

export interface CopyFieldProps {
  label: string;
  value: string;
  multiline?: boolean;
  helperText?: string;
}
