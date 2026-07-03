"use client";
import { AnimatePresence, motion } from "framer-motion";
import { useProfileVisibility } from "./PageProvider";

const EASE = [0.76, 0, 0.24, 1] as const;

export default function EntryScreen({
  showEnterscreen,
  config,
}: {
  showEnterscreen: boolean;
  config: {
    text_color: string;
    entry_text: string | null;
    entry_animation: "Normal" | "Split";
    entry_background_color: string;
  };
}) {
  const { isProfileVisible, setIsProfileVisible } = useProfileVisibility();

  return (
    <>
      {showEnterscreen && (
        <AnimatePresence>
          {!isProfileVisible &&
            (config.entry_animation === "Split" ? (
              <div
                onClick={() => setIsProfileVisible(true)}
                className="absolute z-50 font-user cursor-pointer h-full w-full text-2xl font-medium"
              >
                {/* Top half: top 50% of background + top half of text, clipped */}
                <motion.div
                  className="absolute w-full overflow-hidden"
                  style={{
                    backgroundColor: config.entry_background_color,
                    height: "50%",
                    top: 0,
                  }}
                  exit={{ y: "-100%" }}
                  transition={{ duration: 0.7, ease: EASE }}
                >
                  <div
                    className="absolute left-0 w-full flex justify-center items-center"
                    style={{
                      color: config.text_color,
                      height: "200%",
                      top: 0,
                    }}
                  >
                    {config.entry_text}
                  </div>
                </motion.div>

                {/* Bottom half: bottom 50% of background + bottom half of text, clipped */}
                <motion.div
                  className="absolute w-full overflow-hidden"
                  style={{
                    backgroundColor: config.entry_background_color,
                    height: "50%",
                    bottom: 0,
                  }}
                  exit={{ y: "100%" }}
                  transition={{ duration: 0.7, ease: EASE }}
                >
                  <div
                    className="absolute left-0 w-full flex justify-center items-center"
                    style={{
                      color: config.text_color,
                      height: "200%",
                      bottom: 0,
                    }}
                  >
                    {config.entry_text}
                  </div>
                </motion.div>
              </div>
            ) : (
              <motion.div
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsProfileVisible(true)}
                className="absolute z-50 font-user flex justify-center items-center cursor-pointer h-full w-full text-2xl font-medium"
                style={{
                  color: config.text_color,
                  backgroundColor: config.entry_background_color,
                }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              >
                {config.entry_text}
              </motion.div>
            ))}
        </AnimatePresence>
      )}
    </>
  );
}
