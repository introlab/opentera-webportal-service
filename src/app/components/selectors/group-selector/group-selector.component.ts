import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {Router} from '@angular/router';
import {SelectedProjectService} from '@services/selected-project.service';
import {GroupService} from '@services/participant/group.service';
import {SelectedGroupService} from '@services/selected-group.service';
import {combineLatest, Subscription} from 'rxjs';
import {distinctUntilChanged, switchMap} from 'rxjs/operators';
import {Group} from '@shared/models/group.model';

@Component({
  selector: 'app-group-selector',
  templateUrl: './group-selector.component.html',
  styleUrls: ['./group-selector.component.scss']
})
export class GroupSelectorComponent implements OnInit, OnDestroy {
  @Input() allOption: boolean;
  @Output() selectedProjectChange = new EventEmitter();
  groups: Group[] = [];
  refreshing: boolean;
  selectedGroup: Group;
  private subscription: Subscription;

  constructor(private router: Router,
              private groupService: GroupService,
              private selectedGroupService: SelectedGroupService,
              private selectedProjectService: SelectedProjectService) {
  }

  ngOnInit(): void {
    this.getGroups();
  }

  private getGroups(): void {
    const selectedGroup$ = this.selectedGroupService.getSelectedGroup();
    const selectedProject$ = this.selectedProjectService.getSelectedProject();

    this.subscription = selectedProject$.pipe(
      distinctUntilChanged((a, b) => a.id_project === b.id_project),
      switchMap((selectedProject) => {
        this.refreshing = true;
        return combineLatest([selectedGroup$, this.groupService.getByProject(selectedProject.id_project)]);
      })
    ).subscribe(([selectedGroup, groups]) => {
      this.groups = groups;
      this.setSelectedGroup(selectedGroup);
      this.checkIfUniqueGroup();
      this.refreshing = false;
    });
  }

  private checkIfUniqueGroup(): void {
    if (!!this.groups && this.groups.length === 1) {
      this.onValueChanged(this.groups[0]);
    }
  }

  onValueChanged(selected: Group): void {
    if (this.isDifferentGroup(selected)) {
      if (!!selected) {
        this.selectedGroupService.setSelectedGroup(selected);
      } else {
        this.selectedGroupService.setSelectedGroup(null);
      }
    }
  }

  private isDifferentGroup(group: Group): boolean {
    return this.selectedGroup?.id_participant_group !== group?.id_participant_group;
  }

  private setSelectedGroup(selectedGroup: Group): void {
    if (selectedGroup) {
      const alreadySelected = this.groups.find(p => p.id_participant_group === selectedGroup.id_participant_group);
      if (alreadySelected) {
        this.selectedGroup = alreadySelected;
      }
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
