export default function SkeletonCard() {
  return (
    <div className="bg-surface rounded-card border border-surface-border shadow-card overflow-hidden animate-pulse">
      <div className="w-full aspect-video bg-surface-muted"/>
      <div className="p-6 space-y-3">
        <div className="h-5 bg-surface-muted rounded-badge w-3/4"/>
        <div className="h-4 bg-surface-muted rounded-badge w-1/2"/>
        <div className="flex gap-2 mt-4"><div className="h-6 bg-surface-muted rounded-badge w-16"/><div className="h-6 bg-surface-muted rounded-badge w-20"/></div>
      </div>
    </div>
  )
}
