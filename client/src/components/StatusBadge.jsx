const statusLabels = {
  pending: 'Pending',
  accepted: 'Accepted',
  rejected: 'Rejected',
  completed: 'Completed',
};

const StatusBadge = ({ status }) => {
  const normalizedStatus = statusLabels[status] ? status : 'pending';

  return (
    <span className={`status-badge status-${normalizedStatus}`}>
      <span className="status-dot" aria-hidden="true"></span>
      {statusLabels[normalizedStatus]}
    </span>
  );
};

export default StatusBadge;
