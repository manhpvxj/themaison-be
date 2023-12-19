import clsx from "clsx";
import React from "react";

export type InputHeaderProps = {
  label?: string;
  required?: boolean;
  className?: string;
};

const InputHeader: React.FC<InputHeaderProps> = ({
  label,
  required = false,
  className,
}) => {
  return (
    <div
      className={clsx(
        "inter-small-semibold text-grey-50 flex w-full items-center",
        className
      )}
    >
      <label>{label}</label>
      {required && <div className="text-rose-50 "> *</div>}
    </div>
  );
};

export default InputHeader;
