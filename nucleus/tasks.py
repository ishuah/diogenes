from __future__ import absolute_import
from celery import shared_task, task, app, Task, current_task
from nucleus.models import Person, Relationship
from django.utils.html import strip_tags
import urllib, requests, json, nltk, mongoengine
from nltk import sent_tokenize, word_tokenize, pos_tag, ne_chunk
from nameparser.parser import HumanName
from pprint import pprint

BASE_QUERY = 'https://www.googleapis.com/customsearch/v1?cx=013124516719686669170%3Ahfjkbqcngvw&key=AIzaSyCqVoHi8XHEkPyGQW64HfDdslcdQNxV-VQ&'

@shared_task
def async_data_scrape(profileId):
	person = Person.objects.get(pk=profileId)
	query = { 'q': person.name }
	url = BASE_QUERY + urllib.urlencode(query)
	req = requests.get(url)
	if req.status_code == 200:
		results = req.json()
		for item in results['items']:
			try:
				r = requests.get(item['link'])
				if r.status_code == 200 and 'text/html' in r.headers['content-type']:
					names = get_human_names(strip_tags(r.text))
					for name in names:
						try:
							new_person = Person.objects.create(name=name)
							Relationship.objects.create(personA=person, personB=new_person)
						except mongoengine.NotUniqueError as e:
							print e
			except Exception as e:
				print e
		person.raw_data = json.dumps(results)
		person.status = 'unrefined'
		person.save()

def get_human_names(text):
	tokens = nltk.tokenize.word_tokenize(text)
	pos = nltk.pos_tag(tokens)
	sentt = nltk.ne_chunk(pos, binary = False)
	person_list = []
	person = []
	name = ""
	for subtree in sentt.subtrees(filter=lambda t: t.label() == 'PERSON'):
		for leaf in subtree.leaves():
			person.append(leaf[0])
		if len(person) > 1:
			for part in person:
				name += part + ' '
			if name[:-1] not in person_list:
				person_list.append(name[:-1])
			name = ''
		person = []

	return (person_list)