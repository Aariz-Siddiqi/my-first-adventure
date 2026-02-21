interface HUDProps {
  score: number;
  total: number;
  isLocked: boolean;
}

export default function HUD({ score, total, isLocked }: HUDProps) {
  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      {/* Crosshair */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="h-6 w-[2px] bg-primary/60 absolute -translate-x-1/2 -translate-y-1/2" />
        <div className="w-6 h-[2px] bg-primary/60 absolute -translate-x-1/2 -translate-y-1/2" />
      </div>

      {/* Score */}
      <div className="absolute top-6 left-6">
        <div className="font-display text-xs tracking-widest text-muted-foreground uppercase mb-1">
          Collected
        </div>
        <div className="font-display text-3xl text-glow-cyan text-primary">
          {score}<span className="text-muted-foreground text-lg">/{total}</span>
        </div>
      </div>

      {/* Win message */}
      {score === total && total > 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="font-display text-5xl text-glow-magenta text-accent mb-4">
              ALL COLLECTED!
            </div>
            <div className="font-display text-lg text-muted-foreground tracking-widest">
              YOU WIN — PRESS R TO RESTART
            </div>
          </div>
        </div>
      )}

      {/* Click to play overlay */}
      {!isLocked && score < total && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/70">
          <div className="text-center">
            <div className="font-display text-4xl text-glow-cyan text-primary mb-4">
              NEON ARENA
            </div>
            <div className="font-body text-xl text-muted-foreground mb-2">
              Click to start
            </div>
            <div className="font-body text-sm text-muted-foreground/60 space-y-1">
              <div>WASD / Arrow Keys — Move</div>
              <div>Mouse — Look around</div>
              <div>Collect all the orbs!</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
