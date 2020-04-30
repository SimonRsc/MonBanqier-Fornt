import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import * as $ from 'jquery';
@Component({
  selector: 'app-main-view',
  templateUrl: './main-view.component.html',
  styleUrls: ['./main-view.component.scss']
})
export class MainViewComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
    $(".alertMain").hide();
  }



  hideAlert(){
    $('.alertMain').hide(1500);
  }
  toggleSidebar(){
    $('#sideBar').toggleClass('active');
    $('#filtre').toggle();
    $('#expandButton').toggleClass('active');
  }
}
