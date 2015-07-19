from tastypie import authorization
from tastypie_mongoengine import resources
from tastypie.constants import ALL, ALL_WITH_RELATIONS
from tastypie.authorization import Authorization
from tastypie import fields
from models import Person
from tasks import *

class PersonResource(resources.MongoEngineResource):
	class Meta:
		queryset = Person.objects.all()
		authorization = Authorization()
		filtering = {
			"name": ALL
		}

	def obj_create(self, bundle, request = None, **kwargs):
		bundle = super(PersonResource, self).obj_create(bundle, request=request, **kwargs)
		async_data_scrape.apply_async((bundle.obj.id,))
		return bundle
