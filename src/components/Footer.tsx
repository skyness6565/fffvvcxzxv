const footerLinks = [
  {
    title: "ABOUT MONEXA",
    links: ["Who we are", "Contact Us"],
  },
  {
    title: "NEWS & EVENTS",
    links: ["Latest News"],
  },
  {
    title: "CAREERS",
    links: ["Get Started"],
  },
  {
    title: "GIVING BACK",
    links: ["Monexa Charity"],
  },
];

const Footer = () => {
  return (
    <footer className="bg-primary py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
          {footerLinks.map((section, index) => (
            <div key={index}>
              <h3 className="text-monexa-teal font-semibold mb-3">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a 
                      href="#" 
                      className="text-primary-foreground hover:text-monexa-teal transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center">
          <p className="text-primary-foreground/60 text-sm">
            © 2024 Monexa Bank. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
