type ProgressItemProps = {
  icon?: React.ReactNode;
  circleClass?: string;
  title: string;
  subtitle: string;
  action?: React.ReactNode;
  isLast?: boolean;
  completed?: boolean;
};

export default function ProgressItem({
  icon,
  circleClass = "bg-gray-200 text-gray-500",
  title,
  subtitle,
  action,
  isLast = false,
  completed = false,
}: ProgressItemProps) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
            completed ? "bg-[#1C7C3A] text-white" : circleClass
          }`}
        >
          {icon}
        </div>

        {!isLast && <div className="w-0.5 h-10 bg-gray-200 mt-1" />}
      </div>

      <div className="flex-1 flex items-start justify-between">
        <div>
          <p className="text-base font-semibold">{title}</p>
          <p className="text-sm text-gray-500">{subtitle}</p>
        </div>

        {action && <div className="ml-4">{action}</div>}
      </div>
    </div>
  );
}
