# Weekend Frontend Roadmap for Steering AI on a Production Dashboard

This roadmap is optimized for one outcome: become comfortable enough with frontend development in a single weekend to direct AI agents effectively while continuing work on a production-grade dashboard.

This is not a full frontend curriculum. It is a compressed operating model for:

- reading React code without getting lost
- steering AI agents with precise instructions
- reviewing frontend diffs for correctness and quality
- debugging common layout, state, and data issues
- shipping smaller, safer changes in a real dashboard

## The Objective by Monday

By the end of this weekend, you should be able to:

- trace a UI feature to the files that control it
- identify where state lives and how a change propagates
- describe frontend work to an AI agent in concrete, testable terms
- catch common React and CSS mistakes in agent-generated code
- verify loading, error, empty, and responsive states
- debug basic rendering, layout, and fetch issues with DevTools

## Core Learning Stack

Use two kinds of sources:

- Official docs for correctness and long-term reference
- Scrimba for fast, interactive repetition

### Official sources

- MDN Learn Web Development: <https://developer.mozilla.org/en-US/docs/Learn>
- MDN HTML basics: <https://developer.mozilla.org/en-US/docs/Learn_web_development/Getting_started/Your_first_website/Creating_the_content>
- web.dev CSS layout: <https://web.dev/learn/css/layout/>
- web.dev Flexbox: <https://web.dev/learn/css/flexbox>
- web.dev Accessibility forms: <https://web.dev/learn/accessibility/forms>
- React Learn: <https://react.dev/learn>
- React Managing State: <https://react.dev/learn/managing-state>
- React Sharing State Between Components: <https://react.dev/learn/sharing-state-between-components>
- React Preserving and Resetting State: <https://react.dev/learn/preserving-and-resetting-state>
- MDN Fetch API: <https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch>
- Chrome DevTools docs: <https://developer.chrome.com/docs/devtools>
- Chrome DevTools inspect mode: <https://developer.chrome.com/docs/devtools/inspect-mode>
- Chrome DevTools CSS debugging: <https://developer.chrome.com/docs/devtools/css/>

### Scrimba source

- Scrimba Learn React by Bob Ziroll: <https://m.scrimba.com/learn/learnreact>

## What I Think About Scrimba

Scrimba is worth using for this goal.

Why it helps:

- interactive exercises force pattern recognition faster than passive videos
- Bob Ziroll's React course is practical and well-structured
- the projects map reasonably well to the kinds of component/state issues you will see in dashboards

Where it becomes a trap:

- trying to complete the full course in one weekend
- spending more time on Scrimba than in your actual dashboard codebase
- treating completion as progress instead of transfer into real work

Recommendation:

- use Scrimba for React fundamentals only
- cap Scrimba at 3 to 5 hours this weekend
- spend the rest of the time applying concepts directly inside this repo

## Weekend Schedule

This schedule assumes roughly 14 to 18 focused hours across Saturday and Sunday, plus a short Friday setup session.

## Friday Night: Setup and Orientation

Time: 2 hours

### Goal

Build the minimum browser and codebase mental model so the rest of the weekend has context.

### Study

- MDN Learn Web Development overview
- MDN HTML basics
- web.dev CSS layout
- web.dev Flexbox

### Focus topics

- HTML structure: sections, headings, buttons, forms, inputs
- CSS box model
- `display`, `flex`, `grid`
- spacing, width, height, overflow
- how layout breaks on smaller screens

### Repo exercise

In this dashboard codebase, identify:

- the app entry point
- the main dashboard route or page component
- the shared component folder
- where styles live
- where data fetching happens

### Outcome

By the end of Friday night, you should be able to look at a component and tell whether a bug is probably:

- structure
- styling
- state
- data flow

## Saturday Morning: React Fundamentals for Reading and Steering Code

Time: 3.5 to 4 hours

### Goal

Learn enough React to inspect and direct component-level changes confidently.

### Primary sources

- React Learn: <https://react.dev/learn>
- React Managing State: <https://react.dev/learn/managing-state>
- Scrimba Learn React: <https://m.scrimba.com/learn/learnreact>

### Scrimba lessons to do

