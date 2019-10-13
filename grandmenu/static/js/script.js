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
      "background-color","#FFA500"
      );
  }else{
    $(this).addClass("doing");
    $(".sortable").sortable({
    disabled: false
    });
    $(".menu-box").css(
      "background-color","#E2421F"
      );
    $(".sortable").sortable();
    $(".sortable").disableSelection();
  }
    // $("#submit").click(function() {
    //   var result = $(".sortable").sortable("toArray");
    // $("#result").val(result);
    // $("form").submit();
    //   });
});



