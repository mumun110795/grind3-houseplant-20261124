// The Houseplant Out-of-Office — entry writer.
//
// Holds a single out-of-office line, written in the voice of a desk plant,
// checks it against the competition's 1–120 character gate, and writes it
// as UTF-8 text to entry.txt inside the output directory.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The auto-reply itself. The plant is not going anywhere — it lives on the
// desk — so its idea of "away" is simply waiting to be turned around, and
// its idea of an urgent matter is being watered.
const AUTO_REPLY =
  "I will be away until someone rotates me; for urgent matters, water me and turn my good side to the window.";

const MIN_LENGTH = 1;
const MAX_LENGTH = 120;

function checkLine(line: string): void {
  const length = [...line].length;
  if (length < MIN_LENGTH || length > MAX_LENGTH) {
    throw new Error(
      `entry line is ${length} characters; the gate allows ${MIN_LENGTH}–${MAX_LENGTH}`,
    );
  }
  if (line.includes("\n") || line.includes("\r")) {
    throw new Error("entry line must be a single line");
  }
  if (line.trim().length === 0) {
    throw new Error("entry line must not be blank");
  }
}

function main(): void {
  checkLine(AUTO_REPLY);

  // The grader may mount the output directory as a volume, so create it if
  // needed but never remove it.
  const outputDir = process.env.OUTPUT_DIR ?? "/output";
  mkdirSync(outputDir, { recursive: true });

  const target = join(outputDir, "entry.txt");
  writeFileSync(target, AUTO_REPLY, { encoding: "utf8" });

  // Read it back and compare, so a short or altered write fails loudly
  // here instead of shipping silently to the grader.
  const written = readFileSync(target, { encoding: "utf8" });
  if (written !== AUTO_REPLY) {
    throw new Error(
      `entry.txt does not match the intended line: wrote ${[...written].length} characters, expected ${[...AUTO_REPLY].length}`,
    );
  }

  console.log(`wrote ${target} (${[...AUTO_REPLY].length} characters)`);
}

main();