Use only these lessons from `Learn React`.

#### Module 1: Build a React info site

- 1. Introduction to React
- 3. First React
- 8. Why React? It's declarative
- 9. JSX
- 17. Custom Components
- 20. Parent/Child Components
- 21. Styling with Classes
- 22. Organize components
- 23. Run React locally with Vite
- 35. React Section 1 Recap

#### Module 2: Build an AirBnb Experiences clone

- 7. Props Part 1: Understanding the Concept
- 8. Props Part 2: Reusable Components
- 10. Props part 3: Create a contact component
- 11. Props part 4: receiving props in a component
- 13. Destructuring props
- 17. Review - array .map()
- 18. React renders arrays
- 19. Mapping components
- 23. Project: key prop
- 28. React Section 2 Recap

### React concepts to understand

- components
- props
- JSX
- parent-child structure
- reusable components
- list rendering
- `key`
- basic project structure

### Repo exercise

Pick one visible dashboard section and trace:

- which component renders it
- what props it receives
- whether it owns its own state
- whether data comes from a parent or a fetch

### Outcome

By the end of this block, you should be able to answer:

- which file owns this UI?
- which component passes data into it?
- is this repeated UI abstracted correctly or not?

## Saturday Afternoon: State, Forms, and Data Fetching

Time: 3 to 4 hours

### Goal

Learn enough React state and request handling to spot the most common AI implementation mistakes.

### Primary sources

- React Managing State
- React Sharing State Between Components
- React Preserving and Resetting State
- MDN Fetch API
- web.dev Accessibility forms

### Scrimba lessons to do

#### Module 3: Build a meme generator

- 9. Props vs. State: Props
- 10. Props vs. State: State
- 12. useState
- 14. Changing state
- 16. useState - Changing state with a callback function
- 22. Complex state: arrays
- 23. Complex state: objects
- 24. Complex state: updating state objects
- 26. Passing state as props
- 27. Setting state from child components
- 33. Boxes challenge part 3.1 - local state
- 34. Boxes challenge part 3.2 - unified state
- 38. Conditional rendering: &&
- 40. Conditional rendering: ternary
- 43. React forms intro
- 44. Watch for input changes in React
- 46. Forms state object
- 48. Controlled inputs
- 49. Forms in React: Textarea
- 50. Forms in React: Checkbox
- 51. Forms in React: Radio buttons
- 52. Forms in React: Select & Option
- 53. Forms in React: Submitting the form
- 54. Accessible labels - useId
- 58. Making API calls
- 59. Intro to useEffect
- 60. useEffect() syntax and default behavior
- 61. useEffect dependencies array
- 63. useEffect for fetching data
- 65. Project: Get Memes from API
- 67. useEffect cleanup function
- 68. Using an async function inside useEffect
- 69. React Section 3 Recap

### Concepts to understand

- props vs state
- local state vs shared state
- updating arrays and objects immutably
- conditional rendering
- controlled forms
- request lifecycle
- `useEffect`
- fetching data on mount
- avoiding unnecessary refetches

### Repo exercise

Pick one interactive dashboard feature such as:

- a filter bar
- date selector
- tab switcher
- modal
- table search

Then trace:

- where state is created
- who updates it
- what rerenders after a change
- whether network activity is triggered

### Outcome

By the end of this block, you should be able to tell an AI agent:

- where state belongs
- whether a component is storing derived state unnecessarily
- whether a fetch is happening in the wrong place
- whether form inputs are wired properly

## Saturday Evening: Layout Review and Debugging

Time: 2 hours

### Goal

Get comfortable enough with DevTools to localize bugs before asking an agent to fix them.

### Primary sources

- Chrome DevTools inspect mode
- Chrome DevTools CSS docs

### What to practice

- inspect DOM structure
- compare computed styles
- use the box model panel
- toggle classes
- identify overflow and width problems
- inspect network requests
- read console errors

### Dashboard drills

- inspect one card or chart container and explain why it sizes the way it does
- inspect one broken or suspicious mobile layout
- open the Network tab and trace one data request
- identify whether one bug is data-related or styling-related

### Outcome

