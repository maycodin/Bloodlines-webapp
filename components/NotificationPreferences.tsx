type NotificationItem = {
  id: string;
  title: string;
  description: string;
};

const NOTIFICATION_ITEMS: NotificationItem[] = [
  {
    id: "emergency_alerts",
    title: "Emergency alerts",
    description: "Critical blood requests in your area",
  },
  {
    id: "donation_reminders",
    title: "Donation reminders",
    description: "When you're eligible to donate again",
  },
];

type NotificationPreferencesProps = {
  onConfigure: (id: string) => void;
};

const NotificationPreferences = ({ onConfigure }: NotificationPreferencesProps) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-[#D8D6D6]">
      <p className="font-semibold text-gray-800 mb-5">Notification preferences</p>

      <div className="flex flex-col gap-5">
        {NOTIFICATION_ITEMS.map((item) => (
          <div key={item.id} className="flex justify-between items-center">
            <div>
              <p className="text-sm font-semibold text-gray-800">{item.title}</p>
              <p className="text-sm text-gray-500">{item.description}</p>
            </div>

            <button
              onClick={() => onConfigure(item.id)}
              className="border border-gray-300 text-sm px-4 py-1.5 rounded-md hover:bg-gray-50 transition"
            >
              Configure
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationPreferences;