export type SourceName = "hackernews" | "producthunt" | "technews";

export interface RawItem {
  source: SourceName;
  source_id: string;
  title: string;
  tagline: string | null;
  url: string;
  launched_at: string | null;
  votes: number;
  comments: number;
  news_mentions: number;
}