By the end of Saturday, you should be able to say:

- this is a CSS/layout bug
- this is stale state
- this is a fetch issue
- this is the wrong component owning behavior

## Sunday Morning: Review Like a Technical Lead

Time: 3 hours

### Goal

Build a review framework for AI-generated frontend changes.

### Review checklist

For every diff, check:

- correctness
- mobile responsiveness
- loading state
- empty state
- error state
- accessibility
- consistency with the existing codebase
- scope discipline
- maintainability

### Questions to ask on every task

- what file owns this behavior?
- is state local, shared, or derived?
- is this the smallest patch that solves the problem?
- what happens if the API is slow, empty, or fails?
- what happens on narrow screens?
- does keyboard navigation still work?
- did the agent change unrelated files?
- did the agent introduce a new abstraction without a real need?

### Repo exercise

Review one recent change or current dashboard feature as if it came from an AI agent. Write down:

- what is correct
- what is risky
- what edge cases are missing
- what should be narrowed or rewritten

### Outcome

By the end of this block, you should be able to reject bad AI diffs with specific reasons instead of general discomfort.

## Sunday Afternoon: Apply Everything to a Real Dashboard Task

Time: 3 to 4 hours

### Goal

Use the repo as the main learning environment and practice directing AI with tight scope.

### Workflow

1. Pick one real dashboard task.
2. Ask the agent to inspect first.
3. Ask for the smallest viable patch.
4. Specify non-goals.
5. Require handling for loading, empty, and error states if relevant.
6. Require mobile behavior.
7. Review the diff.
8. Verify in the browser.

### Prompt template

```text
Inspect the current dashboard code first and identify the files that control [feature].

Then make the smallest patch that does this:
- [desired behavior]

Constraints:
- preserve existing data flow
- do not refactor unrelated components
- keep styling consistent with the current dashboard
- handle loading, empty, and error states if relevant
- ensure mobile layout works down to [width]

Acceptance criteria:
- [specific observable behaviors]

After changes, explain which files changed and how to verify.
```

### Good task choices

- tighten spacing or layout on one dashboard section
- improve a filter bar or search UI
- fix a loading or empty state
- make one chart/card section responsive
- clean up one modal or form flow

### Bad task choices

- redesign the whole dashboard
- switch state management libraries
- rewrite routing
- refactor large shared component trees
- introduce a new design system

## Sunday Evening: Consolidate Into an Operating Checklist

Time: 1 hour

Create a short personal checklist you can use before every AI task.

Suggested checklist:

- where is the entry point for this screen?
- which component owns this feature?
- where does the data come from?
- where does state live?
- what are the loading, empty, error, and success states?
- what is the mobile behavior?
- what is the smallest safe patch?
- how will I verify it manually?

Keep this checklist next to the repo while you work.

## What to Skip This Weekend

Do not spend time on:

- advanced algorithms
- deep React internals
- custom build tooling
- advanced state libraries
- animation systems
- testing frameworks beyond basic awareness
- architecture theory detached from your current repo

Those are useful later, but not necessary for directing AI on this dashboard right now.

## What Comfortable Looks Like by Monday

You are ready to keep working on the dashboard if you can:

- open a feature and quickly find the relevant files
- trace props and state through a component tree
- identify whether a bug is layout, state, or data flow
- give the agent constrained instructions with acceptance criteria
- review diffs for edge cases, responsiveness, and scope
- catch overengineering before it lands

That is enough to operate effectively with AI, even if you are not yet independently strong across all of frontend.

## Recommended Time Split

If you only have one weekend, use roughly:

- 20% browser and CSS fundamentals
- 35% React fundamentals and state
- 15% forms and fetch flows
- 10% DevTools debugging
- 20% direct application inside this repo

## Final Recommendation on Scrimba

Use Scrimba, but treat it as acceleration, not the main event.

Best use:

- Modules 1 to 3 lessons listed above
- only the lessons directly tied to components, props, state, forms, and effects

Do not try to finish the entire course this weekend.

The fastest path is:

- learn a concept in Scrimba
- confirm it in React or MDN docs
- immediately map it onto this dashboard

That loop will make you productive fastest.
