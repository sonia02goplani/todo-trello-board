import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, moveItemInArray, transferArrayItem, DragDropModule } from '@angular/cdk/drag-drop';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { TodoService } from '../../services/todo.service';
import { Todo, Lane } from '../../models/todo.interface';
import { CreateTaskComponent } from '../create-task/create-task.component';
import { BoardStore } from '../../store/board.store';
import { take } from 'rxjs/operators';
import { Status } from '../../models/todo.interface';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DragDropModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatPaginatorModule,
    MatSelectModule
  ]
})
export class BoardComponent implements OnInit {
  boardStore = inject(BoardStore);
  lanes$ = this.boardStore.lanes$;
  totalTodos$ = this.boardStore.totalTodos$;
  loading$ = this.boardStore.loading$;
  error$ = this.boardStore.error$;
  
  connectedLists: string[] = [];
  
  users = Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    name: `User ${i + 1}`
  }));

  constructor(
    private dialog: MatDialog
  ) {
    this.connectedLists = ['pending', 'in-progress', 'completed'];
  }

  ngOnInit(): void {
    this.boardStore.loadTodos();
  }

  onUserChange(userId: number | null): void {
    this.boardStore.setSelectedUser(userId);
  }

  onPageChange(event: PageEvent): void {
    this.boardStore.setPagination({ pageSize: event.pageSize, pageIndex: event.pageIndex });
    this.boardStore.loadTodos();
  }

  onDrop(event: CdkDragDrop<Todo[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      const todo = event.container.data[event.currentIndex];
      let newStatus: Status;

      // Map container ID to Status
      switch(event.container.id) {
        case 'in-progress':
          newStatus = Status.InProgress;
          break;
        case 'completed':
          newStatus = Status.Completed;
          break;
        default:
          newStatus = Status.Pending;
      }
      
      // Update the todo in the store with new status
      this.boardStore.editTodo({
        todoId: todo.id,
        changes: { 
          status: newStatus,
          completed: newStatus === Status.Completed
        }
      });
    }
  }

  deleteTodo(todo: Todo): void {
    this.boardStore.deleteTodo(todo.id);
  }

  editTodo(todo: Todo): void {
    const dialogRef = this.dialog.open(CreateTaskComponent, {
      width: '500px',
      disableClose: false,
      data: { 
        userId: todo.userId,
        editMode: true,
        todo: { ...todo }
      }
    });

    dialogRef.afterClosed().subscribe(updatedTodo => {
      if (updatedTodo) {
        // Keep the original ID and userId when updating
        this.boardStore.editTodo({
          todoId: todo.id,
          changes: {
            ...updatedTodo,
            id: todo.id,
            userId: todo.userId
          }
        });
      }
    });
  }

  openCreateTaskDialog(): void {
    this.boardStore.selectedUserId$.pipe(take(1)).subscribe(userId => {
      const dialogRef = this.dialog.open(CreateTaskComponent, {
        width: '500px',
        disableClose: false,
        data: { 
          userId,
          editMode: false,
          todo: null
        }
      });

      dialogRef.afterClosed().subscribe(newTask => {
        if (newTask) {
          this.boardStore.addTodo(newTask);
        }
      });
    });
  }
} 