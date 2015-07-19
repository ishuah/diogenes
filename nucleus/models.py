from mongoengine import *

CHOICES = (
		(0, 'unqueued'),
		(1, 'queued'),
		(2, 'unrefined'),
		(3, 'refined')
	)

class Person(Document):
	name = StringField(required=True, max_length=200)
	image = ImageField()
	short_description = StringField(max_length=500)
	tags = ListField(StringField(max_length=50))
	related_people = ListField(StringField())
	status = IntField(default=0, choices=CHOICES)
	raw_data = StringField()
	refined_data = StringField()
	
class Relationship(Document):
	personA = ReferenceField(Person)
	personB = ReferenceField(Person)
	abRelationship = StringField(default='undefined')
	baRelationship = StringField(default='undefined')