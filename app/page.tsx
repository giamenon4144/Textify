"use client";

import { useMemo, useState } from "react";

type Tab = "genz" | "simple" | "cheatsheet";

const starter =
  "Photosynthesis is the process plants use to turn sunlight, water, and carbon dioxide into glucose and oxygen. It mainly happens in the leaves, inside structures called chloroplasts. Chlorophyll absorbs sunlight and gives plants their green color. The glucose stores energy for the plant, while oxygen is released into the air.";

const replacements: Array<[RegExp, string]> = [
  [/\baccording to\b/gi, "as said by"],
  [/\badditional(?:ly)?\b/gi, "more"],
  [/\bapproximately\b/gi, "about"],
  [/\bcommence(?:d|s|ment)?\b/gi, "start"],
  [/\bconsequently\b/gi, "so"],
  [/\bconsiderable\b/gi, "large"],
  [/\bconstitutes?\b/gi, "makes up"],
  [/\bdemonstrate(?:d|s)?\b/gi, "show"],
  [/\bdespite the fact that\b/gi, "even though"],
  [/\bdue to the fact that\b/gi, "because"],
  [/\bfacilitate(?:d|s)?\b/gi, "help"],
  [/\bfundamental\b/gi, "basic"],
  [/\bhowever\b/gi, "but"],
  [/\bimplement(?:ed|s|ing)?\b/gi, "put in place"],
  [/\bin addition\b/gi, "also"],
  [/\bin order to\b/gi, "to"],
  [/\bindicate(?:d|s)?\b/gi, "show"],
  [/\bindividuals\b/gi, "people"],
  [/\binitial(?:ly)?\b/gi, "first"],
  [/\b(?:modify|modified|modification)\b/gi, "change"],
  [/\bnumerous\b/gi, "many"],
  [/\bobtain(?:ed|s)?\b/gi, "get"],
  [/\boccur(?:red|s|ring)?\b/gi, "happen"],
  [/\bparticipate(?:d|s)?\b/gi, "take part"],
  [/\bportion\b/gi, "part"],
  [/\bpossess(?:ed|es)?\b/gi, "have"],
  [/\bprocess\b/gi, "way"],
  [/\bprevious(?:ly)?\b/gi, "before"],
  [/\bprimarily\b/gi, "mostly"],
  [/\bprovide(?:d|s)?\b/gi, "give"],
  [/\bpurchase(?:d|s)?\b/gi, "buy"],
  [/\bregarding\b/gi, "about"],
  [/\brequire(?:d|s)?\b/gi, "need"],
  [/\bretain(?:ed|s)?\b/gi, "keep"],
  [/\bsignificant(?:ly)?\b/gi, "important"],
  [/\bsubsequent(?:ly)?\b/gi, "later"],
  [/\bsufficient\b/gi, "enough"],
  [/\btherefore\b/gi, "so"],
  [/\btransmit(?:ted|s)?\b/gi, "send"],
  [/\butilize(?:d|s)?\b/gi, "use"],
  [/\bwith the exception of\b/gi, "except"],
  [/\bstructures\b/gi, "parts"],
  [/\babsorbs?\b/gi, "takes in"],
  [/\breleased\b/gi, "let out"],
];

function sentences(value: string) {
  return (
    value
      .trim()
      .replace(/\s+/g, " ")
      .match(/[^.!?]+[.!?]+|[^.!?]+$/g)
      ?.map((line) => line.trim())
      .filter(Boolean) ?? []
  );
}

function simplifyWords(value: string) {
  let result = value;
  replacements.forEach(([pattern, replacement]) => {
    result = result.replace(pattern, replacement);
  });
  return result
    .replace(/\b(is|are|was|were) able to\b/gi, "can")
    .replace(/\bhas the ability to\b/gi, "can")
    .replace(/\ba large number of\b/gi, "many")
    .replace(/\bat this point in time\b/gi, "now")
    .replace(/\bfor the purpose of\b/gi, "to")
    .replace(/\s+/g, " ")
    .trim();
}

function splitIdeas(items: string[]) {
  return items
    .flatMap((item) =>
      item
        .replace(/\(([^)]+)\)/g, ", meaning $1,")
        .split(/;\s*|,\s+(?=(?:but|while|whereas|which|and|so|because)\b)/i),
    )
    .map((idea) => simplifyWords(idea).trim())
    .filter(Boolean)
    .map((idea) => {
      const cleaned = idea
        .replace(/^(however|therefore|additionally),?\s*/i, "")
        .replace(/^which\s+/i, "This ")
        .replace(/^whereas\s+/i, "But ")
        .replace(/^while\s+/i, "At the same time, ")
        .replace(/^and\s+/i, "Also, ")
        .replace(/^but\s+/i, "But ")
        .replace(/^so\s+/i, "So ");
      return cleaned.charAt(0).toUpperCase() + cleaned.slice(1).replace(/[.!?]*$/, ".");
    });
}

function shorten(idea: string, maxWords: number) {
  const words = idea.split(/\s+/);
  if (words.length <= maxWords) return idea;
  const pivot = words.findIndex(
    (word, index) =>
      index > 5 && /^(and|but|because|while|which|that)$/i.test(word.replace(/[,.]/g, "")),
  );
  if (pivot > 0) {
    return `${words.slice(0, pivot).join(" ").replace(/[,;]$/, "")}. ${words
      .slice(pivot)
      .join(" ")
      .replace(/^(and|which|that)\s+/i, "This ")}`;
  }
  return idea;
}

