import datetime

from flask import current_app
from sqlalchemy.sql import func

from project import db


class Person(db.Model):

    __tablename__ = 'persons'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    title = db.Column(db.String(255), nullable=False)
    biohash = db.Column(db.String(255), nullable=False)
    block = db.Column(db.Boolean(), default=False, nullable=False)

    def __init__(self, title, biohash, block):
        self.title = title
        self.biohash = biohash
        self.block = block

    def to_json(self):
        return {
            'id': self.id,
            'title': self.title,
            'biohash': self.biohash,
            'block': self.block
        }
