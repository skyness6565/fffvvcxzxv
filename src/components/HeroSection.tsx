import heroImage from "@/assets/hero-woman.jpg";

const HeroSection = () => {
  return (
    <section className="relative">
      <div className="relative h-[400px] md:h-[500px]">
        <img 
          src={heroImage} 
          alt="Woman using mobile banking"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
        <div className="absolute bottom-8 left-4 md:left-8">
          <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground text-shadow">
            Monexa Bank
          </h1>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
