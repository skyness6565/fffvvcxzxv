import { useState } from "react";

const testimonials = [
  {
    quote: "I am impressed with the customer service and speed of payout",
    author: "Ralph Morris",
  },
  {
    quote: "Monexa has made managing my finances so much easier. Their mobile app is excellent!",
    author: "Sarah Johnson",
  },
];

const TestimonialsSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section className="py-16 px-4 bg-secondary">
      <div className="container mx-auto max-w-2xl text-center">
        <h2 className="text-2xl md:text-3xl font-serif italic text-monexa-teal mb-8">
          Hear From Our Customers
        </h2>

        <div className="min-h-[120px]">
          <p className="text-lg text-foreground mb-4">
            {testimonials[activeIndex].quote}
          </p>
          <p className="text-monexa-teal font-serif italic font-semibold">
            {testimonials[activeIndex].author}
          </p>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-8">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === activeIndex ? "bg-monexa-teal" : "bg-muted-foreground/30"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
