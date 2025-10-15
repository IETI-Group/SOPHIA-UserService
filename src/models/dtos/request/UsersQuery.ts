import type ApiRequestQuery from './ApiRequestQuery.js';

interface UsersQuery extends ApiRequestQuery {
  firstName?: string;
  lastName?: string;
  birthDayFrom?: Date;
  birthDayTo?: Date;
}

export type { UsersQuery };
export default UsersQuery;
