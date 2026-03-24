export const Panel = ({ title, children, action, dot = true, compact = false }: any) => {
  return (
    <div className="panel transition-[filter,opacity] duration-[280ms] ease-in-out relative">
      {title && (
        <div className="panel-header">
          <div className="flex items-center gap-2.5">
            {dot && <div className="panel-header-dot"></div>}
            <h2 className="panel-header-title">{title}</h2>
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className={compact ? "p-2" : "panel-content"}>{children}</div>
    </div>
  );
};
