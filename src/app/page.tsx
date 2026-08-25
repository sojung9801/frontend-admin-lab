import ContentList from "@/features/content/ui/ContentList";

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-12 font-sans sm:px-10">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8">
          <p className="text-sm font-semibold text-blue-600">Admin</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-950">
            콘텐츠 목록
          </h1>
          <p className="mt-2 text-zinc-600">
            등록된 콘텐츠를 확인하고 관리하세요.
          </p>
        </header>

        <ContentList />
      </div>
    </main>
  );
}
