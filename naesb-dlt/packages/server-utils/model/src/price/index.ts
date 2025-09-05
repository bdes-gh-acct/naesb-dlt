export interface IPriceIndexProvider {
  id: string;
  name: string;
  abbreviation: string;
}

export interface IPriceIndex {
  id: string;
  providerId: string;
  name: string;
  provider?: IPriceIndexProvider;
}

export interface IPriceIndexValue {
  id: string;
  indexId: string;
  midpoint: number;
}
