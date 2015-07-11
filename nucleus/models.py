from mongoengine import *

class Person(Document):
	name = StringField(required=True, max_length=200)
	image = ImageField()
	short_description = StringField(max_length=500)
	tags = ListField(StringField(max_length=50))
	related_people = ListField(StringField())
	status = StringField(default='unexplored')
	raw_data = StringField()
	refined_data = StringField()
	
class Relationship(Document):
	personA = ReferenceField(Person)
	personB = ReferenceField(Person)
	abRelationship = StringField(default='undefined')
	baRelationship = StringField(default='undefined')