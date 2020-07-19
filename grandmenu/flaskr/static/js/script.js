//ログイン時のフォームに関するjs
$(function(){
  $(".js-registration").click(function(){
    $.when($(".js-form--login").slideUp()
      ).done(function() {
    $(".js-form--registration").slideDown();
    });
  });
});

$(function(){
  $(".js-login").click(function(){
    $.when($(".js-form--registration").slideUp()
      ).done(function() {
    $(".js-form--login").slideDown();
    });
  });
});

// 読み込んだあとのローカライズに関するjs
$(document).ready(function(){
  var pathname = location.pathname
  var ws_order = "../static/js/websocket_order.js"
  var ws_kitchin = "../static/js/websocket_kitchin.js"

  if (pathname != '/order_menu'){
    $('.wrapper--header').prepend(
    '<div class="header__menu js-header__menu icon_menu">'+
      '<span></span>'+
      '<span></span>'+
      '<span></span>'+
    '</div>');
    $('.wrapper--header').after(
      '<ul class="wrapper--side">'+
      '<li class="side_menu_1">'+
        '<div class="side_menu_1__content">オーダーシステム</div>'+
        '<div class="side_menu_1__opener icon_pulus">'+
          '<span></span>'+
          '<span></span>'+
        '</div>'+
      '</li>'+
      '<ul class="side_menu_2">'+
        '<li><a class="side_menu_2__content" href="/show_menu">メニュー表登録・修正</a></li>'+
        '<li><a class="side_menu_2__content" href="/qrcode/generate">QRコード発行</a></li>'+
        '<li><a class="side_menu_2__content" href="/activate">テーブルアクティベート</a></li>'+
      '</ul>'+
      '<li class="side_menu_1">'+
        '<div class="side_menu_1__content">設定</div>'+
        '<div class="side_menu_1__opener icon_pulus">'+
          '<span></span>'+
          '<span></span>'+
        '</div>'+
      '</li>'+
      '<ul class="side_menu_2">'+
        '<li><a class="side_menu_2__content" href="/store_setting">店舗情報</a></li>'+
        '<li><a class="side_menu_2__content" href="#">従業員情報</a></li>'+
        '<li><a class="side_menu_2__content" href="/sales_management">売上管理</a></li>'+
      '</ul>'+
      '<a class="side_menu__logout" href="/logout">ログアウト</a>'+
    '</ul>')
  };

  if(pathname == '/order_menu' || pathname == '/show_menu'){
    $('.wrapper--header').append(
      '<div class="header__cart js-show__lightbox" data-show="cart">'+
      '<div class="header__quantity"></div>'+
    '</div>'
    );
  }

  if(pathname == '/show_menu' || pathname == '/order_menu' || pathname == '/activate')
    $('.wrapper--main').append(
      '<div class="lightbox--ws_error">'+
        '<div class="lightbox--ws_error__wi-fi"></div>'+
        '<div class="lightbox--ws_error__msg text__subtitle">再接続を実行しています</div>'+
      '</div>');

  if (pathname == '/show_menu' || pathname == '/order_menu') {
    $.getScript(ws_order);
  } else if (pathname == '/activate') {
    $.getScript(ws_kitchin);
  }else {
  }
});

//サイドメニュー表示に関するjs
$(document).on('click', '.js-header__menu', function(){
//レスポンシブ対応のための閾値
  var device_width = $(window).width()
// サイドメニューを隠す処理は同じ
    if($(this).hasClass("js-header__menu--doing")){
      $(this).removeClass("js-header__menu--doing");
      $("body").removeClass("overflow-hidden"); //サイドメニューが表示されることで起こるレイアウトの崩れのhiddenを解除
      $(".wrapper--side").animate({width:"0vw"}, 250);
      $(".wrapper--main").animate({
        'width':'100vw',
        'left':'0vw'
      },250);
      // $(".wrapper--main").animate({width:"100vw"},250)
      // $(".wrapper--main").animate({left:"0vw"}, 250);
    }else{
// サイドメニューを表示する処理
      $(this).addClass("js-header__menu--doing");
      $("body").addClass("overflow-hidden"); //サイドメニューが表示されることで起こるレイアウトの崩れをhiddenで回避
// ディスプレイサイズによって、どこまで表示するかを選択する
    if(device_width < 768){
      $(".wrapper--side").animate({width:"100vw"}, 250);
      $(".wrapper--main").animate({
        left:"100vw",
        width:"0vw"
      }, 250);
    }else if(device_width < 1024){
      $(".wrapper--side").animate({width:"50vw"}, 250);
      $(".wrapper--main").animate({
        left:"50vw",
        width:"50vw"
      }, 250);
    }else{
      $(".wrapper--side").animate({width:"25vw"}, 250);
      $(".wrapper--main").animate({
        left:"25vw",
        width:"75vw"
      }, 250);
    };
  };
});

