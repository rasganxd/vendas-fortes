
// Empty Sonner Toaster component that does nothing
import React from "react";

type ToasterProps = React.HTMLAttributes<HTMLDivElement>;

const Toaster = ({ ...props }: ToasterProps) => {
  // This is an empty component that does nothing
  return null;
};

export { Toaster };
