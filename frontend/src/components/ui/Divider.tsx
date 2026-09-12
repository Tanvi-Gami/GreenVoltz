export default function Divider({ className = '' }: { className?: string }) {
  return <hr className={`border-subtle ${className}`} />;
}
