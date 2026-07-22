import { useEffect, useRef } from "react";
import PerfectScrollbar, { ScrollBarProps } from "react-perfect-scrollbar";
import "react-perfect-scrollbar/dist/css/styles.css";

interface IScrollBarProps extends ScrollBarProps {
  scrollBottom?: boolean;
  disableComponent?: boolean;
}

export const ScrollBar = (props: IScrollBarProps) => {
  const {
    children,
    scrollBottom = false,
    disableComponent = false,
    ...scrollProps
  } = props;
  const refContainer = useRef<any>(null);
  const refScrollbar = useRef<any>(null);
  const prevChildrenHeight = useRef(0);

  useEffect(() => {
    if (
      children &&
      scrollBottom &&
      refContainer.current &&
      refScrollbar.current
    ) {
      const containerHeight = refScrollbar.current?.parentElement?.offsetHeight;
      const childrenHeight = refScrollbar.current?.children?.[0]?.offsetHeight;

      if (
        containerHeight &&
        childrenHeight &&
        childrenHeight > containerHeight &&
        childrenHeight !== prevChildrenHeight.current
      ) {
        prevChildrenHeight.current = childrenHeight;
        refContainer?.current?.scrollIntoView({ behavior: "instant" });
        if (refScrollbar.current) {
          refScrollbar.current.scrollTop = refScrollbar.current.scrollHeight;
        }
      }
    }
  }, [children, scrollBottom, ...Object.values(scrollProps)]);

  if (disableComponent) {
    return <div className={props?.className}>{children}</div>;
  }

  return (
    <PerfectScrollbar
      containerRef={(ref) => (refScrollbar.current = ref)}
      {...scrollProps}
    >
      {children}
      {scrollBottom && <span ref={refContainer} />}
    </PerfectScrollbar>
  );
};