function makeGenZ(items: string[]) {
  const ideas = splitIdeas(items).map((idea) => shorten(idea, 22));
  return [
    "Okay, here’s what’s really going on 👀",
    "",
    ...ideas.flatMap((idea, index) => [
      index === 0 ? `The big idea: ${idea}` : index === 1 ? `Here’s the key part: ${idea}` : idea,
      "",
    ]),
    "That’s the breakdown. Same meaning, way less textbook energy. ✨",
  ]
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function makeSimple(items: string[]) {
  const ideas = splitIdeas(items)
    .map((idea) => shorten(idea, 14))
    .flatMap((idea) => idea.match(/[^.!?]+[.!?]+|[^.!?]+$/g) ?? [idea])
    .map((idea) => idea.trim())
    .filter(Boolean);
  return ["Let’s make this easy.", ...ideas, "That is the big idea."].join(" ");
}

function cleanTerm(sentence: string) {
  const firstPhrase = sentence
    .replace(/[.!?]/g, "")
    .split(/\b(?:is|are|was|were|can|has|have|means|uses|helps|shows)\b/i)[0]
    .trim();
  return firstPhrase.split(/\s+/).slice(0, 3).join(" ") || "Key fact";
}

function makeCheatsheet(items: string[]) {
  const ideas = splitIdeas(items);
  const facts = ideas.slice(0, 7).map((idea) => {
    const term = cleanTerm(idea);
    const detail = shorten(idea, 18).replace(new RegExp(`^${term}\\s*`, "i"), "").trim();
    return `- **${term}** — ${detail || idea}`;
  });
  return [`TL;DR: ${shorten(ideas[0] ?? "Add a summary to see the key idea.", 18)}`, "", ...facts].join(
    "\n",
  );
}

function countWords(value: string) {
  return value.trim() ? value.trim().split(/\s+/).length : 0;
}

export default function Home() {
  const [summary, setSummary] = useState(starter);
  const [activeTab, setActiveTab] = useState<Tab>("genz");
  const [outputs, setOutputs] = useState<Record<Tab, string>>(() => {
    const items = sentences(starter);
    return {
      genz: makeGenZ(items),
      simple: makeSimple(items),
      cheatsheet: makeCheatsheet(items),
    };
  });
  const [copied, setCopied] = useState(false);

  const sourceCount = useMemo(() => countWords(summary), [summary]);
  const outputCount = countWords(outputs[activeTab]);

  function transform() {
    const items = sentences(summary);
    if (!items.length) return;
    setOutputs({
      genz: makeGenZ(items),
      simple: makeSimple(items),
      cheatsheet: makeCheatsheet(items),
    });
    setActiveTab("genz");
  }

  async function copyOutput() {
    await navigator.clipboard.writeText(outputs[activeTab]);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <main>
      <header className="topbar">
        <a className="brand" href="#" aria-label="Textify home">
          textify<span className="brand-dot">.</span>
        </a>
        <div className="header-note">
          <span className="status-dot" />
          No facts added. Nothing important lost.
        </div>
      </header>

      <section className="hero">
        <div>
          <p className="eyebrow">ONE SUMMARY · THREE VOICES</p>
          <h1>
            Same facts.
            <br />
            <em>Better fit.</em>
          </h1>
        </div>
        <p className="intro">
          Paste a summary once. Textify reshapes it for your audience without
          changing what it means.
        </p>
      </section>

      <section className="workspace">
        <div className="input-panel">
          <div className="panel-heading">
            <div>
              <span className="step">01</span>
              <h2>Drop your summary</h2>
            </div>
            <span className="count">{sourceCount} words</span>
          </div>
          <textarea
            value={summary}
            onChange={(event) => setSummary(event.target.value)}
            placeholder="Paste the summary you want to transform…"
            aria-label="Input summary"
          />
          <div className="input-footer">
            <button
              className="clear-button"
              type="button"
              onClick={() => setSummary("")}
              disabled={!summary}
            >
              Clear
            </button>
            <button
              className="transform-button"
              type="button"
              onClick={transform}
              disabled={!summary.trim()}
            >
              Transform text
              <span aria-hidden="true">↗</span>
            </button>
          </div>
        </div>

        <div className="output-panel">
          <div className="panel-heading output-heading">
            <div>
              <span className="step">02</span>
              <h2>Pick your version</h2>
            </div>
            <span className="count">{outputCount} words</span>
          </div>

          <div className="tabs" role="tablist" aria-label="Output style">
            {(
              [
                ["genz", "⚡", "Gen Z"],
                ["simple", "◡", "Simple"],
                ["cheatsheet", "≡", "Cheat sheet"],
              ] as const
            ).map(([key, icon, label]) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={activeTab === key}
                className={activeTab === key ? "active" : ""}
                onClick={() => setActiveTab(key)}
              >
                <span>{icon}</span>
                {label}
              </button>
            ))}
          </div>

          <div className={`result result-${activeTab}`} role="tabpanel">
            <pre>{outputs[activeTab]}</pre>
          </div>

          <div className="output-footer">
            <div className="style-note">
              <span className={`style-icon style-${activeTab}`}>
                {activeTab === "genz" ? "⚡" : activeTab === "simple" ? "◡" : "≡"}
              </span>
              <span>
                <strong>
                  {activeTab === "genz"
                    ? "High energy"
                    : activeTab === "simple"
                      ? "Easy to follow"
                      : "Study ready"}
                </strong>
                {activeTab === "genz"
                  ? "Short, social, and punchy"
                  : activeTab === "simple"
                    ? "Warm, plain language"
                    : "Key facts at a glance"}
              </span>
            </div>
            <button className="copy-button" type="button" onClick={copyOutput}>
              {copied ? "Copied!" : "Copy text"}
              <span aria-hidden="true">{copied ? "✓" : "□"}</span>
            </button>
          </div>
        </div>
      </section>

      <footer>
        <span>Built for clearer communication.</span>
        <span>Text stays in your browser.</span>
      </footer>
    </main>
  );
}
