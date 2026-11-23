"use client";

type SwitchProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label: string;
};

export default function Switch({ checked, onChange, disabled, label }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative shrink-0 w-12 h-7 rounded-full transition-colors disabled:opacity-50 ${checked ? "bg-[#C91E1E] dark:bg-[#F44336]" : "bg-gray-300 dark:bg-gray-600"}`}
    >
      <span className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-[#fff] shadow transition-transform ${checked ? "translate-x-5" : ""}`} />
    </button>
  );
}
