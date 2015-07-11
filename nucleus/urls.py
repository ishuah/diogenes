from django.conf.urls import include, url
from django.views.generic import RedirectView

urlpatterns = [
    url(r'^$', RedirectView.as_view(url='/dashboard/')),
    url(r'^dashboard/$', 'nucleus.views.dashboard', name='dashboard'),
    url(r'^dashboard/add-person-profile/$', 'nucleus.views.add_person_profile', name='new'),
    url(r'^dashboard/delete/(?P<profileId>[\d\w]{0,50})/$', 'nucleus.views.delete_profile', name='delete'),
    url(r'^dashboard/view/(?P<profileId>[\d\w]{0,50})/$', 'nucleus.views.view_profile', name='view'),
    url(r'^dashboard/profile_search/(?P<profileId>[\d\w]{0,50})/$', 'nucleus.views.profile_search', name='search'),
    url(r'^login/', 'django.contrib.auth.views.login', {'template_name': 'nucleus/login.html'}, name='login'),
    url(r'^logout/', 'django.contrib.auth.views.logout', {'template_name': 'nucleus/login.html'}, name='logout'),
]