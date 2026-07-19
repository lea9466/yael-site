---
name: Vitality & Flow
colors:
  surface: '#fbf9f4'
  surface-dim: '#dbdad5'
  surface-bright: '#fbf9f4'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3ee'
  surface-container: '#f0eee9'
  surface-container-high: '#eae8e3'
  surface-container-highest: '#e4e2dd'
  on-surface: '#1b1c19'
  on-surface-variant: '#424842'
  inverse-surface: '#30312e'
  inverse-on-surface: '#f2f1ec'
  outline: '#727972'
  outline-variant: '#c2c8c0'
  surface-tint: '#45664d'
  primary: '#284731'
  on-primary: '#ffffff'
  primary-container: '#3f5f47'
  on-primary-container: '#b3d7b9'
  inverse-primary: '#accfb1'
  secondary: '#486548'
  on-secondary: '#ffffff'
  secondary-container: '#caecc6'
  on-secondary-container: '#4e6c4e'
  tertiary: '#503d25'
  on-tertiary: '#ffffff'
  tertiary-container: '#69543a'
  on-tertiary-container: '#e6caa8'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#c7eccd'
  primary-fixed-dim: '#accfb1'
  on-primary-fixed: '#01210e'
  on-primary-fixed-variant: '#2e4e37'
  secondary-fixed: '#caecc6'
  secondary-fixed-dim: '#aecfab'
  on-secondary-fixed: '#05210a'
  on-secondary-fixed-variant: '#314d32'
  tertiary-fixed: '#fbdebc'
  tertiary-fixed-dim: '#dec2a1'
  on-tertiary-fixed: '#271904'
  on-tertiary-fixed-variant: '#57432a'
  background: '#fbf9f4'
  on-background: '#1b1c19'
  surface-variant: '#e4e2dd'
typography:
  hero-h1:
    fontFamily: Rubik
    fontSize: 72px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  hero-h1-mobile:
    fontFamily: Rubik
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.2'
  section-h2:
    fontFamily: Rubik
    fontSize: 48px
    fontWeight: '600'
    lineHeight: '1.2'
  section-h2-mobile:
    fontFamily: Rubik
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.3'
  card-title:
    fontFamily: Rubik
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Rubik
    fontSize: 20px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Rubik
    fontSize: 17px
    fontWeight: '400'
    lineHeight: '1.6'
  label-sm:
    fontFamily: Rubik
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1'
    letterSpacing: 0.01em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-max: 1440px
  gutter: 24px
  margin-desktop: 80px
  margin-mobile: 20px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
  stack-xl: 64px
---

## Brand & Style

This design system embodies a premium, modern approach to wellness, specifically tailored for a Hebrew-speaking audience. The aesthetic is rooted in **Modern Minimalism with Tactile warmth**, prioritizing clarity, breathability, and a sense of organic "flow." 

The emotional response should be one of quiet confidence and optimism. Unlike clinical health platforms, this system uses soft textures and a sophisticated color palette to feel personal and full of life. It avoids the "rustic" trope by maintaining sharp execution, intentional whitespace, and refined typography, ensuring the brand feels professional yet deeply inviting.

Key visual pillars:
- **Flowing Energy:** Use of soft, organic shadows and generous padding to suggest movement.
- **Natural Sophistication:** A blend of deep earthy tones with vibrant accents.
- **Modern RTL First:** Every component is engineered from the ground up for Hebrew, ensuring proper optical balance and weight distribution.

## Colors

The color strategy uses a **Deep Green** foundation to establish authority and a connection to nature. **Warm Beige** acts as the canvas, replacing harsh whites to provide a more "premium paper" feel that reduces eye strain during long-form reading.

**Functional Color Mapping:**
- **Primary (Deep Green):** Reserved for high-level hierarchy—H1s, H2s, and primary action states.
- **Secondary (Muted Olive):** Used for supporting UI elements and subtle interactive states.
- **Accent (Soft Coral):** Applied sparingly to high-conversion CTAs and "New" notifications to draw the eye without creating visual stress.
- **Surface (Warm Beige):** The primary background for sections and cards to create depth against the neutral page background.
- **Contextual Accents:** Specific categories (Recipes, Editorial, Testimonials) utilize the supporting palette (Mint, Teal, Rose) to provide immediate cognitive cues to the user.

