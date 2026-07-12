"use client";

/**
 * ルートレイアウト自体が失敗した場合の最終フォールバック。
 * ここでは外部コンポーネントに依存せず素の HTML のみで描画する。
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ja">
      <body
        style={{
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
          background: "#f0f9ff",
          color: "#0f172a",
          padding: "16px",
        }}
      >
        <div style={{ textAlign: "center", maxWidth: 480 }}>
          <h1 style={{ fontSize: 20, fontWeight: 800 }}>
            サーバーでエラーが発生しました
          </h1>
          <p style={{ fontSize: 14, color: "#64748b", marginTop: 8 }}>
            時間をおいて再度お試しください。
            {error.digest && (
              <>
                <br />
                エラーID: <code>{error.digest}</code>
              </>
            )}
          </p>
          <button
            onClick={reset}
            style={{
              marginTop: 20,
              padding: "10px 24px",
              borderRadius: 12,
              border: "none",
              background: "linear-gradient(135deg,#0ea5e9,#3b82f6)",
              color: "#fff",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            再読み込み
          </button>
        </div>
      </body>
    </html>
  );
}
