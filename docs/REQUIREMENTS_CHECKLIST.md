# Requirements checklist

| Requirement | Implementation location | Verification method | Result | Status |
| --- | --- | --- | --- | --- |
| Three contextualized problems | `src/problems.js`; problem brief and selector | Source inspection and manual selection | Three prompts with requirements and extension prompts | Complete |
| Meaningful learner submission | `index.html`; draft handling in `src/app.js` | Manual form workflow | Four sections capture assumptions, classes, flow, and reasoning | Complete |
| Validate and submit attempts | `src/evaluation.js`; submit handler | `npm test`; manual incomplete and complete submit | Invalid fields surfaced; complete attempts saved as completed | Complete |
| Useful, explainable feedback | `src/evaluation.js`; feedback rendering | `npm test`; inspect review view | Six scores, evidence cues, and targeted suggestions | Complete |
| History and retry | `src/storage.js`; history UI | Manual repeated attempt/reopen/reload workflow | Local attempts retained and prior feedback can be opened | Complete |
| Clear/extensible domain behavior | `src/problems.js`, `src/evaluation.js`, `src/storage.js` | Architecture/code review | Pure evaluator, independent catalog and storage adapter | Complete |
| Research note | `docs/RESEARCH_NOTE.md` | Content review | Three public approaches compared with scope implications | Complete |
| Design note | `docs/DESIGN_NOTE.md` | Content review | Flow, domain model, evaluation, and trade-offs recorded | Complete |
| AI usage note | `AI_USAGE.md` | Content review | Decisions and human acceptance/rejection explained | Complete |
| Tests and edge/failure cases | `tests/evaluation.test.js` | `npm test` | Validator and rubric unit cases included; results recorded in submission report | Complete |
| Setup and limitations | `README.md` | Fresh local setup | Run/test commands and prototype limitations described | Complete |

Browser interaction checks depend on an interactive browser tool. Automated domain tests do not claim to verify layout or full browser persistence behavior.
