export type BuilderType = 'DA' | 'SA' | 'BS';

export interface UTMParams {
  date: string;
  medium: string;
  product: string;
  brands: string[];
  objective: string;
  issue: string;
  season: string;
  promotion: string;
  materialCount: number;
  builderType: BuilderType;
  urlMode: 'auto' | 'manual';
  manualUrl?: string;
  utmParamType?: 'content' | 'term'; // utm_content vs utm_term 선택
}

export interface UTMResult {
  [brand: string]: {
    campaign: string;
    content: string[];
    url: string[];
    isApproved?: boolean;
  };
}

export interface UTMTemplate extends UTMParams {
  id: string;
  templateName: string;
}

export interface ExportOptions {
  fixedColumnOrder: boolean;
}

