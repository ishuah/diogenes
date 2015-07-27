//Aye aye captain
$(function(){
  notFound = function (data) {
    return '<div id="notfound"><a onclick="newprofile(\''+data.query.replace(/'/g, "\\'")+'\');"><i class="uk-icon-plus-square"></i> Create a profile for '+data.query+'</a></div>';
}

suggestion = function(data){
            return '<div><a onclick="fetchData(\''+data.id+'\')">'+data.name+'</a></div>';
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
        fillData(JSON.parse(data));
    })
    .fail(function()  {
        UIkit.modal.alert("Something went wrong!");
      }); 
  });
}

fetchData = function(profileId){
  $.get('/api/v1/person/?format=json&id='+profileId, function(data){
          $('.typeahead').typeahead('val', '');
          fillData(data.objects[0]);
        });
}

fillData = function(data){
  $('#profile h1.uk-article-title').text(data.name);
  console.log(data.name);
  $('#profile').show();
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
        },
        cache: false
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

});
