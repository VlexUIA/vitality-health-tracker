interface CardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export default function Card({ children, className = "", style }: CardProps) {
  return (
    <div
      className={`rounded-2xl p-5 ${className}`}
      style={{ background: "var(--surface)", border: "1px solid var(--border)", ...style }}
    >
      {children}
    </div>
  );
}
