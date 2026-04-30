export type SignalStatus = "ok" | "warn" | "bad";

export type Signal = {
  label: string;
  value: string;
  detail: string;
  status: SignalStatus;
};

type SignalStripProps = {
  signals: [Signal, Signal, Signal];
};

const STATUS_COLOR: Record<SignalStatus, string> = {
  ok: "var(--positive)",
  warn: "var(--warning)",
  bad: "var(--negative)",
};

export function SignalStrip({ signals }: SignalStripProps) {
  return (
    <div
      className="grid grid-cols-1 md:grid-cols-3"
      style={{
        gap: "1px",
        background: "var(--border)",
        borderTop: "1px solid var(--border)",
      }}
    >
      {signals.map((sig, i) => {
        const color = STATUS_COLOR[sig.status];
        return (
          <div
            key={i}
            style={{
              background: "var(--card)",
              padding: "12px 18px",
              display: "flex",
              alignItems: "flex-start",
              gap: "10px",
            }}
          >
            <div
              style={{
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                background: color,
                boxShadow: `0 0 6px ${color}`,
                marginTop: "5px",
                flexShrink: 0,
              }}
            />
            <div>
              <div
                style={{
                  fontSize: "11px",
                  color: "var(--foreground-muted)",
                  marginBottom: "2px",
                }}
              >
                {sig.label}
              </div>
              <div style={{ fontSize: "13px", fontWeight: 600, color }}>
                {sig.value}
              </div>
              <div
                style={{
                  fontSize: "11px",
                  color: "var(--foreground-muted)",
                  marginTop: "1px",
                }}
              >
                {sig.detail}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
