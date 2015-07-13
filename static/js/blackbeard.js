//Aye aye captain
$( document ).ready(function() {
    $('#add-person').click(function(){
    	$('#add-person-form').show()
    });

    $('#add-person-cancel').click(function(){
    	$('#add-person-form').hide()
    });
	
	$('#add-person-form').submit(function(event){
    	event.preventDefault();
    });

});