import { useState } from "react";
import {
  Car,
  CircleCheck,
  Smile,
  AlertCircle,
  Zap,
  Navigation,
  CheckCircle2,
} from "lucide-react";
import { Hospital } from "lucide-react";
import ProgressItem from "./ProgressItem";
import FeedbackModal from "./FeedbackModal";

// Types

type NotificationIcon = "smile" | "warning" | "lightning";

type Notification = {
  icon: NotificationIcon;
  message: string;
};

type Request = {
  hospital: {
    address: string;
  };
};

// Step config

const STEPS = [
  {
    step: 1,
    icon: <CheckCircle2 size={16} />,
    circleClass: "bg-purple-600 text-white",
    title: "Request Accepted",
    subtitle: "You've committed to donate",
  },
  {
    step: 2,
    icon: <Car size={16} />,
    circleClass: "bg-red-600 text-white",
    title: "On Your Way",
    subtitle: "Travelling to the hospital",
    notification: {
      icon: "smile" as NotificationIcon,
      message: "You are on your way, be safe!",
    },
  },
  {
    step: 3,
    icon: <Hospital size={16} />,
    circleClass: "bg-yellow-400 text-white",
    title: "Arrived at Hospital",
    subtitle: "Check in at reception",
    notification: {
      icon: "warning" as NotificationIcon,
      message: "You have arrived, please check-in!",
    },
  },
  {
    step: 4,
    icon: <CircleCheck size={16} />,
    circleClass: "bg-[#1C7C3A] text-white",
    title: "Donation Complete",
    subtitle: "Mark when finished",
    notification: {
      icon: "lightning" as NotificationIcon,
      message:
        "Please note, it will take 1–2 hours for your donation to be verified",
    },
  },
];

const NotificationIcon = ({ icon }: { icon: NotificationIcon }) => {
  if (icon === "smile") return <Smile className="text-green-500" size={18} />;
  if (icon === "warning")
    return <AlertCircle className="text-[#C91E1E]" size={18} />;
  return <Zap className="text-[#C91E1E]" size={18} />;
};

export default function TrackProgress({
  selectedRequest,
}: {
  selectedRequest: Request;
}) {
  const [progressStep, setProgressStep] = useState(1);
  const [notification, setNotification] = useState<Notification | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const advanceToStep = (targetStep: number) => {
    if (targetStep !== progressStep + 1) return;

    const stepConfig = STEPS.find((s) => s.step === targetStep);
    if (!stepConfig) return;

    setProgressStep(targetStep);

    if (stepConfig.notification) {
      setNotification(stepConfig.notification);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const startNavigation = () => {
    const address = selectedRequest?.hospital?.address;
    if (!address) return;

    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
      address
    )}`;
    window.open(url, "_blank");

    // Clicking "Start Navigation" counts as completing step 2
    advanceToStep(2);
  };

  // Per-step action elements.
  // Step 1 has no action (already complete on accept).
  // Step 2 uses a navigation button instead of a checkbox.
  // Steps 3 & 4 use checkboxes.
  const getAction = (step: number) => {
    if (step === 1) return undefined;

    if (step === 2) {
      // Only show the button if the step hasn't been completed yet
      if (progressStep >= 2) return undefined;
      return (
        <button
          onClick={startNavigation}
          className="flex items-center gap-1 border px-2 py-1 rounded-md hover:bg-gray-50 transition"
        >
          <Navigation size={14} />
          Start Navigation
        </button>
      );
    }

    // Steps 3 & 4 — checkbox, only enabled once the previous step is done
    const isUnlocked = progressStep >= step - 1;
    const isChecked = progressStep >= step;

    return (
      <input
        type="checkbox"
        checked={isChecked}
        disabled={!isUnlocked}
        onChange={() => advanceToStep(step)}
        className="cursor-pointer disabled:cursor-not-allowed"
      />
    );
  };

  return (
    <div className="space-y-6">
      <p className="font-medium text-sm">Donation Progress</p>

      {STEPS.map((s, index) => (
        <ProgressItem
          key={s.step}
          icon={s.icon}
          circleClass={s.circleClass}
          title={s.title}
          subtitle={s.subtitle}
          action={getAction(s.step)}
          isLast={index === STEPS.length - 1}
          completed={progressStep >= s.step}
        />
      ))}

      {notification && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white border shadow-lg rounded-lg px-4 py-3 flex items-center gap-2 z-50">
          <NotificationIcon icon={notification.icon} />
          <p className="text-sm">{notification.message}</p>
        </div>
      )}

      {progressStep === STEPS.length && (
        <div className="flex justify-end">
          <button
            onClick={() => setShowFeedback(true)}
            className="bg-[#1C7C3A] text-white px-4 py-2 rounded-md hover:bg-green-500 transition"
          >
            Give Feedback
          </button>
        </div>
      )}

      {showFeedback && <FeedbackModal onClose={() => setShowFeedback(false)} />}
    </div>
  );
}
