import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { cn } from "@/lib/utils";

const fieldBase =
  "w-full rounded-xl border border-line bg-canvas-soft/80 px-4 text-sm text-content placeholder:text-subtle/80 transition-colors duration-200 hover:border-line focus:border-accent/60 focus:bg-canvas-soft focus:outline-none disabled:cursor-not-allowed disabled:opacity-50";

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean;
  leftIcon?: ReactNode;
};

export function Input({ className, invalid, leftIcon, ...props }: InputProps) {
  if (leftIcon) {
    return (
      <div className="relative">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-subtle">
          {leftIcon}
        </span>
        <input
          className={cn(
            fieldBase,
            "h-11 pl-10",
            invalid && "border-negative/60 focus:border-negative/70",
            className,
          )}
          aria-invalid={invalid || undefined}
          {...props}
        />
      </div>
    );
  }

  return (
    <input
      className={cn(
        fieldBase,
        "h-11",
        invalid && "border-negative/60 focus:border-negative/70",
        className,
      )}
      aria-invalid={invalid || undefined}
      {...props}
    />
  );
}

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  invalid?: boolean;
};

export function Select({ className, invalid, ...props }: SelectProps) {
  return (
    <select
      className={cn(
        fieldBase,
        "h-11 cursor-pointer appearance-none bg-[right_0.9rem_center] bg-no-repeat pr-9",
        invalid && "border-negative/60 focus:border-negative/70",
        className,
      )}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23717887' stroke-width='1.8'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
      }}
      aria-invalid={invalid || undefined}
      {...props}
    />
  );
}

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  invalid?: boolean;
};

export function Textarea({ className, invalid, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        fieldBase,
        "min-h-28 resize-y py-3 leading-relaxed",
        invalid && "border-negative/60 focus:border-negative/70",
        className,
      )}
      aria-invalid={invalid || undefined}
      {...props}
    />
  );
}

export function Label({
  children,
  htmlFor,
  className,
  optional,
}: {
  children: ReactNode;
  htmlFor?: string;
  className?: string;
  optional?: boolean;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn(
        "mb-2 flex items-center justify-between text-[11px] font-medium uppercase tracking-[0.14em] text-muted",
        className,
      )}
    >
      <span>{children}</span>
      {optional ? (
        <span className="text-[10px] normal-case tracking-normal text-subtle">
          Optional
        </span>
      ) : null}
    </label>
  );
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1.5 text-xs text-negative" role="alert">
      {message}
    </p>
  );
}

export function FieldHint({ children }: { children: ReactNode }) {
  return <p className="mt-1.5 text-xs text-subtle">{children}</p>;
}
