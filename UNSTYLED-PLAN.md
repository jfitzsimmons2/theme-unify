# PrimeVue Unstyled Mode + UnoCSS PT — Migration Plan

Switch from PrimeVue's styled design-token mode to **unstyled mode**. Add a new `generatePrimeVuePT` generator in the core package that produces a passthrough (PT) preset with UnoCSS utility classes derived from tokens. Update the playground to use `unstyled: true` with the generated PT, making UnoCSS the single source of truth for all component styling. Keep the existing styled generator for backwards compatibility.

---

## Phase 1: Core Package — New PT Generator

### Step 1.1: Add PT types to `types.ts`

- Add `PTSeverityClassMap` type — maps severity name → `{ bg, hover, active, text, border }` class strings
- Add `PTSurfaceClassMap` type — surface/page/elevated background classes
- These are internal to the generator, not exported as user-facing config

### Step 1.2: Create `generators/primevue-pt.ts` (NEW)

The core of the change. Takes `ResolvedTokens | ResolvedAutoTokens` and outputs a `.ts` file exporting `primevuePT`.

**Internal logic:**

1. Map `semantic.colors.primary.scale` → resolve the color name (e.g., `"beetroot"`) → generate UnoCSS class names: `bg-beetroot-500`, `hover:bg-beetroot-600`, `active:bg-beetroot-700`, `text-white`
2. Map all severity roles (primary, secondary, success, info, warn/warning, danger/error, help, contrast) to their resolved UnoCSS color classes
3. Map surface colors from `semantic.surface.scale` / `darkScale` → light/dark bg/text/border classes
4. Map form field styles from surface scale → border, focus, hover classes
5. Generate PT sections for ~20 components using resolved color classes + structural utilities

**Component coverage (core set ~20):**

| Component                      | PT sections                                                                  |
| ------------------------------ | ---------------------------------------------------------------------------- |
| **Button**                     | root (severity×variant×size×shape×state), label, icon, loadingIcon, badge    |
| **Card**                       | root, header, body, title, subtitle, content, footer                         |
| **InputText**                  | root (default, hover, focus, disabled, invalid states)                       |
| **Textarea**                   | root                                                                         |
| **Select**                     | root, label, dropdown, overlay, list, option, clearIcon                      |
| **DataTable**                  | root, table, header, headerRow, headerCell, bodyRow, bodyCell, paginator     |
| **Dialog**                     | root, mask, header, title, content, footer, pcCloseButton                    |
| **Drawer**                     | root, mask, header, title, content                                           |
| **Message**                    | root (per severity), icon, text, closeButton                                 |
| **Toast**                      | root, message (per severity), messageContent, summary, detail, pcCloseButton |
| **Tag**                        | root (per severity), icon, label                                             |
| **Badge**                      | root (per severity, per size)                                                |
| **Panel**                      | root, header, title, content, pcToggleButton                                 |
| **Accordion** + sub-components | root, header, content, toggleIcon                                            |
| **Tabs** + sub-components      | root, tabList, tab (active state), indicator, panels                         |
| **Menu**                       | root, list, item, itemContent, itemLink, itemIcon, itemLabel, separator      |
| **Menubar**                    | root, rootList, item, itemContent, itemLink, submenu                         |
| **Breadcrumb**                 | root, list, item, itemLink, separator                                        |
| **Avatar**                     | root, icon, label                                                            |
| **ProgressBar**                | root, value, label                                                           |

### Step 1.3: Export from `index.ts`

- Export `generatePrimeVuePT` — used by CLI to generate the PT file
- Export `buildPrimeVuePTObject` — runtime-friendly builder for live token editing in playground

### Step 1.4: Update `cli.ts`

- Add `--pt <filename>` option (default: `primevue-pt.ts`)
- Generate PT file alongside existing outputs
- All four files now generated in one `theme-unify` run

### Step 1.5: Add test (NEW `tests/generators/primevue-pt.test.ts`)

- Verify PT output structure
- Verify severity color mapping correctness
- Verify component section coverage

---

## Phase 2: Playground Migration

_All steps depend on Phase 1 completing._

### Step 2.1: Update `main.ts`

```diff
- import { GeneratedPreset } from "./generated/primevue-preset";
+ import { primevuePT } from "./generated/primevue-pt";

  app.use(PrimeVue, {
-   theme: {
-     preset: GeneratedPreset,
-     options: { darkModeSelector: ".dark" },
-   },
+   unstyled: true,
+   pt: primevuePT,
    ripple: true,
  });
```

### Step 2.2: Generate `src/generated/primevue-pt.ts` (NEW)

Run the updated CLI to produce the PT file (replaces usage of `primevue-preset.ts`).

### Step 2.3: Update `uno.config.ts`

- Add the generated PT file to UnoCSS content filesystem scanning so dynamic class names in JS functions are detected
- Expand safelist to include hover/active/focus state variants used in PT functions

```ts
// Add content scanning:
content: {
  filesystem: ['src/generated/primevue-pt.ts'],
},
```

### Step 2.4: Update `useTokenEditor.ts`

Replace `applyPrimeVueTheme()` (which uses `definePreset`/`usePreset` from `@primeuix/themes`) with:

```ts
function applyPrimeVueTheme(resolved: ResolvedTokens) {
  const newPT = buildPrimeVuePTObject(resolved);
  const pv = usePrimeVue();
  pv.config.pt = newPT;
}
```

