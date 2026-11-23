"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { donor, FeedbackRating } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";

const RATINGS: { value: FeedbackRating; label: string; emoji: string }[] = [
  { value: "TERRIBLE", label: "Terrible", emoji: "😣" },
  { value: "BAD", label: "Bad", emoji: "🙁" },
  { value: "OKAY", label: "Okay", emoji: "😐" },
  { value: "GOOD", label: "Good", emoji: "🙂" },
  { value: "AMAZING", label: "Amazing", emoji: "😄" },
];

type GiveFeedbackModalProps = {
  requestId: string;
  hospitalName?: string;
  onClose: () => void;
  onSubmitted: () => void;
};

export default function GiveFeedbackModal({ requestId, hospitalName, onClose, onSubmitted }: GiveFeedbackModalProps) {
  const { showToast } = useToast();
  const [rating, setRating] = useState<FeedbackRating | null>(null);
  const [comments, setComments] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!rating) return;
    setSubmitting(true);
    try {
      await donor.submitFeedback(requestId, rating, comments);
      showToast("Thank you for your feedback!");
      onSubmitted();
    } catch (err: any) {
      showToast(err?.message || "Could not send your feedback. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] bg-black/50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="feedback-title"
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <h2 id="feedback-title" className="text-xl font-bold text-gray-900">
            Give Feedback
          </h2>
          <button onClick={onClose} aria-label="Close" className="p-2 rounded-full text-gray-500 hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-gray-700 mt-2">How would you describe your blood donation experience{hospitalName ? ` at ${hospitalName}` : ""}?</p>

        <div className="grid grid-cols-5 gap-2 mt-4">
          {RATINGS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setRating(option.value)}
              aria-pressed={rating === option.value}
              className={`flex flex-col items-center gap-1 py-3 rounded-xl border text-xs font-medium ${
                rating === option.value ? "bg-blue-600 border-blue-600 text-white" : "border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
            >
              <span className="text-2xl" aria-hidden="true">
                {option.emoji}
              </span>
              {option.label}
            </button>
          ))}
        </div>

        <label className="block mt-5">
          <span className="block text-sm text-gray-700 mb-1.5">Anything else you&apos;d like to share about your donation experience?</span>
          <textarea
            rows={4}
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-gray-900"
          />
        </label>

        <div className="grid grid-cols-2 gap-3 mt-5">
          <button onClick={submit} disabled={!rating || submitting} className="py-3 rounded-xl bg-[#C91E1E] text-white font-semibold disabled:opacity-50">
            {submitting ? "Sending..." : "Submit"}
          </button>
          <button onClick={onClose} className="py-3 rounded-xl border border-gray-300 text-gray-900 font-medium">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
