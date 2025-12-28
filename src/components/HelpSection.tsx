import { Phone, MapPin, Headphones, Video } from "lucide-react";

const HelpSection = () => {
  const helpItems = [
    {
      icon: MapPin,
      title: "Routing #",
      description: "251480576",
    },
    {
      icon: Phone,
      title: "Branch Hours:",
      description: "Mon - Thurs: 8:30 a.m.-5:00 p.m.\nFriday: 8:30 a.m.-6:00 p.m.\nSaturday: 9:00 a.m.-1:00 p.m.",
    },
    {
      icon: Headphones,
      title: "support@monexa.online",
      description: "Customer Service",
    },
    {
      icon: Video,
      title: "Video Connect",
      description: "Chat Virtually",
    },
  ];

  return (
    <section className="bg-monexa-teal py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <h2 className="text-2xl md:text-3xl font-bold text-primary-foreground text-center mb-10">
          How Can We Help You Today?
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          {helpItems.map((item, index) => (
            <div key={index} className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-full border-2 border-primary-foreground flex items-center justify-center flex-shrink-0">
                <item.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-bold text-primary-foreground">{item.title}</h3>
                <p className="text-primary-foreground/80 text-sm whitespace-pre-line">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HelpSection;
