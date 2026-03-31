import { methodBadgeClass } from "../utils/helpers";

export default function MethodBadge({ method }) {
  return <span className={methodBadgeClass(method)}>{method}</span>;
}
