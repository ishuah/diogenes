from tastypie import authorization
from tastypie_mongoengine import resources,fields
from tastypie.constants import ALL, ALL_WITH_RELATIONS
from tastypie.authorization import Authorization
from models import Person, Relationship
from tasks import *

class PersonResource(resources.MongoEngineResource):
	class Meta:
		queryset = Person.objects.all()
		authorization = Authorization()
		resource_name = 'person'
		filtering = {
			"name": ALL,
			"id": ALL
		}

	def obj_create(self, bundle, request = None, **kwargs):
		bundle = super(PersonResource, self).obj_create(bundle, request=request, **kwargs)
		async_data_scrape.apply_async((bundle.obj.id,))
		return bundle

class RelationshipResource(resources.MongoEngineResource):
	personB = fields.ReferenceField(to='nucleus.resources.PersonResource', attribute='personB', full=True)
	class Meta:
		queryset = Relationship.objects.all()
		authorization = Authorization()
		filtering = {
			"personA": ALL_WITH_RELATIONS,
			"personB": ALL_WITH_RELATIONS
		}
