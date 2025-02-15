import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Status, Todo } from '../models/todo.interface';

export interface TodoResponse {
  todos: Todo[];
  total: number;
  skip: number;
  limit: number;
}

@Injectable({
  providedIn: 'root'
})
export class TodoService {
  private apiUrl = 'https://dummyjson.com/todos';

  constructor(private http: HttpClient) {}

  getTodos(limit: number = 10, skip: number = 0): Observable<TodoResponse> {
    return this.http.get<TodoResponse>(`${this.apiUrl}?limit=${limit}&skip=${skip}`).pipe(
      map(response => ({
        ...response,
        todos: this.mapTodosWithStatus(response.todos)
      }))
    );
  }

  getTodosByUserId(userId: number, limit: number = 10, skip: number = 0): Observable<TodoResponse> {
    return this.http.get<TodoResponse>(`${this.apiUrl}/user/${userId}?limit=${limit}&skip=${skip}`).pipe(
      map(response => ({
        ...response,
        todos: this.mapTodosWithStatus(response.todos)
      }))
    );
  }

  private mapTodosWithStatus(todos: Todo[]): Todo[] {
    return todos.map(todo => ({
      ...todo,
      status: todo.completed ? Status.Completed : Status.Pending
    }));
  }

  addTodo(todo: Partial<Todo>): Observable<Todo> {
    return this.http.post<Todo>(`${this.apiUrl}/add`, todo);
  }

  updateTodo(id: number, todo: Partial<Todo>): Observable<Todo> {
    return this.http.put<Todo>(`${this.apiUrl}/${id}`, todo);
  }

  deleteTodo(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
} 