import YAML from "yaml";

export function parse(text) {
  const t = text.replace(/\r\n/g, "\n");
  const m = t.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return { fm: null, body: t };
  const fm = YAML.parse(m[1]);
  return { fm: fm && typeof fm === "object" ? fm : {}, body: m[2] };
}

export function stringify(fm, body) {
  return `---\n${YAML.stringify(fm).trimEnd()}\n---\n${body}`;
}
