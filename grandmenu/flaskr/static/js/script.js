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
      $(".wrapper--side").animate({width:"0vw"}, 250);
      $(".wrapper--main").animate({width:"100vw"},250);
      $(".wrapper--main").animate({left:"0vw"}, 250);
    }else{
// サイドメニューを表示する処理
      $(this).addClass("js-header__menu--doing");
      $("body").addClass("overflow-hidden"); //サイドメニューが表示されることで起こるレイアウトの崩れをhiddenで回避
// ディスプレイサイズによって、どこまで表示するかを選択する
    if(device_width < 768){
      $(".wrapper--side").animate({width:"100vw"}, 250);
      $(".wrapper--main").animate({width:"0vw"},250);
      $(".wrapper--main").animate({left:"100vw"}, 250);
    }else if(device_width < 1024){
      $(".wrapper--side").animate({width:"50vw"}, 250);
      $(".wrapper--main").animate({width:"50vw"},250);
      $(".wrapper--main").animate({left:"50vw"}, 250);
    }else{
      $(".wrapper--side").animate({width:"25vw"}, 250);
      $(".wrapper--main").animate({width:"75vw"},250);
      $(".wrapper--main").animate({left:"25vw"}, 250);
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

// 中分類類メニュー表示
$(document).on("click", ".js-show__container", function () {
  var show = $(this).data('container');
  var target = $('[data-target="' + show + '"]').attr("class")
  var siblings = $('[data-target="' + show + '"]').siblings('[data-target]').attr("class")
  console.log(show)
  console.log(target)
  console.log(siblings)
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
    console.log(menu_box)
    // $(".menu_box--class_3").css("display", "none");
    $('[data-target="' + menu_box + '"]').siblings().css("display", "none");
    $('[data-target="' + menu_box + '"]').css("display", "flex");
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

// lightboxを表示する処理
$(document).on("click", ".js-show__lightbox", function () {
  var show = $(this).data('show');
  var lightbox = $(".lightbox").css("display")
  var wrapper = $('[data-target="' + show + '"]').css("display")
  console.log(lightbox)
  console.log(wrapper)
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
  console.log(qrcode)
  console.log(one_time_password)
  var test = "container_"+qrcode
  console.log(test)

  $(".wrapper--qrcode").children().css("display", "none")
  $("#container_" + qrcode).css("display", "block")

  if($("#" + qrcode).length){
    console.log('キャンパスは存在するよ')
  }else{
    console.log('キャンパスは存在しないよ')
    $("#container_" + qrcode).append('<span id="' + qrcode +'"></span>');
    $("#" + qrcode).qrcode("http://groundmenucom.herokuapp.com/qrcode/"+one_time_password);
  };
});