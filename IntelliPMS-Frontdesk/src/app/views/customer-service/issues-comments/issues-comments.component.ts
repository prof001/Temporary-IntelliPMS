import { Component, OnInit } from '@angular/core';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {GuestModel} from '../../../models/guest.model';
import {HttpService} from '../../../shared/http.service';
import {IssueCommentModel} from '../../../models/issue-comment.model';
import {formatDate} from '@angular/common';
import {RandomListsService} from '../../../shared/random-lists.service';
import {CheckinOutModel} from '../../../models/checkin-out.model';

@Component({
  selector: 'app-issues-comments',
  templateUrl: './issues-comments.component.html',
  styleUrls: ['./issues-comments.component.css']
})
export class IssuesCommentsComponent implements OnInit {
  modalRef; autocompleteDivDisplay = 'none';
  issueComment: IssueCommentModel = new IssueCommentModel();
  issueCommentAlert = false;
  unprocessedIssuesComments: IssueCommentModel[] = [];
  processingIssuesComments: IssueCommentModel[] = [];
  completedIssuesComments: IssueCommentModel[] = [];
  unprocessedIssuesCommentsNumber;
  chosenRoom: CheckinOutModel = new CheckinOutModel();
  checkedInRooms: CheckinOutModel[] = [];
  date; time; minDate;
  hotelId = localStorage.getItem('hotelId');
  employeeId = localStorage.getItem('employeeId');
  processing = false;

  constructor(
    private modalService: NgbModal,
    private httpService: HttpService,
    private randomList: RandomListsService) { }

  ngOnInit(): void {
    this.getProcessingIssuesComments();
    this.getUnprocessedIssuesComments();
    this.getCompletedIssuesComments();
    this.countUnprocessedRequests();
    this.setCurrentDateTime();
    this.getCheckedInRooms();
  }

  submitIssueComment() {
    this.processing = true;
    const createdDateTime =
      `${this.date.year}-${this.date.month}-${this.date.day} ${this.time.hour}:${this.time.minute}:00`;
    const issueCommentDetails = {
      guestId: this.chosenRoom.payingGuestId,
      checkInId: this.chosenRoom.checkInId,
      createdDateTime,
      createdBy: this.employeeId,
      ...this.issueComment
    };
    this.httpService.createIssueComment(`customer-service/${this.hotelId}/issues-comments/create`, issueCommentDetails)
      .subscribe(
      res => {
        this.processing = false;
        this.issueCommentAlert = true;
        this.getProcessingIssuesComments();
        this.getUnprocessedIssuesComments();
        this.getCompletedIssuesComments();
        this.countUnprocessedRequests();
        this.getCheckedInRooms();
        this.issueComment = new IssueCommentModel();
      },
      err => {
        this.processing = false;
        console.log(err);
      }
    );
    this.modalRef.close();
  }

  getGuestName() {
    this.chosenRoom = this.checkedInRooms.filter(e => e.roomId === +this.issueComment.roomId)[0];
    const minDateArr = this.chosenRoom.checkInDate.split(/[-T.: ]/);
    this.minDate = {
      year: +minDateArr[0],
      month: +minDateArr[1],
      day: +minDateArr[2]
    };

    if (this.chosenRoom.currentOccupant !== null) {
      this.issueComment.guestName = this.chosenRoom.currentOccupant;
    } else {
      this.issueComment.guestName = 'Multiple Occupants';
    }
  }

  getCheckedInRooms() {
    this.httpService.getCurrentCheckedInRooms(`hotels/${this.hotelId}/currentCheckInRooms`).subscribe(
      res => {
        this.checkedInRooms = res;
      },
      err => {
        console.log(err);
      }
    );
  }

  open(content) {
    this.modalRef = this.modalService.open(content);
    this.modalRef.result.then(() => {
    }, () => {});
  }

  getUnprocessedIssuesComments() {
    this.httpService.getIssuesCommentsList(`customer-service/${this.hotelId}/issues-comments?statuss=unprocessed`)
      .subscribe(
      res => {
        this.unprocessedIssuesComments = res;
        const createdDateTime = this.unprocessedIssuesComments.map(obj => this.extractDateTime(obj.createdDateTime));
        // tslint:disable-next-line:forin
        for (const i in this.unprocessedIssuesComments) {
          this.unprocessedIssuesComments[i].createdDateTime = createdDateTime[i][0];
        }
      },
      err => {
        console.log(err);
      }
    );
  }

