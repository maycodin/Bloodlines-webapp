type StepBadgeProps = {
  index: number;
  currentStep: number;
};

export default function StepBadge({
  index,
  currentStep,
}: StepBadgeProps) {
  const active = currentStep === index;

  return (
    <div className="relative flex-1">

      {/* MAIN BODY */}
      <div
        className={`py-2 text-center text-sm font-medium
        ${
          active
            ? "bg-green-500 text-white"
            : "bg-green-50 text-gray-700"
        }
        ${
          active && index === 1
            ? "rounded-l-lg pr-6"
            : "rounded-lg"
        }
        `}
      >
        Step {index}
      </div>

      {/* ARROW HEAD */}
      {active && index === 1 && (
        <span
          className="absolute top-0 right-0 h-full w-6
          bg-green-500"
          style={{
            clipPath:
              "polygon(0 0, 100% 50%, 0 100%)",
          }}
        />
      )}
    </div>
  );
}
