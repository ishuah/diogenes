from django.conf.urls import include, url
from django.views.generic import RedirectView
from tastypie.api import Api
from resources import PersonResource, RelationshipResource

v1_api = Api(api_name='v1')
v1_api.register(PersonResource())
v1_api.register(RelationshipResource())

urlpatterns = [
    url(r'^$', RedirectView.as_view(url='/dashboard/')),
    url(r'^dashboard/$', 'nucleus.views.dashboard', name='dashboard'),
    url(r'^dashboard/upload_image/(?P<profileId>[\d\w]{0,50})/$', 'nucleus.views.upload_image', name='upload_image'),
    url(r'^profile/image/(?P<profileId>[\d\w]{0,50})/$', 'nucleus.views.profile_image', name='profile_image'),
    url(r'^login/', 'django.contrib.auth.views.login', {'template_name': 'nucleus/login.html'}, name='login'),
    url(r'^logout/', 'django.contrib.auth.views.logout', {'template_name': 'nucleus/login.html'}, name='logout'),
    url(r'^api/', include(v1_api.urls)),
]
