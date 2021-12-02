import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {Project} from '@shared/models/project.model';

@Injectable({
  providedIn: 'root'
})
export class SelectedProjectService {
  private projectSubject: BehaviorSubject<Project> = new BehaviorSubject<Project>(new Project());

  constructor() {
  }

  getSelectedProject(): Observable<Project> {
    return this.projectSubject.asObservable();
  }

  setSelectedProject(project: Project): void {
    this.projectSubject.next(project);
  }
}
