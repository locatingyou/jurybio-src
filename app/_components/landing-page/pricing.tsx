"use client";
import { motion } from "framer-motion";
import { IconCheck, IconX } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Plan {
  name: string;
  price: string;
  period: string;
  popular: boolean;
  description: string;
  features: string[];
  cta: string;
  href: string;
}

const premiumFeatures = [
  "Basic Customization",
  "Profile Analytics",
  "Widgets & Links",
  "Animations & Effects",
  "Premium Badge",
  "Discord Role",
  "Image Host",
  "No Watermark",
  "Extra Layouts",
  "Extra Animations & Effects",
  "OpenGraph Customization",
  "Custom Cursor",
  "API Access",
  "Audio Playlist",
  "Background Playlist",
];

const plans: Plan[] = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    popular: false,
    description: "Everything you need for a basic page.",
    features: [
      "Basic Customization",
      "Profile Analytics",
      "Widgets & Links",
      "Animations & Effects",
    ],
    cta: "Get Started",
    href: "/auth?mode=register",
  },
  {
    name: "Premium",
    price: "$5.99",
    period: "lifetime",
    popular: true,
    description: "Unlock the full experience",
    features: premiumFeatures,
    cta: "Upgrade Now",
    href: "https://discord.gg/jurybio",
  },
];

function PricingCard({ plan, index }: { plan: Plan; index: number }) {
  return (
    <div className="flex-1">
      <div
        className={`relative rounded-2xl border h-full flex flex-col overflow-hidden transition-all duration-300 ${
          plan.popular
            ? "border-foreground/20 bg-card hover:border-foreground/30"
            : "border-border/50 bg-card/50 hover:border-border"
        }`}
      >
        <div className="p-7 flex flex-col h-full">
          <div className="flex items-start mb-1.5">
            <h3 className="text-xl font-semibold text-foreground">
              {plan.name}
            </h3>
          </div>
          <p className="text-xs text-foreground/40 mb-5">{plan.description}</p>
          <div className="flex items-baseline gap-1 mb-5">
            <span className="text-4xl font-bold tracking-tight text-foreground">
              {plan.price}
            </span>
            <span className="text-sm text-foreground/35">/{plan.period}</span>
          </div>
          <Button
            asChild
            variant={plan.popular ? "default" : "outline"}
            size="lg"
            className="w-full mb-6"
          >
            <Link href={plan.href}>{plan.cta}</Link>
          </Button>
          <div className="border-t border-border/10 mb-5" />
          <div className="text-[10px] font-semibold uppercase tracking-widest text-foreground/35 mb-3.5">
            What&apos;s included
          </div>
          <div className="flex flex-col gap-2.5">
            {premiumFeatures.map((feature) => {
              const included = plan.features.includes(feature);
              return (
                <div
                  key={feature}
                  className="flex items-center gap-2.5 text-sm"
                >
                  <div
                    className={`flex-shrink-0 w-[18px] h-[18px] rounded-full border border-white/10 flex items-center justify-center ${
                      included ? "bg-foreground/8" : "bg-foreground/4"
                    }`}
                  >
                    {included ? (
                      <IconCheck
                        size={11}
                        stroke={2.5}
                        className="text-foreground/60"
                      />
                    ) : (
                      <IconX
                        size={11}
                        stroke={2.5}
                        className="text-foreground/25"
                      />
                    )}
                  </div>
                  <span
                    className={
                      included ? "text-foreground/70" : "text-foreground/30"
                    }
                  >
                    {feature}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Pricing() {
  return (
    <motion.div
      className="pt-12 sm:pt-10 pb-8 relative flex flex-col items-center px-4"
      id="pricing"
    >
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="text-2xl md:text-3xl font-bold text-foreground tracking-tight text-center mb-12"
      >
        Pricing
      </motion.h1>
      <motion.div
        initial={{ y: 0, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="flex flex-col md:flex-row gap-5 w-full max-w-2xl"
      >
        {plans.map((plan, index) => (
          <PricingCard key={plan.name} plan={plan} index={index} />
        ))}
      </motion.div>
    </motion.div>
  );
}
