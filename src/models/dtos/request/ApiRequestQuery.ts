interface ApiRequestQuery {
  page: number;
  size: number;
  sort?: string;
  order: 'asc' | 'desc';
  lightDTO?: boolean;
}

export type { ApiRequestQuery };
export default ApiRequestQuery;
