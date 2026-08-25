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
};
