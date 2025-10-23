export const getFirstWord = (sentence) => {
  if (typeof sentence !== "string") return "";

  // Trim whitespace and split by spaces
  const words = sentence.trim().split(/\s+/);

  // Return the first word if available, else an empty string
  return words[0] || "";
};
