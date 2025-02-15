export interface Todo {
    id: number;
    todo: string;
    description?: string;
    completed: boolean;
    userId: number;
    status: Status;
    isDeleted?: boolean;
}

export enum Status {
    Pending = 'Pending',
    InProgress = 'In Progress',
    Completed = 'Completed'
}

export interface Lane {
    id: string;
    title: string;
    todos: Todo[];
}