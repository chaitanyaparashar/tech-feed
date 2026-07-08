import type { RawItem } from "@/lib/sources/types";

export const BUZZ_WEIGHTS = {
  votes: 1.0,
  comments: 0.5,
  news_mentions: 2.0,
} as const;

export function scoreBuzz(
  item: Pick<RawItem, "votes" | "comments" | "news_mentions">,
): number {
  return (
    BUZZ_WEIGHTS.votes * Math.log(item.votes + 1) +
    BUZZ_WEIGHTS.comments * Math.log(item.comments + 1) +
    BUZZ_WEIGHTS.news_mentions * item.news_mentions
  );
}
