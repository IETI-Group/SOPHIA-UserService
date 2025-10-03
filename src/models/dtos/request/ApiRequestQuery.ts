export default interface ApiRequestQuery {
  page: number;
  size: number;
  sort: string;
  order: 'asc' | 'desc';
}
