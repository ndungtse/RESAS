export interface ApiResponse {
  message: any;
  result: Result;
}

export interface Result {
  boundaryYear: number;
  data: Daum[];
}

export interface Daum {
  label: string;
  data: Daum2[];
}

export interface Daum2 {
  year: number;
  value: number;
  rate?: number;
}

export interface Prefecture {
  prefCode: number;
  prefName: string;
}
