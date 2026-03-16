import { CommunityPostCard, SectionHeading } from "@/components/ui";
import { ProtectedRoute } from "@/components/protected-route";
import { communityPosts } from "@/lib/content";
import { isLocale } from "@/lib/i18n";

export default function CommunityPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) {
    return null;
  }

  return (
    <ProtectedRoute locale={params.locale} requireAdmin>
      <div className="mx-auto max-w-6xl space-y-10 px-4 py-16 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Fitness Social Network"
        title="A community feed for workouts, progress, questions, and coach replies."
        copy="The social layer supports likes, comments, coach guidance, and viral sharing to Instagram, TikTok, X, and WhatsApp."
      />

      <div className="glass-panel rounded-[32px] p-6">
        <div className="grid gap-4 md:grid-cols-[1fr_auto]">
          <input className="input" placeholder="Share a workout, progress update, or question..." />
          <button className="gradient-button rounded-full px-5 py-3 text-sm font-medium text-white">
            Post update
          </button>
        </div>
      </div>

      <div className="space-y-5">
        {communityPosts.length === 0 ? (
          <div className="glass-panel rounded-[32px] p-8 text-center">
            <p className="text-sm text-zinc-500">No posts yet.</p>
          </div>
        ) : (
          communityPosts.map((post) => (
            <CommunityPostCard key={post.id} post={post} />
          ))
        )}
      </div>
    </div>
    </ProtectedRoute>
  );
}
