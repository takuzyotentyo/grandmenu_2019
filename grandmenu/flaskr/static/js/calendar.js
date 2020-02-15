var show_calendar = function(add_month, datepicker, calendar){
  if(datepicker.val().match(/^[0-9]*年[0-9]*月[0-9]*日\(.\)$/)){
    console.log('true')
    var selected_year = parseInt(datepicker.val().replace(/年[0-9].*/g, ""))
    var selected_month = parseInt(datepicker.val().replace(/[0-9]*年|月[0-9]*日\(.\)/g, "")) + add_month
    var selected_day = parseInt(datepicker.val().replace(/[0-9]*年[0-9]*月|日\(.\)/g, ""))
  }else{
    console.log('false')
    var now = new Date();
    var selected_year = now.getFullYear()
    var selected_month = now.getMonth() + 1
    var selected_day = now.getDate()
  };
// 月の設定(1月の時や、12月の時に年を変える)
  if(selected_month==0){
    var selected_year = selected_year - 1
    var selected_month = 12
  }else if(selected_month==13){
    var selected_year = selected_year + 1
    var selected_month = 1
  }else{
  };
// 日の設定(4月31日が存在しないので5月1日になってしまったりする現象の対応)
  var now = new Date(selected_year + '-' + selected_month + '-' + selected_day)
  if(now.getMonth() + 1 == selected_month){
    var selected_day = now.getDate()
  }else{
    var selected_day = new Date(selected_year, selected_month, 0).getDate()
  };
  var now = new Date(selected_year + '-' + selected_month + '-' + selected_day)
  calendar.empty()
  var y = now.getFullYear();
  var m = now.getMonth() + 1;
  var d = now.getDate();
  var w = now.getDay();
  var wd = ['日', '月', '火', '水', '木', '金', '土'];
  console.log(y + ',' + m + ',' + d + ',' +w)
  // 月初の日付を取得
  var ms = new Date(y, m-1, 1).getDate()
  // 月末の曜日を取得
  var msw = new Date(y, m-1, 1).getDay()
  // 月末の日付を取得
  var me = new Date(y, m, 0).getDate()
  // 先月末の日付を取得
  var lme = new Date(y, m-1, 0).getDate()
  datepicker.val(y + '年' + m + '月' + d + '日' + '(' + wd[w] + ')');
  calendar
    .append('<div class="carender__header"></div>')
    .append('<div class="carender__year_month">' + y + ' 年 ' + m + ' 月</div>')
  calendar.children('.carender__header')
    .append(
      '<div class="carender__today">今日</div>',
      '<div class="carender__last_month">←</div>',
      '<div class="carender__next_month">→</div>');
  for(var i=0; i<7; i++){
    calendar.append('<div class="carender__week">' + wd[i] + '</div>')
  };
  for(var i=0; i<msw; i++){
    var lme = new Date(y, m-1, i-msw).getDate()
    calendar.append('<div class="carender__days--other_month">' + lme + '</div>')
  };
  for(var i=1; i<=me; i++){
    calendar.append('<div class="carender__days">' + i + '</div>')
  };
  var nm = 42-msw-me
  for (var i=1; i<=nm; i++){
    calendar.append('<div class="carender__days--other_month">' + i + '</div>')
  };
  calendar.children('.carender__days').eq(selected_day-1)
  .text("")
  .append('<div class="carender__select_day">' + selected_day + '</div>');
};

$(document).on("click", ".js-datepicker", function(){
  var datepicker = $(this)
  var calendar = $(this).next()
  if(calendar.is(':visible')){
    calendar.css('display','none')
  }else{
    calendar.css('display','flex')
    show_calendar(0, datepicker, calendar)
  };
});

$(document).on("click", ".carender__today", function (){
  var datepicker = $(this).parent().parent().prev()
  var calendar = $(this).parent().parent()
  datepicker.val('')
  show_calendar(0, datepicker, calendar)
});

$(document).on("click", ".carender__next_month", function (){
  var datepicker = $(this).parent().parent().prev()
  var calendar = $(this).parent().parent()
  show_calendar(1, datepicker, calendar)
});

$(document).on("click", ".carender__last_month", function (){
  var datepicker = $(this).parent().parent().prev()
  var calendar = $(this).parent().parent()
  show_calendar(-1, datepicker, calendar)
});

$(document).on("click", ".carender__days", function (){
  var select_obj = $(this);
  var select = $(this).text();
  var selected_obj = $(this).siblings().children('.carender__select_day').parent()
  var selected = selected_obj.children('.carender__select_day').text()
  var datepicker = $(this).parent().prev()
  $('.carender__select_day').remove()
  selected_obj.text(selected)
  select_obj
    .text("")
    .append('<div class="carender__select_day">' + select + '</div>');
  var y = select_obj.siblings('.carender__year_month').text().replace(/ 年 [0-9]* 月/g, "")
  var m = select_obj.siblings('.carender__year_month').text().replace(/([0-9]{4} 年 | 月)/g, "")
  var d = select
  var select_day = new Date( y+'-'+m+'-'+d )
  var wd = [ '日', '月', '火', '水', '木', '金', '土' ]
  var w = wd[ select_day.getDay() ]
  datepicker.val(y + '年' + m + '月' + d + '日' + '(' + w + ')');
  datepicker.next().slideUp()
});

$(function(){
  // Ajax button click
  $('#js-calender_submit_period').on('click',function(){
    console.log('kkk')
    $.ajax({
        url:'/period_sales_data',
        type:'POST',
        data:{
            'period_start':$('#period_start').val(),
            'period_end':$('#period_end').val()
        }
    })
    // $.ajax({
    //   url: "/activate_json",
    //   type: 'post',
    //   data: JSON.stringify(data),
    //   dataType: 'json',
    //   contentType: 'application/json',

  // Ajaxリクエストが成功した時発動
    .done( (data) => {
        // $('.result').html(data);
        console.log(data);
        console.log('done');
    })
    // Ajaxリクエストが失敗した時発動
    .fail( (data) => {
        // $('.result').html(data);
        console.log(data);
        console.log('fail');
    })
    // Ajaxリクエストが成功・失敗どちらでも発動
    .always( (data) => {
      console.log('always');
    });
  });
});



