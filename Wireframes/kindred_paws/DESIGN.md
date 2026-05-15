---
name: Kindred Paws
colors:
  surface: '#fff8f4'
  surface-dim: '#e1d8d2'
  surface-bright: '#fff8f4'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fbf2eb'
  surface-container: '#f5ece5'
  surface-container-high: '#f0e7df'
  surface-container-highest: '#eae1da'
  on-surface: '#1f1b17'
  on-surface-variant: '#56423c'
  inverse-surface: '#34302b'
  inverse-on-surface: '#f8efe8'
  outline: '#89726b'
  outline-variant: '#ddc0b8'
  surface-tint: '#9f4122'
  primary: '#9c3e20'
  on-primary: '#ffffff'
  primary-container: '#bc5636'
  on-primary-container: '#fffbff'
  inverse-primary: '#ffb59f'
  secondary: '#466641'
  on-secondary: '#ffffff'
  secondary-container: '#c5eabb'
  on-secondary-container: '#4a6b45'
  tertiary: '#5f5b54'
  on-tertiary: '#ffffff'
  tertiary-container: '#79746c'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbd0'
  primary-fixed-dim: '#ffb59f'
  on-primary-fixed: '#3a0a00'
  on-primary-fixed-variant: '#802a0d'
  secondary-fixed: '#c8edbe'
  secondary-fixed-dim: '#acd0a3'
  on-secondary-fixed: '#032104'
  on-secondary-fixed-variant: '#2f4e2b'
  tertiary-fixed: '#e8e2d8'
  tertiary-fixed-dim: '#ccc6bc'
  on-tertiary-fixed: '#1e1b15'
  on-tertiary-fixed-variant: '#4a463f'
  background: '#fff8f4'
  on-background: '#1f1b17'
  surface-variant: '#eae1da'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.25'
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.2'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
  container-max: 1280px
  gutter: 24px
---

## Brand & Style

This design system centers on a "Soft Modernism" aesthetic, prioritizing emotional resonance and accessibility. The brand personality is grounded in empathy, designed to feel like a supportive neighbor rather than a clinical database. By combining minimalist layouts with tactile, warm color applications, the UI evokes feelings of safety, hope, and community.

The visual style utilizes generous whitespace to reduce cognitive load—crucial for users in high-stress "lost pet" situations—while integrating organic, rounded elements that mimic the soft nature of pets. Icons and decorative elements like hearts and paw prints are used as subtle accents to reinforce the mission without cluttering the functional paths.

## Colors

The palette is inspired by natural clay and earth tones to ground the experience in reality and trust.

- **Primary (Terracotta):** Used for call-to-action buttons, highlights, and critical "Lost & Found" alerts. It provides a warm, high-energy focal point.
- **Secondary (Soft Green):** Represents growth, health, and successful adoptions. It is used for "Found" status indicators, health records, and secondary actions.
- **Tertiary (Beige):** Serves as the primary surface color, replacing harsh whites to create a softer, more paper-like reading experience that reduces eye strain.
- **Neutral (Charcoal Brown):** Used for typography and iconography to maintain high contrast while avoiding the sterile feel of pure black.

## Typography

This design system utilizes **Plus Jakarta Sans** for all levels of the hierarchy. This choice provides a friendly, optimistic, and highly approachable character through its soft curves and modern geometry.

Headlines should use tighter letter spacing and heavier weights to create a sense of grounded authority. Body text is set with generous line height (1.6) to ensure maximum legibility for users of all ages and visual abilities. Labels and micro-copy utilize medium to semi-bold weights to remain distinct even at smaller scales.

## Layout & Spacing

The layout philosophy follows a **fluid grid** model based on an 8px rhythm. For web interfaces, a 12-column system is used with 24px gutters and 24px side margins.

Spacing is used intentionally to group related pet information:
- **Tight (4px-12px):** Used for connecting labels to their input fields or icons to text.
- **Medium (24px):** The standard gap between cards in a feed or between content sections.
- **Large (48px-80px):** Used to separate major sections, such as a "Pet Gallery" from the "Adoption Process" guide, ensuring the UI feels "airy" and unhurried.

## Elevation & Depth

To maintain the warm and trustworthy feel, this design system avoids harsh, black shadows. Instead, it utilizes **Ambient Shadows** and **Tonal Layers**.

Depth is created using low-opacity shadows tinted with the primary terracotta or neutral charcoal colors (e.g., `rgba(74, 69, 64, 0.08)`). Surfaces that require the most attention, like "Lost Pet" alert cards, use a slightly higher elevation with a more diffused blur to appear as if they are floating gently above the beige background. Secondary elements remain flat or use a 1px soft-border in a slightly darker beige to indicate interactivity without adding visual noise.

## Shapes

The shape language is consistently **Rounded**, reflecting the softness of the pets the platform serves. 

The standard radius is 0.5rem (8px) for buttons and input fields, while larger components like pet profile cards and modal containers use 1rem (16px) or 1.5rem (24px). This creates a "friendly-first" interface that feels safe to touch and navigate. Circular shapes are reserved strictly for user avatars and decorative pet-status badges to provide a distinct contrast against the rectangular grid.

## Components

- **Buttons:** Primary buttons are solid Terracotta with white text and a 0.5rem radius. They should feature a subtle "squish" animation (scale down to 0.98) on click to add a tactile, playful feel.
- **Cards:** Pet profile cards use a white background on the beige surface, featuring a 1rem corner radius and a soft ambient shadow. Images within cards should have a "top-only" radius of 1rem.
- **Chips:** Used for pet attributes (e.g., "Vaccinated," "Good with kids"). These use the Soft Green as a light background tint with dark green text.
- **Input Fields:** These feature a 1px border in a mid-tone beige, moving to a thicker 2px Terracotta border on focus. Icons (like a search magnifying glass or a paw) should be placed at the start of the field.
- **Adoption Badges:** Heart-shaped icons or ribbons used as overlays on pet images to denote "Urgent" or "Success Story" status.
- **Progress Indicators:** Soft, rounded bars used in the adoption application process to make a multi-step task feel manageable and friendly.