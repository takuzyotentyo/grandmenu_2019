$(document).ready(function(){

  if (window.location.protocol == "https:") {
    var ws_scheme = "wss://";
  } else {
    var ws_scheme = "ws://"
  };

  var socket = io.connect(ws_scheme + location.host);

  socket.on('connect', function() {
    // lightbox--ws_errorがvisibleということは、一旦conecctが完了した後に、エラーで接続が切れ、再度connectの処理が必要になったということ
    if($(".lightbox--ws_error").is(':visible')) {
      socket.emit("reload");
    }else{
      $(".lightbox--ws_error").css('display','flex')
    socket.emit("cart",{"action":"show"});
    };
  });

  socket.on('reload', function(){
    location.reload();
  });

  socket.on('server_to_client_message', function(msg){
    console.log(msg);
  });

  socket.on('cart', function(cart){
    // カート内の数量を変更
    $('.header__quantity').text(cart['total_quantity']);
    if(cart['action']=="show" || cart['action']=="submit"){
      // 子要素を一度消して、再度表示させる処理は、websocketが意図せず切れたときのために必要
      console.log("cart['action']は")
      console.log(cart['action'])
      $('.wrapper--cart')
        .empty()
        .append('<div class="menu_box--order__food">Food</div>')
        .append('<div class="menu_box--order__drink">drink</div>')
        .append('<div class="total--order"></div>')
        .append('<button class="form__button" id="order_submit"></button>')
      $('#order_submit')
        .append('<span>確定</span>')
        .append('<span>注文</span>')
    };
    if(cart['action']=="show" || cart['action']=="add" || cart['action']=="change"){
      console.log("以下の処理でオーダーを追加")
      console.log(cart['order_list'])
      var len = cart['order_list'].length;
      // cart['order_list']はORDER_ID, CLASS_1, CLASS_2, CLASS_3, PRICE, ORDER_QUANTITY]
      var order_list = cart['order_list']
      // 以下の処理で、menu_listをHTML内に組み込む
      for (var i=0; i<len; i++) {
        var order_id = order_list[i][0]
        var class_1 = order_list[i][1]
        var class_2 = order_list[i][2]
        var class_3 = order_list[i][3]
        var price = parseInt(order_list[i][4])
        var order_quantity = parseInt(order_list[i][5])
        // メニューがカート内に存在しているかを調べ、なければ新しく追加
        if($('#order_id_' + order_id).length){
          // 存在していて、order_quantityが0の場合消して、他の場合は数量を変更
          if(order_quantity==0){
            $("#order_id_" + order_id).remove();
          }else{
            $('#order_id_' + order_id).children('input[type="number"]').val(order_quantity)
            $('#order_id_' + order_id).children(".menu_box--order__subtotal").text("小計 ¥ " + price * order_quantity);
          };
        }else{
          $(".menu_box--order__" + class_1).after('<li class="menu_box--order" id="order_id_' + order_id + '"></li>');
          $('#order_id_' + order_id)
            .append('<span class="menu_box--order__class_2">' + class_2 + '</span>')
            .append('<span class="menu_box--order__class_3">' + class_3 + '</span>')
            .append('<span class="menu_box--order__price">¥ ' + price + '</span>')
            .append('<span class="menu_box--order__quantity_label">数量</span>')
            .append('<span class="menu_box--order__increase">+</span>')
            .append('<input class="menu_box--order__quantity" min="0" type="number" pattern="\d" value="'+ order_quantity +'" disabled>')
            .append('<span class="menu_box--order__decrease">-</span>')
            .append('<span class="menu_box--order__garbage"></span>')
            .append('<span class="menu_box--order__subtotal">小計 ¥ '+ price * order_quantity + '</span>')
        console.log(order_list[i][3]);
        };
      };
    };
    var total_int = 0
      $(".menu_box--order__subtotal").each(function () {
        var subtotal_int = parseInt($(this).text().replace("小計 ¥ ", ""));
        total_int += subtotal_int;
      });
      var total = '合計 ¥ ' + total_int
      $(".total--order").text(total);
  });


  // order_history['order_item']はORDER_ID, CLASS_1, CLASS_2, CLASS_3, PRICE, ORDER_QUANTITY]の順
  socket.on('order_history', function(order_history){
    console.log("オーダーが履歴に追加されました")
    // order_history['action']は、show,addのどちらかの値を持つ
    if (order_history['action']=="show"){
      $('.wrapper--order_history')
        .empty()
        .append('<div class="menu_box--order_history__food">Food</div>')
        .append('<div class="menu_box--order_history__drink">drink</div>')
        .append('<div class="total--order_history"></div>')
        .append('<button class="form__button" id="order_check" type="submit"></button>')
      $('#order_check')
        .append('<span>確定</span>')
        .append('<span>会計</span>')
    };
    if(order_history['action']=="show" || order_history['action']=="add"){
      var len = order_history['order_history'].length;
      var order_history = order_history['order_history']
      // 以下の処理で、order_historyをHTML内に組み込む
      for (var i=0; i<len; i++) {
        var order_id = order_history[i][0]
        var class_1 = order_history[i][1]
        var class_2 = order_history[i][2]
        var class_3 = order_history[i][3]
        var price = parseInt(order_history[i][4])
        var order_quantity = parseInt(order_history[i][5])
        var order_status = parseInt(order_history[i][6])
        console.log(order_status)
        $(".menu_box--order_history__" + class_1).after('<li class="menu_box--order_history" id="order_id_' + order_id + '"></li>');
        $('#order_id_' + order_id)
          .append('<span class="menu_box--order_history__class_2">' + class_2 + '</span>')
          .append('<span class="menu_box--order_history__class_3">' + class_3 + '</span>')
          .append('<span class="menu_box--order_history__price">¥ ' + price + '</span>')
          .append('<span class="menu_box--order_history__quantity_label">数量</span>')
          .append('<span class="menu_box--order_history__quantity">' + order_quantity + '</span>')
          .append('<span class="menu_box--order_history__subtotal"></span>')
          .append('<span class="menu_box--order_history__order_status"></span>')
        order_history_obj = $('#order_id_' + order_id).children('.menu_box--order_history__order_status')
        subtotal_obj = $('#order_id_' + order_id).children('.menu_box--order_history__subtotal')
        if(order_status==0||order_status==2){
          order_history_obj.text('調理中');
          subtotal_obj.text('小計 ¥ ' + price*order_quantity)
        }else if(order_status==3){
          order_history_obj.text('調理完了');
          subtotal_obj.text('小計 ¥ ' + price*order_quantity)
        }else{
          order_history_obj.text('キャンセル');
          subtotal_obj.text('小計 ¥ 0')
        };
      };
    }else{
      var order_id = order_history['order_id']
      var order_status = order_history['order_status']
      console.log('test')
      console.log(order_history['action'])
      console.log(order_id)
      console.log(order_status)
      if(order_status==3){
          $('#order_id_'+order_id).children('.menu_box--order_history__order_status').text('調理完了');
        }else{
          $('#order_id_'+order_id).children('.menu_box--order_history__order_status').text('キャンセル')
          $('#order_id_'+order_id).children('.menu_box--order_history__subtotal').text('小計 ¥ 0')
        };
    };
    var total_int = 0
    $(".menu_box--order_history__subtotal").each(function () {
      var subtotal_int = parseInt($(this).text().replace("小計 ¥ ", ""));
      total_int += subtotal_int;
    });
    var total = '合計 ¥ ' + total_int
    $(".total--order_history").text(total);
  });

// add_to_cartの処理
  $(document).on("click", ".menu_box--class_3__add_to_cart", function () {
    var quantity = $(this).siblings('input[type="number"]').val();
    //正の数且つ整数の時のみカートに加える判定
    if(quantity > 0 && Number.isInteger(quantity) == false){
      // add_orderの変数に加える情報は menu_id,price, quantity
      var menu_id = $(this).siblings('input[type="checkbox"]').attr("value")
      var order_quantity = $(this).siblings('input[type="number"]').val()
      var add_to_cart = {"action" : "add", 'menu_id': menu_id, 'order_quantity': order_quantity};
      $(this).siblings('input[type="number"]').val("")
      socket.emit("cart", add_to_cart);
    }else{
      $(this).siblings('input[type="number"]').val("")
    };
  });

  $(document).on("click", ".menu_box--order__increase", function () {
    var befor_quantity = $(this).siblings('input[type="number"]').val();
    var order_quantity = parseInt(befor_quantity) + 1;
    var order_id = $(this).parent().attr("id").replace("order_id_", "")
    var change_cart = {'action': 'change', 'order_id': order_id, 'order_quantity': order_quantity}
    socket.emit("cart", change_cart);
  });

  $(document).on("click", ".menu_box--order__decrease", function () {
    var befor_quantity = $(this).siblings('input[type="number"]').val();
    var order_quantity = parseInt(befor_quantity) - (1);
    var order_id = $(this).parent().attr("id").replace("order_id_", "")
    var change_cart = {'action': 'change', 'order_id': order_id, 'order_quantity': order_quantity}
    socket.emit("cart", change_cart);
  });

  $(document).on("click", ".menu_box--order__garbage", function () {
    var order_quantity = 0;
    var order_id = $(this).parent().attr("id").replace("order_id_", "")
    var change_cart = {'action': 'change', 'order_id': order_id, 'order_quantity': order_quantity}
    socket.emit("cart", change_cart);
  });

  $(document).on("click", "#order_submit", function () {
    if(confirm("一緒にご来店頂いたお客様が\n注文をカートに追加している場合があります。\n本当にオーダーを確定しますか？")){
      console.log("オーター確定")
      socket.emit("order_submit");
    };
  });

  // 会計完了の処理
  $(document).on("click", "#order_check", function () {
    console.log("test")
    if(confirm("お会計を行いますか？")){
      socket.emit("checkout");
    };
  });

  socket.on('checkout', function(total_fee){
    $('.wrapper--main').children().remove();
    $('.header__cart').remove();
    $('.wrapper--main').append('<div class="wrapper--checkout fadein"></div>')
    $('.wrapper--checkout')
      .append('<div class="text__subtitle">お客様のお会計は</div>')
      .append('<div class="text__title">' + total_fee + ' 円です</div>')
      .append('<div class="text__subtitle">レジにお進みください</div>');
  });

  socket.on('error', function(){
    console.log("接続エラー")
    $(".lightbox--ws_error").css({
      "left":"0%",
      "visibility":"visible"
    });
  });

});