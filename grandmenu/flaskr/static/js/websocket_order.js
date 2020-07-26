$(document).ready(function(){

  if (window.location.protocol == "https:") {
    var ws_scheme = "wss://";
  } else {
    var ws_scheme = "ws://"
  };

  var socket = io.connect(ws_scheme + location.host);

  socket.on('connect', function() {
    set_cart()
    set_history()
    console.log('OK1')
    // lightbox--ws_errorがvisibleの場合、conecctが完了した後に、エラーで接続が切れ、再度connectの処理が必要になったということ
    if($(".lightbox--ws_error").is(':visible')) {
      socket.emit("reload");
    }else{
      $(".lightbox--ws_error").css('display','flex')
    socket.emit("order_list_show");
    };
  });

  // カートと注文履歴を表示
  socket.on('order_list_show', function(order_list){
    var order_menu, order_status,
        i = 0, len = order_list.length
        console.log('OK2')
    for (i=0; i<len; i++) {
      order_menu = order_list[i]
      order_status = parseInt(order_list[i][6])
      // カート内の商品を表示
      if (order_status == 0 || order_status == 1){
        add_cart(order_menu)
      }else{
        add_order_history(order_menu)
      };
    };
    // カート内の数・合計、履歴の合計を計算
    console.log('OK3')
    calc_cart()
    calc_history()
  });

  socket.on('cart_reset', function(){
    console.log('cart_reset')
    set_cart()
    calc_cart()
  });

  socket.on('reload', function(){
    location.reload();
  });

  socket.on('server_to_client_message', function(msg){
    console.log(msg);
  });

  $(document).on("click", ".menu_box--class_3__add_to_cart", function () {
    var quantity = $(this).siblings('input[type="number"]').val(),
        menu_id = $(this).siblings('input[type="checkbox"]').attr("value"),
        add_to_cart = {'menu_id': menu_id, 'quantity': quantity};
    //正の数且つ整数の時のみカートに加える判定
    if(quantity > 0 && Number.isInteger(quantity) == false){
      $(this).siblings('input[type="number"]').val("")
      socket.emit("add_to_cart", add_to_cart);
    }else{
      $(this).siblings('input[type="number"]').val("")
    };
  });

  socket.on('check_request', function(total_fee){
    $('.wrapper--main').children().remove();
    $('.header__cart').remove();
    $('.wrapper--main').append('<div class="wrapper--checkout fadein"></div>')
    $('.wrapper--checkout').append(
      '<div class="text__subtitle">お客様のお会計は</div>'+
      '<div class="text__title">' + total_fee + ' 円です</div>'+
      '<div class="text__subtitle">レジにお進みください</div>'
    );
  });

  socket.on('error', function(){
    console.log("接続エラー")
    $(".lightbox--ws_error").css({
      "left":"0%",
      "visibility":"visible"
    });
  });

  $(document).on("click", ".menu_box--order__increase", function () {
    var quantity = parseInt($(this).siblings('input[type="number"]').val()) +1,
        order_id = $(this).parent().attr("id").replace("order_id_", ""),
        change_cart = {'order_id': order_id, 'quantity': quantity}
    socket.emit("change_order_quantity", change_cart);
  });

  $(document).on("click", ".menu_box--order__decrease", function () {
    var quantity = parseInt($(this).siblings('input[type="number"]').val()) -1,
        order_id = $(this).parent().attr("id").replace("order_id_", ""),
        change_cart = {'order_id': order_id, 'quantity': quantity}
    socket.emit("change_order_quantity", change_cart);
  });

  $(document).on("click", ".menu_box--order__garbage", function () {
    var quantity = 0,
        order_id = $(this).parent().attr("id").replace("order_id_", ""),
        change_cart = {'order_id': order_id, 'quantity': quantity}
    console.log('削除ボタン押した')
    socket.emit("change_order_quantity", change_cart);
  });

  $(document).on("click", "#order_submit", function () {
    if(confirm("一緒にご来店頂いたお客様が\n注文をカートに追加している場合があります。\n本当にオーダーを確定しますか？")){
      socket.emit("order_submit");
    };
  });

  $(document).on("click", "#check_request", function () {
    if(confirm("お会計を行いますか？")){
      socket.emit("check_request");
    };
  });


  // このjsで使用する関数
  // カートの内容を整える
  function set_cart(subtotal_class){
    $('.wrapper--cart').empty()
        .append(
          '<div class="menu_box--order__food">Food</div>' +
          '<div class="menu_box--order__drink">drink</div>' +
          '<div class="total--order"></div>' +
          '<button class="form__button" id="order_submit"></button>'
        );
    $('#order_submit')
      .append(
        '<span>確定</span>' +
        '<span>注文</span>'
      );
  };

  // 履歴の内容を整える
  function set_history(subtotal_class){
    $('.wrapper--order_history').empty()
      .append(
        '<div class="menu_box--order_history__food">Food</div>' +
        '<div class="menu_box--order_history__drink">drink</div>' +
        '<div class="total--order_history"></div>' +
        '<button class="form__button" id="check_request" type="submit"></button>'
      );
    $('#check_request')
      .append(
        '<span>確定</span>' +
        '<span>会計</span>'
      );
  };

  function calc_cart(){
    var total_quantity = 0, subtotal_quantity,
        total_fee = 0, subtotal_fee
    $(".menu_box--order__quantity").each(function () {
      subtotal_quantity = parseInt($(this).val())
      total_quantity += subtotal_quantity
    });
    $(".menu_box--order__subtotal").each(function () {
      subtotal_fee = parseInt($(this).text().replace("小計 ¥ ", ""))
      total_fee += subtotal_fee
    });
    $(".header__quantity").text(total_quantity)
    $(".total--order").text('合計 ¥ ' + total_fee)
  };

  function calc_history(){
    var total = 0, subtotal
    $(".menu_box--order_history__subtotal").each(function () {
      subtotal = parseInt($(this).text().replace("小計 ¥ ", ""))
      total += subtotal
    });
    $(".total--order_history").text('合計 ¥ ' + total)
  };

  // カートに追加する関数
  function add_cart(order_menu){
    var order_id = order_menu[0],
        class_1 = order_menu[1],
        class_2 = order_menu[2],
        class_3 = order_menu[3],
        price = parseInt(order_menu[4]),
        quantity = parseInt(order_menu[5]),
        order_status = parseInt(order_menu[6])
        subtotal = price * quantity
    console.log('quantityは')
    console.log(quantity)
    // カート内にアイテムが存在するか確認
    if($('#order_id_' + order_id).length){
      // 存在していて、quantityが0の場合消す、他の場合は数量を変更
      if(quantity==0){
        $("#order_id_" + order_id).remove();
      }else{
        $('#order_id_' + order_id).children('input[type="number"]').val(quantity)
        $('#order_id_' + order_id).children(".menu_box--order__subtotal").text("小計 ¥ " + subtotal)
      };
    }else{
      $(".menu_box--order__" + class_1)
      .after('<li class="menu_box--order" id="order_id_' + order_id + '"></li>');
    $('#order_id_' + order_id)
      .append(
        '<span class="menu_box--order__class_2">' + class_2 + '</span>' +
        '<span class="menu_box--order__class_3">' + class_3 + '</span>' +
        '<span class="menu_box--order__price">¥ ' + price + '</span>' +
        '<span class="menu_box--order__quantity_label">数量</span>' +
        '<span class="menu_box--order__increase">+</span>' +
        '<input class="menu_box--order__quantity" min="0" type="number" pattern="\d" value="'+ quantity +'" disabled>' +
        '<span class="menu_box--order__decrease">-</span>' +
        '<span class="menu_box--order__garbage"></span>' +
        '<span class="menu_box--order__subtotal">小計 ¥ '+ subtotal + '</span>'
      );
    };
  };

  // 注文履歴に追加する関数
  function add_order_history(order_menu){
    var order_status_obj, subtotal_obj, subtotal, status_label,
        order_id = order_menu[0],
        class_1 = order_menu[1],
        class_2 = order_menu[2],
        class_3 = order_menu[3],
        price = parseInt(order_menu[4]),
        quantity = parseInt(order_menu[5]),
        order_status = parseInt(order_menu[6])

    if(order_status==2){
      status_label = '調理中'
      subtotal = price*quantity
    }else if(order_status==3){
      status_label = '調理完了'
      subtotal = price*quantity
    }else if(order_status==5){
      status_label = '会計依頼'
      subtotal = price*quantity
    }else{
      status_label = 'キャンセル'
      subtotal = 0
    };

    if($('#order_id_' + order_id).length){
      $('#order_id_'+order_id).children('.menu_box--order_history__order_status').text(status_label)
      $('#order_id_'+order_id).children('.menu_box--order_history__subtotal').text('小計 ¥ ' + subtotal)
    }else{
      $(".menu_box--order_history__" + class_1)
        .after('<li class="menu_box--order_history" id="order_id_' + order_id + '"></li>');
      $('#order_id_' + order_id)
        .append(
          '<span class="menu_box--order_history__class_2">' + class_2 + '</span>' +
          '<span class="menu_box--order_history__class_3">' + class_3 + '</span>' +
          '<span class="menu_box--order_history__price">¥ ' + price + '</span>' +
          '<span class="menu_box--order_history__quantity_label">数量</span>' +
          '<span class="menu_box--order_history__quantity">' + quantity + '</span>' +
          '<span class="menu_box--order_history__subtotal">小計 ¥ ' + subtotal +'</span>' +
          '<span class="menu_box--order_history__order_status">' + status_label + '</span>'
        );
    };
  };

  function change_order_history(order_menu){
    var order_id = order_history['order_id'],
        order_status = order_history['order_status']
    if(order_status==3){
      $('#order_id_'+order_id).children('.menu_box--order_history__order_status').text('調理完了');
    }else{
      $('#order_id_'+order_id).children('.menu_box--order_history__order_status').text('キャンセル')
      $('#order_id_'+order_id).children('.menu_box--order_history__subtotal').text('小計 ¥ 0')
    };
  };

// -----ここまで修正済み

  // socket.on('cart', function(cart){
  //   // カート内の数量を変更
  //   $('.header__quantity').text(cart['total_quantity']);
  //   if(cart['action']=="show" || cart['action']=="submit"){
  //     // 子要素を一度消して、再度表示させる処理は、websocketが意図せず切れたときのために必要
  //     console.log("cart['action']は")
  //     console.log(cart['action'])
  //     $('.wrapper--cart')
  //       .empty()
  //       .append('<div class="menu_box--order__food">Food</div>')
  //       .append('<div class="menu_box--order__drink">drink</div>')
  //       .append('<div class="total--order"></div>')
  //       .append('<button class="form__button" id="order_submit"></button>')
  //     $('#order_submit')
  //       .append('<span>確定</span>')
  //       .append('<span>注文</span>')
  //   };
  //   if(cart['action']=="show" || cart['action']=="add" || cart['action']=="change"){
  //     console.log("以下の処理でオーダーを追加")
  //     console.log(cart['order_list'])
  //     var len = cart['order_list'].length;
  //     // cart['order_list']はORDER_ID, CLASS_1, CLASS_2, CLASS_3, PRICE, ORDER_QUANTITY]
  //     var order_list = cart['order_list']
  //     // 以下の処理で、menu_listをHTML内に組み込む
  //     for (var i=0; i<len; i++) {
  //       var order_id = order_list[i][0]
  //       var class_1 = order_list[i][1]
  //       var class_2 = order_list[i][2]
  //       var class_3 = order_list[i][3]
  //       var price = parseInt(order_list[i][4])
  //       var order_quantity = parseInt(order_list[i][5])
  //       // メニューがカート内に存在しているかを調べ、なければ新しく追加
  //       if($('#order_id_' + order_id).length){
  //         // 存在していて、order_quantityが0の場合消して、他の場合は数量を変更
  //         if(order_quantity==0){
  //           $("#order_id_" + order_id).remove();
  //         }else{
  //           $('#order_id_' + order_id).children('input[type="number"]').val(order_quantity)
  //           $('#order_id_' + order_id).children(".menu_box--order__subtotal").text("小計 ¥ " + price * order_quantity);
  //         };
  //       }else{
  //         $(".menu_box--order__" + class_1).after('<li class="menu_box--order" id="order_id_' + order_id + '"></li>');
  //         $('#order_id_' + order_id)
  //           .append('<span class="menu_box--order__class_2">' + class_2 + '</span>')
  //           .append('<span class="menu_box--order__class_3">' + class_3 + '</span>')
  //           .append('<span class="menu_box--order__price">¥ ' + price + '</span>')
  //           .append('<span class="menu_box--order__quantity_label">数量</span>')
  //           .append('<span class="menu_box--order__increase">+</span>')
  //           .append('<input class="menu_box--order__quantity" min="0" type="number" pattern="\d" value="'+ order_quantity +'" disabled>')
  //           .append('<span class="menu_box--order__decrease">-</span>')
  //           .append('<span class="menu_box--order__garbage"></span>')
  //           .append('<span class="menu_box--order__subtotal">小計 ¥ '+ price * order_quantity + '</span>')
  //       console.log(order_list[i][3]);
  //       };
  //     };
  //   };
  //   var total_int = 0
  //     $(".menu_box--order__subtotal").each(function () {
  //       var subtotal_int = parseInt($(this).text().replace("小計 ¥ ", ""));
  //       total_int += subtotal_int;
  //     });
  //     var total = '合計 ¥ ' + total_int
  //     $(".total--order").text(total);
  // });


  // order_history['order_item']はORDER_ID, CLASS_1, CLASS_2, CLASS_3, PRICE, ORDER_QUANTITY]の順
  // socket.on('order_history', function(order_history){
  //   console.log("オーダーが履歴に追加されました")
  //   // order_history['action']は、show,addのどちらかの値を持つ
  //   if (order_history['action']=="show"){
  //     $('.wrapper--order_history')
  //       .empty()
  //       .append('<div class="menu_box--order_history__food">Food</div>')
  //       .append('<div class="menu_box--order_history__drink">drink</div>')
  //       .append('<div class="total--order_history"></div>')
  //       .append('<button class="form__button" id="order_check" type="submit"></button>')
  //     $('#order_check')
  //       .append('<span>確定</span>')
  //       .append('<span>会計</span>')
  //   };
  //   if(order_history['action']=="show" || order_history['action']=="add"){
  //     var len = order_history['order_history'].length;
  //     var order_history = order_history['order_history']
  //     // 以下の処理で、order_historyをHTML内に組み込む
  //     for (var i=0; i<len; i++) {
  //       var order_id = order_history[i][0]
  //       var class_1 = order_history[i][1]
  //       var class_2 = order_history[i][2]
  //       var class_3 = order_history[i][3]
  //       var price = parseInt(order_history[i][4])
  //       var order_quantity = parseInt(order_history[i][5])
  //       var order_status = parseInt(order_history[i][6])
  //       console.log(order_status)
  //       $(".menu_box--order_history__" + class_1).after('<li class="menu_box--order_history" id="order_id_' + order_id + '"></li>');
  //       $('#order_id_' + order_id)
  //         .append('<span class="menu_box--order_history__class_2">' + class_2 + '</span>')
  //         .append('<span class="menu_box--order_history__class_3">' + class_3 + '</span>')
  //         .append('<span class="menu_box--order_history__price">¥ ' + price + '</span>')
  //         .append('<span class="menu_box--order_history__quantity_label">数量</span>')
  //         .append('<span class="menu_box--order_history__quantity">' + order_quantity + '</span>')
  //         .append('<span class="menu_box--order_history__subtotal"></span>')
  //         .append('<span class="menu_box--order_history__order_status"></span>')
  //       order_history_obj = $('#order_id_' + order_id).children('.menu_box--order_history__order_status')
  //       subtotal_obj = $('#order_id_' + order_id).children('.menu_box--order_history__subtotal')
  //       if(order_status==2){
  //         order_history_obj.text('調理中');
  //         subtotal_obj.text('小計 ¥ ' + price*order_quantity)
  //       }else if(order_status==3){
  //         order_history_obj.text('調理完了');
  //         subtotal_obj.text('小計 ¥ ' + price*order_quantity)
  //       }else{
  //         order_history_obj.text('キャンセル');
  //         subtotal_obj.text('小計 ¥ 0')
  //       };
  //     };
  //   }else{
  //     var order_id = order_history['order_id']
  //     var order_status = order_history['order_status']
  //     console.log('test')
  //     console.log(order_history['action'])
  //     console.log(order_id)
  //     console.log(order_status)
  //     if(order_status==3){
  //         $('#order_id_'+order_id).children('.menu_box--order_history__order_status').text('調理完了');
  //       }else{
  //         $('#order_id_'+order_id).children('.menu_box--order_history__order_status').text('キャンセル')
  //         $('#order_id_'+order_id).children('.menu_box--order_history__subtotal').text('小計 ¥ 0')
  //       };
  //   };
  //   var total_int = 0
  //   $(".menu_box--order_history__subtotal").each(function () {
  //     var subtotal_int = parseInt($(this).text().replace("小計 ¥ ", ""));
  //     total_int += subtotal_int;
  //   });
  //   var total = '合計 ¥ ' + total_int
  //   $(".total--order_history").text(total);
  // });

});