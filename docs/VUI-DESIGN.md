# LibMarket Voice UI (VUI) — Design Spec (brief)

Purpose: concise spec for voice prompts, supported languages, and examples for low-literacy UI components.

1) Supported languages
- en-US — English (primary)
- pcm — Pidgin/Local variant (placeholder code; TTS engines may map to en-US with localized copy)

2) Prompt templates (keys)
- welcome { name }
- fieldPrompt { field }
- confirm { action }
- errorShort
- successShort

3) Usage examples
- On first-open: speakPrompt('welcome', { name: userName })
- When focusing a form field: speakPrompt('fieldPrompt', { field: 'product title' })
- On save: speakPrompt('successShort')

4) Component usage
- LowLiteracyCard: use for category tiles, onboarding cards, and action shortcuts. Include voiceText prop when available.
- LargeActionButton: use for primary CTAs (Sell Item, Add Product), include voicePromptKey for short audio feedback.

5) Accessibility & UX rules
- Keep prompts short (<6 words ideally).
- Provide visual fallback for all voice interactions.
- Buttons: minimum 44x44 touch target; CTAs 56px height recommended.
- Provide explicit "Stop" and "Help" affordances.

6) Implementation notes
- Default language set via setDefaultLang(lang)
- Use speakPrompt(key, vars, lang?) for templated audio
- For TTS in local languages, evaluate cloud TTS if browser TTS lacks local voice.

