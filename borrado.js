console.log("Borrado.js!");

$(".borrado").confirmation({singleton: true, onComplete: borrado})



function borrado () {
	var selectedRow = $(this).parent().parent();
	var filaId = selectedRow.attr("id");
	var idNum = filaId.substring(4);
	var jqxhr = $.ajax( "borrarFila?fila=" + idNum )
	  .done(function(data) {
	  	if (data=="ok") {
	    	selectedRow.animate({opacity: 0, backgroundColor: "red"}, 500, 'swing', function() {
	    		$(this).remove();
	    	});
	  	}
	  })
	  .fail(function() {
	    alert( "error" );
	  });	
}

$(".borrado").hover(function(){
	$(this).parent().parent().addClass("filasporborrar");
}, function(){
	$(this).parent().parent().removeClass("filasporborrar");
});





/*
$(".borrado").click(function(){
	var color = $(this).parent().parent().css("color");
	if (color == "rgb(51, 51, 51)") {
	$(this).parent().parent().css("color","rgb(255, 0, 0)");
} else {
	$(this).parent().parent().css("color","rgb(51, 51, 51)")
}
});
*/


