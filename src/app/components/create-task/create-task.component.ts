import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { TodoService } from '../../services/todo.service';
import { Status, Todo } from '../../models/todo.interface';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BoardStore } from '../../store/board.store';

@Component({
  selector: 'app-create-task',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatInputModule,
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './create-task.component.html',
  styleUrls: ['./create-task.component.scss']
})
export class CreateTaskComponent {
  newTask = {
    todo: '',
    status: 'Pending',
    completed: false,
    userId: 152
  };

  constructor(
    private dialogRef: MatDialogRef<CreateTaskComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { 
      userId: number | null;
      editMode: boolean;
      todo: Todo | null;
    }
  ) {
    if (data?.userId) {
      this.newTask.userId = data.userId;
    }

    if (data.editMode && data.todo) {
      this.newTask = { ...data.todo };
    }
  }

  onSubmit() {
    if (this.newTask.todo.trim()) {
      this.dialogRef.close(this.newTask);
    }
  }

  onCancel() {
    this.dialogRef.close(null);
  }
} 