export const Panel = ({ title, children, action, dot = true }: any) => {
  return (
    <div className="panel">
      {title && (
        <div className="panel-header">
          <div className="flex items-center gap-2.5">
            {dot && <div className="panel-header-dot"></div>}
            <h2 className="panel-header-title">{title}</h2>
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="panel-content">{children}</div>
    </div>
  );
};
