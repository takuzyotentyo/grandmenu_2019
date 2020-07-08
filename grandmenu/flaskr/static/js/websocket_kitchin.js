$(document).ready(function(){

  if (window.location.protocol == "https:") {
    var ws_scheme = "wss://";
  } else {
    var ws_scheme = "ws://"
  };

  var socket = io(ws_scheme + location.host, {transports: ["websocket"]});

  // 'connect'はクライアント側からサーバー側と繋ぐための特別なイベントで、勝手に行われる
  socket.on('connect', function() {
    // lightbox--ws_errorがvisibleということは、一旦conecctが完了した後に、エラーで接続が切れ、再度connectの処理が必要になったということ
    if($(".lightbox--ws_error").is(':visible')) {
      console.log('リロード')
      socket.emit("reload");
    }else{
      $(".lightbox--ws_error").css('display','none')
      console.log('ソケットkitchin_infomation')
      socket.emit("kitchin_infomation","client has connected");
    };
  });

  socket.on('reload', function(){
    location.reload();
  });

  // 特に意味無し
  socket.on('server_to_client_connection', function(msg){
    console.log(msg);
  });

  // テーブルアクティベートに関する処理
  $(document).on("click", ".table_activate__checkbox", function () {
    // table_numberを取得
    var table_number = {"table_number": $(this).attr("id").replace("table_", "")}
    // チェックボックスにすでにチェックが入っているかと、ポップアップウィンドウの回答によって、activate_statusに変数を入れる
    if($(this).prop("checked") == true) {
      if(confirm("テーブルアクティベートを行いますか？")){
        socket.emit("table_activate", table_number);
      }else{
        // キャンセルをした場合、チェックボックスを戻す
        $(this).prop("checked", false);
      };
    }else{
      if(confirm("会計が終わっていないお客様がいらっしゃる可能性があります。\n本当にOFFにしますか？")){
        socket.emit("table_activate", table_number);
      }else{
        // キャンセルをした場合、チェックボックスを戻す
        $(this).prop("checked", true);
      };
    };
  });

  // table_activateを反映する処理
  socket.on('table_activate', function(table_status){
    console.log("table_activateを実行します")
    var table_number = table_status['table_number']
    var table_number_obj = $("#table_" + table_number)
    var activate_status = table_status['activate_status']
    var one_time_password =  table_status['one_time_password']
    // var qrcode = 'http://groundmenucom.herokuapp.com/qrcode/'
    var qrcode_url = location.protocol + '//' + location.host + '/qrcode/'
    // チェックボックスを動かす処理
    if(activate_status == 1){
      table_number_obj.prop("checked", true);
      table_number_obj.parent().next(".text__body").css("visibility","visible")
      $('.wrapper--qrcode').append(
        '<div id="container_qrcode_' + table_number + '" data-target="qrcode_' + table_number + '" data-one_time_password="' + one_time_password + '"></div>')
      $("#container_qrcode_" + table_number)
        .append(
          '<div class="text__title">Table ' + table_number + '</div>' +
          '<span id="qrcode_' + table_number +'"></span>'
        )
      $("#qrcode_" + table_number).qrcode(qrcode_url + one_time_password);
      console.log(qrcode_url + one_time_password)
    }else{
      table_number_obj.prop("checked", false);
      table_number_obj.parent().next(".text__body")
        .css("visibility","hidden")
        .text('QR確認 >')
      table_number_obj.parent().parent().removeClass('bound')
      $("#container_qrcode_" + table_number).remove();
    };
  });

  socket.on('table_activate_origin', function(table_status){
    console.log("table_activate_originを実行します")
    var activate_status = table_status['activate_status']
    var table_number = table_status['table_number']
    if(activate_status == 1){
      $(".lightbox").children().css("display","none");
      $(".wrapper--qrcode").children().css("display", "none")
      $(".wrapper--qrcode").css("display","");
      $("#container_qrcode_" + table_number).css("display", "")
      $(".lightbox").css("display","flex")
      $('[data-target="lightbox_always_show"]').css("display", "");
      $(".lightbox").animate({left:"0%"}, 250);
    };
  });

  socket.on('show_order', function(data){
    if(data['action']=="show"){
      $(".order_list__wrap").empty();
    };
    var len = data['order_list'].length;
    var order_list = data['order_list']
    // 以下の処理で、order_listをHTML内に組み込む
    if(order_list != []){
      for (var i=0; i<len; i++) {
        var order_id = order_list[i][0]
        var class_1 = order_list[i][1]
        var class_2 = order_list[i][2]
        var class_3 = order_list[i][3]
        var table_number = order_list[i][4]
        var quantity = order_list[i][5]
        $(".order_list__wrap")
          .append('<li class="menu_box--order" id="order_id_'+order_id+'"></li>');
        $('#order_id_' + order_id)
          .append('<span class="menu_box--order__class_2">'+class_2+'</span>')
          .append('<span class="menu_box--order__class_3">'+class_3+'</span>')
          .append('<span class="menu_box--order__table">Table '+table_number+'</span>')
          .append('<span class="menu_box--order__quantity_label">数量</span>')
          .append('<span class="menu_box--order__quantity--kitchen">'+quantity+'</span>')
          .append('<span class="menu_box--order__order_check"></span>')
          .append('<span class="menu_box--order__order_cansel">キャンセル</span>')
      };
    };
    console.log('show_order_fin')
  });

  $(document).on("click", ".menu_box--order__order_check", function () {
    var menu = $(this).siblings(".menu_box--order__class_3").text()
    var quantity = $(this).siblings(".menu_box--order__quantity").text()
    var order_id = $(this).parent().attr("id").replace("order_id_", "")
    var order_status = 3
    // アラートを出して、調理完了を確認
    if(confirm(menu + quantity + "個の調理を完了しましたか？")){
      // OKの時の処理
      socket.emit("order_status_change", {'order_id': order_id, 'order_status':order_status});
    }else{
      // キャンセルの時の処理(何もしない)
    };
  });

  $(document).on("click", ".menu_box--order__order_cansel", function () {
    var menu = $(this).siblings(".menu_box--order__class_3").text()
    var quantity = $(this).siblings(".menu_box--order__quantity").text()
    var order_id = $(this).parent().attr("id").replace("order_id_", "")
    var order_status = 4
    // アラートを出して、キャンセルするかを確認
    if(confirm("本当に" + menu + quantity + "個の調理をキャンセルしますか？")){
      // OKの時の処理
      socket.emit("order_status_change", {'order_id': order_id, 'order_status':order_status});
    }else{
      // キャンセルの時の処理(何もしない)
    };
  });

  socket.on('order_check', function(order_id){
    $('#order_id_' + order_id).remove()
  });

  // 会計依頼をキッチンで受け取る
  socket.on('checkout_for_kitchin', function(checkout){
    console.log('test')
    var table_number = checkout['table_number']
    // var table_number = 1
    var total_fee = checkout['total_fee']
    var table_number_obj = $('#table_' + table_number).parent().parent()
    var change_text_obj = $('#table_' + table_number).parent().siblings('.js-show__qrcode')
    table_number_obj.addClass('bound');
    change_text_obj.text('会計表示 >');
    var check_out_obj = $('#container_qrcode_' + table_number)
    check_out_obj.children('.total_fee').remove()
    check_out_obj.children('.check__submit_for_kitchin_push').remove()
    check_out_obj.append(
      '<div class="text__title total_fee">会計 ¥ ' + total_fee + '</div>' +
      '<button class="form__button check__submit_for_kitchin_push" data-table_number="' + table_number + '">' +
        '<span>確認</span>' +
        '<span>会計</span>' +
      '</button>'
    );
  });

  // 会計を完了する
  $(document).on("click", ".check__submit_for_kitchin_push", function () {
    var table_number = $(this).data('table_number')
    socket.emit("check__submit_for_kitchin_receive", {'table_number': table_number});
  });

  // 会計完了の知らせを受け取る
  socket.on('check__submit_for_kitchin_receive', function(table_number){
    var table_number = table_number['table_number']
    console.log('table_number_'+table_number)
    var table_number_obj = $("#table_" + table_number)
    table_number_obj.prop("checked", false);
    table_number_obj.parent().next(".text__body")
      .css("visibility","hidden")
      .text('QR確認 >')
    table_number_obj.parent().parent().removeClass('bound')
    $("#container_qrcode_" + table_number).remove();
    $.when($(".lightbox").animate({left:"100%"}, 250)).done(function(){
      $(".lightbox").css("display", "none");
      $(".lightbox").children().css("display", "none");
    });
  });

  socket.on('error', function(){
  console.log("接続エラー")
  $(".lightbox--ws_error").css('left','0')
  });

});