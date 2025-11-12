// mounts: star field, scrolling code background, scattered error lines

const CODE_LINES = [
  'function initPortfolio(){ /* A.R.I. is alive */ }',
  'const projects=[PsyLens,RingABell,LostSummer];',
  'async function loadData(){ throw new Error("This-place-isnt-real"); }',
  'if(ready){ deploy(); } else { console.warn("A.R.I. prevents deployment"); }',
  'export default Portfolio;',
  'for(let i=0;i<errors.length;i++){ /* … */ }',
  'console.error("What-are-you-looking-for.exe");',
  'const whisper="your secret is safe with M..."',
];

const ERROR_LINES = [
  "SyntaxError: Unexpected token '{'",
  "TypeError: Cannot read property 'length'",
  "ReferenceError: foo is not defined",
  "Error: Missing closing bracket ']'",
  "Warning: Deprecated function call",
  "Uncaught Error: undefined is not a function",
  "Error: Expected ';' but found '}'",
  "TypeError: null is not an object",
  "SyntaxError: Unexpected end of input",
  "Error: Maximum call stack size exceeded",
];

const CODE_FONT_LINE_H = 14; // keep in sync with CSS

export function mountDecor() {
  mountCodeBackground();
  mountStars(100);
  scatterErrors(12);
}

function mountCodeBackground() {
  const holder = document.getElementById("codeBg");
  if (!holder) return;

  const lines = Math.floor(window.innerHeight / CODE_FONT_LINE_H) + 8;
  let text = "";
  for (let i = 0; i < lines; i++) {
    const indent = "  ".repeat(Math.floor(Math.random() * 4));
    const line = CODE_LINES[Math.floor(Math.random() * CODE_LINES.length)];
    text += indent + line + "\n";
  }
  holder.textContent = text;
}

function mountStars(count) {
  const field = document.getElementById("starField");
  if (!field) return;

  const symbols = ["(", ")", "{", "}", "[", "]", "<", ">", "/", "\\", "|", ";", ":", ".", ",", "=", "+", "-", "*", "&", "%", "$", "#", "@", "!", "?"];

  for (let i = 0; i < count; i++) {
    const el = document.createElement("div");
    el.className = "star";
    el.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    el.style.left = Math.random() * 100 + "%";
    el.style.top = Math.random() * 100 + "%";
    el.style.fontSize = 8 + Math.round(Math.random() * 10) + "px";
    el.style.animationDelay = (Math.random() * 3).toFixed(2) + "s";
    field.appendChild(el);
  }
}

function scatterErrors(count) {
  const layer = document.getElementById("errorsLayer");
  if (!layer) return;

  for (let i = 0; i < count; i++) {
    const el = document.createElement("div");
    el.className = "error-line";
    el.textContent = ERROR_LINES[Math.floor(Math.random() * ERROR_LINES.length)];
    el.style.left = Math.random() * 90 + 5 + "%";
    el.style.top = Math.random() * 90 + 5 + "%";
    el.style.transform = `rotate(${(Math.random() - 0.5) * 4}deg)`;
    layer.appendChild(el);
  }
}
