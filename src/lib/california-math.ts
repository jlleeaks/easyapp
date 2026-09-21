/** California CCSS Mathematics (2013), kindergarten, printed pages 11–12.
 * Parent descriptions are summaries, not quotations or district pacing claims.
 * Area IDs retain existing history; new lessons persist the selected area explicitly.
 */
export const CA_MATH_SOURCE =
  "https://www.cde.ca.gov/be/st/ss/documents/ccssmathstandardaug2013.pdf#page=19";
export const CA_MATH_FRAMEWORK = "California CCSS Mathematics · Kindergarten";
export const CA_MATH_UNITS = [
  {
    id: "k-math-counting",
    title: "Counting and numbers",
    short: "Number explorers",
    codes: ["K.CC.1", "K.CC.2", "K.CC.3", "K.CC.4", "K.CC.5"],
    domain: "Counting and Cardinality",
    description:
      "Count to 100 by ones and tens. Read and write numbers 0–20, and connect them to groups of up to 20 objects.",
    keywords: ["count", "numeral", "number recognition"],
  },
  {
    id: "k-math-comparing",
    title: "Comparing quantities",
    short: "More, less, same",
    codes: ["K.CC.6", "K.CC.7"],
    domain: "Counting and Cardinality",
    description:
      "Match and compare small groups. Explore more, fewer and equal, and compare written numbers from 1 to 10.",
    keywords: ["compare", "more than", "less than", "quantity"],
  },
  {
    id: "k-math-addition-subtraction",
    title: "Addition and subtraction",
    short: "Put together, take apart",
    codes: ["K.OA.1", "K.OA.2", "K.OA.3", "K.OA.4", "K.OA.5"],
    domain: "Operations and Algebraic Thinking",
    description:
      "Use objects to join and separate groups within 10. Explore partners that make 10 and build fluency within 5.",
    keywords: ["addition", "subtraction", "add", "combine", "minus"],
  },
  {
    id: "k-math-teen-numbers",
    title: "Teen numbers",
    short: "A ten and a little more",
    codes: ["K.NBT.1"],
    domain: "Number and Operations in Base Ten",
    description:
      "Build numbers 11–19 as ten ones and some extra ones, using objects and drawings.",
    keywords: ["teen", "place value", "ten ones"],
  },
  {
    id: "k-math-measurement",
    title: "Measurement and data",
    short: "Sort & discover",
    codes: ["K.MD.1", "K.MD.2", "K.MD.3"],
    domain: "Measurement and Data",
    description:
      "Compare length and weight. Sort objects into categories, count each group and talk about what you notice.",
    keywords: ["measure", "sort", "weight", "length"],
  },
  {
    id: "k-math-shapes",
    title: "Shapes and spatial thinking",
    short: "Shape builders",
    codes: ["K.G.1", "K.G.2", "K.G.3", "K.G.4", "K.G.5", "K.G.6"],
    domain: "Geometry",
    description:
      "Find, describe and build flat and solid shapes. Explore their parts, positions and how shapes fit together.",
    keywords: ["shape", "geometry", "triangle", "circle"],
  },
] as const;
export function mathUnit(id?: string | null) {
  return CA_MATH_UNITS.find((unit) => unit.id === id);
}
