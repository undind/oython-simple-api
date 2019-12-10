from flask import abort, make_response
from config import db
from models import Person, PersonSchema, Note


# Create a handler for our read (GET) people
def read_all():
    """
    This function responds to a request for /api/people
    with the complete lists of people

    :return:        json string of list of people
    """
    # Create the list of people from our data
    people = Person.query.order_by(Person.lname).all()

    person_schema = PersonSchema(many=True)
    return person_schema.dump(people)


def read_one(person_id):
    """
    This function responds to a request for /api/people/{person_id}
    with one matching person from people

    :param person_id:   ID of person to find
    :return:            person matching ID
    """
    # Get the person requested
    person = Person.query.filter(Person.person_id == person_id).outerjoin(Note).one_or_none()

    if person is not None:

        # Serialize the data for the response
        person_schema = PersonSchema()
        data = person_schema.dump(person)
        return data

    # otherwise, nope, not found
    else:
        abort(
            404, "Person not found for Id: {person_id}".format(person_id=person_id)
        )

    return person


def create(person):
    """
    This function creates a new person in the people structure
    based on the passed-in person data

    :param person:  person to create in people structure
    :return:        201 on success, 406 on person exists
    """
    lname = person.get("lname")
    fname = person.get("fname")

    # Does the person exist already?
    existing_person = Person.query.filter(Person.fname == fname).filter(Person.lname == lname).one_or_none()

    if existing_person is None:

        # Create a person instance using the schema and the passed in person
        schema = PersonSchema()
        new_person = schema.load(person, session=db.session)

        # Add the person to the database
        db.session.add(new_person)
        db.session.commit()

        # Serialize and return the newly created person in the response
        data = schema.dump(new_person)

        return data, 201

    else:
        abort(
            409,
            'Person {fname} {lname} exists already'.format(
                fname=fname, lname=lname
            )
        )


def update(person_id, person):
    """
    This function updates an existing person in the people structure
    :param person_id:   Id of the person to update in the people structure
    :param person:      person to update
    :return:            updated person structure
    """
    # Get the person requested from the db into session
    update_person = Person.query.filter(
        Person.person_id == person_id
    ).one_or_none()

    # Did we find an existing person?
    if update_person is not None:

        # turn the passed in person into a db object
        schema = PersonSchema()
        updated = schema.load(person, session=db.session)

        # Set the id to the person we want to update
        updated.person_id = update_person.person_id

        # merge the new object into the old and commit it to the db
        db.session.merge(updated)
        db.session.commit()

        # return updated person in the response
        data = schema.dump(update_person)

        return data, 200

    # Otherwise, nope, didn't find that person
    else:
        abort(404, f"Person not found for Id: {person_id}")


def delete(person_id):
    """
    This function deletes a person from the people structure
    :param person_id:   Id of the person to delete
    :return:            200 on successful delete, 404 if not found
    """
    # Get the person requested
    person = Person.query.filter(Person.person_id == person_id).one_or_none()

    # Did we find a person?
    if person is not None:
        db.session.delete(person)
        db.session.commit()
        return make_response(
            "Person {person_id} deleted".format(person_id=person_id), 200
        )

    # Otherwise, nope, didn't find that person
    else:
        abort(
            404,
            "Person not found for Id: {person_id}".format(person_id=person_id),
        )
