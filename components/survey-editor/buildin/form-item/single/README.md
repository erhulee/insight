# Single Question Component

This module provides a sortable single-choice question component with drag and drop functionality using `@dnd-kit`.

## Structure

```
single/
├── index.ts              # Main exports
├── render.tsx            # Main component
├── types.ts              # TypeScript interfaces
├── hooks/
│   ├── useSortableOptions.ts  # Custom hook for drag and drop logic
│   └── useCardSelection.ts    # Custom hook for card selection logic
├── utils/
│   └── idGenerator.ts    # ID generation utilities
└── schema.tsx            # Schema definition
```

## Features

- ✅ Drag and drop reordering of options
- ✅ Real-time option editing
- ✅ Add new options with unique IDs
- ✅ Smooth animations and visual feedback
- ✅ Keyboard accessibility
- ✅ Touch device support
- ✅ **Global card selection** - Click anywhere on the card to select the question
- ✅ **Smart event handling** - Prevents selection when clicking interactive elements

## Usage

```tsx
import { SingleQuestion } from './components/survey-editor/buildin/form-item/single'

function MyComponent() {
  const dsl = {
    // your question DSL
  }
  
  return <SingleQuestion dsl={dsl} />
}
```

## Custom Hooks

### useSortableOptions
Encapsulates all the drag and drop logic:

```tsx
import { useSortableOptions } from './hooks/useSortableOptions'

const {
  sortableItems,
  sensors,
  handleDragStart,
  handleDragEnd,
  addOption,
  updateOption,
  activeItem,
} = useSortableOptions(dsl)
```

### useCardSelection
Manages card selection logic with smart event handling:

```tsx
import { useCardSelection } from './hooks/useCardSelection'

const {
  handleCardClick,
  handleDragStart,
  handleDragEnd,
} = useCardSelection(questionId)
```

## Card Selection Behavior

The component automatically handles question selection when clicking anywhere on the card, except for:

- Input fields (text inputs, textareas)
- Buttons (including the "Add Option" button)
- Radio buttons
- Drag handles and draggable elements
- Elements with specific ARIA roles

This ensures that:
- Users can click anywhere on the card to select the question
- Interactive elements work as expected without triggering selection
- Drag and drop functionality is not interfered with

## ID Generation

Each option gets a unique ID when created:

```typescript
// Format: opt_1703123456789_abc123
const newOption = {
  label: '新选项',
  value: generateUniqueId(),
  id: generateUniqueId(),
}
```

## Dependencies

- `@dnd-kit/core` - Core drag and drop functionality
- `@dnd-kit/sortable` - Sortable list functionality
- `@dnd-kit/utilities` - Utility functions
- `antd` - Radio component
- `lucide-react` - Icons 