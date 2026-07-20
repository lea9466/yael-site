"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";

import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils/cn";

type AutoResizeTextareaProps = Omit<
  React.ComponentPropsWithoutRef<typeof Textarea>,
  "rows"
> & {
  minHeightPx?: number;
  maxHeightPx?: number;
};

export const AutoResizeTextarea = forwardRef<
  HTMLTextAreaElement,
  AutoResizeTextareaProps
>(function AutoResizeTextarea(
  {
    className,
    value,
    minHeightPx = 64,
    maxHeightPx = 220,
    onChange,
    ...props
  },
  ref
) {
  const innerRef = useRef<HTMLTextAreaElement | null>(null);

  useImperativeHandle(ref, () => innerRef.current as HTMLTextAreaElement);

  const resize = useCallback(() => {
    const element = innerRef.current;

    if (!element) {
      return;
    }

    element.style.minHeight = `${minHeightPx}px`;
    element.style.maxHeight = `${maxHeightPx}px`;
    element.style.height = "auto";
    const nextHeight = Math.min(
      Math.max(element.scrollHeight, minHeightPx),
      maxHeightPx
    );
    element.style.height = `${nextHeight}px`;
    element.style.overflowY =
      element.scrollHeight > maxHeightPx ? "auto" : "hidden";
  }, [maxHeightPx, minHeightPx]);

  useEffect(() => {
    resize();
  }, [resize, value]);

  return (
    <Textarea
      {...props}
      ref={innerRef}
      value={value}
      rows={2}
      className={cn("min-h-16 max-h-[220px] resize-y overflow-hidden", className)}
      onChange={(event) => {
        onChange?.(event);
        window.requestAnimationFrame(resize);
      }}
    />
  );
});
