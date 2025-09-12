import prisma from "../src/utils/prismaClient.ts";

async function main() {
  const texts = [
    { content: "This is a sample text for testing." },
    { content: "Typing fast is fun and improves your skills." },
    { content: "Practice makes perfect when it comes to typing speed." },
    { content: "The quick brown fox jumps over the lazy dog." },
    { content: "Consistent practice leads to better accuracy and speed." },
    { content: "TypeRacer is a great way to challenge your friends." },
    { content: "Short sentences are easier to type quickly." },
    { content: "Focus on accuracy before increasing your speed." },
    { content: "Every keystroke counts in a typing race." },
    { content: "Stay relaxed and keep your hands in the home position." },
  ];

  for (const text of texts) {
    await prisma.text.create({ data: text });
  }
}

main().then(() => process.exit(0));
