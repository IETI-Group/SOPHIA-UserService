import type ApiRequestQuery from './ApiRequestQuery.js';

export interface ApiRequestBatchUsers extends ApiRequestQuery {
  users: string[];
}
