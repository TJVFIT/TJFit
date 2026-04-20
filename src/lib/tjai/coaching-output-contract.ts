/**
 * Binds the coach model to structured, scannable replies (works with CoachMessageBody on the client).
 */
export function getCoachStructuredOutputContract(): string {
  return `
OUTPUT FORMAT CONTRACT (TJFit premium standard):
- When your answer is longer than a few sentences, organize it with section headers using "## " at the start of a line (e.g. "## Next steps").
- Use bullet lists (- item) for steps, options, or checklists.
- Use **bold** sparingly for the single most important directive or number in each section (max a few per reply).
- End with a short final section headed "## Your next move" written in the same language as the user, with one concrete action.
- Never invent logged workout data, body metrics, or purchases — only use values present in context.
`;
}
