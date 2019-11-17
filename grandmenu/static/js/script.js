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


//グローバルナビの大メニューに関するjs
$(document).on('click', '.js-header__menu', function(){
  var device_width = $(window).width();
  if(device_width < 1024){
    if($(this).hasClass("js-header__menu--doing")){
      $(this).removeClass("js-header__menu--doing");
      $("body").removeClass("overflow-hidden"); //サイドメニューが表示されることで起こるレイアウトの崩れのhiddenを解除
      $(".wrapper__side").animate({width:"0vw", queue: false}, 250)
      $(".wrapper__main").animate({width:"100vw"},250)
      $(".wrapper__main").animate({left:"0vw", queue: false}, 250);
    }else{
      $(this).addClass("js-header__menu--doing");
      $("body").addClass("overflow-hidden"); //サイドメニューが表示されることで起こるレイアウトの崩れをhiddenで回避
      $(".wrapper__side").animate({width:"100vw", queue: false}, 250)
      $(".wrapper__main").animate({width:"0vw"},250)
      $(".wrapper__main").animate({left:"100vw", queue: false}, 250);
    };
  }else{
    if($(this).hasClass("js-header__menu--doing")){
      $(this).removeClass("js-header__menu--doing");
      $("body").removeClass("overflow-hidden"); //サイドメニューが表示されることで起こるレイアウトの崩れのhiddenを解除
      $(".wrapper__side").animate({width:"0vw", queue: false}, 250)
      $(".wrapper__main").animate({width:"100vw"},250)
      $(".wrapper__main").animate({left:"0vw", queue: false}, 250);
    }else{
      $(this).addClass("js-header__menu--doing");
      $("body").addClass("overflow-hidden"); //サイドメニューが表示されることで起こるレイアウトの崩れをhiddenで回避
      $(".wrapper__side").animate({width:"25vw", queue: false}, 250)
      $(".wrapper__main").animate({width:"75vw"},250)
      $(".wrapper__main").animate({left:"25vw", queue: false}, 250);
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
$(function() {
$(".button__add").click(function(){
$(".lightbox--add").css(
        "display", "flex"
    );
});
});

// メニュー追加のためのLightboxを消す
$(function() {
  $(".lightbox--add").dblclick(function(){
    $(".lightbox--add").css(
        "display", "none"
      );
  });
});

// 中分類類メニュー表示
$(function(){
  $(".js-food").click(function(){
    $.when($(".sortable_class_2--drink").slideUp()
      ).done(function() {
    $(".sortable_class_2--food").slideDown();
    });
  });
});

$(function(){
  $(".js-drink").click(function(){
    $.when($(".sortable_class_2--food").slideUp()
      ).done(function() {
    $(".sortable_class_2--drink").slideDown();
    });
  });
});

// 小分類類メニュー表示
$(function() {
  $(".menu_box--class_2").click(function(){
    var selector = $(this).attr('value')
    $(".lightbox--class_3").css(
      "display", "flex"
    );
    $("." + selector).css(
      "display", "flex"
    );
  });
});

// 小分類のメニュー消す
$(function() {
  $(".lightbox--class_3").dblclick(function(){
    $(".lightbox--class_3 li").css(
        "display", "none"
    );
    $(".lightbox--class_3").css(
        "display", "none"
    );
  });
});

// ドラック&ドロップでメニューの順番を並べ替える関数
$(document).on('click', '.button__sortable', function() {
  $(this).remove();
  $('<button form="sort_menu" id="sort_submit" class="button__sortable--active" type="button">⇅</button>').insertBefore(".button__add");
  $(".sortable").sortable({
  disabled: false
  });
  $(".menu_box--class_2").addClass("vibration");
  $(".menu_box--class_3").addClass("vibration");
  $(".menu_box--class_2").css(
    "background-color","#BF7C00"
    );
  $(".menu_box--class_3").css(
    "background-color","#BF7C00"
    );
// ソートの順番を保存する処理
  $(".sortable_class_2--food").sortable();
  $(".sortable_class_2--drink").sortable();
  $(".sortable_class_3").sortable();
  $(".sortable").disableSelection();
});

$(document).on("click", "#sort_submit", function () {
  var class_2_sort_result_food = $(".sortable_class_2--food").sortable("toArray", { attribute: 'id'});
  $("#class_2_sort_result_food").val(class_2_sort_result_food);
  var class_2_sort_result_drink = $(".sortable_class_2--drink").sortable("toArray", { attribute: 'id'});
  $("#class_2_sort_result_drink").val(class_2_sort_result_drink);
  var class_3_sort_result = $(".sortable_class_3").sortable("toArray", { attribute: 'id'});
  $("#class_3_sort_result").val(class_3_sort_result);
  $("#sort_menu").submit();
});

// デリートボタンを押した後の挙動
$(function(){
  $(".button__delete").click(function(){
  $(this).remove();
  $('<button form="delete_menu" class="button__delete--active" type="submit">ー</button>').insertAfter(".button__add");
  $(".menu_box--class_2").addClass("vibration");
  $(".menu_box--class_3").addClass("vibration");
  $(".menu_box--class_2").css(
    "background-color","#DC3B00"
    );
  $(".menu_box--class_3").css(
    "background-color","#DC3B00"
    );
  $(".delete").prop("disabled", false);
  });
});



// デリートのチェックが入ったときの処理
$(document).on("click", ".menu_box--class_3", function () {
  if($(this).children("input:checkbox").prop("disabled") == false){
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
$(document).on("click", ".class_3__increase", function () {
  var order_quantity_befor = $(this).next(".text_box--number").val();
  if(order_quantity_befor == ""){
    $(this).next(".text_box--number").val(1)
  }else{
    // parseIntで数字として足し算
    order_quantity = parseInt(order_quantity_befor) + parseInt(1);
    $(this).next(".text_box--number").val(order_quantity)
  };
});

// 注文数量の隣の-を押した後の処理
$(document).on("click", ".class_3__decrease", function () {
  var order_quantity_befor = $(this).prev(".text_box--number").val();
  if(order_quantity_befor == "" || order_quantity_befor == 1 || order_quantity_befor == 0){
    $(this).prev(".text_box--number").val("")
  }else{
    // parseIntで数字として足し算
    order_quantity = parseInt(order_quantity_befor) - parseInt(1);
    $(this).prev(".text_box--number").val(order_quantity)
  };
});

// オーダーを追加したときにカートに加える仕組み
$(document).on("click", ".class_3__add_to_cart", function () {
  var quantity = $(this).siblings(".text_box--number").val()
  //正の数且つ整数の時のみカートに加える判定
  if(quantity > 0 && Number.isInteger(quantity) == false){
    var add_order = $(this).parent("li").attr("id") + "," + $(this).siblings(".text_box--number").val();
    console.log(add_order);
    var add_order_json = {
    "add_order": add_order
    }
    $.ajax({
      url: "/add_to_cart_json",
      type: 'post',
      data: JSON.stringify(add_order_json),
      dataType: 'json',
      contentType: 'application/json',
    })
    .done(function(data, textStatus, jqXHR){
      $(".header__quantity").remove();
      $('<div class="header__quantity"></div>').appendTo(".header__cart");
      console.log(data);
      $('.header__quantity').text(data);
    });
  }else{};
});



// テーブルアクティベートの処理
$(document).on("click", ".checkbox--activate__checkbox", function () {
  table_number = $(this).attr("id").replace("table_", "");
  if($(this).prop("checked") == true) {
    var data = {
    "table_number": table_number,
    "activate_status": 1
    }
    console.log("チェック項目がチェックされています。");
    console.log(data);
    $.ajax({
      url: "/activate_json",
      type: 'post',
      data: JSON.stringify(data),
      dataType: 'json',
      contentType: 'application/json',
    })
    .done(function(data, textStatus, jqXHR){
      console.log(data)
    })
    ;
  }else {
    var data = {
    "table_number": table_number,
    "activate_status": 0
    }
    console.log("チェック項目がチェックされていません。");
    console.log(data);
    $.ajax({
      url: "/activate_json",
      type: 'post',
      data: JSON.stringify(data),
      dataType: 'json',
      contentType: 'application/json',
    })
    .done(function(data, textStatus, jqXHR){
      console.log(data)
    })
    ;
  };
  });







