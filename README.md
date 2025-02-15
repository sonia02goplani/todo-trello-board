# Todo Trello Board

A reactive Kanban board built with Angular and NgRx Component Store, featuring drag-and-drop functionality and user-based task management.

## Features

- Drag and drop tasks between lanes (Pending, In Progress, Completed)
- Filter tasks by user
- Create, edit, and delete tasks
- Reactive state management using NgRx Component Store
- Responsive design
- Local state persistence during session

## Live Demo

[View Demo](https://sonia02goplani.github.io/todo-trello-board)

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Angular CLI (v16 or higher)

### Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Run the development server: `npm start`
4. Open your browser and navigate to `http://localhost:4200`

## Technical Approach

### Architecture

The application follows a reactive architecture using:
- Angular (Standalone Components)
- NgRx Component Store for state management
- Angular Material for UI components
- Angular CDK for drag-and-drop functionality

### State Management

The application uses NgRx Component Store to manage state with the following features:
- Segregated tasks by user ID
- Local filtering without API calls
- Optimistic updates for better UX
- Reactive state updates across components

### Key Design Decisions

1. **Standalone Components**: Utilized Angular's standalone components for better modularity and tree-shaking.

2. **Local State Management**: Tasks are stored by user ID in the store, enabling:
   - Quick filtering without API calls
   - Improved performance
   - Better user experience

3. **Drag and Drop**: Implemented using Angular CDK for:
   - Native-feeling interactions
   - Automatic state updates
   - Cross-lane task movement

## Trade-offs and Potential Improvements

### Current Trade-offs

1. **Local State**: 
   - Pros: Fast interactions, no API latency
   - Cons: State is lost on page refresh

2. **In-Memory Storage**:
   - Pros: Quick access and updates
   - Cons: Limited by browser memory

3. **Optimistic Updates**:
   - Pros: Immediate user feedback
   - Cons: Potential state inconsistency with backend

### Potential Improvements

1. **Persistence**:
   - Implement localStorage/sessionStorage for state persistence
   - Add backend synchronization
   - Handle offline capabilities

2. **Performance**:
   - Implement virtual scrolling for large task lists
   - Add pagination for better memory management
   - Optimize state updates for large datasets

3. **Features**:
   - Add task due dates and priorities
   - Implement task search and filtering
   - Add user authentication
   - Add task comments and attachments
   - Implement board customization

4. **Testing**:
   - Add comprehensive unit tests
   - Implement E2E testing
   - Add performance testing

5. **UX Improvements**:
   - Add loading skeletons
   - Improve error handling
   - Add undo/redo functionality
   - Implement keyboard shortcuts



    