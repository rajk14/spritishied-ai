# Graph Report - spitishield-mobile  (2026-05-08)

## Corpus Check
- 26 files · ~8,771 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 42 nodes · 19 edges · 1 communities detected
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]

## God Nodes (most connected - your core abstractions)
1. `useThemeColor()` - 4 edges
2. `Text()` - 2 edges
3. `View()` - 2 edges
4. `useColorScheme()` - 2 edges

## Surprising Connections (you probably didn't know these)
- `useThemeColor()` --calls--> `useColorScheme()`  [INFERRED]
  components\Themed.tsx → components\useColorScheme.web.ts

## Communities

### Community 0 - "Community 0"
Cohesion: 0.47
Nodes (4): Text(), useThemeColor(), View(), useColorScheme()

## Suggested Questions
_Not enough signal to generate questions. This usually means the corpus has no AMBIGUOUS edges, no bridge nodes, no INFERRED relationships, and all communities are tightly cohesive. Add more files or run with --mode deep to extract richer edges._