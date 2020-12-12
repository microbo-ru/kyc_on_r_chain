import os

from flask import Blueprint, jsonify, request

from project.api.models import Person
from project import db


persons_blueprint = Blueprint('persons', __name__)


@persons_blueprint.route('/persons', methods=['GET', 'POST'])
def all_persons():
    response_object = {
        'status': 'success',
        'container_id': os.uname()[1]
    }
    if request.method == 'POST':
        post_data = request.get_json()
        title = post_data.get('title')
        biohash = post_data.get('biohash')
        block = post_data.get('block')
        db.session.add(Person(title=title, biohash=biohash, block=block))
        db.session.commit()
        response_object['message'] = 'Person added!'
    else:
        response_object['persons'] = [person.to_json() for person in Person.query.all()]
    return jsonify(response_object)


@persons_blueprint.route('/persons/ping', methods=['GET'])
def ping():
    return jsonify({
        'status': 'success',
        'message': 'pong!',
        'container_id': os.uname()[1]
    })


@persons_blueprint.route('/persons/<person_id>', methods=['PUT', 'DELETE'])
def single_person(person_id):
    response_object = {
      'status': 'success',
      'container_id': os.uname()[1]
    }
    person = Person.query.filter_by(id=person_id).first()
    if request.method == 'PUT':
        post_data = request.get_json()
        person.title = post_data.get('title')
        person.biohash = post_data.get('biohash')
        person.block = post_data.get('block')
        db.session.commit()
        response_object['message'] = 'Person updated!'
    if request.method == 'DELETE':
        db.session.delete(person)
        db.session.commit()
        response_object['message'] = 'Person removed!'
    return jsonify(response_object)


if __name__ == '__main__':
    app.run()
