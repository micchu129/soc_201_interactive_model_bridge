const sceneNames = ['Hero', 'Setup world', 'Population', 'Agent focus', 'Agent profile', 'Networks', 'Policy lab']

export default function SceneNavigation({ activeScene, maxUnlockedScene, onNavigate, blockedMessage }) {
  const canGoUp = activeScene > 0
  const canGoDown = activeScene < maxUnlockedScene
  return (
    <nav className="fixed right-5 top-1/2 z-[80] flex -translate-y-1/2 flex-col items-center gap-3">
      <button
        aria-label="Previous scene"
        disabled={!canGoUp}
        onClick={() => onNavigate(activeScene - 1)}
        className="nav-arrow"
      >↑</button>
      <div className="glass rounded-full px-2 py-3">
        <div className="flex flex-col gap-2">
          {sceneNames.map((name, index) => (
            <button
              key={name}
              title={name}
              disabled={index > maxUnlockedScene}
              onClick={() => onNavigate(index)}
              className={`h-2 w-2 rounded-full transition ${index === activeScene ? 'scale-150 bg-cyan-300 shadow-[0_0_12px_#67e8f9]' : index <= maxUnlockedScene ? 'bg-slate-500 hover:bg-slate-300' : 'bg-slate-800'}`}
            />
          ))}
        </div>
      </div>
      <button
        aria-label="Next scene"
        disabled={!canGoDown}
        onClick={() => onNavigate(activeScene + 1)}
        className="nav-arrow"
      >↓</button>
      {!canGoDown && activeScene < 6 && <p className="glass absolute right-12 top-1/2 w-44 -translate-y-1/2 rounded-xl px-3 py-2 text-right text-xs text-slate-300">{blockedMessage}</p>}
    </nav>
  )
}
