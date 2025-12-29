import { useNavigate } from "react-router-dom";
import { ArrowLeft, Bell, CheckCircle } from "lucide-react";

const Notifications = () => {
  const navigate = useNavigate();

  const notifications = [
    {
      id: 1,
      title: "Welcome to Monexa!",
      message: "Your account has been successfully created. Start exploring our banking services.",
      time: "Just now",
      read: false,
    },
    {
      id: 2,
      title: "Security Tip",
      message: "Never share your PIN or password with anyone. Monexa will never ask for these details.",
      time: "1 hour ago",
      read: true,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-gradient-to-r from-monexa-blue to-monexa-teal p-4 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-6 h-6 text-primary-foreground" />
          </button>
          <h1 className="text-xl font-bold text-primary-foreground">Notifications</h1>
        </div>
      </header>

      <div className="p-4">
        {notifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No notifications yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-card rounded-xl p-4 ${!notification.read ? "border-l-4 border-primary" : ""}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{notification.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                    <p className="text-xs text-muted-foreground mt-2">{notification.time}</p>
                  </div>
                  {notification.read && (
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