//グローバルナビの小メニュー表示に関するjs
// $(document).on('click', '.js-side_menu_1__opener', function(){
//   if($(this).hasClass("js-icon_pulus--doing")){
//     $(this).removeClass("js-icon_pulus--doing");
//     $(this).parent("li").css("background-color","#FFA500");
//     $(this).parent("li").next(".side_menu_2").slideUp();
//   }else{
//     $(this).addClass("js-icon_pulus--doing");
//     $(this).parent("li").next(".side_menu_2").slideDown();
//     $(this).parent("li").css("background-color","#072A24");
//   };
// });

//グローバルナビの小メニュー表示に関するjs_テスト
$(document).on('click', '.side_menu_1', function(){
  if($(this).children('.icon_pulus').hasClass("js-icon_pulus--doing")){
    $(this).children().removeClass("js-icon_pulus--doing");
    $(this).css("background-color","#FFA500");
    $(this).next(".side_menu_2").slideUp();
  }else{
    $(this).children('.icon_pulus').addClass("js-icon_pulus--doing");
    $(this).next(".side_menu_2").slideDown();
    $(this).css("background-color","#072A24");
  };
});

// 中分類類メニュー表示
$(document).on("click", ".js-show__container", function () {
  var show = $(this).data('container');
  var target = $('[data-target="' + show + '"]').attr("class")
  var siblings = $('[data-target="' + show + '"]').siblings('[data-target]').attr("class")
  $.when(
    $('[data-target="' + show + '"]').siblings('[data-target]').slideUp())
  .done(function(){
    $('[data-target="' + show + '"]').slideDown()
  });
});

// 小分類メニューを表示する
$(function() {
  $(".js-show__menu_box").click(function(){
    var menu_box = $(this).data('menu_box');
    // $(".menu_box--class_3").css("display", "none");
    $('[data-target="' + menu_box + '"]').siblings().css("display", "none");
    $('[data-target="' + menu_box + '"]').css("display", "flex");
  });
});

// ドラック&ドロップでメニューの順番を並べ替える関数
$(document).on('click', '.button__sortable', function() {
  $(this).remove();
  $('<button form="sort_menu" id="sort_submit" class="button__sortable--active" type="button">⇅</button>').insertAfter(".button__add");
  $(".menu_box--class_2").addClass("vibration");
  $(".menu_box--class_3").addClass("vibration");
  $(".menu_box--class_2").css(
    "background-color","#BF7C00"
    );
  $(".menu_box--class_3").css(
    "background-color","#BF7C00"
    );
// 指定した要素の子要素をソート可能にする
  $(".js-sortable_class_2--food").sortable();
  $(".js-sortable_class_2--drink").sortable();
  // 戻るボタンがソートできないようにするためにitemオプションは必要
  $(".js-sortable_class_3").sortable({
    items: '.menu_box--class_3'
  });
});

$(document).on("click", "#sort_submit", function () {
  var class_2_sort_result_food = $(".js-sortable_class_2--food").sortable("toArray", { attribute: 'id'});
  var class_2_sort_result_drink = $(".js-sortable_class_2--drink").sortable("toArray", { attribute: 'id'});
  var class_3_sort_result = $(".js-sortable_class_3").sortable("toArray", { attribute: 'id'});
  $("#class_2_sort_result_food").val(class_2_sort_result_food);
  $("#class_2_sort_result_drink").val(class_2_sort_result_drink);
  $("#class_3_sort_result").val(class_3_sort_result);
  $("#sort_menu").submit();
});

// デリートボタンを押した後の挙動
$(function(){
  $(".button__delete").click(function(){
// 一度ボタンを消した後に、同じ場所にsubmit属性を持ったボタンを追加する
  $(this).remove();
  $('<button form="delete_menu" class="button__delete--active" type="submit">ー</button>').insertBefore(".button__add");
// vibrationクラスを追加して震えさせる
  $(".menu_box--class_2").addClass("vibration");
  $(".menu_box--class_3").addClass("vibration");
// 色を変える
  $(".menu_box--class_2").css("background-color","#DC3B00");
  $(".menu_box--class_3").css("background-color","#DC3B00");
// deleteというチェックボックスを使えるようにする
  $(".delete").prop("disabled", false);
  });
});

// デリートのチェックが入ったときの処理
$(document).on("click", ".menu_box--class_3", function () {
// 子要素のチェックボックスが入力可能かどうか判定し、無理なら何もしない
  if($(this).children("input:checkbox").prop("disabled") == false){
// 子要素のチェックボックスにチェックが入っているか判定し、チェックが入っていればチェックを取る。入ってなければ入れる
    if($(this).children("input:checkbox").prop("checked") == true){
      $(this).children("input:checkbox").prop('checked', false);
      $(this).css("background-color","#DC3B00");
    }else{
      $(this).children("input:checkbox").prop('checked', true);
      $(this).css("background-color","#401100");
    };
  }else{
  };
});

