import { Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { Observable, switchMap, tap, forkJoin, map } from 'rxjs';
import { TodoService } from '../services/todo.service';
import { Todo, Lane, Status } from '../models/todo.interface';

interface BoardState {
  tasksByUser: { [userId: number]: Todo[] };
  lanes: Lane[];
  totalTodos: number;
  loading: boolean;
  error: string | null;
  selectedUserId: number | null;
  pageSize: number;
  pageIndex: number;
}

const initialState: BoardState = {
  tasksByUser: {},
  lanes: [
    { id: 'pending', title: 'Pending', todos: [] },
    { id: 'in-progress', title: 'In Progress', todos: [] },
    { id: 'completed', title: 'Completed', todos: [] }
  ],
  totalTodos: 0,
  loading: false,
  error: null,
  selectedUserId: null,
  pageSize: 10,
  pageIndex: 0
};

@Injectable()
export class BoardStore extends ComponentStore<BoardState> {
  constructor(private todoService: TodoService) {
    super(initialState);
  }

  // Selectors
  readonly lanes$ = this.select(state => state.lanes);
  readonly totalTodos$ = this.select(state => state.totalTodos);
  readonly loading$ = this.select(state => state.loading);
  readonly error$ = this.select(state => state.error);
  readonly selectedUserId$ = this.select(state => state.selectedUserId);
  readonly pagination$ = this.select(state => ({
    pageSize: state.pageSize,
    pageIndex: state.pageIndex
  }));

  // Updaters
  readonly setLoading = this.updater((state, loading: boolean) => ({
    ...state,
    loading
  }));

  readonly setError = this.updater((state, error: string | null) => ({
    ...state,
    error
  }));

  readonly setSelectedUser = this.updater((state, userId: number | null) => {
    const newState = {
      ...state,
      selectedUserId: userId,
      pageIndex: 0
    };
    
    // Update lanes for the selected user
    const userTodos = userId 
      ? state.tasksByUser[userId] || []
      : Object.values(state.tasksByUser).flat();

    return {
      ...newState,
      lanes: state.lanes.map(lane => ({
        ...lane,
        todos: userTodos.filter(todo => 
          lane.id === todo.status.toLowerCase().replace(' ', '-')
        )
      }))
    };
  });

  readonly setPagination = this.updater((state, { pageIndex, pageSize }: { pageIndex: number; pageSize: number }) => ({
    ...state,
    pageIndex,
    pageSize
  }));

  // Effects
  readonly loadTodos = this.effect((trigger$: Observable<void>) => {
    return trigger$.pipe(
      tap(() => this.setLoading(true)),
      switchMap(() => {
        // Load todos for all users (1-10)
        const userIds = Array.from({ length: 10 }, (_, i) => i + 1);
        const requests = userIds.map(userId => 
          this.todoService.getTodosByUserId(userId).pipe(
            map(response => ({ userId, todos: response.todos }))
          )
        );

        return forkJoin(requests).pipe(
          tap({
            next: (responses) => {
              // Create tasksByUser map
              const tasksByUser = responses.reduce((acc, { userId, todos }) => {
                acc[userId] = todos;
                return acc;
              }, {} as { [key: number]: Todo[] });

              // Calculate total todos
              const totalTodos = Object.values(tasksByUser).reduce(
                (sum, todos) => sum + todos.length, 
                0
              );

              this.patchState(state => ({
                ...state,
                tasksByUser,
                totalTodos,
                loading: false
              }));

              // Update lanes based on selected user
              this.updateLanesForSelectedUser();
            },
            error: (error) => {
              this.setLoading(false);
              this.setError(error.message);
            }
          })
        );
      })
    );
  });

  // Update lanes based on selected user
  private updateLanesForSelectedUser() {
    this.patchState(state => {
      const userTodos = state.selectedUserId 
        ? state.tasksByUser[state.selectedUserId] || []
        : Object.values(state.tasksByUser).flat();

      return {
        ...state,
        lanes: state.lanes.map(lane => ({
          ...lane,
          todos: userTodos.filter(todo => 
            lane.id === todo.status.toLowerCase().replace(' ', '-')
          )
        }))
      };
    });
  }

  readonly editTodo = this.effect((update$: Observable<{ todoId: number, changes: Partial<Todo> }>) => {
    return update$.pipe(
      tap(({ todoId, changes }) => {
        this.patchState(state => {
          const updatedTasksByUser = { ...state.tasksByUser };
          let updatedTodo: Todo | null = null;
          
          // Find and update the todo in tasksByUser
          for (const userId in updatedTasksByUser) {
            const todoIndex = updatedTasksByUser[userId].findIndex(t => t.id === todoId);
            if (todoIndex !== -1) {
              updatedTodo = {
                ...updatedTasksByUser[userId][todoIndex],
                ...changes,
                id: todoId,
                userId: Number(userId)
              };
              
              updatedTasksByUser[userId] = [
                ...updatedTasksByUser[userId].slice(0, todoIndex),
                updatedTodo,
                ...updatedTasksByUser[userId].slice(todoIndex + 1)
              ];
              break;
            }
          }

          if (!updatedTodo) return state;

          // Get current view todos
          const userTodos = state.selectedUserId 
            ? updatedTasksByUser[state.selectedUserId] || []
            : Object.values(updatedTasksByUser).flat();

          // Update lanes with the modified todos
          const updatedLanes = state.lanes.map(lane => ({
            ...lane,
            todos: userTodos.filter(todo => 
              lane.id === todo.status.toLowerCase().replace(' ', '-')
            )
          }));

          return {
            ...state,
            tasksByUser: updatedTasksByUser,
            lanes: updatedLanes
          };
        });
      })
    );
  });

  readonly deleteTodo = this.effect((todoId$: Observable<number>) => {
    return todoId$.pipe(
      tap((todoId) => {
        this.patchState(state => ({
          ...state,
          lanes: state.lanes.map(lane => ({
            ...lane,
            todos: lane.todos.map(todo => 
              todo.id === todoId 
                ? { ...todo, isDeleted: true }
                : todo
            ).filter(todo => !todo.isDeleted)
          }))
        }));
      })
    );
  });

  readonly addTodo = this.effect((todo$: Observable<Todo>) => {
    return todo$.pipe(
      tap((newTodo) => {
        this.patchState(state => {
          const userId = newTodo.userId;
          
          // Create a new todo with a temporary ID
          const todoWithId = {
            ...newTodo,
            id: Date.now(), // Use timestamp as temporary ID
            status: Status.Pending // Always start in Pending
          };

          // Update tasksByUser
          const updatedTasksByUser = {
            ...state.tasksByUser,
            [userId]: [
              todoWithId,
              ...(state.tasksByUser[userId] || [])
            ]
          };

          // Get current view todos
          const userTodos = state.selectedUserId 
            ? updatedTasksByUser[state.selectedUserId] || []
            : Object.values(updatedTasksByUser).flat();

          return {
            ...state,
            tasksByUser: updatedTasksByUser,
            totalTodos: state.totalTodos + 1,
            lanes: state.lanes.map(lane => ({
              ...lane,
              todos: lane.id === 'pending'
                ? [todoWithId, ...lane.todos]
                : lane.todos
            }))
          };
        });
      })
    );
  });

  // Helper method to find a todo by id across all lanes
  readonly findTodoById = (todoId: number) => {
    const state = this.get();
    for (const lane of state.lanes) {
      const todo = lane.todos.find(t => t.id === todoId);
      if (todo) return todo;
    }
    return null;
  };
} 