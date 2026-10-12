# AI usage

AI assistance was used as a design and implementation aid; final scope choices and code review remain the candidate's responsibility.

1. **Practice input scope.** AI suggested supporting text, code, and diagrams to capture more evidence. I kept structured text for this two-day prototype because it reveals responsibilities, collaboration, and rationale without spending most of the assignment building an editor. The domain keeps a future submission-format seam.
2. **Feedback strategy.** AI suggested an unconstrained LLM reviewer. I rejected that as the default because it would require credentials, add latency and cost, and could produce opaque judgments. The prototype uses deterministic completeness and rubric cues with evidence and actionable prompts; the limitation is documented, and the result contract can host an LLM or human reviewer later.
3. **Architecture.** AI proposed separate workflow, problem, evaluation, and persistence responsibilities. I accepted those boundaries but kept them as small modules in one static monolith, consistent with the assignment's scope and change tests.
4. **Reliability.** AI recommended saving drafts and preserving attempt snapshots. I accepted browser-local autosave and stored submitted drafts with their review so later editing does not rewrite history. I also made storage failure degrade to a visible session-only state.
5. **Research framing.** AI helped compare public descriptions of a broad LLD toolkit, a guided OOD course, and collaborative drawing. I used that comparison to define a narrow product direction and explicitly marked the scan as limited rather than implying user research.
