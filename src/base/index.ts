/**
 * Base Components & Utilities Export
 *
 * Tất cả base components, hooks, và utilities được export từ đây
 * để dễ dàng import trong các module khác
 *
 * Usage:
 * ```typescript
 * import { BaseApiService, createBaseStore, useApi } from '@/src/base';
 * ```
 */

// Base Service
export {BaseApiService} from "./BaseApiService";
export type {PaginationParams, PaginatedResponse, ApiResponse} from "./BaseApiService";

// Base Store
export {createBaseStore} from "./BaseStore";
export type {BaseStoreState, BaseStoreActions, BaseStore} from "./BaseStore";

// Base Repository (if needed)
export {BaseRepository} from "./BaseRepository";
export type {Repository} from "./BaseRepository";

// Base Controller (if needed)
// export { BaseController } from './BaseController';

// Hooks
export {useApi, useMutation, useQuery} from "./useApi";
export type {UseApi, UseApiState, UseApiActions, UseApiOptions} from "./useApi";
