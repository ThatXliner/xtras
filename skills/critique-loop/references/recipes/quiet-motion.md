# Quiet Motion

**Look:** UI motion you feel rather than watch: fast, purposeful, and gone before it gets in the way.
**Good for:** product UI, interactions, transitions, component animation.

## Whether to animate

- **Animation needs a purpose:** explaining where something came from, showing a state change, or feedback for an action. "It looks cool" isn't one for anything users see often.
- **Never animate keyboard-initiated or high-frequency actions.** Something used a hundred times a day feels slow with any animation at all.
- **Save delight for rare moments:** onboarding, first-time use, celebrations.

## How it moves

- **Fast.** UI animation stays under about 300 ms: press feedback 100–160 ms, tooltips 125–200 ms, dropdowns 150–250 ms, modals and drawers 200–500 ms.
- **Ease-out for UI, never ease-in.** Ease-in starts slow, so the interface feels like it's lagging behind the user.
- **Nothing appears from nothing.** Scale from about 0.95 with opacity, not from 0.
- **Buttons answer a press** (a slight scale-down on active).
- **Springs for things the user drags or throws,** so motion keeps the momentum of the gesture.
- **Animate named properties,** not `all`, so nothing unexpected moves.
