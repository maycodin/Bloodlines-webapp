import { User } from "lucide-react";

type ProfileInfoProps = {
  fullName: string;
  email: string;
  phone: string;
  hospitalName: string;
  onEditProfile: () => void;
};

const ProfileInfo = ({
  fullName,
  email,
  phone,
  hospitalName,
  onEditProfile,
}: ProfileInfoProps) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-[#D8D6D6]">
      <p className="font-semibold text-gray-800 mb-6">Profile information</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-8 mb-6">
        <div>
          <p className="text-sm font-semibold text-gray-800">Full name</p>
          <p className="text-sm text-gray-700 mt-0.5">{fullName}</p>
        </div>

        <div>
          <p className="text-sm font-semibold text-gray-800">Email address</p>
          <p className="text-sm text-gray-700 mt-0.5">{email}</p>
        </div>

        <div>
          <p className="text-sm font-semibold text-gray-800">Phone</p>
          <p className="text-sm text-gray-700 mt-0.5">{phone}</p>
        </div>

        <div>
          <p className="text-sm font-semibold text-gray-800">Name of Hospital</p>
          <p className="text-sm text-gray-700 mt-0.5 whitespace-pre-line">{hospitalName}</p>
        </div>
      </div>

      <button
        onClick={onEditProfile}
        className="bg-[#C91E1E] hover:bg-red-700 text-white text-sm px-4 py-2 rounded-md transition"
      >
        Edit Profile
      </button>
    </div>
  );
};

export default ProfileInfo;