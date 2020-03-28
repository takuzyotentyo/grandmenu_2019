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
  var now = new Date(selected_year + '/' + selected_month + '/' + selected_day)
  if(now.getMonth() + 1 == selected_month){
    var selected_day = now.getDate()
  }else{
    var selected_day = new Date(selected_year, selected_month, 0).getDate()
  };
  var now = new Date(selected_year + '/' + selected_month + '/' + selected_day)
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
  console.log(i)
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
  var select_day = new Date( y+'/'+m+'/'+d )
  var wd = [ '日', '月', '火', '水', '木', '金', '土' ]
  var w = wd[ select_day.getDay() ]
  datepicker.val(y + '年' + m + '月' + d + '日' + '(' + w + ')');
  datepicker.next().slideUp()
});

$(function(){
  $('#js-calender_submit_day').on('click',function(){
    var period_day = $('#period_day').val()
    var data ={'period_day':period_day}
    console.log(period_day)
    if (period_day != '') {
      console.log(data)
      var a = window.sessionStorage.getItem(['store_id']);
      console.log(a);
      $.ajax({
          url:'/sales_management/day_sales_data',
          type:'POST',
          data:JSON.stringify(data),
          contentType:'application/json',
      })
      // Ajaxリクエストが成功した時発動
      .done( (data) => {
        // $('.result').html(data);
        console.log(data);
        console.log('done');
        $('.wrapper--message').empty()
        $('.wrapper--sales_data').empty()
        $('.wrapper--menu_list').empty()
        // var period_day = data['period'][0]
        var period_day_pre = new Date(data['period'][0])
        var y = period_day_pre.getFullYear();
        var m = period_day_pre.getMonth() + 1;
        var d = period_day_pre.getDate();
        var w = period_day_pre.getDay();
        var wd = ['日', '月', '火', '水', '木', '金', '土'];
        var period_day = y+'年'+m+'月'+d+'日'+'('+wd[w]+')'
        var order_data = data['order_data']
        var menu_list = data['menu_list']
        var len_order_data = order_data.length;
        var len_menu_list = menu_list.length
        var i
        // var order_data = data;
        // 以下の処理で、dataをHTML内に組み込む
        for (i=0; i<len_order_data; i++) {
          var dataObj = new Object();
          dataObj.order_id = order_data[i][0]
          dataObj.class_1 = order_data[i][1]
          dataObj.class_2 = order_data[i][2]
          dataObj.class_3 = order_data[i][3]
          dataObj.price = parseInt(order_data[i][4])
          dataObj.order_quantity = parseInt(order_data[i][5])
          dataObj.order_status = parseInt(order_data[i][6])
          dataObj.table_number = parseInt(order_data[i][7])
          dataObj.group_id = parseInt(order_data[i][8])
          dataObj.menu_id = parseInt(order_data[i][9])
          $('.wrapper--sales_data').append('<span class="sales_data--' + i + '"></span>')
          $('.sales_data--' + i).data(dataObj)
          var class_3 = $('.sales_data--'+ i).data("class_3");
          console.log(class_3)
        };
        for (i=0; i<len_menu_list; i++) {
          var menuObj = new Object();
          menuObj.menu_id = menu_list[i][0]
          menuObj.class_1 = menu_list[i][1]
          menuObj.class_2 = menu_list[i][2]
          menuObj.class_3 = menu_list[i][3]
          menuObj.price = parseInt(menu_list[i][4])
          $('.wrapper--menu_list').append('<span class="menu_list--' + i + '"></span>')
          $('.menu_list--' + i).data(menuObj)
        };
        $('.wrapper--message').append(
          '<div class="text__subtitle">'+ period_day +'の売上</div>');
        var total_sales = 0
        for (i=0; i<len_order_data; i++) {
          if ($('.sales_data--' + i).data('order_status')==5)
            total_sales = total_sales + ($('.sales_data--' + i).data('price') * $('.sales_data--' + i).data('order_quantity'));
            console.log(total_sales)
        };
        $('.wrapper--message').append(
          '<div class="text__title">¥ ' + total_sales + '</div>');
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
    };
  });
});

$(function(){
  // Ajax button click
  $('#js-calender_submit_period').on('click',function(){
    var period_start = $('#period_start').val()
    var period_end = $('#period_end').val()
    var data ={'period_start':period_start, 'period_end':period_end}
    console.log(period_start)
    console.log(period_end)
    console.log(data)
    $.ajax({
        url:'/sales_management/period_sales_data',
        type:'POST',
        data:JSON.stringify(data),
        contentType:'application/json',
    })
  // Ajaxリクエストが成功した時発動
    .done( (data) => {
        // $('.result').html(data);
        console.log(data);
        console.log('done');
        $('.wrapper--message').empty()
        $('.wrapper--sales_data').empty()
        $('.wrapper--menu_list').empty()
        var period_start_pre = new Date(data['period'][0])
        var y_start = period_start_pre.getFullYear();
        var m_start = period_start_pre.getMonth() + 1;
        var d_start = period_start_pre.getDate();
        var w_start = period_start_pre.getDay();
        var wd_start = ['日', '月', '火', '水', '木', '金', '土'];
        var period_start = y_start+'年'+m_start+'月'+d_start+'日'+'('+wd_start[w_start]+')'
        var period_end_pre = new Date(data['period'][1])
        var y_end = period_end_pre.getFullYear();
        var m_end = period_end_pre.getMonth() + 1;
        var d_end = period_end_pre.getDate() - 1;
        var w_end = period_end_pre.getDay();
        var wd_end = ['日', '月', '火', '水', '木', '金', '土'];
        var period_end = y_end+'年'+m_end+'月'+d_end+'日'+'('+wd_end[w_end]+')'
        var order_data = data['order_data']
        var menu_list = data['menu_list']
        var len_order_data = order_data.length;
        var len_menu_list = menu_list.length
        var i
        // var order_data = data;
        // 以下の処理で、dataをHTML内に組み込む
        for (i=0; i<len_order_data; i++) {
          var dataObj = new Object();
          dataObj.order_id = order_data[i][0]
          dataObj.class_1 = order_data[i][1]
          dataObj.class_2 = order_data[i][2]
          dataObj.class_3 = order_data[i][3]
          dataObj.price = parseInt(order_data[i][4])
          dataObj.order_quantity = parseInt(order_data[i][5])
          dataObj.order_status = parseInt(order_data[i][6])
          dataObj.table_number = parseInt(order_data[i][7])
          dataObj.group_id = parseInt(order_data[i][8])
          dataObj.menu_id = parseInt(order_data[i][9])
          $('.wrapper--sales_data').append('<span class="sales_data--' + i + '"></span>')
          $('.sales_data--' + i).data(dataObj)
          var class_3 = $('.sales_data--'+ i).data("class_3");
          console.log(class_3)
        };
        for (i=0; i<len_menu_list; i++) {
          var menuObj = new Object();
          menuObj.menu_id = menu_list[i][0]
          menuObj.class_1 = menu_list[i][1]
          menuObj.class_2 = menu_list[i][2]
          menuObj.class_3 = menu_list[i][3]
          menuObj.price = parseInt(menu_list[i][4])
          $('.wrapper--menu_list').append('<span class="menu_list--' + i + '"></span>')
          $('.menu_list--' + i).data(menuObj)
        };
        $('.wrapper--message').append(
          '<div class="text__subtitle">' + period_start + ' から ' + period_end + 'の売上</div>'
        );
        var total_sales = 0
        for (i=0; i<len_order_data; i++) {
          if ($('.sales_data--' + i).data('order_status')==5)
            total_sales = total_sales + ($('.sales_data--' + i).data('price') * $('.sales_data--' + i).data('order_quantity'));
            console.log(total_sales)
        };
        $('.wrapper--message').append(
          '<div class="text__title">¥ ' + total_sales + '</div>');
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

$(function(){
  $('.button__bar_chart').on('click',function(){
    var orderArray = []
    var coefficientArray = []
    var total = 0
    var menuObj = new Object()
    var price = 0
    $('.wrapper--menu_list').children().each(function(index, element){
    // console.log(index + ':' + $(element).data('menu_id')+':'+$(element).data('class_3'));
    var class_3 = $(element).data('class_3')
    var menu_id = $(element).data('menu_id')
    var subtotal = 0
    var quantity = 0
    menuObj ={}
    quantity = 0
    price = $(element).data('price')
      $('.wrapper--sales_data').children().each(function(index, element){
        if ($(element).data('menu_id') == menu_id && $(element).data('order_status')==5){
          quantity = quantity + $(element).data('order_quantity')
        };
      });
      subtotal = price * quantity
      total = total + subtotal
      console.log(class_3 + "の小計は" + subtotal)
      menuObj.class_3 = class_3
      menuObj.subtotal = subtotal
      orderArray.push(menuObj)
      coefficientArray.push(subtotal)
    })
    console.log(orderArray)
    console.log('合計' + total)
    var coefficient = Math.max.apply(null, coefficientArray) / 100
    console.log(coefficient)
    $('.chart__title').text('メニュー別売上');
    $('.chart__total').text('合計 ¥ ' + total)
    var len = orderArray.length
    var i=0
    $('.chart__bars').empty()
    for (i=0; i<len; i++) {
      $('.chart__bars').append(
        '<li class="chart__bar" style = "width:' + orderArray[i]['subtotal'] / coefficient +'%;">' +
        '<span class="chart__bar_label">' + orderArray[i]['class_3'] + '</span>' +
        '<span class="chart__bar_label">¥ ' + orderArray[i]['subtotal'] + '</span>' +
        '</li>'
        )
    };
  });
});

$(function(){
  $('.button__books').on('click',function(){
    var orderArray = []
    $('.wrapper--sales_data').children().each(function(index, element){
      var menuObj = new Object()
      var class_3 = $(element).data('class_3')
      var quantity = $(element).data('order_quantity')
      var price = $(element).data('price')
      menuObj.class_3 = class_3
      menuObj.quantity = quantity
      menuObj.price = price
      orderArray.push(menuObj)
    });
    console.log(orderArray)
    var len = orderArray.length
    var i = 0
    var j = 0
    var total = 0
    var subtotal = 0
    $('.wrapper--sales_books').empty()
    $('.wrapper--sales_books').append(
      '<li class="sales_book--header">' +
        '<span class="sales_book__item--center">注文履歴</span>' +
      '</li>' +
      '<li class="sales_book--header">' +
        '<span class="sales_book__item">No.</span>' +
        '<span class="sales_book__item">品名</span>' +
        '<span class="sales_book__item--left">金額</span>' +
        '</li>'
      )
    for (i=0; i<len; i++) {
      j = j+1
      subtotal = orderArray[i]['price'] * orderArray[i]['quantity']
      total = total+subtotal
      $('.wrapper--sales_books').append(
        '<li class="sales_book">' +
          '<span class="sales_book__item">' + j + '.</span>' +
          '<span class="sales_book__item">' + orderArray[i]['class_3'] + '</span>' +
          '<span class="sales_book__item--left">¥ ' + subtotal + '</span>' +
        '</li>'
      )
    };
    $('.wrapper--sales_books').append(
      '<li class="sales_book--total">' +
        '<span class="sales_book__item--left">¥ ' +total + '</span>'+
      '</li>'
      )
  });
});
