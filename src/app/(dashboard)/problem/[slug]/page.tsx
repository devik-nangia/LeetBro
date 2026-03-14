import { ProblemView } from "@/components/problem-view";

export default async function ProblemPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <div className="max-w-5xl mx-auto pb-24">
      <ProblemView slug={slug} />
    </div>
  );
}
