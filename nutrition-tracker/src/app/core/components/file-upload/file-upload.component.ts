import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
/**
 * https://www.geeksforgeeks.org/angular-file-upload/
 */
@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
})
export class FileUploadComponent {
  file: File | null = null;

  @Output() fileUploaded = new EventEmitter<File>();

  onChange(event: any) {
    this.file = event.target.files[0];
  }

  onUpload() {
    if (!this.file || this.file === null) return;

    console.log(this.file);
    this.fileUploaded.emit(this.file);
  }
}
