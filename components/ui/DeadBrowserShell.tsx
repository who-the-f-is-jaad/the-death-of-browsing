// The "dead browser" metaphor is retired.
// This is now a plain page shell — just a max-width container.

interface Props {
  children: React.ReactNode;
}

export default function DeadBrowserShell({ children }: Props) {
  return (
    <div className="page-shell">
      <div className="page-content">
        {children}
      </div>
    </div>
  );
}
