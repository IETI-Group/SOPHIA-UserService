import { relations } from 'drizzle-orm';
import {
  boolean,
  decimal,
  index,
  integer,
  pgEnum,
  pgTable,
  smallint,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import {
  LEARNING_STYLES,
  PACE_PREFERENCE,
  ROLE,
  ROLE_STATUS,
  VERIFICATION_STATUS,
} from '../utils/types.js';

/*
 * ENUMS
 */
export const userRoleEnum = pgEnum('user_role', [ROLE.ADMIN, ROLE.STUDENT, ROLE.INSTRUCTOR]);
export const learningStyleEnum = pgEnum('learning_style', [
  LEARNING_STYLES.VISUAL,
  LEARNING_STYLES.AUDITORY,
  LEARNING_STYLES.KINESTHETIC,
  LEARNING_STYLES.READING_WRITING,
  LEARNING_STYLES.GAMIFICATION,
  LEARNING_STYLES.STORYTELLING,
  LEARNING_STYLES.CASE_STUDY,
  LEARNING_STYLES.PROBLEM_SOLVING,
  LEARNING_STYLES.COLLABORATIVE,
  LEARNING_STYLES.SELF_PACED,
]);
export const roleStatusEnum = pgEnum('role_status', [
  ROLE_STATUS.ACTIVE,
  ROLE_STATUS.INACTIVE,
  ROLE_STATUS.SUSPENDED,
]);

export const pacePreferenceEnum = pgEnum('pace_preference', [
  PACE_PREFERENCE.SLOW,
  PACE_PREFERENCE.NORMAL,
  PACE_PREFERENCE.FAST,
]);

export const verificationStatusEnum = pgEnum('verification_status', [
  VERIFICATION_STATUS.VERIFIED,
  VERIFICATION_STATUS.PENDING,
  VERIFICATION_STATUS.REJECTED,
]);

// ============================================
// MAIN TABLES
// ============================================

export const users = pgTable(
  'users',
  {
    id_user: uuid('id_user').defaultRandom().primaryKey(),
    email: varchar('email', { length: 254 }).notNull().unique(),
    first_name: varchar('first_name', { length: 60 }).notNull(),
    last_name: varchar('last_name', { length: 100 }).notNull(),
    bio: text('bio'),
    created_at: timestamp('created_at').defaultNow().notNull(),
    birth_date: timestamp('birth_date').notNull(),
    updated_at: timestamp('updated_at').$onUpdate(() => new Date()),
  },
  (table) => ({
    emailIdx: uniqueIndex('users_email_idx').on(table.email),
    nameIdx: index('users_name_idx').on(table.first_name, table.last_name),
    createdAtIdx: index('users_created_at_idx').on(table.created_at),
    birthDateIdx: index('users_birth_date_idx').on(table.birth_date),
  })
);

export const user_learning_profile = pgTable(
  'user_learning_profile',
  {
    id_learning_profile: uuid('id_learning_profile').defaultRandom().primaryKey(),
    user_id: uuid('user_id')
      .notNull()
      .references(() => users.id_user, { onDelete: 'cascade' })
      .unique(),
    primary_style: learningStyleEnum('primary_style').notNull(),
    secondary_style: learningStyleEnum('secondary_style'),
    pace_preference: pacePreferenceEnum('pace_preference').notNull(),
    interactivity_preference: smallint('interactivity_preference').notNull(), // 1-10 scale
    gamification_enabled: boolean('gamification_enabled').notNull(),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').$onUpdate(() => new Date()),
  },
  (table) => ({
    userIdIdx: uniqueIndex('user_learning_profile_user_id_idx').on(table.user_id),
    primaryStyleIdx: index('user_learning_profile_primary_style_idx').on(table.primary_style),
  })
);

export const linked_accounts = pgTable(
  'linked_accounts',
  {
    id_linked_account: uuid('id_linked_account').defaultRandom().primaryKey(),
    user_id: uuid('user_id')
      .notNull()
      .references(() => users.id_user, { onDelete: 'cascade' }),
    provider: varchar('provider', { length: 100 }).notNull(), // e.g., 'google', 'facebook'
    issuer: varchar('issuer', { length: 254 }).notNull(), // e.g., 'accounts.google.com'
    external_id: varchar('external_id', { length: 150 }).notNull(), // ID from the external provider
    email: varchar('email', { length: 254 }),
    email_verified: boolean('email_verified').default(false).notNull(),
    linked_at: timestamp('linked_at').defaultNow().notNull(),
    is_primary: boolean('is_primary').default(false).notNull(),
    status: roleStatusEnum('status').default(ROLE_STATUS.ACTIVE).notNull(),
  },
  (table) => ({
    providerExternalIdIdx: uniqueIndex('linked_accounts_provider_external_id_idx').on(
      table.provider,
      table.external_id
    ),
    userIdIdx: index('linked_accounts_user_id_idx').on(table.user_id),
    userProviderIdx: index('linked_accounts_user_provider_idx').on(table.user_id, table.provider),
    userPrimaryIdx: index('linked_accounts_user_primary_idx').on(table.user_id, table.is_primary),
  })
);

export const roles = pgTable(
  'roles',
  {
    id_role: uuid('id_role').defaultRandom().primaryKey(),
    name: userRoleEnum('name').notNull().unique(),
    description: text('description'),
  },
  (table) => ({
    nameIdx: uniqueIndex('roles_name_idx').on(table.name),
  })
);

export const users_roles = pgTable(
  'users_roles',
  {
    id_user_role: uuid('id_user_role').defaultRandom().primaryKey(),
    user_id: uuid('user_id')
      .notNull()
      .references(() => users.id_user, { onDelete: 'cascade' }),
    role_id: uuid('role_id')
      .notNull()
      .references(() => roles.id_role, { onDelete: 'cascade' }),
    assigned_at: timestamp('assigned_at').defaultNow().notNull(),
    expires_at: timestamp('expires_at'),
    status: roleStatusEnum('status').default(ROLE_STATUS.ACTIVE).notNull(),
  },
  (table) => ({
    userRoleIdx: uniqueIndex('users_roles_user_role_idx').on(table.user_id, table.role_id),
    userIdIdx: index('users_roles_user_id_idx').on(table.user_id),
    roleIdIdx: index('users_roles_role_id_idx').on(table.role_id),
    statusIdx: index('users_roles_status_idx').on(table.status),
  })
);

export const instructors = pgTable(
  'instructors',
  {
    id_instructor: uuid('id_instructor')
      .references(() => users.id_user, { onDelete: 'cascade' })
      .primaryKey(),
    total_students: integer('total_students').default(0).notNull(),
    total_courses: integer('total_courses').default(0).notNull(),
    average_rating: decimal('average_rating', { precision: 3, scale: 2 }).default('0').notNull(), // e.g., 4.75
    total_reviews: integer('total_reviews').default(0).notNull(),
    verification_status: verificationStatusEnum('verification_status')
      .default(VERIFICATION_STATUS.PENDING)
      .notNull(),
    verified_at: timestamp('verified_at'),
  },
  (table) => ({
    verificationStatusIdx: index('instructors_verification_status_idx').on(
      table.verification_status
    ),
    averageRatingIdx: index('instructors_average_rating_idx').on(table.average_rating),
    verifiedIdx: index('instructors_verified_idx').on(table.verification_status, table.verified_at),
  })
);

// ============================================
// REVIEWS SYSTEM
// ============================================

export const reviews = pgTable(
  'reviews',
  {
    id_review: uuid('id_review').defaultRandom().primaryKey(),
    reviewer_id: uuid('reviewer_id')
      .notNull()
      .references(() => users.id_user, { onDelete: 'cascade' }),
    rate: smallint('rate').notNull(), // 1-5 stars
    recommended: boolean('recommended').notNull(),
    comments: text('comments'),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').$onUpdate(() => new Date()),
  },
  (table) => ({
    reviewerIdIdx: index('reviews_reviewer_id_idx').on(table.reviewer_id),
    createdAtIdx: index('reviews_created_at_idx').on(table.created_at),
    rateIdx: index('reviews_rate_idx').on(table.rate),
  })
);

export const instructors_reviews = pgTable(
  'instructors_reviews',
  {
    id_instructor_review: uuid('id_instructor_review')
      .references(() => reviews.id_review, { onDelete: 'cascade' })
      .primaryKey(),
    instructor_id: uuid('instructor_id')
      .references(() => instructors.id_instructor, { onDelete: 'cascade' })
      .notNull(),
  },
  (table) => ({
    instructorIdIdx: index('instructors_reviews_instructor_id_idx').on(table.instructor_id),
  })
);

export const courses_reviews = pgTable(
  'courses_reviews',
  {
    id_course_review: uuid('id_course_review')
      .references(() => reviews.id_review, { onDelete: 'cascade' })
      .primaryKey(),
    course_id: uuid('course_id').notNull(), // FK courses microservice
  },
  (table) => ({
    courseIdIdx: index('courses_reviews_course_id_idx').on(table.course_id),
  })
);

// ============================================
// RELATIONS - Drizzle ORM Relations
// ============================================

export const usersRelations = relations(users, ({ one, many }) => ({
  learningProfile: one(user_learning_profile, {
    fields: [users.id_user],
    references: [user_learning_profile.user_id],
  }),
  linkedAccounts: many(linked_accounts),
  userRoles: many(users_roles),
  instructor: one(instructors, {
    fields: [users.id_user],
    references: [instructors.id_instructor],
  }),
  reviewsWritten: many(reviews),
}));

export const userLearningProfileRelations = relations(user_learning_profile, ({ one }) => ({
  user: one(users, {
    fields: [user_learning_profile.user_id],
    references: [users.id_user],
  }),
}));

export const linkedAccountsRelations = relations(linked_accounts, ({ one }) => ({
  user: one(users, {
    fields: [linked_accounts.user_id],
    references: [users.id_user],
  }),
}));

export const rolesRelations = relations(roles, ({ many }) => ({
  userRoles: many(users_roles),
}));

export const usersRolesRelations = relations(users_roles, ({ one }) => ({
  user: one(users, {
    fields: [users_roles.user_id],
    references: [users.id_user],
  }),
  role: one(roles, {
    fields: [users_roles.role_id],
    references: [roles.id_role],
  }),
}));

export const instructorsRelations = relations(instructors, ({ one, many }) => ({
  user: one(users, {
    fields: [instructors.id_instructor],
    references: [users.id_user],
  }),
  reviews: many(instructors_reviews),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  reviewer: one(users, {
    fields: [reviews.reviewer_id],
    references: [users.id_user],
  }),
  instructorReview: one(instructors_reviews, {
    fields: [reviews.id_review],
    references: [instructors_reviews.id_instructor_review],
  }),
  courseReview: one(courses_reviews, {
    fields: [reviews.id_review],
    references: [courses_reviews.id_course_review],
  }),
}));

export const instructorsReviewsRelations = relations(instructors_reviews, ({ one }) => ({
  review: one(reviews, {
    fields: [instructors_reviews.id_instructor_review],
    references: [reviews.id_review],
  }),
  instructor: one(instructors, {
    fields: [instructors_reviews.instructor_id],
    references: [instructors.id_instructor],
  }),
}));

export const coursesReviewsRelations = relations(courses_reviews, ({ one }) => ({
  review: one(reviews, {
    fields: [courses_reviews.id_course_review],
    references: [reviews.id_review],
  }),
}));
