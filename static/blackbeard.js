requirejs.config({
    baseUrl: '/static/js',
    paths: {
        jquery: 'jquery-1.11.3.min',
        bloodhound: 'typehead/bloodhound.min',
        typeahead: 'typehead/typeahead.jquery.min',
        UIkit: 'uikit.min',
        upload: 'components/upload.min',
        notify: 'components/notify.min',
        htmleditor: 'components/htmleditor',
        marked: 'marked.min'
    },
    shim: {
        'UIkit':{
          'deps': ['jquery']
        },
        'upload':{
          'deps': ['UIkit']
        },
        'notify': {
          'deps': ['UIkit']
        },
        'marked': {
          exports: 'marked'
        },
        'htmleditor': {
          'deps': ['UIkit', 'marked']
        },
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
requirejs(['jquery', 'marked', 'codemirror/lib/codemirror', 'codemirror/mode/markdown/markdown', 'codemirror/addon/mode/overlay', 'codemirror/mode/xml/xml', 'codemirror/mode/gfm/gfm' , 'UIkit','notify', 'upload', 'typeahead' , 'bloodhound',  'htmleditor' ],
function($, marked, CodeMirror) {
    window.UIkit = UIkit;
    console.log(UIkit);
    window.CodeMirror = CodeMirror;
    window.marked = marked;
    

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

    editProfile = function(refined_data){
      $.ajax({
              url:'/api/v1/person/'+$('input[name=profileId]').val()+'/',
              type:"PATCH",
              data: JSON.stringify({refined_data:refined_data}),
              contentType:"application/json; charset=utf-8",
              dataType:"text"
            })
            .done(function(data){
                $('.typeahead').typeahead('val', '');
                UIkit.notify("<i class='uk-icon-plus-square'></i> Profile updated successfully", {status:'success'});
            })
            .fail(function()  {
                UIkit.modal.alert("Something went wrong!");
              }); 
    }

    fetchData = function(profileId){
      $.get('/api/v1/person/?format=json&id='+profileId, function(data){
              $('.typeahead').typeahead('val', '');
              fillData(data.objects[0]);
            });
    }

    fillData = function(data){
      var editor = $('.CodeMirror')[0].CodeMirror;
      $('input[name=profileId]').val(data.id);
      $('#profile h1.uk-article-title').text(data.name);
      $('#profile img.uk-thumbnail').attr('src', '/profile/image/'+data.id+'/');

      if(data.short_description)
        $('#profile p.uk-article-meta').text(data.short_description);
      else
        $('#profile p.uk-article-meta').text("Current occupation information not available");

      if(data.refined_data){
        $('#refined_data').html(data.refined_data);
        editor.setValue(data.refined_data);
      }
      else{
        $('#refined_data').html("<p  class=uk-article-lead'>Short Description not available</p>");
        editor.setValue("<p  class=uk-article-lead'>Short Description not available</p>");
      }
      editor.refresh();
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

    $('#edit').on('click', function(e){
      if($('#profile .editor').is(':visible')){
        var editor = $('.CodeMirror')[0].CodeMirror;
        $('#refined_data').html(editor.getValue());
        editProfile(editor.getValue());
        $('#profile .editor').hide();
        $('#cancel').hide();
        $('#refined_data').show();
        $(this).text('Edit');
      } else {
        $('#profile .editor').show();
        $('#cancel').show();
        $('#refined_data').hide();
        $(this).text('Save');
      }
    });

    $('#cancel').on('click', function(e){
        $('#profile .editor').hide();
        $('#cancel').hide();
        $('#refined_data').show();
        $('#edit').text('Edit');
    });

});