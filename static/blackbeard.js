requirejs.config({
    baseUrl: '/static/js',
    paths: {
        jquery: 'jquery-1.11.3.min',
        bloodhound: 'typehead/bloodhound.min',
        typeahead: 'typehead/typeahead.jquery.min'

    },
    shim: { 
        'bloodhound': {
            'deps': ['jquery'],
            exports: 'Bloodhound'
        },
        'typeahead': {
            'deps': ['jquery'],
            exports: '$.fn.typeahead'
        }
    }
});
requirejs(['jquery', 'uikit.min', 'components/notify.min', 'components/upload.min', 'typeahead' , 'bloodhound' ],
function($) {
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
      $('input[name=profileId]').val(data.id);
      $('#profile h1.uk-article-title').text(data.name);
      $('#profile img.uk-thumbnail').attr('src', '/profile/image/'+data.id+'/');

      if(data.short_description)
        $('#profile p.uk-article-meta').text(data.short_description);
      else
        $('#profile p.uk-article-meta').text("Current occupation information not available");

      if(data.refined_data)
        $('#profile p.uk-article-lead').text(data.refined_data);
      else
        $('#profile p.uk-article-lead').text("Short Description not available");

      $('#profile').show();
    }

    var progressbar = $("#progressbar"),
        bar         = progressbar.find('.uk-progress-bar'),
        settings    = {

        actionUrl: '/dashboard/upload_image/', // upload url

        allow : '*.(jpg|jpeg|gif|png)', // allow only images

        loadstart: function() {
            bar.css("width", "0%").text("0%");
            progressbar.removeClass("uk-hidden");
        },

        progress: function(percent) {
            percent = Math.ceil(percent);
            bar.css("width", percent+"%").text(percent+"%");
        },

        allcomplete: function(response) {

            bar.css("width", "100%").text("100%");

            setTimeout(function(){
                progressbar.addClass("uk-hidden");
            }, 250);

            $('#profile img.uk-thumbnail').attr('src', '/profile/image/'+$('input[name=profileId]').val()+'/?'+ + new Date().getTime());
            UIkit.notify("<i class='uk-icon-plus-square'></i> Upload completed", {status:'success'});
        },

        before: function(settings, files){
          settings.action = settings.actionUrl+$('input[name=profileId]').val()+'/';
          console.log(files);
        }
    };

    var select = UIkit.uploadSelect($("#upload-select"), settings),
    drop   = UIkit.uploadDrop($("#upload-drop"), settings);

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