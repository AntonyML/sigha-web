# Modern UI Feedback System

This project now includes a comprehensive modern feedback system that replaces traditional browser alerts and console logging with accessible, animated UI components.

## Components Overview

### 1. ToastContainer (`organisms/ToastContainer`)
- Uses Sonner for toast notifications
- Positioned globally in the app layout
- Supports success, error, warning, and info variants
- Auto-dismisses after configurable duration

### 2. ModalManager (`organisms/ModalManager`)
- Uses Radix UI Dialog primitives
- Supports multiple modal types (confirm, alert, custom)
- Includes Framer Motion animations
- Accessible and keyboard navigable

### 3. NotificationCenter (`organisms/NotificationCenter`)
- Persistent notifications with animations
- Supports marking as read/unread
- Auto-dismiss with customizable duration
- Positioned in top-right corner

## Usage

### Basic Feedback Hook

```tsx
import { useFeedbackWithNotifications } from '../hooks/useFeedbackWithNotifications';

function MyComponent() {
  const feedback = useFeedbackWithNotifications();

  const handleSuccess = () => {
    feedback.success('Operation completed successfully');
  };

  const handleError = () => {
    feedback.error('Something went wrong', 'Error Title');
  };

  const handleConfirm = async () => {
    const confirmed = await feedback.confirm('Are you sure?', 'This action cannot be undone');
    if (confirmed) {
      // Proceed with action
    }
  };

  return (
    // Your component JSX
  );
}
```

### Toast Notifications

```tsx
// Simple toast
feedback.success('Data saved successfully');
feedback.error('Failed to save data');
feedback.warning('Please check your input');
feedback.info('New update available');

// Toast with custom title
feedback.success('Profile updated', 'Success');
```

### Modal Dialogs

```tsx
// Confirmation dialog
const confirmed = await feedback.confirm('Delete item?', 'This cannot be undone');

// Custom modal
const result = await feedback.showModal({
  title: 'Custom Modal',
  description: 'Modal description',
  variant: 'custom',
  content: <CustomComponent />,
  confirmText: 'Save',
  cancelText: 'Cancel'
});
```

### Persistent Notifications

```tsx
// Show notification (appears in NotificationCenter)
feedback.showNotification({
  title: 'New Message',
  message: 'You have received a new message',
  variant: 'info',
  duration: 10000, // 10 seconds
  icon: 'bi-envelope-fill'
});
```

## Migration Guide

### Replace `alert()`

**Before:**
```tsx
alert('Data saved successfully');
```

**After:**
```tsx
feedback.success('Data saved successfully');
```

### Replace `window.confirm()`

**Before:**
```tsx
if (window.confirm('Are you sure?')) {
  // Do something
}
```

**After:**
```tsx
const confirmed = await feedback.confirm('Are you sure?');
if (confirmed) {
  // Do something
}
```

### Replace `console.log()` for user feedback

**Before:**
```tsx
console.log('Operation completed');
```

**After:**
```tsx
feedback.info('Operation completed');
```

## Available Methods

### Toast Methods
- `success(message, title?)` - Green success toast
- `error(message, title?)` - Red error toast
- `warning(message, title?)` - Yellow warning toast
- `info(message, title?)` - Blue info toast

### Modal Methods
- `confirm(title, description?)` - Returns Promise<boolean>
- `showModal(options)` - Returns Promise<boolean> with full modal control

### Notification Methods
- `showNotification(options)` - Shows persistent notification

## Provider Setup

The system is automatically available throughout the app via:

```tsx
// App.tsx
<FeedbackProvider>
  <NotificationProvider>
    <AppLayout>
      {/* Your app content */}
    </AppLayout>
  </NotificationProvider>
</FeedbackProvider>
```

## Accessibility

- All components use Radix UI primitives for accessibility
- Keyboard navigation support
- Screen reader compatible
- Focus management
- ARIA labels and roles

## Animation

- Framer Motion for smooth animations
- Toast slide-in/out animations
- Modal scale/fade transitions
- Notification slide animations

## Styling

- Tailwind CSS for consistent styling
- Bootstrap Icons integration
- Responsive design
- Dark/light theme support (extensible)