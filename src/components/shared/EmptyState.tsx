export const EmptyState = ({ message = 'No data available' }) => {
  return (
    <div className="flex items-center justify-center py-12 text-text-muted">
      <p className="text-body">{message}</p>
    </div>
  );
};
