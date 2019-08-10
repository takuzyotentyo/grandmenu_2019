// Lightboxの追加関数
$(function() {
	$(".button__add").click(function(){
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


//クリックで表示非表示の切り替え
function changeDisplay(class_middle){
  var str = document.getElementById("name_of_dish_" + class_middle);
  if(str.style.display == "none"){
    str.style.display = "block";
  }else{
    str.style.display = "none";
  }
}
