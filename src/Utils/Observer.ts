export interface Observer<T> {
    update(data: T): void;
}

export interface Observable<T> {
    subscribe(subscriber: Observer<T>): void;
    unsubscribe(subscriber: Observer<T>): void
}

export class Notifier<T> implements Observable<T> {
    private subscribers: Set<Observer<T>> = new Set<Observer<T>>();

    subscribe(subscriber: Observer<T>): void {
        this.subscribers.add(subscriber);
    }

    unsubscribe(subscriber: Observer<T>): void {
        this.subscribers.delete(subscriber);
    }

    notify(data: T): void {
        this.subscribers.forEach(subscriber => subscriber.update(data));
    }
}