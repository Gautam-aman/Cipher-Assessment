# Research note: making LLD practice reviewable

## Learner problem

Low-level design practice asks a learner to turn a prompt into objects, responsibilities, relationships, and behavior. The hard part is often not starting a design; it is deciding whether the design handles requirements cleanly, what trade-offs it made, and what to improve next. A static reference answer is a poor sole judge when multiple designs can be valid. Useful practice needs both a concrete prompt and a review that points to evidence in the learner's own reasoning.

## A small scan of existing approaches

**LLDCanvas** presents a broad, purpose-built toolkit: curated practice problems, visual UML editing, pattern support, timed practice, and code execution. Its breadth suggests that learners value both a blank-canvas practice environment and tools that represent structure. For a two-day MVP, reproducing a full diagram editor would consume effort before demonstrating the feedback loop, so Blueprint narrows the input to structured design notes. [LLDCanvas overview](https://www.lldcanvas.in/about) · [Features](https://www.lldcanvas.in/features)

**Educative's Grokking the Low Level Design Interview Using OOD Principles** is a guided course for learning OOD concepts. A course can teach and demonstrate a model, while repeated independent attempts need a lightweight space to articulate a learner's own design. Blueprint complements this practice mode rather than trying to recreate a course catalog. [Educative course](https://www.educative.io/courses/grokking-the-low-level-design-interview-using-ood-principles)

**CoderPad Drawing Mode** supports collaborative drawing during interviews. This demonstrates the value of visual modeling in a live interaction, while also highlighting that a solo practice tool can start with less interaction overhead. Blueprint uses text to capture the design and its rationale in a portable, reviewable form; diagram support is a future submission adapter. [CoderPad Drawing Mode documentation](https://coderpad.io/resources/docs/interview/drawing-mode/)

## Gap and product direction

These approaches span broad toolkits, guided instruction, and live collaborative drawing. The focused gap for this prototype is a deliberate solo learning loop that retains the learner's explanation and makes the feedback criteria visible. The MVP offers three familiar problems; a structured written design; one extension prompt per problem; a stable six-part rubric; and an attempt history. It does not attempt to be a course, a diagramming canvas, or a general interview platform.

## Feedback and evaluation choice

Completeness and state transitions are deterministic. Quality feedback is represented as criteria with scores, visible evidence cues, concerns, and suggestions. The prototype's simple lexical cues make the interaction demonstrable without credentials, network calls, latency, or hidden cost. This is a deliberate prototype trade-off, not a claim that keyword matching can judge design quality. A future LLM or human evaluator should receive the structured submission, fixed rubric, and problem context, and return the same result schema; asynchronous processing should preserve the attempt first and expose `evaluating` / `failed` states.

## Limitations

This is a short product scan based on public product descriptions, not hands-on evaluation of every tool or independent learner research. The implementation has no account or cross-device history, no diagram/code editor, and no semantic evaluator. These omissions protect the assignment's stated scope while leaving explicit seams for later experiments.
