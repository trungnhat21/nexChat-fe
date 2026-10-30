import type { FeedPost } from "./post";

export type SearchPerson = {
    id: string;
    name: string;
    firstName?: string | null;
    lastName?: string | null;
    username: string | null;
    avatar: string | null;
    bio?: string | null;
    friendStatus: "none" | "outgoing" | "incoming" | "friends" | "blocked";
    requestId?: string | null;
    following: boolean;
};

export type SearchHashtag = {
    tag: string;
    postsCount: number;
};

export type SearchPage<T> = {
    items: T[];
    nextCursor: string | null;
};

export type SearchAllResults = {
    success: true;
    query: string;
    people: SearchPage<SearchPerson>;
    posts: SearchPage<FeedPost>;
    hashtags: {
        items: SearchHashtag[];
        nextCursor: null;
    };
};

export type SearchCategory = "people" | "posts" | "hashtags";

export type SearchTab = "all" | SearchCategory | "media";

export type SearchCategoryResults = {
    success: true;
    category: SearchCategory;
    items: SearchPerson[] | FeedPost[] | SearchHashtag[];
    nextCursor: string | null;
};
