from sqlalchemy.ext.associationproxy import association_proxy
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import MetaData
from sqlalchemy.orm import validates
from sqlalchemy_serializer import SerializerMixin
from sqlalchemy.ext.hybrid import hybrid_property



metadata = MetaData(naming_convention={
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
})

db = SQLAlchemy(metadata=metadata)


class User(db.Model, SerializerMixin):
    __tablename__= 'users'

    id = db.Column(db.Integer, primary_key=True)
    user_name = db.Column(db.String)
    email = db.Column(db.String)
    _password_hash = db.Column(db.String, nullable=False)

    builds = db.relationship("Build", cascade='all, delete', backref='user')
    usernotes = db.relationship("UserNote", cascade='all, delete', backref='user')
    usergroups = db.relationship("UserGroup", cascade='all, delete', backref='user')


    serialize_rules = ('id', 'user_name', 'email')



    @classmethod
    def clear_validation_errors(cls):
        cls.validation_errors = []

    @hybrid_property
    def password_hash(self):
        return self._password_hash

    @password_hash.setter
    def password_hash(self, password):
        from app import bcrypt
        if type(password) is str and 8 <= len(password) <= 16:
            password_hash = bcrypt.generate_password_hash(password.encode('utf-8'))
            self._password_hash = password_hash.decode('utf-8')
        else:
            self.validation_errors.append('Password must be between 8 and 16 characters long.')

    def authenticate(self, password):
        from app import bcrypt
        return bcrypt.check_password_hash(self._password_hash, password.encode('utf-8'))

    @validates('user_name')
    def validate_user_name(self, key, user_name):
        if User.query.filter_by(user_name=user_name).first():
            self.validation_errors.append('Username is already in use')
            raise ValueError('Username is already in use')
        if type(user_name) is str and 8 <= len(user_name) <= 16:
            return user_name
        else:
            self.validation_errors.append('Username must be between 8 and 16 characters long')
            raise ValueError('Username must be between 8 and 16 characters long')

    @validates('email')
    def validate_email(self, key, email):
        if User.query.filter_by(email=email).first():
            self.validation_errors.append('Email is already in use')
            raise ValueError('Email is already in use')
        if type(email) is str:
            return email
        else:
            self.validation_errors.append('Email must be a string')
            raise ValueError('Email must be a string')



class Build (db.Model, SerializerMixin):
    __tablename__= 'builds'

    id =db.Column(db.Integer, primary_key=True)
    build_name =db.Column(db.String)
    matchup =db.Column(db.String)
    category =db.Column(db.String)
    build_order =db.Column(db.String )

    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))

serialize_rules = ('id', 'build_name', 'matchup', "category", 'build_order')


# Validations
# Build Name x characters max
# Matchup, only allowable matchups accepted are TVT TVP TVZ, PVP, PVT, PVZ, and ZVZ, ZVT, ZVP 
# Category only allowable categories accepted are Mech, Bio, Air, Mix, .....etc...
# Build order only format acceptedd....length x characters max 

class Result(db.Model, SerializerMixin):
    __tablename__= 'results'
    
    id =db.Column(db.Integer, primary_key=True)
    opp_division =db.Column(db.String)
    win_loss =db.Column(db.String)
    
    build_id = db.Column(db.Integer, db.ForeignKey('builds.id'))

    serialize_rules = ('id', 'opp_division', 'win_loss', 'build_id')

# Validations
# Divsions allowed b3, b2, b1, S1, S2, S3, G1, G2, G3, P1, P2, P3, D1, D2, D3, M1, M2, M3, GM 
# Win loss : there is no draws, you only add to the results when you used a build and a full game was completed no astrices...Only a W or L allwoed
# A valid Build id tied to the exact user adding the result will only be accepted 

class Group(db.Model, SerializerMixin):
    __tablename__= 'groups'

    id =db.Column(db.Integer, primary_key=True)
    group_name =db.Column(db.String)

    serialize_rules = ('id', 'group_name')

# Validations
# Group Name can not already exist, Group Name x characters long maximum


class UserGroup(db.Model, SerializerMixin):
    __tablename__= 'usergroups'


    id =db.Column(db.Integer, primary_key=True)



    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    group_id = db.Column(db.Integer, db.ForeignKey('groups.id'))

    serialize_rules = ("user_id", "group_id")

# Validations


class UserNote(db.Model, SerializerMixin):
    __tablename__= 'usernotes'

    id =db.Column(db.Integer, primary_key=True)
    note =db.Column(db.String) 

    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    build_id = db.Column(db.Integer, db.ForeignKey('builds.id'))

    serialize_rules = ('id', 'note', 'build_id')

# Validations
# Cap the length of a note to  x characters maximum
# Valid user_id, and build_id required to post