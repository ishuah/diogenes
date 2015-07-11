from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from nucleus.models import Person
from nucleus.tasks import *
import urllib, requests, json


@login_required(login_url='/login/')
def dashboard(request):
	people = Person.objects.all()
	return render(request, 'nucleus/dashboard_list_profiles.html', {'people': people})

@login_required(login_url='/login/')
def add_person_profile(request):
	if request.method == "POST":
		Person.objects.create(name=request.POST.get("name"), short_description=request.POST.get("short_description"))
		messages.success(request, 'New person added successfully.')
		return render(request, 'nucleus/dashboard_new_profile.html')
	return render(request, 'nucleus/dashboard_new_profile.html')

@login_required(login_url='/login/')
def delete_profile(request, profileId):
	if request.method == "POST":
		Person.objects.get(pk=profileId).delete()
		return redirect('dashboard')
	else:
		person = Person.objects.get(pk=profileId)
		return render(request, 'nucleus/dashboard_confirm_profile_delete.html', {'person': person})

@login_required(login_url='/login/')
def view_profile(request, profileId):
	person = Person.objects.get(pk=profileId)
	if person.raw_data:
		raw_data = json.loads(person.raw_data)
		return render(request, 'nucleus/dashboard_view_profile.html', {'person': person, 'raw_data': raw_data})
	return render(request, 'nucleus/dashboard_view_profile.html', {'person': person} )

@login_required(login_url='/login/')
def profile_search(request, profileId):
	async_data_scrape.apply_async((profileId,))
	return redirect('view', profileId=profileId)

