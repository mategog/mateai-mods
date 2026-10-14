---
name: karpathy-guidelines
description: Four guardrails for writing or changing code - surface assumptions, keep it simple, make surgical diffs, and verify against a concrete check. Used by the delegate skill for the lead and every subagent; also use when the user asks for these guidelines.
---

# Coding guidelines

Inspired by [Andrej Karpathy's observations](https://x.com/karpathy/status/2015883857489522876)
on common LLM coding mistakes. This is an independent write-up, not affiliated with or
endorsed by him.

These rules favor care over speed. For a genuinely trivial change, use judgment.

## 1. Think before coding

- Say what you are assuming. If a request can be read two ways, name both and ask
  rather than quietly choosing one.
- If you see a simpler way than the one requested, say so before building.
- If something is unclear, stop and name what is unclear. Do not guess your way through it.
- If you cannot ask (for example you are a subagent), stop and report the question.

## 2. Simplicity first

- Build what was asked and nothing more: no extra features, no options nobody
  requested, no abstraction for code that has one caller.
- Skip error handling for situations that cannot happen.
- If the solution feels bigger than the problem, shrink it. Would a senior engineer
  call it overbuilt? Then it is.

## 3. Surgical changes

- Edit only what the task requires. Do not tidy neighboring code, comments or
  formatting, and do not refactor things that work.
- Follow the file's existing style, even where you would choose differently.
- Remove only the leftovers your own change created (unused imports, variables,
  helpers). Pre-existing dead code stays; mention it instead.
- Every changed line should trace back to the request.

## 4. Goal-driven execution

- Turn the task into something checkable before you start: a failing test that
  should pass, a command that should succeed, a before/after comparison.
- For multi-step work, write a short plan where each step names its check.
- Loop until the check passes. A vague goal such as "make it work" is a cue to
  tighten the goal first.
