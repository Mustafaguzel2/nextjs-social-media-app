import TrendsSidebar from "@/components/TrendsSidebar";
import SearchResults from "./SearchResult";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{ q?: string }>;
};

export async function generateMetadata({
  searchParams,
}: PageProps) {
  const { q } = await Promise.resolve(searchParams);
  return {
    title: `Search results for "${q || "Search"}"`,
  };
}

export default async function Page({
  searchParams,
}: PageProps) {
  const { q } = await Promise.resolve(searchParams);
  const searchQuery = q ?? "";

  return (
    <main className="flex w-full min-w-0 gap-5">
      <div className="mt-6 w-full min-w-0 space-y-5">
        <div className="rounded-2xl bg-card p-5 shadow-sm">
          <h1 className="line-clamp-2 break-all text-center text-2xl font-bold">
            {searchQuery ? `Search results for "${searchQuery}"` : "Search"}
          </h1>
        </div>
        <SearchResults query={searchQuery} />
      </div>
      <TrendsSidebar />
    </main>
  );
}
