interface HUDProps {
  isLocked: boolean;
  elapsedTime: number;
  bestTime: number | null;
  reached: boolean;
  falls: number;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 100);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
}

export default function HUD({ isLocked, elapsedTime, bestTime, reached, falls }: HUDProps) {
  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      {/* Crosshair */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="h-2 w-2 rounded-full bg-white/80 shadow-[0_0_6px_rgba(0,0,0,0.4)]" />
      </div>

      {/* Timer */}
      <div className="absolute top-6 left-6 bg-white/85 rounded-2xl px-5 py-3 shadow-lg">
        <div className="font-display text-xs tracking-wider text-muted-foreground uppercase">Time</div>
        <div className="font-display text-3xl text-primary text-shadow-soft">{formatTime(elapsedTime)}</div>
        {bestTime !== null && (
          <div className="font-body text-sm text-muted-foreground mt-1">★ Best: {formatTime(bestTime)}</div>
        )}
      </div>

      {/* Falls counter */}
      <div className="absolute top-6 right-6 bg-white/85 rounded-2xl px-5 py-3 shadow-lg text-right">
        <div className="font-display text-xs tracking-wider text-muted-foreground uppercase">Falls</div>
        <div className="font-display text-3xl text-accent text-shadow-soft">{falls}</div>
      </div>

      {/* Goal hint */}
      {!reached && isLocked && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/85 rounded-full px-6 py-2 shadow-lg">
          <div className="font-display text-base text-foreground">🚩 Reach the yellow checkpoint!</div>
        </div>
      )}

      {/* Win message */}
      {reached && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-candy-sky/40 to-candy-pink/40">
          <div className="text-center bg-white/90 rounded-3xl px-12 py-10 shadow-2xl">
            <div className="text-6xl mb-2">🎉</div>
            <div className="font-display text-5xl text-primary text-shadow-pop mb-3">YOU MADE IT!</div>
            <div className="font-display text-2xl text-accent mb-2">{formatTime(elapsedTime)}</div>
            <div className="font-body text-base text-muted-foreground mb-4">Falls: {falls}</div>
            {bestTime !== null && bestTime === elapsedTime && (
              <div className="font-display text-lg text-candy-orange mb-4 animate-pulse">
                ⭐ NEW BEST TIME ⭐
              </div>
            )}
            <div className="font-body text-base text-muted-foreground tracking-wide">
              Press <span className="font-display text-primary">R</span> to play again
            </div>
          </div>
        </div>
      )}

      {/* Click to play */}
      {!isLocked && !reached && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-candy-sky/60 to-candy-lavender/60">
          <div className="text-center bg-white/90 rounded-3xl px-12 py-10 shadow-2xl max-w-md">
            <div className="text-6xl mb-2">🌈</div>
            <div className="font-display text-5xl text-primary text-shadow-pop mb-2">
              Sky Hop!
            </div>
            <div className="font-body text-lg text-muted-foreground mb-6">
              A breezy little platformer
            </div>
            <div className="font-body text-base text-foreground space-y-1 mb-6">
              <div><span className="font-display text-primary">WASD</span> — Move</div>
              <div><span className="font-display text-primary">Space</span> — Jump</div>
              <div><span className="font-display text-primary">Mouse</span> — Look around</div>
              <div className="pt-2">Hop the platforms and reach the 🚩 checkpoint!</div>
            </div>
            <div className="inline-block bg-primary text-primary-foreground rounded-full px-6 py-3 font-display text-lg shadow-md">
              Click to start
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
