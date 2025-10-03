import type ApiRequestQuery from './ApiRequestQuery.js';

export default interface UsersQuery extends ApiRequestQuery {
  firstName?: string;
  lastName?: string;
  birthDayFrom?: Date;
  birthDayTo?: Date;
}
