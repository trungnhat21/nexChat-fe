import api from "./index";
import type { SearchAllResults, SearchCategory, SearchCategoryResults } from "../component/type/search";

export type SearchSort = "relevance" | "latest" | "newest";
export type SearchPeriod = "all" | "24h" | "day" | "week" | "month";

export interface SearchFilterParams {
    sort?: SearchSort;
    period?: SearchPeriod;
    mediaOnly?: boolean;
}

export interface SearchAllOptions extends SearchFilterParams {
    query: string;
    limit?: number;
    signal?: AbortSignal;
}

export async function searchAll(
    queryOrOptions: string | SearchAllOptions,
    signal?: AbortSignal
): Promise<SearchAllResults> {
    const isOptions = typeof queryOrOptions === "object" && queryOrOptions !== null;
    const query = isOptions ? queryOrOptions.query : queryOrOptions;
    const limit = isOptions ? queryOrOptions.limit : undefined;
    const abortSignal = isOptions ? queryOrOptions.signal ?? signal : signal;
    const sort = isOptions ? queryOrOptions.sort : undefined;
    const period = isOptions ? queryOrOptions.period : undefined;
    const mediaOnly = isOptions ? queryOrOptions.mediaOnly : undefined;

    return (
        await api.get<SearchAllResults>("/search", {
            params: {
                query,
                ...(limit !== undefined ? { limit } : {}),
                ...(sort ? { sort } : {}),
                ...(period ? { period } : {}),
                ...(mediaOnly !== undefined ? { mediaOnly } : {}),
            },
            signal: abortSignal,
        })
    ).data;
}

export async function searchCategory(
    query: string,
    category: SearchCategory,
    cursor?: string,
    signal?: AbortSignal,
    limit?: number,
    filters?: SearchFilterParams
): Promise<SearchCategoryResults> {
    return (
        await api.get<SearchCategoryResults>("/search", {
            params: {
                query,
                category,
                ...(cursor !== undefined ? { cursor } : {}),
                ...(limit !== undefined ? { limit } : {}),
                ...(filters?.sort ? { sort: filters.sort } : {}),
                ...(filters?.period ? { period: filters.period } : {}),
                ...(filters?.mediaOnly !== undefined ? { mediaOnly: filters.mediaOnly } : {}),
            },
            signal,
        })
    ).data;
}
