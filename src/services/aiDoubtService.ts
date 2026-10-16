export type DoubtType = 'concept' | 'numerical' | 'code' | 'exam' | 'quick';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  doubtType?: DoubtType;
  contextNoteTitle?: string;
}

export interface SolveDoubtParams {
  question: string;
  doubtType: DoubtType;
  branch?: string;
  subject?: string;
  semester?: number;
  contextNoteTitle?: string;
  contextSnippet?: string;
  conversationHistory?: { role: 'user' | 'model'; content: string }[];
}

export async function askAIDoubt(params: SolveDoubtParams): Promise<string> {
  try {
    const res = await fetch('/api/ai/solve-doubt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || `Server returned ${res.status}`);
    }

    return data.answer || 'No response generated.';
  } catch (err: any) {
    console.warn('API error in askAIDoubt, generating resilient fallback solution:', err);
    return getOfflineDoubtSolution(params);
  }
}

function getOfflineDoubtSolution(params: SolveDoubtParams): string {
  const q = (params.question || '').toLowerCase();
  const sub = params.subject || 'Engineering';

  if (q.includes('kcl') || q.includes('kvl') || q.includes('kirchhoff')) {
    return `### Kirchhoff's Current & Voltage Laws (Circuit Analysis)

> **Conservation Laws:** KCL represents **Conservation of Charge**, while KVL represents **Conservation of Energy**.

#### 1. Kirchhoff's Current Law (KCL)
- **Statement:** The algebraic sum of currents entering and leaving any node in a circuit is identically zero.
- **Formula:** $\\sum I_{\\text{in}} = \\sum I_{\\text{out}}$.
- **Analogy:** Water flowing through a pipe junction cannot accumulate; inflow must equal outflow.

#### 2. Kirchhoff's Voltage Law (KVL)
- **Statement:** The sum of potential rises and drops around any closed loop is zero.
- **Formula:** $\\sum V_{\\text{loop}} = 0$.

#### 3. University Exam Tip:
- Consistently adopt one sign convention (e.g. entering current $= +$, leaving current $= -$).
- In nodal analysis, reference node (Ground) is always taken as $0\\text{ V}$.`;
  }

  if (q.includes('dijkstra') || q.includes('shortest path') || q.includes('bellman')) {
    return `### Shortest Path Algorithms: Dijkstra vs Bellman-Ford

| Metric | Dijkstra | Bellman-Ford |
| :--- | :--- | :--- |
| **Paradigm** | Greedy Approach | Dynamic Programming |
| **Negative Edges** | **Unsupported** (fails) | **Supported** (handles negative weights) |
| **Time Complexity** | $O((V+E) \\log V)$ | $O(V \\times E)$ |
| **Negative Cycles** | Cannot detect | Detects negative weight cycles |

#### Core Takeaway:
Use Dijkstra for non-negative road/routing networks. Use Bellman-Ford when negative costs or arbitrage cycles are present.`;
  }

  if (params.doubtType === 'numerical') {
    return `### Step-by-Step Numerical Framework: ${params.question}

#### 1. Given Variables & Boundary Conditions:
- Extract all initial values from the problem statement for **${sub}**.
- Convert all non-standard units to SI base units before calculation.

#### 2. Governing Formulation:
- Apply the fundamental conservation theorem:
  $$\\text{Input} - \\text{Losses} = \\text{Output}$$
- Substitute known values into the characteristic equation and isolate the target variable.

#### 3. Verification:
- Check dimensional consistency $[M^a L^b T^c]$ on both sides of the equation.`;
  }

  return `### Engineering Concept Overview: ${params.question}

#### 1. Core Operating Principle:
In **${sub}**, this concept models the transfer and storage of energy or information under operational constraints.

#### 2. Governing Relationship:
- Systems naturally seek minimum potential energy or maximum stability under boundary constraints.
- Always apply standard safety factors (typically $1.5 - 2.5$) in practical engineering designs.

#### 3. University Exam Strategy:
- State definitions clearly in the opening paragraph.
- Always include a schematic block diagram and write SI units for all final answers.`;
}

export async function getSuggestedQuestions(
  subject?: string,
  branch?: string
): Promise<string[]> {
  try {
    const res = await fetch('/api/ai/suggest-questions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ subject, branch }),
    });

    if (!res.ok) {
      throw new Error('Failed to fetch suggested questions');
    }

    const data = await res.json();
    if (Array.isArray(data.questions) && data.questions.length > 0) {
      return data.questions;
    }
  } catch (err) {
    console.warn('Fallback to local suggested questions', err);
  }

  // Fallback high-yield engineering questions
  if (subject) {
    return [
      `Explain the fundamental working principle of ${subject}`,
      `Derive the key governing equation for this unit in ${subject}`,
      `What are the most frequent 10-mark exam questions in ${subject}?`,
      `Provide a step-by-step numerical solving framework for this topic.`
    ];
  }

  return [
    'Explain Paging vs Segmentation in Operating Systems with a diagram',
    'Derive Euler-Bernoulli Beam bending formula step-by-step',
    'Explain 3-Phase Induction Motor working principle & slip',
    'How does Dijkstra Shortest Path algorithm work with an example?'
  ];
}

export async function generateQuizFromAI(
  subject: string,
  branch: string,
  topic?: string,
  count = 5
) {
  try {
    const res = await fetch('/api/ai/generate-quiz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject, branch, topic, count })
    });
    const data = await res.json();
    if (data.success && Array.isArray(data.questions) && data.questions.length > 0) {
      return data.questions;
    }
  } catch (err) {
    console.warn('AI quiz generation error, using curated question bank:', err);
  }
  return null;
}

export async function generateShortNotesFromAI(
  subject: string,
  branch: string,
  topic: string
) {
  try {
    const res = await fetch('/api/ai/generate-short-notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject, branch, topic })
    });
    const data = await res.json();
    if (data.success && data.shortNote && data.shortNote.title) {
      return data.shortNote;
    }
  } catch (err) {
    console.warn('AI short notes generation error, using curated cheat sheets:', err);
  }
  return null;
}

