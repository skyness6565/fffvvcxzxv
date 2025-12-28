import { ChevronRight } from "lucide-react";
import youngWoman from "@/assets/young-woman.jpg";
import friendsGroup from "@/assets/friends-group.jpg";
import teamHands from "@/assets/team-hands.jpg";
import happyYouth from "@/assets/happy-youth.jpg";

const articles = [
  {
    image: youngWoman,
    category: "STARTING OUT",
    title: "Start Building Your Financial Strength",
  },
  {
    image: friendsGroup,
    category: "STARTING OUT",
    title: "How to Manage Your Checking",
  },
  {
    image: teamHands,
    category: "STARTING OUT",
    title: "How to Save for Summer Vacation",
  },
  {
    image: happyYouth,
    category: "RUNNING A BUSINESS",
    title: "How Rising Rates and Inflation Impact Businesses",
  },
];

const ArticlesSection = () => {
  return (
    <section className="py-12 px-4 bg-background">
      <div className="container mx-auto max-w-4xl">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-4">
          START BUILDING YOUR FINANCIAL STRENGTH
        </h2>
        <p className="text-muted-foreground text-center mb-8 max-w-2xl mx-auto">
          Tax season is quickly approaching—do you know what you need to claim, and what forms you need to submit? This tax checklist makes filing simple. Learn more today!
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          {articles.map((article, index) => (
            <div key={index} className="relative group cursor-pointer overflow-hidden rounded-lg">
              <div className="relative h-[250px]">
                <img 
                  src={article.image} 
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              </div>
              <div className="absolute bottom-4 left-4 right-4">
                <span className="inline-block bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded mb-2">
                  {article.category}
                </span>
                <h3 className="text-primary-foreground font-semibold flex items-center gap-1 group-hover:underline">
                  {article.title}
                  <ChevronRight className="w-4 h-4" />
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ArticlesSection;
