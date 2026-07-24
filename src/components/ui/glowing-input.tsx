"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";

export function GlowingInput({
  placeholder = "Tell TJAI what you want to change...",
  onSubmit,
  className
}: {
  placeholder?: string;
  onSubmit?: (value: string) => void;
  className?: string;
}) {
  const [value, setValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimer = useRef<number | null>(null);
  const reduceMotion = useReducedMotion();
  const canSubmit = value.trim().length > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit?.(value.trim());
  };

  useEffect(
    () => () => {
      if (typingTimer.current) window.clearTimeout(typingTimer.current);
    },
    []
  );

  return (
    <div className={cn("relative w-full", className)}>
      <motion.div
        className="relative flex w-full items-center rounded-[1.35rem] border border-accent-soft/20 bg-[#071126]/90 p-2 shadow-inset backdrop-blur-xl sm:p-2.5"
        animate={
          reduceMotion
            ? undefined
            : {
                borderColor: isFocused ? "rgba(134,169,255,0.48)" : "rgba(134,169,255,0.20)"
              }
        }
        transition={{ type: "spring", stiffness: 120, damping: 22 }}
      >
        <div className="ml-1 mr-3 grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.055]">
          <Sparkles className="h-4 w-4 text-accent-soft" aria-hidden />
        </div>
        <label htmlFor="tjai-prompt" className="sr-only">
          Ask TJAI
        </label>
        <input
          id="tjai-prompt"
          type="text"
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            setIsTyping(true);
            if (typingTimer.current) window.clearTimeout(typingTimer.current);
            typingTimer.current = window.setTimeout(() => setIsTyping(false), 650);
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={(event) => {
            if (event.key === "Enter") handleSubmit();
          }}
          placeholder={placeholder}
          className="min-w-0 flex-1 bg-transparent text-base text-white outline-none placeholder:text-slate-400 sm:text-lg"
          autoComplete="off"
        />
        <motion.button
          type="button"
          aria-label="Send to TJAI"
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="relative grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent text-white shadow-inset transition disabled:cursor-not-allowed disabled:opacity-35"
          whileHover={canSubmit && !reduceMotion ? { scale: 1.04 } : undefined}
          whileTap={canSubmit && !reduceMotion ? { scale: 0.96 } : undefined}
        >
          <motion.span
            animate={!reduceMotion && isTyping ? { x: [0, 3, 0] } : { x: 0 }}
            transition={isTyping ? { duration: 0.7, repeat: Infinity } : { duration: 0.2 }}
          >
            <ArrowRight className="h-5 w-5" aria-hidden />
          </motion.span>
        </motion.button>
      </motion.div>
    </div>
  );
}
