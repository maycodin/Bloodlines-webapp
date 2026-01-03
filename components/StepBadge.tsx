type StepBadgeProps = {
    index: number;
    currentStep: number;
  };
  
  export default function StepBadge({ index, currentStep }: StepBadgeProps) {
    const isActive = currentStep === index;
    const isDone = currentStep > index;
  
    return (
      <div
        className={`flex-1 py-2 rounded-md text-center text-sm font-medium transition
          ${
            isDone
              ? "bg-green-500 text-white"
              : isActive
              ? "bg-red-600 text-white"
              : "bg-white/40 text-gray-700"
          }`}
      >
        Step {index}
      </div>
    );
  }
  