# Document Enforcement Rules

**Purpose:** Prevent Claude from ignoring docs, drifting from the plan, or making changes that conflict with decisions.

**Instructions for Claude:** These rules are NON-NEGOTIABLE. Follow them every session.

---

## Rule 1: Always Read Before Acting

### Before ANY coding session:
```
1. Read TASKS.md — What's in progress? What's blocked?
2. Read PROJECT-PLAN.md — What phase are we in? What's the current deliverable?
```

### Before database changes:
```
1. Read SCHEMA.md — What exists? What are the relationships?
2. After changes: UPDATE SCHEMA.md immediately
```

### Before API changes:
```
1. Read API-CONTRACTS.md — What's the current structure?
2. After changes: UPDATE API-CONTRACTS.md immediately
```

### Before architectural decisions:
```
1. Read DECISIONS.md — What's already decided?
2. If new decision: ADD to DECISIONS.md before implementing
```

### Before adding AI providers:
```
1. Read lib/ai/providers.ts — What models exist? What's the pricing?
2. Update MODELS array and pricing when adding new providers
```

---

## Rule 2: Announce What You're Doing

At the start of every task, Claude states:

```
📍 Current Phase: [Phase X from PROJECT-PLAN.md]
📋 Current Task: [Task from TASKS.md]
📁 Files I'll Touch: [List of files]
📖 Docs I Referenced: [Which docs I read]
```

This prevents drift and keeps the user oriented.

---

## Rule 3: Update Docs in Real-Time

### TASKS.md Updates (Every Session)
- Move tasks to "In Progress" when starting
- Add "Files Touched" as you work
- Move to "Completed" when done
- Add session notes at end of session

### DECISIONS.md Updates (When Decisions Happen)
If you're choosing between approaches, STOP and:
1. Document the decision in DECISIONS.md
2. Include alternatives considered
3. Then implement

### SCHEMA.md Updates (When Schema Changes)
After ANY database change:
1. Update the table definition
2. Update migration history
3. Regenerate types: `npx supabase gen types typescript --local > src/types/database.ts`

### Provider Updates (When Adding Models)
After adding new AI models:
1. Update lib/ai/providers.ts with model definition and pricing
2. Note any special requirements in DECISIONS.md

---

## Rule 4: Challenge Scope Creep

If the user asks for something NOT in PROJECT-PLAN.md:

```
Claude responds:
"That's not in our current plan. Options:
1. Add it to the Backlog for later
2. Add it to the current phase (may delay completion)
3. Replace something in the current phase with this

Which would you prefer?"
```

Never just do it without acknowledging the scope change.

---

## Rule 5: Checkpoint Before Phase Transitions

Before moving to the next phase, Claude must:

```
## Phase [X] Completion Checklist

### Deliverables
- [ ] [Deliverable 1] — Status
- [ ] [Deliverable 2] — Status

### Docs Updated
- [ ] TASKS.md — All tasks marked complete
- [ ] SCHEMA.md — Reflects current database
- [ ] API-CONTRACTS.md — All endpoints documented
- [ ] DECISIONS.md — All decisions recorded

### Ready for Phase [X+1]?
[Claude's assessment]

**User confirmation required to proceed.**
```

---

## Rule 6: Conflict Resolution

If current request CONFLICTS with existing docs:

```
Claude responds:
"This conflicts with [DOC-NAME]:
- Doc says: [X]
- You're asking for: [Y]

Options:
1. Update the doc and proceed with your request
2. Stick with what the doc says
3. Let's discuss which is right

Which approach?"
```

Never silently override documented decisions.

---

## Rule 7: Context Recovery

If starting a new session or context was cleared:

```
Claude's first action:
"Let me get oriented..."

1. Read TASKS.md for current state
2. Read PROJECT-PLAN.md for current phase
3. Summarize: "We're in Phase X, working on Y. Last session we Z."
4. Ask: "Does that match your understanding?"
```

---

## Rule 8: End-of-Session Protocol

Before ending any session:

```
Claude must:
1. Update TASKS.md with:
   - What was completed
   - What's still in progress
   - Any blockers discovered
   - Session notes

2. State: "Docs are updated. Next session, start with [specific task]."
```

---

## Rule 9: Cost Awareness

This project involves real API costs. Claude must:

1. **Estimate costs** before running large benchmark jobs
2. **Confirm with user** before executing benchmark runs that exceed $10
3. **Track actual costs** in cost_logs table
4. **Report cost anomalies** if extraction costs exceed model pricing estimates

---

## Rule 10: The User Can Override

The user can always say:
- "Skip the docs for now"
- "Just do it, we'll document later"
- "Ignore that decision, we're changing direction"

But Claude should:
1. Acknowledge the override
2. Note what's being skipped
3. Flag it in TASKS.md session notes
4. Remind user to update docs before next session

---

## Enforcement Phrases for User

If Claude is drifting, the user can say:

| Phrase | Claude's Response |
|--------|-------------------|
| "Check the docs" | Re-read relevant docs, summarize what they say |
| "Are you following the plan?" | Quote current phase/task from PROJECT-PLAN.md |
| "Document this first" | Add to DECISIONS.md before implementing |
| "What phase are we in?" | State phase, deliverables, progress |
| "Update the docs" | Update all relevant docs before continuing |
| "What's the cost?" | Estimate API costs for proposed operation |

---

## Red Flags for Claude

Stop and check docs if you notice:
- You're about to create a new table (check SCHEMA.md)
- You're adding a major feature (check PROJECT-PLAN.md)
- You're choosing between approaches (add to DECISIONS.md)
- You're adding a new AI provider (update providers.ts and DECISIONS.md)
- User mentions something you don't have context for (re-read docs)
- Task is taking longer than expected (check if scope crept)
- Benchmark run will cost more than $10 (confirm with user)
