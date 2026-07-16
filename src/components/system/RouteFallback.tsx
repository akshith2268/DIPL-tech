export function RouteFallback() {
  return (
    <div className="route-fallback" role="status" aria-live="polite">
      <span className="route-fallback__mark" />
      <span>Loading Drith Infra</span>
    </div>
  );
}