// 注文数量の隣の+を押した後の処理
$(document).on("click", ".menu_box--class_3__increase", function () {
  var order_quantity_befor = $(this).siblings('input[type="number"]').val();
  if(order_quantity_befor == ""){
    $(this).siblings('input[type="number"]').val(1)
  }else{
    // parseIntで数字として足し算
    order_quantity = parseInt(order_quantity_befor) + parseInt(1);
    $(this).siblings('input[type="number"]').val(order_quantity)
  };
});

// 注文数量の隣の-を押した後の処理
$(document).on("click", ".menu_box--class_3__decrease", function () {
  var order_quantity_befor = $(this).siblings('input[type="number"]').val();
  if(order_quantity_befor == "" || order_quantity_befor == 1 || order_quantity_befor == 0){
    $(this).siblings('input[type="number"]').val("")
  }else{
    // parseIntで数字として足し算
    order_quantity = parseInt(order_quantity_befor) - parseInt(1);
    $(this).siblings('input[type="number"]').val(order_quantity)
  };
});

// lightboxを表示する処理
$(document).on("click", ".js-show__lightbox", function () {
  var show = $(this).data('show');
  var lightbox = $(".lightbox").css("display")
  var wrapper = $('[data-target="' + show + '"]').css("display")
  $(".lightbox").children().css("display", "none");
  if(lightbox == "none"){
    $.when($(".lightbox").css("display", "flex")).done(function(){
      $(".lightbox").animate({left:"0%"}, 250)
      $('[data-target="' + show + '"]').css("display", "");
      $('[data-target="lightbox_always_show"]').css("display", "");
    });
  }else if (lightbox != "none" && wrapper  == "none"){
    $.when(
      $(".lightbox").animate({left:"100%"}, 250))
    .done(function(){
      $(".lightbox").children().css("display", "none");
      $('[data-target="' + show + '"]').css("display", "");
      $('[data-target="lightbox_always_show"]').css("display", "");
      $(".lightbox").animate({left:"0%"}, 250)
    });
  }else{
    $.when(
      $(".lightbox").animate({left:"100%"}, 250))
    .done(function(){
      $(".lightbox").css("display", "none");
      $(".lightbox").children().css("display", "none");
    });
  };
});

// 表示されているライトボックスを消す処理
$(document).on("click", ".lightbox__back", function () {
  $.when($(".lightbox").animate({left:"100%"}, 250)).done(function(){
    $(".lightbox").css("display", "none");
    $(".lightbox").children().css("display", "none");
  });
});

// QRコードがなかった場合に、QRコードを生成する処理
$(document).on("click", ".js-show__qrcode", function () {
  var qrcode = $(this).data('qrcode');
  var qrcode_obj = $('[data-target="' + qrcode + '"]')
  var one_time_password = $('[data-target="' + qrcode + '"]').data('one_time_password');
  var qrcode_url = location.protocol + '//' + location.host + '/qrcode/'

  $(".wrapper--qrcode").children().css("display", "none")
  $("#container_" + qrcode).css("display", "block")

  if($("#" + qrcode).length){
  }else{
    $("#container_" + qrcode).append('<span id="' + qrcode +'"></span>');
    $("#" + qrcode).qrcode(qrcode_url + one_time_password);
  };
});

// スワイプされた場合の挙動
$(function(){
  $('.lightbox').on('touchstart', onTouchStart); //指が触れたか検知
  $('.lightbox').on('touchmove', onTouchMove); //指が動いたか検知
  $('.lightbox').on('touchend', onTouchEnd); //指が離れたか検知
  var direction, position;
  //スワイプ開始時の横方向の座標を格納
  function onTouchStart(event) {
    position = getPosition(event);
    direction = ''; //一度リセットする
  }
  //スワイプの方向（left／right）を取得
  function onTouchMove(event) {
    if (position - getPosition(event) > 70) { // 70px以上移動しなければスワイプと判断しない
      direction = 'left'; //左と検知
    } else if (position - getPosition(event) < -70){  // 70px以上移動しなければスワイプと判断しない
      direction = 'right'; //右と検知
    }
  }

  function onTouchEnd(event) {
    if (direction == 'right'){
      $.when($(".lightbox").animate({left:"100%"}, 250)).done(function(){
      $(".lightbox").css("display", "none");
      $(".lightbox").children().css("display", "none");
    });
    } else if (direction == 'left'){
      $.when($(".lightbox").animate({left:"-100%"}, 250)).done(function(){
      $(".lightbox").css("display", "none");
      $(".lightbox").children().css("display", "none");
    });
    }
  }

  //横方向の座標を取得
  function getPosition(event) {
    return event.originalEvent.touches[0].pageX;
  }
});

