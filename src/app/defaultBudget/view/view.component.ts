import { Component, OnInit } from '@angular/core';
import * as $ from 'jquery';
@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss']
})
export class ViewComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
    $('.alertMain').hide();

  }

  hideAlert(){
    $('.alertMain').hide(1000);
  }
}
