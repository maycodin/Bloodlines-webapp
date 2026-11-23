"use client";

import { useRef, useState } from "react";
import { Camera, Loader2 } from "lucide-react";
import { uploadAvatar } from "@/lib/api";
import { useAuth } from "@/app/contexts/AuthContext";
import { useToast } from "@/components/ui/Toast";

const MAX_SIZE_MB = 5;

export default function AvatarUpload({ avatarUrl }: { avatarUrl?: string }) {
  const { user, refreshUser, patchUser } = useAuth();
  const { showToast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | undefined>(avatarUrl);
  const [uploading, setUploading] = useState(false);
  const shown = preview || user?.avatarUrl;
  const initial = user?.fullName?.trim().charAt(0).toUpperCase() || "U";

  const handleFile = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showToast("Please choose an image file.", "error");
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      showToast(`Please choose an image smaller than ${MAX_SIZE_MB}MB.`, "error");
      return;
    }
    setUploading(true);
    try {
      const url = await uploadAvatar(file);
      setPreview(url);
      await refreshUser();
      patchUser({ avatarUrl: url });
      showToast("Profile photo updated");
    } catch (err: any) {
      showToast(err?.message || "Could not update your photo. Please try again.", "error");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="relative w-28 h-28">
      {shown ? (
        <img src={shown} alt="Profile photo" className="w-28 h-28 rounded-full object-cover" />
      ) : (
        <span className="w-28 h-28 rounded-full bg-red-100 dark:bg-[#3a2323] text-[#C91E1E] dark:text-[#F44336] text-5xl font-bold flex items-center justify-center">
          {initial}
        </span>
      )}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        aria-label="Change profile photo"
        className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-white dark:bg-[#2a2a2a] shadow-md flex items-center justify-center text-[#C91E1E] dark:text-[#F44336]"
      >
        {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
      </button>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
    </div>
  );
}
