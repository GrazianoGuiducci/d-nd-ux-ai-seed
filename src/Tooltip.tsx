import React, { createContext, useContext } from 'react';
import HoverPopover, { PopoverPlacement } from './ui/HoverPopover';

export const TooltipGlobalContext = createContext<boolean>(true);

export interface TooltipContent {
  function: string;
  mechanism?: string;
  expectation?: string;
  example?: string;
}

export interface TooltipProps {
  content: TooltipContent | string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'right' | 'left' | 'auto';
  block?: boolean;
}

const renderTooltipContent = (content: TooltipContent | string) => {
  if (typeof content === 'string') {
    const [maybeTitle, ...rest] = content.split(':');
    const hasTitle = rest.length > 0 && maybeTitle.length <= 80;
    return (
      <>
        {hasTitle && <span className="lab-tip-title">{maybeTitle}</span>}
        <div className="lab-tip-body">{hasTitle ? rest.join(':').trim() : content}</div>
      </>
    );
  }

  return (
    <>
      <span className="lab-tip-title">Function</span>
      <div className="lab-tip-body">{content.function}</div>
      {content.mechanism && <div className="lab-tip-logic">{content.mechanism}</div>}
      {content.expectation && (
        <div className="lab-tip-related">
          <span>{content.expectation}</span>
        </div>
      )}
      {content.example && (
        <div className="lab-tip-funnel">
          <span>{content.example}</span>
        </div>
      )}
    </>
  );
};

/**
 * Tooltip — semantic wrapper around HoverPopover.
 *
 * Use this when the tooltip explains function/mechanism/expectation. Use
 * HoverPopover directly for custom popovers or closed-panel gutters.
 */
export function Tooltip({ content, children, position = 'right', block = true }: TooltipProps) {
  const isEnabled = useContext(TooltipGlobalContext);

  return (
    <HoverPopover
      content={renderTooltipContent(content)}
      placement={position as PopoverPlacement}
      enabled={isEnabled}
      gap={10}
      estimatedWidth={320}
      estimatedHeight={260}
      anchorClassName={block ? 'block' : undefined}
    >
      {children}
    </HoverPopover>
  );
}

export default Tooltip;

