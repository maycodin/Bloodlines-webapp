import { useState } from "react";
import { Frown, Meh, Smile, Laugh, Angry, LucideIcon } from "lucide-react";

type RatingLabel = "Terrible" | "Bad" | "Okay" | "Good" | "Amazing";

type RatingOption = {
  label: RatingLabel;
  icon: LucideIcon;
};

type FeedbackModalProps = {
  onClose: () => void;
};

const RATING_OPTIONS: RatingOption[] = [
  { label: "Terrible", icon: Angry },
  { label: "Bad", icon: Frown },
  { label: "Okay", icon: Meh },
  { label: "Good", icon: Smile },
  { label: "Amazing", icon: Laugh },
];

export default function FeedbackModal({ onClose }: FeedbackModalProps) {
  const [rating, setRating] = useState<RatingLabel | null>(null);
  const [comment, setComment] = useState("");

  const handleSubmit = () => {
    console.log({ rating, comment });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-lg rounded-xl p-6 shadow-lg">
        <h2 className="font-semibold text-lg mb-1">Give Feedback</h2>

        <p className="text-sm text-gray-500 mb-6">
          How would you describe your blood donation experience?
        </p>

        {/* Rating options */}
        <div className="flex gap-3 mb-6">
          {RATING_OPTIONS.map(({ label, icon: Icon }) => {
            const selected = rating === label;

            return (
              <button
                key={label}
                onClick={() => setRating(label)}
                className={`flex flex-col items-center justify-center w-20 h-20 border rounded-md text-sm transition ${selected
                    ? "bg-blue-600 text-white border-blue-600"
                    : "hover:bg-blue-600 hover:text-white"
                  }`}
              >
                <Icon size={18} />
                <span className="text-xs mt-1">{label}</span>
              </button>
            );
          })}
        </div>

        <p className="text-sm mb-2">
          Do you have any feedback you would like to share as regards your
          donation experience?
        </p>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full border rounded-md p-3 h-28 text-sm mb-6"
          placeholder="Share your thoughts..."
        />

        <div className="flex justify-center gap-4">
          <button
            onClick={handleSubmit}
            className="bg-[#C91E1E] text-white px-6 py-2 rounded-md"
          >
            Submit
          </button>

          <button
            onClick={onClose}
            className="bg-gray-100 px-6 py-2 rounded-md"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}