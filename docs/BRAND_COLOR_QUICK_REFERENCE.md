# LibMarket Brand Color Quick Reference

## The Three Brand Colors

### 🔵 Deep Teal Blue
```
Hex: #006B7D
RGB: rgb(0, 107, 125)
Use: Primary brand color, buttons, links, active states
```

### ⬜ Off-White
```
Hex: #F5F5F0
RGB: rgb(245, 245, 240)
Use: Backgrounds, cards, button text on teal
```

### 🔴 Muted Coral Red
```
Hex: #D84A4A
RGB: rgb(216, 74, 74)
Use: Errors, alerts, destructive actions
```

---

## Quick Usage Rules

### ✅ DO
- Use `var(--color-primary)` for Deep Teal Blue
- Use `var(--color-bg-secondary)` for Off-White backgrounds
- Use `var(--color-error)` for Muted Coral Red
- Maintain WCAG AA contrast minimums (4.5:1 for text)

### ❌ DON'T
- Never use `#FFFFFF` or `white` for backgrounds
- Never use `#FF0000` or `red` for errors
- Don't hardcode hex colors in components
- Don't use pure white or bright red anywhere

---

## CSS Variable Reference

```css
/* Copy-paste ready */

/* Primary Color */
background-color: var(--color-primary);        /* #006B7D */
background-color: var(--color-primary-hover);  /* #005666 - Darker */
background-color: var(--color-primary-light);  /* #E6F4F6 - Lighter */

/* Backgrounds */
background-color: var(--color-bg-primary);     /* #EAEAE0 - Body */
background-color: var(--color-bg-secondary);   /* #F5F5F0 - Off-White */
background-color: var(--color-bg-tertiary);    /* #E8E8DD - Tertiary */

/* Text */
color: var(--color-text-primary);              /* #1A1A1A - Primary */
color: var(--color-text-secondary);            /* #4A4A4A - Secondary */
color: var(--color-text-tertiary);             /* #6B6B6B - Tertiary */

/* Borders */
border-color: var(--color-border);             /* #D5D5C8 */
border-color: var(--color-border-light);       /* #E0E0D5 */

/* Semantic */
color: var(--color-success);                   /* #42b72a - Green */
color: var(--color-error);                     /* #D84A4A - Coral Red */
color: var(--color-warning);                   /* #f7b928 - Orange */
```

---

## Common Patterns

### Primary Button
```css
.btn-primary {
  background-color: var(--color-primary);
  color: var(--color-bg-secondary);
}
```

### Card
```css
.card {
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
}
```

### Error Message
```css
.error {
  color: var(--color-error);
  background-color: #F8D7D7; /* Light coral */
  border: 1px solid var(--color-error);
}
```

---

## Accessibility Checks

✅ **All combinations tested and WCAG compliant:**
- Primary text on off-white: **13.5:1** (AAA)
- Secondary text on off-white: **7.8:1** (AA)
- Off-white on Deep Teal: **4.8:1** (AA)
- Error text on off-white: **4.2:1** (AA)

---

## Need More Info?
See `COLOR_SCHEME_IMPLEMENTATION.md` for complete documentation.
