"use client";

import {
  type ComponentPropsWithoutRef,
  type ElementType,
  type ReactNode,
} from "react";

type RevealTextProps<TElement extends ElementType = "span"> = {
  as?: TElement;
  children: ReactNode;
  mode?: "words" | "chars";
  kind?: "hero" | "heading" | "paragraph" | "button" | "text";
} & Omit<ComponentPropsWithoutRef<TElement>, "as" | "children">;

export default function RevealText<TElement extends ElementType = "span">({
  as,
  children,
  mode = "words",
  kind = "text",
  ...props
}: RevealTextProps<TElement>) {
  const Component = as ?? "span";

  return (
    <Component
      data-text-reveal
      data-text-reveal-mode={mode}
      data-text-reveal-kind={kind}
      {...props}
    >
      {children}
    </Component>
  );
}
