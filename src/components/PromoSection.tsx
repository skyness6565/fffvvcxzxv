import businessMan from "@/assets/business-man.jpg";

const PromoSection = () => {
  return (
    <section>
      {/* Business man image */}
      <div className="relative h-[300px]">
        <img 
          src={businessMan} 
          alt="Businessman working on laptop"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Promo content */}
      <div className="bg-secondary py-10 px-4">
        <div className="container mx-auto max-w-2xl">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            Get €300* With a Checking Account Built for You
          </h2>
          <p className="text-muted-foreground">
            For a limited time, get a €300 when you open any new checking account! *Select "Learn More" to see important offer details.
          </p>
        </div>
      </div>
    </section>
  );
};

export default PromoSection;
