import Link from "next/link";
export function Brand() {
  return (
    <Link href="/" className="easy-brand" title="Easy home">
      <span className="brand-mark" aria-hidden="true">
        e
      </span>
      easy<span className="brand-dot">.</span>
    </Link>
  );
}
