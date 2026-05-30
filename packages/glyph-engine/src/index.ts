export type Point = {
  x: number;
  y: number;
};

export type Stroke = {
  id: string;
  points: Point[];
};

export type RingResult = {
  center: Point;
  radius: number;
  points: Point[];
};

export type Template = {
  id: string;
  strokes: Stroke[];
  tolerance?: number;
};

export type TemplateMatch = {
  templateId: string;
  confidence: number;
};

function distance(a: Point, b: Point): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function normalizePoints(points: Point[]): Point[] {
  if (points.length === 0) return [];
  const minX = Math.min(...points.map((p) => p.x));
  const minY = Math.min(...points.map((p) => p.y));
  const maxX = Math.max(...points.map((p) => p.x));
  const maxY = Math.max(...points.map((p) => p.y));
  const scaleX = maxX - minX || 1;
  const scaleY = maxY - minY || 1;
  return points.map((p) => ({
    x: (p.x - minX) / scaleX,
    y: (p.y - minY) / scaleY,
  }));
}

function computeCentroid(points: Point[]): Point {
  const sum = points.reduce(
    (acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }),
    { x: 0, y: 0 },
  );
  return { x: sum.x / points.length, y: sum.y / points.length };
}

function isClosedLoop(points: Point[], threshold: number): boolean {
  if (points.length < 3) return false;
  const first = points[0];
  const last = points[points.length - 1];
  return distance(first, last) < threshold;
}

export function detectRing(points: Point[]): RingResult | null {
  if (points.length < 6) return null;

  const closed = isClosedLoop(points, 30);
  if (!closed) return null;

  const centroid = computeCentroid(points);
  const distances = points.map((p) => distance(p, centroid));
  const avgRadius = distances.reduce((a, d) => a + d, 0) / distances.length;
  const variance =
    distances.reduce((a, d) => a + (d - avgRadius) ** 2, 0) / distances.length;
  const stdDev = Math.sqrt(variance);

  if (stdDev > avgRadius * 0.35) return null;

  return { center: centroid, radius: avgRadius, points };
}

function resamplePoints(points: Point[], targetCount: number): Point[] {
  if (points.length < 2) return points;

  let totalLen = 0;
  const segLengths: number[] = [];
  for (let i = 1; i < points.length; i++) {
    const d = distance(points[i - 1], points[i]);
    segLengths.push(d);
    totalLen += d;
  }

  const step = totalLen / (targetCount - 1);
  const result: Point[] = [points[0]];

  let accumulated = 0;
  let segIdx = 0;
  for (let i = 1; i < targetCount - 1; i++) {
    const targetDist = i * step;
    while (segIdx < segLengths.length && accumulated + segLengths[segIdx] < targetDist) {
      accumulated += segLengths[segIdx];
      segIdx++;
    }
    if (segIdx >= segLengths.length) break;

    const remaining = targetDist - accumulated;
    const t = remaining / (segLengths[segIdx] || 1);
    const a = points[segIdx];
    const b = points[segIdx + 1];
    result.push({
      x: a.x + (b.x - a.x) * t,
      y: a.y + (b.y - a.y) * t,
    });
  }

  result.push(points[points.length - 1]);
  return result;
}

function compareStrokes(
  input: Stroke[],
  template: Stroke[],
  tolerance: number,
): number {
  if (input.length === 0 || template.length === 0) return 0;
  if (input.length !== template.length) {
    const ratio = Math.min(input.length, template.length) / Math.max(input.length, template.length);
    if (ratio < 0.5) return 0;
  }

  let totalScore = 0;
  let comparisons = 0;

  const maxStrokes = Math.min(input.length, template.length);
  for (let s = 0; s < maxStrokes; s++) {
    const inStroke = input[s];
    const tmStroke = template[s];

    const resampleCount = Math.max(inStroke.points.length, tmStroke.points.length, 32);
    const inResampled = resamplePoints(inStroke.points, resampleCount);
    const tmResampled = resamplePoints(tmStroke.points, resampleCount);

    const inNorm = normalizePoints(inResampled);
    const tmNorm = normalizePoints(tmResampled);

    let matchCount = 0;
    const maxPts = Math.min(inNorm.length, tmNorm.length);
    for (let p = 0; p < maxPts; p++) {
      const d = distance(inNorm[p], tmNorm[p]);
      if (d < tolerance) matchCount++;
    }
    totalScore += matchCount / maxPts;
    comparisons++;
  }

  return comparisons > 0 ? totalScore / comparisons : 0;
}

export function matchTemplate(
  strokes: Stroke[],
  templates: Template[],
): TemplateMatch | null {
  let bestMatch: TemplateMatch | null = null;
  let bestScore = 0;

  for (const template of templates) {
    const tolerance = template.tolerance ?? 0.25;
    const score = compareStrokes(strokes, template.strokes, tolerance);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = { templateId: template.id, confidence: score };
    }
  }

  return bestScore > 0.4 ? bestMatch : null;
}
