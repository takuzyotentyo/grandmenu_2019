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
$(document).on('click', '.header__menu', function(){
    if($(this).hasClass("js-three_line_menu--doing")){
      $(this).removeClass("js-three_line_menu--doing");
      $("body").removeClass("overflow-hidden"); //サイドメニューが表示されることで起こるレイアウトの崩れのhiddenを解除
      $(".wrapper__side").animate({left:"-25vw", queue: false}, 250)
      $(".wrapper__main").animate({width:"100vw"},250)
      $(".wrapper__main").animate({left:"0vw", queue: false}, 250);
    }else{
      $(this).addClass("js-three_line_menu--doing");
      $("body").addClass("overflow-hidden"); //サイドメニューが表示されることで起こるレイアウトの崩れをhiddenで回避
      $(".wrapper__side").animate({left:"0vw", queue: false}, 250)
      $(".wrapper__main").animate({width:"75vw"},250)
      $(".wrapper__main").animate({left:"25vw", queue: false}, 250);
    };
});
//グローバルナビの小メニュー表示に関するjs
$(document).on('click', '.global_navi__1_opener', function(){
    if($(this).hasClass("js-icon_pulus--doing")){
      $(this).removeClass("js-icon_pulus--doing");
      $(this).parent("li").css("background-color","#FFA500");
      $(this).parent("li").next(".global_navi__2").slideUp();
    }else{
      $(this).addClass("js-icon_pulus--doing");
      $(this).parent("li").next(".global_navi__2").slideDown(
        );
      $(this).parent("li").css("background-color","#072A24");
    };
});





// メニュー追加のためのLightboxを表示
$(function() {
	$(".button__add").click(function(){
		$(".lightbox").css(
        "display", "flex"
    	);
	});
});

// メニュー追加のためのLightboxを消す
$(function() {
  $(".lightbox").dblclick(function(){
    $(".lightbox").css(
        "display", "none"
      );
  });
});

// 小分類メニュー表示
$(function() {
  $(".menu_box").click(function(){
    var selector = $(this).attr('value')
      $(".lightbox__menu_box").css(
        "display", "flex"
      );
      $("." + selector).css(
          "display", "flex"
        );
      });
    });

// 小分類のメニュー消す
$(function() {
  $(".lightbox__menu_box").dblclick(function(){
    $(".lightbox__menu_box li").css(
        "display", "none"
      );
    $(".lightbox__menu_box").css(
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
  $(".menu_box").css(
    "background-color","#BF7C00"
    );
  $(".menu_box__class_3").css(
    "background-color","#BF7C00"
    );
  $(".menu_box").addClass("vibration");
  $(".menu_box__class_3").addClass("vibration");
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

// button_deleteを押した後の挙動
$(function(){
  $(".button__delete").click(function(){
  $(this).remove();
  $('<button form="delete_menu" class="button__delete--active" type="submit">ー</button>').insertAfter(".button__add");
  $(".menu_box").addClass("vibration");
  $(".menu_box__class_3").addClass("vibration menu_box__class_3--delete");
  $(".menu_box").removeClass("menu_box");
  $(".menu_box__class_3").removeClass("menu_box__class_3");
  $(".delete").prop("disabled", false);
  $(".deletemark--class_2").addClass("deletable");
  $(".deletemark--class_3").addClass("deletable");
  });
});

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
    });
    // .done(function(data, textStatus, jqXHR){
    // });
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
    });
    // .done(function(data, textStatus, jqXHR){
    //   console.log(status_change)
    // });
  };
  });








