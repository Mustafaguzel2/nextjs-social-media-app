import { Metadata } from "next";
import Bookmarks from "./Bookmarks";
import TrendsSidebar from "@/components/TrendsSidebar";

export const metadata: Metadata = {
  title: "Bookmarks",
  description: "Bookmarks Page",
};

export default function BookmarksPage() {
  return (
    <main className="flex w-full min-w-0 gap-5">
      <div className="w-full min-w-0 space-y-5">
        <div className="rounded-2xl bg-card p-5 shadow-sm mt-6">
          <h1 className="text-center text-2xl font-bold">Bookmarks</h1>
        </div>
        <Bookmarks />
      </div>
      <TrendsSidebar />
    </main>
  );
}
