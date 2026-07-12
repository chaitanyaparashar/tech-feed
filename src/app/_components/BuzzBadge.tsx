export default function BuzzBadge({ tier }: { tier: "High" | "Medium" | "Low" }) {
  return <span className={`buzz-badge buzz-badge-${tier.toLowerCase()}`}>{tier} buzz</span>;
}
