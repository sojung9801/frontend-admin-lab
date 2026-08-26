export type ContentStatus = "published" | "draft";

export type Content = {
  id: number;
  userId: number;
  title: string;
  body: string;
  status: ContentStatus;
};

export type ContentFilters = {
  search: string;
  status: ContentStatus | "all";
  page: number;
};

export type ContentsResponse = {
  items: Content[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
};
