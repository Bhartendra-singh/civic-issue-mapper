const STATUS_STYLES = {
  pending: 'bg-status-open-bg text-status-open',
  'in-progress': 'bg-status-progress-bg text-status-progress',
  resolved: 'bg-status-resolved-bg text-status-resolved',
  reopened: 'bg-status-open-bg text-status-open',
  neutral: 'bg-cyan-dim text-navy-2',
};

const STATUS_LABELS = {
  pending: 'Pending',
  'in-progress': 'In Progress',
  resolved: 'Resolved',
  reopened: 'Reopened',
};

export default function Badge({ status, children, className = '' }) {
  const styles = STATUS_STYLES[status] ?? STATUS_STYLES.neutral;
  const label = children ?? STATUS_LABELS[status] ?? status;

  return (
    <span
      className={`
        inline-flex items-center
        text-xs font-semibold
        px-2.5 py-1 rounded-full
        ${styles}
        ${className}
      `}
    >
      {label}
    </span>
  );
}