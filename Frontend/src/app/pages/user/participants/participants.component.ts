import {AfterViewInit, Component, EventEmitter, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MatSort} from '@angular/material/sort';
import {MatPaginator} from '@angular/material/paginator';
import {MatTableDataSource} from '@angular/material/table';
import {combineLatest, Subscription} from 'rxjs';
import {Participant} from '@shared/models/participant.model';
import {NotificationService} from '@services/notification.service';
import {MatDialog} from '@angular/material/dialog';
import {Router} from '@angular/router';
import {SelectedProjectService} from '@services/selected-project.service';
import {switchMap, take} from 'rxjs/operators';
import {ParticipantService} from '@services/participant/participant.service';
import {ConfirmationComponent} from '@components/confirmation/confirmation.component';
import {Pages} from '@core/utils/pages';
import {ParticipantFormComponent} from '@components/forms/participant-form/participant-form.component';
import {SelectedGroupService} from '@services/selected-group.service';
import {createParticipantUrl, isObjectEmpty} from '@core/utils/utility-functions';
import {ThemePalette} from '@angular/material/core';
import {Clipboard} from '@angular/cdk/clipboard';
import {SelectedParticipantService} from '@services/selected-participant.service';
import {MatSlideToggleChange} from '@angular/material/slide-toggle';

@Component({
  selector: 'app-participants',
  templateUrl: './participants.component.html',
  styleUrls: ['./participants.component.scss']
})
export class ParticipantsComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild(MatSort, {static: false}) sort: MatSort;
  @ViewChild(MatPaginator, {static: false}) paginator: MatPaginator;
  participants: Participant[] = [];
  dataSource: MatTableDataSource<Participant>;
  displayedColumns: string[] = ['participant_name', 'group', 'status', 'url', 'controls'];
  showCopyButton = 0;
  color: ThemePalette = 'primary';
  showInactive = false;
  private subscriptions: Subscription[] = [];

  constructor(private notificationService: NotificationService,
              public dialog: MatDialog,
              private router: Router,
              private clipboard: Clipboard,
              private selectedParticipantService: SelectedParticipantService,
              private selectedGroupService: SelectedGroupService,
              private participantService: ParticipantService,
              private selectedProjectService: SelectedProjectService) {
    this.setDataSource();
  }

  private static createEmptyParticipant(): Participant {
    const newPart = new Participant();
    newPart.id_participant = 0;
    newPart.participant_enabled = true;
    newPart.participant_login_enabled = false;
    return newPart;
  }

  ngOnInit(): void {
    this.getParticipants();
    this.refreshParticipants();
  }

  private refreshParticipants(): void {
    const selectedProject$ = this.selectedProjectService.getSelectedProject();
    const selectedGroup$ = this.selectedGroupService.getSelectedGroup();

    this.subscriptions.push(
      combineLatest([selectedProject$, selectedGroup$]).pipe(
        switchMap(([project, group]) => {
          if (isObjectEmpty(group)) {
            return this.participantService.getByProject(project.id_project);
          } else {
            return this.participantService.getByGroup(group.id_participant_group);
          }
        })
      ).subscribe()
    );
  }

  private getParticipants(): void {
    this.subscriptions.push(
      this.participantService.participants$().subscribe((participants) => {
        this.participants = participants;
        this.participants.forEach((participant) => {
          participant.connection_url = createParticipantUrl(participant.participant_token);
        });
        this.setDataSource();
      })
    );
  }

  private setDataSource(): void {
    this.dataSource = new MatTableDataSource(this.participants);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.dataSource.filterPredicate = this.doFiltering;
    this.applyInactiveFilter();
  }

  ngAfterViewInit(): void {
    this.dataSource = new MatTableDataSource(this.participants);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = JSON.stringify({target: 'name', filter: filterValue.trim()});
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  deactivate(participant: Participant): void {
    if (participant.participant_enabled) {
      this.confirmDeactivation(participant);
    } else {
      this.confirmDelete(participant);
    }
  }

  private confirmDeactivation(participant: Participant): void {
    const dialogRef = this.dialog.open(ConfirmationComponent, {
      width: '350px',
      data: 'Si le participant est réactivé, le lien pour se connecter changera. Continuer?'
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const temp = new Participant();
        temp.participant_enabled = false;
        temp.participant_token_enabled = false;
        temp.id_participant_group = participant.id_participant_group;
        temp.id_project = participant.id_project;
        temp.id_participant = participant.id_participant;
        this.participantService.update(temp).subscribe(() => {
          this.notificationService.showSuccess('Le participant ' + participant.participant_name + ' a été désactivé.');
        }, (err) => {
          console.error('Ce compte ne possède pas les permissions pour désactiver ce participant.', err);
          this.notificationService.showError('Ce compte ne possède pas les permissions pour désactiver ce participant.');
        });
      }
    });
  }

  private confirmDelete(participant: Participant): void {
    const dialogRef = this.dialog.open(ConfirmationComponent, {
      width: '350px',
      data: 'Êtes-vous sûr de vouloir supprimer ce participant?'
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.participantService.delete(participant.id_participant).subscribe(() => {
          this.notificationService.showSuccess('Le participant ' + participant.participant_name + ' a été supprimé.');
        }, (err) => {
          console.error('Ce compte ne possède pas les permissions pour supprimer ce participant.', err);
          this.notificationService.showError('Ce compte ne possède pas les permissions pour supprimer ce participant.');
        });
      }
    });
  }

  openForm(participant: Participant): void {
    const copy = {...participant};
    const dialogRef = this.dialog.open(ParticipantFormComponent, {
      width: '500px',
      disableClose: true,
      data: !!participant ? copy : ParticipantsComponent.createEmptyParticipant()
    });

    dialogRef.afterClosed().pipe(
      take(1)
    ).subscribe((result) => {
      this.refreshParticipants();
    });
  }

  openCalendar(participant: Participant): void {
    this.selectedParticipantService.setSelectedParticipant(participant);
    this.router.navigate([Pages.calendarPage]);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  copyUrl(url: string): void {
    this.clipboard.copy(url);
    this.notificationService.showSuccess('Le lien a été copié.');
  }

  toggleInactive(toggleEvent: MatSlideToggleChange): void {
    this.showInactive = toggleEvent.checked;
    this.applyInactiveFilter();
  }

  applyInactiveFilter(): void{
    this.dataSource.filter = JSON.stringify({target: 'disabled_only', filter: this.showInactive});
  }

  doFiltering(data: Participant, filter: string): boolean {
    const filter_details = JSON.parse(filter);
    if (filter_details.target === 'name'){
      return data.participant_name.toLowerCase().includes(filter_details.filter.toLowerCase());
    }
    if (filter_details.target === 'disabled_only'){
      if (filter_details.filter){
        return true;
      }else{
        return data.participant_enabled;
      }
    }
    return true; // Default: no filter
  }
}
