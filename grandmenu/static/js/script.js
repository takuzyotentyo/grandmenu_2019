// Lightboxの追加関数
$(function() {
	$(".menu-box__add").click(function(){
		$(".lightbox").css(
        "display", "flex"
    	);
	});
});


// ドラック&ドロップでメニューの順番を並べ替える関数
$(function() {
      $(".sortable").sortable();
      $(".sortable").disableSelection();
      $("#submit").click(function() {
          var result = $(".sortable").sortable("toArray");
          $("#result").val(result);
          $("form").submit();
      });
  });