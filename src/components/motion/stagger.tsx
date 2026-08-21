"use client";

import * as m from "motion/react-m";
import { Children, type ReactNode } from "react";
import { distance, duration, ease } from "@styles/motion";

// Long lists (a big project grid, a tag cloud) shouldn't make the last item
// wait seconds for its turn — only the first N items get the staggered
// reveal, the rest render immediately.
const MAX_STAGGERED_CHILDREN = 8;

const itemVariants = {
  hidden: { opacity: 0, y: distance.sm },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: duration.base, ease: ease.out },
  },
};

type StaggerProps = {
  children: ReactNode;
  step?: number;
  className?: string;
  itemClassName?: string;
};

export function Stagger({
  children,
  step = 0.06,
  className,
  itemClassName,
}: StaggerProps) {
  const items = Children.toArray(children);
  const staggered = items.slice(0, MAX_STAGGERED_CHILDREN);
  const rest = items.slice(MAX_STAGGERED_CHILDREN);

  return (
    <m.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={{ hidden: {}, visible: { transition: { staggerChildren: step } } }}
    >
      {staggered.map((child, index) => (
        <m.div key={index} className={itemClassName} variants={itemVariants}>
          {child}
        </m.div>
      ))}
      {rest}
    </m.div>
  );
}
