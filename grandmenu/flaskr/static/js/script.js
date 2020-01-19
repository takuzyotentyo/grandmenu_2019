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


//サイドメニュー表示に関するjs
$(document).on('click', '.js-header__menu', function(){
//レスポンシブ対応のための閾値
  var device_width = $(window).width();
// サイドメニューを隠す処理は同じ
    if($(this).hasClass("js-header__menu--doing")){
      $(this).removeClass("js-header__menu--doing");
      $("body").removeClass("overflow-hidden"); //サイドメニューが表示されることで起こるレイアウトの崩れのhiddenを解除
      $(".wrapper__side").animate({width:"0vw"}, 250);
      $(".wrapper__main").animate({width:"100vw"},250);
      $(".wrapper__main").animate({left:"0vw"}, 250);
    }else{
// サイドメニューを表示する処理
      $(this).addClass("js-header__menu--doing");
      $("body").addClass("overflow-hidden"); //サイドメニューが表示されることで起こるレイアウトの崩れをhiddenで回避
// ディスプレイサイズによって、どこまで表示するかを選択する
    if(device_width < 768){
      $(".wrapper__side").animate({width:"100vw"}, 250);
      $(".wrapper__main").animate({width:"0vw"},250);
      $(".wrapper__main").animate({left:"100vw"}, 250);
    }else if(device_width < 1024){
      $(".wrapper__side").animate({width:"50vw"}, 250);
      $(".wrapper__main").animate({width:"50vw"},250);
      $(".wrapper__main").animate({left:"50vw"}, 250);
    }else{
      $(".wrapper__side").animate({width:"25vw"}, 250);
      $(".wrapper__main").animate({width:"75vw"},250);
      $(".wrapper__main").animate({left:"25vw"}, 250);
    };
  };
});
//グローバルナビの小メニュー表示に関するjs
$(document).on('click', '.js-side_menu_1__opener', function(){
  if($(this).hasClass("js-icon_pulus--doing")){
    $(this).removeClass("js-icon_pulus--doing");
    $(this).parent("li").css("background-color","#FFA500");
    $(this).parent("li").next(".side_menu_2").slideUp();
  }else{
    $(this).addClass("js-icon_pulus--doing");
    $(this).parent("li").next(".side_menu_2").slideDown();
    $(this).parent("li").css("background-color","#072A24");
  };
});


// メニュー追加のためのLightboxを表示
// $(function() {
//   $(".button__add").click(function(){
//     $.when($(".lightbox--add").css("display", "flex")).done(function(){
//      $(".lightbox--add").animate({left:"0%"}, 250);
//     });
//   });
// });

// 中分類類メニュー表示
$(function(){
  $(".js-food").click(function(){
    $.when($(".js-sortable_class_2--drink").slideUp()
      ).done(function() {
    $(".js-sortable_class_2--food").slideDown();
    });
  });
});

$(function(){
  $(".js-drink").click(function(){
    $.when($(".js-sortable_class_2--food").slideUp()
      ).done(function() {
    $(".js-sortable_class_2--drink").slideDown();
    });
  });
});

// 小分類メニューを表示する
$(function() {
  $(".js-show__menu_box").click(function(){
    var menu_box = $(this).data('menu_box');
    console.log(menu_box)
    $(".menu_box--class_3").css("display", "none");
    $("." + menu_box).css("display", "flex");
    // $(".lightbox--class_3__back").css("display", "inline-block");
    // $.when($(".lightbox--class_3").css("display", "flex")).done(function(){
    //   $(".lightbox--class_3").animate({left:"0%"}, 250);
    // });
  });
});

// ドラック&ドロップでメニューの順番を並べ替える関数
$(document).on('click', '.button__sortable', function() {
  $(this).remove();
  $('<button form="sort_menu" id="sort_submit" class="button__sortable--active" type="button">⇅</button>').insertBefore(".button__add");
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
  $('<button form="delete_menu" class="button__delete--active" type="submit">ー</button>').insertAfter(".button__add");
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

//  カート内を確認する
// $(document).on("click", ".header__cart", function () {
//   if($(".lightbox--order").css("display") == "none"){
//     $.when($(".lightbox--order").css("display", "block")).done(function(){
//       $(".lightbox--order").animate({left:"0%"}, 250)
//     });
//   }else{
//     $.when($(".lightbox--order").animate({left:"100%"}, 250)).done(function(){
//       $(".lightbox--order").css("display", "none");
//     });
//   };
// });

// テーブルアクティベートのテーブル状況と、オーダー状況に関する記述
$(function(){
  $(".js-order").click(function(){
    $.when(
    $(".table_activate__wrap").slideUp()
      ).done(function() {
    $(".order_list__wrap").slideDown().css("display", "flex");
    });
  });
});

$(function(){
  $(".js-activate").click(function(){
    $.when(
    $(".order_list__wrap").slideUp()
      ).done(function() {
    $(".table_activate__wrap").slideDown();
    });
  });
});

$(document).on("click", ".js-show__lightbox", function () {
  var lightbox = $(this).data('lightbox');
  console.log(lightbox)
  if($("." + lightbox).css("display") == "none"){
    $.when($("." + lightbox).css("display", "flex")).done(function(){
      $("." + lightbox).animate({left:"0%"}, 250)
    });
  }else{
    $.when($("." + lightbox).animate({left:"100%"}, 250)).done(function(){
      $("." + lightbox).css("display", "none");
    });
  };
});

$(document).on("click", ".lightbox__back", function () {
  $.when($(this).parent().animate({left:"100%"}, 250)).done(function(){
    $(this).css("display", "none");
  });
});

$(document).on("click", ".js-show_qrcode", function () {
  var table_number = $(this).siblings('.table_activate__table_number').text().replace("Table ","")
  var one_time_password = $('#qrcode_' + table_number + '_wrap').val()
  console.log(table_number)

  test = $("#qrcode_" + table_number + "_wrap").children('span').children()
  console.log(test)
  if($("#qrcode_" + table_number).length){
    console.log('キャンパスは存在するよ')
  }else{
    console.log('キャンパスは存在しないよ')
    $('<span id="qrcode_' + table_number +'"></span>').appendTo("#qrcode_" + table_number + "_wrap");
    $("#qrcode_" + table_number).qrcode("http://127.0.0.1:5000/qrcode/" + one_time_password);
  };
  $.when($("#qrcode_" + table_number + "_wrap").css("display", "flex")).done(function(){
    $(this).animate({left:"0"}, 250);
  });
});






