import { Component, OnInit } from '@angular/core';
import {ExternalLinkTemplate, SearchCriteria} from "../models/externalLinkTemplate";
import {ToastrService} from "ngx-toastr";
import {MatDialog} from "@angular/material/dialog";
import {SettingsDialogComponent} from "../settings-dialog/settings-dialog.component";

@Component({
  selector: 'app-config',
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.scss']
})
export class ConfigComponent implements OnInit {
  items: ExternalLinkTemplate[] = [];
  loading: boolean = true;

  constructor(private toastr: ToastrService, public dialog: MatDialog) { }

  ngOnInit(): void {
    this.loading = false;
  }

  remove(removableItem: ExternalLinkTemplate) {
    this.items.splice(this.items.findIndex(item => item.id === removableItem.id,1));
    this.toastr.success(removableItem.linkName + ' removed.');
  }

  openDialog() {
    const dialogRef = this.dialog.open(SettingsDialogComponent, {
      width: '90%',
      data: new ExternalLinkTemplate()
    });

    dialogRef.afterClosed().subscribe(result => {
      this.items.push(result);
    });
  }
}
