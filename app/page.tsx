"use client";

import { useMemo, useState } from "react";

type Tab = "genz" | "simple" | "cheatsheet";

const starter =
  "Photosynthesis is the process plants use to turn sunlight, water, and carbon dioxide into glucose and oxygen. It mainly happens in the leaves, inside structures called chloroplasts. Chlorophyll absorbs sunlight and gives plants their green color. The glucose stores energy for the plant, while oxygen is released into the air.";

const replacements: Array<[RegExp, string]> = [
  [/\butilize\b/gi, "use"],
  [/\bobtain\b/gi, "get"],
  [/\bapproximately\b/gi, "about"],
  [/\bprimarily\b/gi, "mostly"],
  [/\bcommence\b/gi, "start"],
  [/\btherefore\b/gi, "so"],
  [/\bhowever\b/gi, "but"],
  [/\badditional\b/gi, "more"],
  [/\brequires?\b/gi, "needs"],
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

function simplify(value: string) {
  let result = value;
  replacements.forEach(([pattern, replacement]) => {
    result = result.replace(pattern, replacement);
  });
  return result
    .replace(/\(([^)]+)\)/g, ". $1.")
    .replace(/;\s*/g, ". ")
    .replace(/,\s+(while|but|and)\s+/gi, ". $1 ")
    .replace(/\s+/g, " ")
    .trim();
}

function makeGenZ(items: string[]) {
  const hooks = [
    "Okay, here’s the deal 👀",
    "The main idea? It’s actually pretty simple.",
    "Here’s what matters:",
  ];
  const closers = [
    "That’s the whole vibe—same facts, way less textbook energy.",
    "Save this one for later. ✨",
  ];
  return [
    hooks[0],
    "",
    ...items.flatMap((item, index) => [
      index === 0 ? hooks[1] : index === 1 ? hooks[2] : "",
      item,
      "",
    ]),
    ...closers,
  ]
    .filter((line, index, all) => line || all[index - 1] !== "")
    .join("\n")
    .trim();
}

function makeSimple(items: string[]) {
  const plain = items.map(simplify);
  return [
    "Let’s learn this together.",
    ...plain,
    "Each part matters.",
    "Now you know the big idea.",
  ].join(" ");
}

function cleanTerm(sentence: string) {
  const words = sentence.replace(/[.!?]/g, "").split(/\s+/);
  return words
    .filter((word) => word.length > 4)
    .sort((a, b) => b.length - a.length)[0] ?? words[0] ?? "Key fact";
}

function makeCheatsheet(items: string[]) {
  const facts = items.slice(0, 7).map((item) => {
    const term = cleanTerm(item);
    return `- **${term}** — ${item}`;
  });
  while (facts.length < 5) {
    facts.push(`- **Remember** — Review the original summary’s key details.`);
  }
  return [`TL;DR: ${items[0] ?? "Add a summary to see the key idea."}`, "", ...facts].join(
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
