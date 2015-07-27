from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.contrib import messages
from django.http import HttpResponse
from nucleus.models import Person
from nucleus.tasks import *
import urllib, requests, json


@login_required(login_url='/login/')
def dashboard(request):
	people = Person.objects.all()
	return render(request, 'nucleus/base_dashboard.html')

@csrf_exempt
@login_required(login_url='/login/')
def upload_image(request, profileId):
	if request.method == 'POST':
		profile = Person.objects.get(pk=profileId)
		profile.image = request.FILES.get('files[]')
		profile.save()
		return HttpResponse(request, status=201)

@login_required(login_url='/login/')
def profile_image(request, profileId):
	profile = Person.objects.get(pk=profileId)
	if profile.image:
		return HttpResponse(profile.image.read(), content_type="image/png")
	image = open('static/img/placeholder_200x200.svg')
	return HttpResponse(image.read(), content_type="image/svg+xml")


