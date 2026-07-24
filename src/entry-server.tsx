import { StrictMode } from "react";
import { renderToReadableStream } from "react-dom/server";
import { StaticRouter } from "react-router-dom";
import { App } from "./App";
import { ErrorBoundary } from "./components/system/ErrorBoundary";

export async function render(url: string) {
  let renderError: unknown;
  const stream = await renderToReadableStream(
    <StrictMode>
      <ErrorBoundary>
        <StaticRouter location={url}>
          <App />
        </StaticRouter>
      </ErrorBoundary>
    </StrictMode>,
    {
      onError(error) {
        renderError = error;
      },
    },
  );

  await stream.allReady;
  const html = await new Response(stream).text();

  if (renderError) throw renderError;
  return html;
}
