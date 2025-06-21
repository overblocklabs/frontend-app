export function LotteryCardSkeleton() {
  return (
    <div className="bg-card-bg rounded-lg p-6 border border-border animate-pulse">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="h-6 bg-background rounded w-3/4"></div>
        <div className="h-5 bg-background rounded w-16"></div>
      </div>
      
      {/* Prize and participants */}
      <div className="space-y-3 mb-6">
        <div className="flex justify-between">
          <div className="h-4 bg-background rounded w-20"></div>
          <div className="h-6 bg-background rounded w-24"></div>
        </div>
        <div className="flex justify-between">
          <div className="h-4 bg-background rounded w-24"></div>
          <div className="h-4 bg-background rounded w-16"></div>
        </div>
        <div className="flex justify-between">
          <div className="h-4 bg-background rounded w-20"></div>
          <div className="h-4 bg-background rounded w-12"></div>
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="mb-4">
        <div className="h-2 bg-background rounded-full"></div>
      </div>
      
      {/* Button */}
      <div className="h-10 bg-background rounded w-full"></div>
    </div>
  );
}

export function WinnerCardSkeleton() {
  return (
    <div className="card p-6 bg-gradient-to-br from-accent/10 to-primary/10 border border-accent/20 animate-pulse">
      <div className="text-center">
        {/* Icon */}
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/20"></div>
        
        {/* Title */}
        <div className="h-6 bg-background/30 rounded w-3/4 mx-auto mb-4"></div>
        
        {/* Winner address */}
        <div className="mb-4">
          <div className="h-4 bg-background/30 rounded w-16 mx-auto mb-1"></div>
          <div className="h-4 bg-background/30 rounded w-32 mx-auto"></div>
        </div>
        
        {/* Prize info */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div className="h-3 bg-background/30 rounded w-16 mx-auto mb-1"></div>
            <div className="h-6 bg-background/30 rounded w-20 mx-auto mb-1"></div>
            <div className="h-3 bg-background/30 rounded w-12 mx-auto"></div>
          </div>
          <div>
            <div className="h-3 bg-background/30 rounded w-16 mx-auto mb-1"></div>
            <div className="h-6 bg-background/30 rounded w-20 mx-auto mb-1"></div>
            <div className="h-3 bg-background/30 rounded w-12 mx-auto"></div>
          </div>
        </div>
        
        {/* Date and link */}
        <div className="pt-4 border-t border-border/30">
          <div className="h-3 bg-background/30 rounded w-24 mx-auto mb-2"></div>
          <div className="h-3 bg-background/30 rounded w-20 mx-auto"></div>
        </div>
      </div>
    </div>
  );
}

export function LoadingSpinner({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg', className?: string }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8', 
    lg: 'w-12 h-12'
  };
  
  return (
    <div className={`animate-spin rounded-full border-2 border-accent/20 border-t-accent ${sizeClasses[size]} ${className}`}></div>
  );
}

export function LoadingSection({ title, description }: { title: string, description: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <LoadingSpinner size="lg" className="mb-6" />
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-muted text-center max-w-md">{description}</p>
    </div>
  );
} 