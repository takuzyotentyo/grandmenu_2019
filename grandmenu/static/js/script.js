// Lightboxを表示する
$(function() {
	$(".button__add").click(function(){
		$(".lightbox").css(
        "display", "flex"
    	);
	});
});

// Lightboxを隠す
$(function() {
  $(".lightbox").dblclick(function(){
    $(".lightbox").css(
        "display", "none"
      );
  });
});

// 小分類メニュー表示
$(function() {
  $(".menu-box").click(function(){
    var selector = $(this).attr('value')
      $(".lightbox__menu-box").css(
        "display", "flex"
      );
      $("." + selector).css(
          "display", "inline-block"
        );
      });
    });

// 小分類のメニュー消す
$(function() {
  $(".lightbox__menu-box").dblclick(function(){
    $(".lightbox__menu-box li").css(
        "display", "none"
      );
    $(".lightbox__menu-box").css(
        "display", "none"
      );
  });
});

// ドラック&ドロップでメニューの順番を並べ替える関数
$(document).on('click', '.button__sortable', function() {
  if($(".button__sortable").hasClass("doing")){
    $(this).removeClass("doing");
    $(".sortable").sortable({
    disabled: true
    });
    $(".menu-box").css(
      "background-color",""
      );
    $(".menu-box__name_of_dish").css(
      "background-color",""
      );
    $(".menu-box").removeClass("vibration");
    $(".menu-box__name_of_dish").removeClass("vibration");
  }else{
    $(this).addClass("doing");
    $(".button__sortable").remove();
    $('<button form="sort_menu" id="sort_submit" class="button__sortable--active" type="submit">⇅</button>').insertBefore(".button__add");
    $(".sortable").sortable({
    disabled: false
    });
    $(".menu-box").css(
      "background-color","#BF7C00"
      );
    $(".menu-box__name_of_dish").css(
      "background-color","#BF7C00"
      );
    // $(".menu-box").addClass("vibration");
    $(".menu-box__name_of_dish").addClass("vibration");
// ソートの順番を保存する処理
    $(".sortable").sortable();
    $(".sortable").disableSelection();
  };
});

$(function() {
    // $("#sort_submit").click(function() {
    $(".menu-box__food").click(function() {
      var sort_result = $(".sortable").sortable("toArray", { attribute: 'id'});
      $("#sort_result").val(sort_result);
      // $("form").submit();
      console.log(JSON.stringify(sort_result));
    });
});

// deleteに関するjsを導入
$(function(){
  $(".button__delete").click(function(){
    if($(".button__delete").hasClass("doing")){
      $(this).removeClass("doing");
      $(".menu-box").removeClass("vibration");
      $(".menu-box__name_of_dish").removeClass("vibration");
      $(".delete").children().remove();;
    }else{
      $(this).addClass("doing");
      $(".menu-box").addClass("vibration");
      $(".menu-box__name_of_dish").addClass("vibration");
      $(".menu-box").removeClass("menu-box");
      $(".menu-box__name_of_dish").removeClass("menu-box__name_of_dish");
      $(".delete").prop("disabled", false);
      $(".deletemark").addClass("deletable");
      $(".button__delete").remove();
      $('<button form="delete_menu" class="button__delete--active" type="submit">ー</button>').insertAfter(".button__add");
      };
    });
});