  countUnprocessedRequests() {
    this.httpService.countUnprocessedIssuesComments(`customer-service/${this.hotelId}/issues-comments/countUnprocessed`)
      .subscribe(
      res => {
        // @ts-ignore
        this.unprocessedIssuesCommentsNumber = res.num;
      },
      err => {
        console.log(err);
      }
    );
  }

  getProcessingIssuesComments() {
    this.httpService.getIssuesCommentsList(`customer-service/${this.hotelId}/issues-comments?statuss=processing`)
      .subscribe(
      res => {
        this.processingIssuesComments = res;
        const createdDateTime = this.processingIssuesComments.map(obj => this.extractDateTime(obj.createdDateTime));
        // tslint:disable-next-line:forin
        for (const i in this.processingIssuesComments) {
          this.processingIssuesComments[i].createdDateTime = createdDateTime[i][0];
        }
      },
      err => {
        console.log(err);
      }
    );
  }

  getCompletedIssuesComments() {
    this.httpService.getIssuesCommentsList(`customer-service/${this.hotelId}/issues-comments?statuss=resolved`)
      .subscribe(
      res => {
        this.completedIssuesComments = res;
        const createdDateTime = this.completedIssuesComments.map(obj => this.extractDateTime(obj.createdDateTime));
        const resolvedDateTime = this.completedIssuesComments.map(obj => this.extractDateTime(obj.resolvedDateTime));

        // tslint:disable-next-line:forin
        for (const i in this.completedIssuesComments) {
          this.completedIssuesComments[i].createdDateTime = createdDateTime[i][0];
          this.completedIssuesComments[i].resolvedDateTime = resolvedDateTime[i][0];
        }
      },
      err => {
        console.log(err);
      }
    );
  }

  updateIssuesComments(action, issueCommentId) {
    this.processing = true;
    let issuesCommentsDetails;
    const fDateTime = formatDate(new Date(), 'yyyy-MM-dd HH:mm:SS', 'en');
    const resolvedDateTime = this.randomList.parseDateTime(fDateTime);
    if (action === 'processing') {
      issuesCommentsDetails = {action, issueCommentId};
    } else if (action === 'resolved') {
      issuesCommentsDetails = {action,  issueCommentId, resolvedDateTime};
    }
    this.httpService.updateIssuesComments(`customer-service/${this.hotelId}/issues-comments/update`, issuesCommentsDetails)
      .subscribe(
      res => {
        this.processing = false;
        this.getUnprocessedIssuesComments();
        this.countUnprocessedRequests();
        this.getProcessingIssuesComments();
        this.getCompletedIssuesComments();
      },
      err => {
        this.processing = false;
        console.log(err);
      }
    );
  }

  extractDateTime(dateTime) {
    const resDateTime = dateTime.split(/[-T.: ]/);

    if (resDateTime[3] <= 12) {
      return [`${resDateTime[2]}/${resDateTime[1]}/${resDateTime[0]} ${resDateTime[3]}:${resDateTime[4]} AM`];
    } else {
      let adjustedTime = resDateTime[3] % 12;
      if (adjustedTime < 10) {
        // @ts-ignore
        adjustedTime = '0' + adjustedTime;
      }
      return [`${resDateTime[2]}/${resDateTime[1]}/${resDateTime[0]} ${adjustedTime}:${resDateTime[4]} PM`];
    }
  }

  setCurrentDateTime() {
    const dateTime = formatDate(new Date(), 'yyyy-MM-dd HH:mm:SS', 'en');
    const dateTimeArray = dateTime.split(/[-: ]/);
    const currentTimeArray = [];

    // tslint:disable-next-line:forin
    for (const i of dateTimeArray) {
      currentTimeArray.push(+i);
    }

    this.date = {
      year: currentTimeArray[0],
      month: currentTimeArray[1],
      day: currentTimeArray[2]
    };
    this.time = {
      hour: currentTimeArray[3],
      minute: currentTimeArray[4],
      second: currentTimeArray[5]
    };
  }
}
