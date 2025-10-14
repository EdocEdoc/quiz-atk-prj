import { motion } from "framer-motion";
import { clsx } from "clsx";

export default function GlowingCharacter({
  src,
  isAttacking,
  isDefending,
  className = "",
}) {
  // Pick glow color based on state
  const glowColor = isAttacking
    ? "rgba(255,165,0,0.8)" // orange
    : isDefending
    ? "rgba(0,255,0,0.8)" // green
    : "rgba(168,85,247,0.8)"; // purple-500
  const baseClasses = "w-40 drop-shadow-lg";
  return (
    <motion.img
      src={src}
      alt="Character"
      className={clsx(baseClasses, className)}
      animate={
        isAttacking
          ? { x: [0, -10, 10, -5, 5, 0] } // shake when attacking
          : {}
      }
      transition={{ duration: 0.4 }}
      style={{
        filter: `drop-shadow(0 0 15px ${glowColor}) drop-shadow(0 0 30px ${glowColor})`,
        transition: "filter 0.3s ease-in-out",
      }}
    />
  );
}
