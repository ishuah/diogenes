//Aye aye captain
$(function(){
  notFound = function (data) {
    return '<div id="notfound"><a onclick="newprofile(\''+data.query.replace(/'/g, "\\'")+'\');"><i class="uk-icon-plus-square"></i> Create a profile for '+data.query+'</a></div>';
}

suggestion = function(data){
            return '<div><a href="'+data.resource_uri+'">'+data.name+'</a></div>';
        }

newprofile = function(query){
  UIkit.modal.prompt("<h2>New Profile</h2>\nProfile name: ", query, function(value){
    $.ajax({
      url:'/api/v1/person/?format=json',
      type:"POST",
      data: JSON.stringify({name:value, status:1}),
      contentType:"application/json; charset=utf-8",
      dataType:"text"
    })
    .done(function(data){
        $('.typeahead').typeahead('val', '');
        UIkit.notify("<i class='uk-icon-plus-square'></i> Profile created successfully", {status:'success'});
    })
    .fail(function()  {
        UIkit.modal.alert("Something went wrong!");
      }); 
  });
}

var profiles = new Bloodhound({
  datumTokenizer: Bloodhound.tokenizers.whitespace,
  queryTokenizer: Bloodhound.tokenizers.whitespace,
  remote: {
        url: '/api/v1/person/?format=json&name__icontains=%QUERY',
        wildcard: '%QUERY',
        filter: function (profiles) {
            return $.map(profiles.objects, function (profile) {
                return profile;
            });
        }
    }
});

$('#bloodhound .typeahead').typeahead({
      hint: true,
      highlight: true,
      minLength: 3
    },
    {
      name: 'profiles',
      display: 'name',
      source: profiles,
      templates: {
            suggestion: suggestion,
            notFound: notFound
        }
    });


$.get('/api/v1/person/?format=json&limit=0', function(data){ 
  for (var i = data.objects.length - 1; i >= 0; i--) {
    if (data.objects[i].status == 0)
      $('#unqueued').append('<div class="uk-width-medium-1-1">'+
                            '<a href="view/'+data.objects[i].id+'" class="uk-panel uk-panel-hover">'+
                              '<h3 class="uk-panel-title">'+
                                data.objects[i].name +
                              '</h3>'+
                            '</a>'+
                            '</div>');
    else if (data.objects[i].status == 1)
      $('#queued').append('<div class="uk-width-medium-1-1">'+
                            '<a href="view/'+data.objects[i].id+'" class="uk-panel uk-panel-hover">'+
                              '<h3 class="uk-panel-title">'+
                                data.objects[i].name +
                              '</h3>'+
                            '</a>'+
                            '</div>');
    else if (data.objects[i].status == 2)
      $('#unrefined').append('<div class="uk-width-medium-1-1">'+
                            '<a href="view/'+data.objects[i].id+'" class="uk-panel uk-panel-hover">'+
                              '<h3 class="uk-panel-title">'+
                                data.objects[i].name +
                              '</h3>'+
                            '</a>'+
                            '</div>');
    else if (data.objects[i].status == 3)
      $('#refined').append('<div class="uk-width-medium-1-1">'+
                            '<a href="view/'+data.objects[i].id+'" class="uk-panel uk-panel-hover">'+
                              '<h3 class="uk-panel-title">'+
                                data.objects[i].name +
                              '</h3>'+
                            '</a>'+
                            '</div>');
  };
});
});