## Typography

**Rubik** is the cornerstone of this system, chosen for its exceptional Hebrew legibility and friendly yet professional geometric construction. 

**RTL Considerations:** 
- All text is right-aligned by default. 
- Line heights are slightly increased (1.6 for body) to accommodate Hebrew vowel signs (nikkud) if used, and to provide a more "airy," premium reading experience.
- Font weights are used strategically to create a clear scan path; bold headers contrast sharply with medium-weight labels.

**Scaling:**
On mobile devices (390px), the typography scales down to maintain readability without overwhelming the viewport. Hero headers lose some of their aggressive negative letter-spacing to ensure the characters remain distinct on smaller displays.

## Layout & Spacing

The layout follows a **Fluid Grid** logic with a fixed maximum container width. 

- **Desktop (1440px):** A 12-column grid with 80px side margins. Large whitespace "moats" are used between major sections (stack-xl) to emphasize the premium nature of the content.
- **Mobile (390px):** A 4-column grid with 20px margins. Content cards generally stack vertically, while badges and categories use horizontal overflow (scroll) to preserve vertical space.

**RTL Flow:**
The layout direction is `rtl`. Logic-based spacing (e.g., `padding-inline-start`) should be used instead of physical directions (e.g., `padding-right`) to ensure consistent behavior across all components. Visual weight is anchored to the right, with secondary info trailing to the left.

## Elevation & Depth

Hierarchy is established through **Ambient Shadows** and **Tonal Layering**. 

- **Level 0 (Base):** Neutral (#F9F7F2) background.
- **Level 1 (Sections):** Warm Beige (#E3C7A6) background with no shadow, used to group related content.
- **Level 2 (Cards/Floating Elements):** White background with a very soft, diffused shadow (0px 10px 30px rgba(63, 95, 71, 0.08)). The shadow uses a Deep Green tint rather than pure black to maintain the "Natural" brand feel.
- **Interactions:** On hover, Level 2 elements transition to **Level 3**, featuring a 2px vertical lift and a slightly more pronounced shadow (0px 15px 40px rgba(63, 95, 71, 0.12)).

This approach creates a "stacked paper" effect that feels tactile and high-end, avoiding the harshness of heavy borders.

## Shapes

The shape language is consistently **Rounded**. This softens the UI, making the "Healthy" and "Flowing" brand values tangible.

- **Standard Elements (Buttons, Inputs):** 0.5rem (8px) radius. This provides a modern, approachable look without being overly "bubbly."
- **Containers (Cards, Section Blocks):** 1rem (16px) radius to create a distinct frame for high-quality imagery.
- **Featured Imagery:** Large images should use the 1.5rem (24px) radius to emphasize their importance as the "life" of the page.
- **Pills/Badges:** These are the only exception, using a "Rounded-Full" (999px) treatment to distinguish them as metadata/labels.

## Components

### Buttons
- **Primary:** Deep Green background, White text. High contrast, 8px radius.
- **Secondary:** Muted Olive background or 2px border.
- **CTA Accent:** Soft Coral background for high-priority conversion points (e.g., "Join Now").
- **Interaction:** All buttons utilize a 2px "lift" and a subtle darkening of the background color on hover.

### Cards
Cards are the primary content delivery vehicle. They feature:
- Large aspect-ratio images (typically 4:3 or 16:9).
- Warm Beige or White surfaces.
- Right-aligned text with Deep Green card titles.
- Minimal 1px borders in Muted Olive for definition where shadows are not appropriate.

### Badges & Pills
- **Style:** Outlined with a 1px border matching the text color.
- **Fill:** 10% opacity version of the accent color for the background.
- **Shape:** Full pill (rounded-full).
- **Typography:** Label-sm, all-caps (if English) or medium weight (Hebrew).

### Input Fields
- **Surface:** White or very light Beige.
- **Border:** 1px Muted Olive, focusing to 2px Deep Green.
- **Labels:** Positioned above the field, right-aligned, using Deep Green.

### Lists & Navigation
- **Top Nav:** Clean, persistent, with high whitespace between items.
- **Lists:** Use custom iconography (organic dots or leaf-inspired bullets) instead of standard browser bullets.
- **Footer:** High-contrast Deep Green background with Warm Beige text for a grounded, authoritative finish to the page experience.