"use client";

import { useEffect } from 'react';
import { X } from 'lucide-react';

export type Message = { type: 'success' | 'error'; text: string };

type InlineMessageProps = {
  message: Message | null;
  onClose?: () => void;
  className?: string;
};

const AUTO_HIDE_MS = 5000;

const InlineMessage = ({ message, onClose, className = 'mb-4' }: InlineMessageProps) => {
  useEffect(() => {
    if (!message || message.type !== 'success' || !onClose) return;
    const timer = setTimeout(onClose, AUTO_HIDE_MS);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div
      role={message.type === 'error' ? 'alert' : 'status'}
      className={`${className} p-3 rounded-lg text-sm flex items-start justify-between gap-3 ${
        message.type === 'success'
          ? 'bg-green-50 border border-green-200 text-green-700'
          : 'bg-red-50 border border-red-200 text-red-700'
      }`}
    >
      <span>{message.text}</span>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss message"
          className="shrink-0 opacity-70 hover:opacity-100"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default InlineMessage;
