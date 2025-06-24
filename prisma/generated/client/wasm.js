
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 6.6.0
 * Query Engine version: f676762280b54cd07c770017ed3711ddde35f37a
 */
Prisma.prismaVersion = {
  client: "6.6.0",
  engine: "f676762280b54cd07c770017ed3711ddde35f37a"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.MovieScalarFieldEnum = {
  id: 'id',
  tmdbId: 'tmdbId',
  titleEn: 'titleEn',
  titleJa: 'titleJa',
  titleZh: 'titleZh',
  year: 'year',
  director: 'director',
  duration: 'duration',
  synopsis: 'synopsis',
  posterUrl: 'posterUrl',
  backdropUrl: 'backdropUrl',
  voteAverage: 'voteAverage',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PlatformScalarFieldEnum = {
  id: 'id',
  name: 'name',
  website: 'website',
  type: 'type',
  logo: 'logo',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.RegionScalarFieldEnum = {
  id: 'id',
  code: 'code',
  name: 'name',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AvailabilityScalarFieldEnum = {
  id: 'id',
  url: 'url',
  price: 'price',
  currency: 'currency',
  type: 'type',
  lastChecked: 'lastChecked',
  isAvailable: 'isAvailable',
  notes: 'notes',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  movieId: 'movieId',
  platformId: 'platformId',
  regionId: 'regionId'
};

exports.Prisma.ContentVersionScalarFieldEnum = {
  id: 'id',
  entityType: 'entityType',
  entityId: 'entityId',
  version: 'version',
  changes: 'changes',
  changeType: 'changeType',
  author: 'author',
  reason: 'reason',
  isActive: 'isActive',
  createdAt: 'createdAt'
};

exports.Prisma.ContentReviewScalarFieldEnum = {
  id: 'id',
  entityType: 'entityType',
  entityId: 'entityId',
  versionId: 'versionId',
  status: 'status',
  reviewer: 'reviewer',
  comments: 'comments',
  reviewedAt: 'reviewedAt',
  createdAt: 'createdAt'
};

exports.Prisma.ContentUpdateTaskScalarFieldEnum = {
  id: 'id',
  taskType: 'taskType',
  entityType: 'entityType',
  entityId: 'entityId',
  priority: 'priority',
  status: 'status',
  scheduledAt: 'scheduledAt',
  startedAt: 'startedAt',
  completedAt: 'completedAt',
  errorMessage: 'errorMessage',
  metadata: 'metadata',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ContentQualityMetricScalarFieldEnum = {
  id: 'id',
  entityType: 'entityType',
  entityId: 'entityId',
  metricType: 'metricType',
  score: 'score',
  details: 'details',
  measuredAt: 'measuredAt'
};

exports.Prisma.UserFeedbackScalarFieldEnum = {
  id: 'id',
  entityType: 'entityType',
  entityId: 'entityId',
  feedbackType: 'feedbackType',
  content: 'content',
  userAgent: 'userAgent',
  ipAddress: 'ipAddress',
  isResolved: 'isResolved',
  resolvedAt: 'resolvedAt',
  createdAt: 'createdAt'
};

exports.Prisma.ContentSyncLogScalarFieldEnum = {
  id: 'id',
  source: 'source',
  syncType: 'syncType',
  status: 'status',
  recordsProcessed: 'recordsProcessed',
  recordsUpdated: 'recordsUpdated',
  recordsCreated: 'recordsCreated',
  recordsFailed: 'recordsFailed',
  errorDetails: 'errorDetails',
  startedAt: 'startedAt',
  completedAt: 'completedAt'
};

exports.Prisma.CharacterScalarFieldEnum = {
  id: 'id',
  name: 'name',
  nameJa: 'nameJa',
  nameZh: 'nameZh',
  description: 'description',
  imageUrl: 'imageUrl',
  isMainCharacter: 'isMainCharacter',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.MovieCharacterScalarFieldEnum = {
  id: 'id',
  movieId: 'movieId',
  characterId: 'characterId',
  voiceActor: 'voiceActor',
  voiceActorJa: 'voiceActorJa',
  importance: 'importance',
  createdAt: 'createdAt'
};

exports.Prisma.CrewMemberScalarFieldEnum = {
  id: 'id',
  name: 'name',
  nameJa: 'nameJa',
  biography: 'biography',
  imageUrl: 'imageUrl',
  birthDate: 'birthDate',
  nationality: 'nationality',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.MovieCrewScalarFieldEnum = {
  id: 'id',
  movieId: 'movieId',
  crewMemberId: 'crewMemberId',
  role: 'role',
  department: 'department',
  createdAt: 'createdAt'
};

exports.Prisma.MovieReviewScalarFieldEnum = {
  id: 'id',
  movieId: 'movieId',
  title: 'title',
  content: 'content',
  author: 'author',
  rating: 'rating',
  reviewType: 'reviewType',
  language: 'language',
  isPublished: 'isPublished',
  publishedAt: 'publishedAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.WatchGuideScalarFieldEnum = {
  id: 'id',
  title: 'title',
  description: 'description',
  guideType: 'guideType',
  content: 'content',
  order: 'order',
  isPublished: 'isPublished',
  language: 'language',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.WatchGuideMovieScalarFieldEnum = {
  id: 'id',
  guideId: 'guideId',
  movieId: 'movieId',
  order: 'order',
  notes: 'notes',
  createdAt: 'createdAt'
};

exports.Prisma.MediaContentScalarFieldEnum = {
  id: 'id',
  movieId: 'movieId',
  title: 'title',
  description: 'description',
  mediaType: 'mediaType',
  url: 'url',
  thumbnailUrl: 'thumbnailUrl',
  duration: 'duration',
  fileSize: 'fileSize',
  language: 'language',
  isPublished: 'isPublished',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.TagScalarFieldEnum = {
  id: 'id',
  name: 'name',
  nameJa: 'nameJa',
  nameZh: 'nameZh',
  description: 'description',
  color: 'color',
  category: 'category',
  createdAt: 'createdAt'
};

exports.Prisma.MovieTagScalarFieldEnum = {
  id: 'id',
  movieId: 'movieId',
  tagId: 'tagId',
  createdAt: 'createdAt'
};

exports.Prisma.UserFavoriteScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  movieId: 'movieId',
  createdAt: 'createdAt'
};

exports.Prisma.MovieStatsScalarFieldEnum = {
  id: 'id',
  movieId: 'movieId',
  viewCount: 'viewCount',
  favoriteCount: 'favoriteCount',
  shareCount: 'shareCount',
  lastViewed: 'lastViewed',
  updatedAt: 'updatedAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.JsonNullValueInput = {
  JsonNull: Prisma.JsonNull
};

exports.Prisma.NullableJsonNullValueInput = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
};
exports.PlatformType = exports.$Enums.PlatformType = {
  STREAMING: 'STREAMING',
  RENTAL: 'RENTAL',
  PURCHASE: 'PURCHASE',
  FREE: 'FREE',
  CINEMA: 'CINEMA',
  PHYSICAL: 'PHYSICAL'
};

exports.AvailabilityType = exports.$Enums.AvailabilityType = {
  SUBSCRIPTION: 'SUBSCRIPTION',
  RENT: 'RENT',
  BUY: 'BUY',
  FREE: 'FREE',
  CINEMA: 'CINEMA',
  LIBRARY: 'LIBRARY',
  DVD: 'DVD'
};

exports.ChangeType = exports.$Enums.ChangeType = {
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  RESTORE: 'RESTORE'
};

exports.ReviewStatus = exports.$Enums.ReviewStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  NEEDS_REVISION: 'NEEDS_REVISION'
};

exports.TaskType = exports.$Enums.TaskType = {
  MOVIE_UPDATE: 'MOVIE_UPDATE',
  AVAILABILITY_CHECK: 'AVAILABILITY_CHECK',
  PLATFORM_SYNC: 'PLATFORM_SYNC',
  REGION_UPDATE: 'REGION_UPDATE',
  QUALITY_CHECK: 'QUALITY_CHECK',
  CONTENT_REVIEW: 'CONTENT_REVIEW'
};

exports.Priority = exports.$Enums.Priority = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  URGENT: 'URGENT'
};

exports.TaskStatus = exports.$Enums.TaskStatus = {
  PENDING: 'PENDING',
  RUNNING: 'RUNNING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED'
};

exports.FeedbackType = exports.$Enums.FeedbackType = {
  INCORRECT_INFO: 'INCORRECT_INFO',
  MISSING_INFO: 'MISSING_INFO',
  BROKEN_LINK: 'BROKEN_LINK',
  SUGGESTION: 'SUGGESTION',
  BUG_REPORT: 'BUG_REPORT',
  OTHER: 'OTHER'
};

exports.SyncType = exports.$Enums.SyncType = {
  FULL_SYNC: 'FULL_SYNC',
  INCREMENTAL_SYNC: 'INCREMENTAL_SYNC',
  MANUAL_SYNC: 'MANUAL_SYNC',
  SCHEDULED_SYNC: 'SCHEDULED_SYNC'
};

exports.SyncStatus = exports.$Enums.SyncStatus = {
  STARTED: 'STARTED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED'
};

exports.CrewRole = exports.$Enums.CrewRole = {
  DIRECTOR: 'DIRECTOR',
  PRODUCER: 'PRODUCER',
  WRITER: 'WRITER',
  ANIMATOR: 'ANIMATOR',
  COMPOSER: 'COMPOSER',
  VOICE_DIRECTOR: 'VOICE_DIRECTOR',
  ART_DIRECTOR: 'ART_DIRECTOR',
  SOUND_DESIGNER: 'SOUND_DESIGNER',
  EDITOR: 'EDITOR',
  OTHER: 'OTHER'
};

exports.ReviewType = exports.$Enums.ReviewType = {
  PROFESSIONAL: 'PROFESSIONAL',
  EDITORIAL: 'EDITORIAL',
  ANALYSIS: 'ANALYSIS',
  BEHIND_SCENES: 'BEHIND_SCENES',
  TRIVIA: 'TRIVIA'
};

exports.GuideType = exports.$Enums.GuideType = {
  CHRONOLOGICAL: 'CHRONOLOGICAL',
  THEMATIC: 'THEMATIC',
  BEGINNER: 'BEGINNER',
  ADVANCED: 'ADVANCED',
  FAMILY: 'FAMILY',
  SEASONAL: 'SEASONAL'
};

exports.MediaType = exports.$Enums.MediaType = {
  TRAILER: 'TRAILER',
  CLIP: 'CLIP',
  BEHIND_SCENES: 'BEHIND_SCENES',
  INTERVIEW: 'INTERVIEW',
  SOUNDTRACK: 'SOUNDTRACK',
  ARTWORK: 'ARTWORK',
  POSTER: 'POSTER',
  WALLPAPER: 'WALLPAPER'
};

exports.Prisma.ModelName = {
  Movie: 'Movie',
  Platform: 'Platform',
  Region: 'Region',
  Availability: 'Availability',
  ContentVersion: 'ContentVersion',
  ContentReview: 'ContentReview',
  ContentUpdateTask: 'ContentUpdateTask',
  ContentQualityMetric: 'ContentQualityMetric',
  UserFeedback: 'UserFeedback',
  ContentSyncLog: 'ContentSyncLog',
  Character: 'Character',
  MovieCharacter: 'MovieCharacter',
  CrewMember: 'CrewMember',
  MovieCrew: 'MovieCrew',
  MovieReview: 'MovieReview',
  WatchGuide: 'WatchGuide',
  WatchGuideMovie: 'WatchGuideMovie',
  MediaContent: 'MediaContent',
  Tag: 'Tag',
  MovieTag: 'MovieTag',
  UserFavorite: 'UserFavorite',
  MovieStats: 'MovieStats'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }

        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