- Remove all `@primeuix/themes` imports (Aura, Lara, Nora, Material, definePreset, usePreset)
- Keep runtime CSS injection for UnoCSS shortcut overrides

### Step 2.5: Update `playground/package.json`

- Remove `@primeuix/themes` from dependencies
- Update `generate` script to include `--pt` output

### Step 2.6: Update `style.css`

Add minimal CSS transitions for overlay components since PrimeVue styled mode provided these automatically:

- Dialog fade (enter/leave)
- Drawer slide (enter/leave)
- Toast slide-in animation
- ~20 lines of CSS total using `@keyframes` and transition classes

### Step 2.7: Update `App.vue` (minimal)

- Most template usage stays unchanged — PT handles internal component styling
- The existing UnoCSS utility classes on the wrapper divs (`flex`, `gap`, `p`, etc.) remain
- Add structural classes where PrimeVue styled mode provided default layout internally

### Step 2.8: Update generate script

Modify `playground/package.json` generate script to include `--pt`:

```json
"generate": "theme-unify -c ./tokens.config.ts -o ./src/generated --pt primevue-pt.ts"
```

---

## Phase 3: Verification

1. **Core tests** — `pnpm test` in `packages/core/` — verify PT generator produces correct output
2. **Generate** — `pnpm generate` in `packages/playground/` — verify all four files generated
3. **Visual check** — `pnpm dev` in playground:
   - Buttons: all 8 severities × 3 variants × 3 sizes
   - Forms: InputText, Select, Textarea, Checkbox, DatePicker, Password
   - Data: DataTable with striped rows, sorting, pagination
   - Panels: Card, Accordion, Tabs, Panel collapse/expand
   - Overlays: Dialog, Drawer, Toast, Popover
   - Menus: Menubar, Breadcrumb, Menu
   - Messages: all 6 severities
   - Misc: Tag, Badge, Avatar, ProgressBar, Divider
   - Dark mode toggle
   - UnoCSS palette viewer
4. **Runtime editing** — edit colors in token editor → verify components update at runtime
5. **Build** — `pnpm build` in playground — verify production build succeeds

---

## Relevant Files

| File                                                    | Action  | Key Change                                                                              |
| ------------------------------------------------------- | ------- | --------------------------------------------------------------------------------------- |
| `packages/core/src/generators/primevue-pt.ts`           | **NEW** | PT generator: `semantic.colors` → UnoCSS class mappings → PT sections for 20 components |
| `packages/core/src/types.ts`                            | MODIFY  | Internal `PTSeverityClassMap`, `PTSurfaceClassMap` types                                |
| `packages/core/src/index.ts`                            | MODIFY  | Export `generatePrimeVuePT`, `buildPrimeVuePTObject`                                    |
| `packages/core/src/cli.ts`                              | MODIFY  | Add `--pt` CLI option                                                                   |
| `packages/core/tests/generators/primevue-pt.test.ts`    | **NEW** | PT generator tests                                                                      |
| `packages/playground/src/main.ts`                       | MODIFY  | `unstyled: true, pt: primevuePT` replaces styled preset                                 |
| `packages/playground/src/generated/primevue-pt.ts`      | **NEW** | Generated PT preset (replaces usage of `primevue-preset.ts`)                            |
| `packages/playground/uno.config.ts`                     | MODIFY  | Content scanning for PT file class extraction                                           |
| `packages/playground/src/composables/useTokenEditor.ts` | MODIFY  | Runtime PT builder via `buildPrimeVuePTObject` + `usePrimeVue()`                        |
| `packages/playground/package.json`                      | MODIFY  | Remove `@primeuix/themes`, update generate script                                       |
| `packages/playground/src/style.css`                     | MODIFY  | Add overlay transition CSS                                                              |
| `packages/playground/src/App.vue`                       | MODIFY  | Minimal structural class additions                                                      |

---

## Decisions

- **Keep the old styled generator** (`generatePrimeVue`) — users on styled mode are unaffected; backwards compatible
- **PT is generated, not hand-maintained** — color/theme classes change when tokens change; structural layout classes are stable patterns baked into generator logic
- **Dark mode** uses `dark:` UnoCSS variant in PT classes, matching existing `.dark` selector setup
- **Runtime updates** via `usePrimeVue().config.pt` replacing `usePreset()` — PrimeVue reactively re-renders components when PT changes
- **`@primeuix/themes` removed from playground only** — core package keeps it for styled generator and tests

---

## Notes

1. **UnoCSS class extraction** — The PT file uses dynamic classes in JS functions (e.g., `({ props }) => props.severity === 'danger' ? 'bg-beetroot-500 ...' : ''`). Configure `content.filesystem` in UnoCSS to scan the PT file. Alternative: expand safelist entries.

2. **Transition animations** — PrimeVue styled mode injects CSS transitions for overlay enter/leave via `@primeuix/themes`. In unstyled mode, we need ~20 lines of CSS in `style.css` for Dialog fade, Drawer slide, Toast slide-in animations using standard `@keyframes`.

3. **Components beyond core 20** — The remaining ~50 showcase components (Galleria, Carousel, Stepper, SpeedDial, TreeTable, OrganizationChart, etc.) will render unstyled with no PT. They can be enhanced iteratively, or styled inline with per-component `:pt` props directly in `App.vue`.
