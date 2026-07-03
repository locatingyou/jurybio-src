"use client";
import { motion } from "motion/react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
export default function Faq() {
  const questions: QuestionandAnswer[] = [
    {
      question: "What is jury",
      answer: "Jury is a biolink platform that lets you share everything in one clean customizable page. It's built for speed, simplicity, and ease of use.",
    },
    {
      question: "What makes you stand out?",
      answer: "We offer unique features, customization and integrations that set us apart from other biolink platforms.",
    },
    {
      question: "Is it free?",
      answer: "Yes!, jury offers a free tier with basic features & customization and a premium tier with unlimited customization & features.",
    }
  ];

  // i like types because im autistic!!!
  interface QuestionandAnswer {
    question: string;
    answer: string;
  }
  return (
    <section className="py-16 h-auto flex flex-col items-center gap-4 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center mb-2"
      >
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          Frequently{" "}
          <span className="relative inline-block">
           Asked
          </span>{" "}
          <span className="relative inline-block">
            <span className="text-transparent bg-gradient-to-b from-white/30 via-white/90 to-white/30 bg-clip-text">
              Questions
            </span>
            <svg
              className="absolute -bottom-1 left-0 w-full overflow-visible pointer-events-none"
              height="8"
              viewBox="0 0 100 8"
              preserveAspectRatio="none"
            >
              <motion.path
                d="M 0 5 C 15 3, 30 6, 45 4.5 S 70 6, 85 4 S 95 5.5, 100 4"
                stroke="var(--chart-2)"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0, opacity: 0 }}
                whileInView={{ pathLength: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.9, ease: "easeOut", delay: 0.3 }}
              />
            </svg>
          </span>{" "}
        </h1>
      </motion.div>
      <span className="w-full max-w-2xl bg-gradient-to-r from-transparent via-white/30 to-transparent h-[1px]" />
      <div className="h-full">
        <Accordion
          type="single"
                collapsible
                className="w-xl rounded-lg border px-4 py-2"
        >
          {questions.map((question, index) => (
            <AccordionItem key={index} value={question.question}>
              <AccordionTrigger>{question.question}</AccordionTrigger>
              <AccordionContent>{question.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}