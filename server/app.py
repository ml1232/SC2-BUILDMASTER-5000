from flask import Flask, request, make_response, jsonify, session
from flask_cors import CORS
from flask_migrate import Migrate
from flask_restful import Api
from flask_sqlalchemy import SQLAlchemy
from models import db, User, Build, Result, Group, UserGroup, UserNote
import os
from flask_cors import cross_origin
from sqlalchemy import and_
from werkzeug.exceptions import NotFound, Unauthorized
from flask_session import Session 




BASE_DIR = os.path.abspath(os.path.dirname(__file__))
DATABASE = os.environ.get("DB_URI", f"sqlite:///{os.path.join(BASE_DIR, 'app.db')}")

print(f"Database file path: {DATABASE}")

app = Flask(__name__)
CORS(app)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:////home/ml1232/Development/code/phase-4/CAPSTONEDIRECTORY/CAPSTONED/server/app.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.json.compact = False

app.secret_key = b'L\x06\xb2YA\x9b&U\xc0\xa6\xdc\x0b\xf8\xf6\x89s'


migrate = Migrate(app, db)
api = Api(app)
db.init_app(app)

from flask_bcrypt import Bcrypt
bcrypt = Bcrypt( app )


@app.route('/')
def index():
    return '<h1>Project Server</h1>'



@app.route('/api/register', methods=['POST'])
def register():
    data = request.json  # Extract user registration data from the request

    if 'user_name' not in data or 'email' not in data or 'password' not in data:
        response = make_response(jsonify({'message': 'Missing required fields'}), 400)
        return response

 
    new_user = User(
        user_name=data['user_name'],
        email=data['email'],
        password_hash = data['password'] # Save the hashed password
    )

    print (data['password'])


    db.session.add(new_user)
    db.session.commit()

    response = make_response(jsonify({'message': 'User registered successfully'}), 201)
    return response


@app.route('/api/login', methods=['POST'])
def login():
    data = request.json  # Extract login data from the request

    if 'user_name' not in data or 'password' not in data:
        response = make_response(jsonify({'message': 'Missing required fields'}), 400)
        return response

    # Query the database to find the user with the provided username
    print (data['user_name'])
    user = User.query.filter_by(user_name = data['user_name']).first()

    print (data['password'])

    
    if user and user.authenticate(data['password']) :
        session['user_id'] = user.id  # Store the user_id in the session
        response = make_response(jsonify({'message': 'Login successful'}), 200)
        return response
    
    else:
        response = make_response(jsonify({'message': 'Invalid credentials'}), 401)
        return response



@app.route('/api/user_info', methods=['GET'])
def get_user_info():
    if 'user_id' in session:
        user_id = session['user_id']
        
        if user_id:
            user = User.query.get(user_id)
            
            if user:
                # Return user information
                return jsonify({'user_id': user.id, 'user_name': user.user_name, 'email': user.email}), 200
            else:
                return jsonify({'message': 'User not found'}), 404
        else:
            return jsonify({'message': 'User ID is not set in the session'}), 400
    else:
        return jsonify({'message': 'Not logged in'}), 401
    

# Add a new route for sign-out
@app.route('/api/signout', methods=['GET'])
def signout():
    if 'user_id' in session:
        session.pop('user_id', None)  # Clear the user_id from the session
        return jsonify({'message': 'Sign out successful'}), 200
    else:
        return jsonify({'message': 'Not logged in'}), 401



# Class User

@app.route('/api/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    try:
        # Retrieve the user with the specified user_id
        user = User.query.get(user_id)

        if not user:
            return jsonify({'error': 'User not found'}), 404

        db.session.delete(user)
        db.session.commit()

        return jsonify({'message': 'User deleted successfully'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Failed to delete user", "error": str(e)}), 500



#class Builds 

@app.route('/api/builds', methods=['POST'])
def create_build():

    data = request.get_json()

    user_id = data.get('user_id')
    build_name = data.get('build_name')
    matchup = data.get('matchup')
    category = data.get('category')
    build_order = data.get('build_order')

    try:

        new_build = Build(
            user_id=user_id,
            build_name=build_name,
            matchup=matchup,
            category=category,
            build_order=build_order
        )

        db.session.add(new_build)
        db.session.commit()

        return jsonify({'message': 'Build created successfully'}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Failed to create build", "error": str(e)}), 500
    



@app.route('/api/builds', methods=['GET'])

def get_all_builds():
    user_id = request.args.get('user_id')   # pass user_id as a query parameter

    if user_id is None:
        return jsonify({'error': 'User ID is required in the query parameters'}), 400

    try:
        # Retrieve all custom builds for the user with the specified user_id
        builds = Build.query.filter_by(user_id=user_id).all()

        # Create a list containing build_id and build_name for each build
        builds_data = [{'build_id': build.id, 'build_name': build.build_name, 'matchup': build.matchup, 'category': build.category, 'build_order': build.build_order} for build in builds]

        return jsonify(builds_data), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Failed to retrieve builds", "error": str(e)}), 500
    


#class BuildsById 

@app.route('/api/builds/<int:build_id>', methods=['GET'])
def get_single_build(build_id):
    try:
  
        build = Build.query.get(build_id)

        if not build:
            return jsonify({'error': 'Build not found'}), 404

        # data returned
        build_data = {
            'build_id': build.id,
            'build_name': build.build_name,
            'matchup': build.matchup,
            'category': build.category,
            'build_order': build.build_order,
            'user_id': build.user_id
        }

        return jsonify(build_data), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Failed to retrieve build", "error": str(e)}), 500
    


@app.route('/api/builds/<int:build_id>', methods=['PUT'])
def update_build(build_id):

    try:
        # Retrieve the build with the specified build_id
        build = Build.query.get(build_id)

        if not build:
            return jsonify({'error': 'Build not found'}), 404

        # Parse the request data (assuming it contains fields you want to update)
        data = request.get_json()

        # Update the build attributes with the new data
        if 'build_name' in data:
            build.build_name = data['build_name']
        if 'matchup' in data:
            build.matchup = data['matchup']
        if 'category' in data:
            build.category = data['category']
        if 'build_order' in data:
            build.build_order = data['build_order']

        db.session.commit()

        return jsonify({'message': 'Build updated successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Failed to update build", "error": str(e)}), 500
    




@app.route('/api/builds/<int:build_id>', methods=['DELETE'])
def delete_build(build_id):
    try:
        # Retrieve the build with the specified build_id
        build = Build.query.get(build_id)

        if not build:
            return jsonify({'error': 'Build not found'}), 404

        # Delete the build from the database
        db.session.delete(build)
        db.session.commit()

        return jsonify({'message': 'Build deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Failed to delete build", "error": str(e)}), 500



#class Results

@app.route('/api/results', methods=['POST'])
def post_match_result():
    try:
        data = request.get_json()

        # Assuming your request data includes opp_division, win_loss, and build_id
        opp_division = data.get('opp_division')
        win_loss = data.get('win_loss')
        build_id = data.get('build_id')

        # Create a new Result instance
        new_result = Result(
            opp_division=opp_division,
            win_loss=win_loss,
            build_id=build_id
        )

        # Add the new_result to the database
        db.session.add(new_result)
        db.session.commit()

        return jsonify({'message': 'Match result posted successfully'}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Failed to post match result", "error": str(e)}), 500



@app.route('/api/results', methods=['GET'])
def get_all_results():
    user_id = request.args.get('user_id')  # pass user_id as a query parameter

    if user_id is None:
        return jsonify({'error': 'User ID is required in the query parameters'}), 400

    try:
        # Retrieve all match results for the user with the specified user_id
        results = db.session.query(Result).join(Build).filter(and_(Build.user_id == user_id, Build.id == Result.build_id)).all()

        # Create a list containing result details for each result
        results_data = [{'result_id': result.id, 'opp_division': result.opp_division, 'win_loss': result.win_loss, 'build_id': result.build_id} for result in results]

        return jsonify(results_data), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Failed to retrieve results", "error": str(e)}), 500


@app.route('/api/results/by-build-id', methods=['GET'])
def get_results_by_build_id():
    build_id = request.args.get('build_id')  # pass build_id as a query parameter

    if build_id is None:
        return jsonify({'error': 'Build ID is required in the query parameters'}), 400

    try:
        # Retrieve results for the specified build ID
        results = Result.query.filter_by(build_id=build_id).all()

        # Create a list containing result details for each result
        results_data = [{'result_id': result.id, 'opp_division': result.opp_division, 'win_loss': result.win_loss, 'build_id': result.build_id} for result in results]

        return jsonify(results_data), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Failed to retrieve results by Build ID", "error": str(e)}), 500



# Retrieve All Match Results for all Custom Builds (GET /api/results/<custombuild_id>) Return data in specific format displaying only key stats for each build they have 

# class Groups 

@app.route('/api/groups', methods=['POST'])
def create_group():
    try:
        data = request.get_json()

        # Assuming your request data includes user_id and group_name
        user_id = data.get('user_id')
        group_name = data.get('group_name')

        # Create a new Group instance
        new_group = Group(
            group_name=group_name
        )

        # Add the new_group to the database
        db.session.add(new_group)
        db.session.commit()

        # Retrieve the group_id of the newly created group
        group_id = new_group.id

        # Create an entry in the UserGroups table to represent the user's relationship with the group
        user_group = UserGroup(
            user_id=user_id,
            group_id=group_id
        )

        # Add the user_group to the database
        db.session.add(user_group)
        db.session.commit()

        return jsonify({'message': 'Group created successfully'}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Failed to create group", "error": str(e)}), 500



@app.route('/api/groups', methods=['GET'])
def get_all_groups():
    try:
        user_id = request.args.get('user_id')  # Assuming you pass user_id as a query parameter

        # Retrieve all groups for the user with the specified user_id, including group_name
        user_groups = db.session.query(UserGroup, Group.group_name).join(Group).filter(UserGroup.user_id == user_id).all()

        # Create a list containing group_id and group_name for each group
        groups_data = [{'group_id': user_group.UserGroup.group_id, 'group_name': user_group.group_name} for user_group in user_groups]

        return jsonify(groups_data), 200
    except Exception as e:
        return jsonify({"message": "Failed to retrieve groups", "error": str(e)}), 500

# Class UserGroup by id



@app.route('/api/usergroups/<int:group_id>', methods=['GET'])
def get_group_members(group_id):
    try:
        # Retrieve all user_ids for the specified group_id
        user_ids = UserGroup.query.filter_by(group_id=group_id).with_entities(UserGroup.user_id)

        # Retrieve all user data for the user_ids in the group
        group_members = User.query.filter(User.id.in_(user_ids)).all()

        # Create a list containing user_id and user_name for each group member
        group_members_data = [{'user_id': user.id, 'user_name': user.user_name} for user in group_members]

        return jsonify(group_members_data), 200
    except Exception as e:
        return jsonify({"message": "Failed to retrieve group members", "error": str(e)}), 500





@app.route('/api/groups/<int:group_id>', methods=['DELETE'])
def delete_group(group_id):
    try:
        # Retrieve the group with the specified group_id
        group = Group.query.get(group_id)

        if not group:
            return jsonify({'error': 'Group not found'}), 404

        # Delete the group from the database
        db.session.delete(group)
        db.session.commit()

        return jsonify({'message': 'Group deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Failed to delete group", "error": str(e)}), 500



@app.route('/api/usergroups', methods=['POST'])
def add_users_to_group():
    try:
        data = request.get_json()

        # Assuming your request data includes group_id, user_id, and user_names
        group_id = data.get('group_id')
        user_id = data.get('user_id')
        user_names = data.get('user_names')

        # Split user_names by comma and remove any leading/trailing spaces
        user_names = [name.strip() for name in user_names.split(',')]

        for user_name in user_names:
            # Find the user with the given user_name
            user = User.query.filter_by(user_name=user_name).first()

            if user:
                # Create a new UserGroup instance to associate the user with the group
                new_usergroup = UserGroup(
                    user_id=user_id,
                    group_id=group_id
                )

                db.session.add(new_usergroup)

        db.session.commit()

        return jsonify({'message': 'Users added to the group successfully'}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Failed to add users to the group", "error": str(e)}), 500



@app.route('/api/usergroups/<int:user_id>/<int:group_id>', methods=['DELETE'])
def remove_user_from_group(user_id, group_id):
    usergroup = UserGroup.query.filter_by(user_id=user_id, group_id=group_id).first()

    if usergroup:
        db.session.delete(usergroup)
        db.session.commit()
        return jsonify({'message': 'User removed from group successfully'}), 200
    else:
        return jsonify({'error': 'User not found in the group'}), 404




@app.route('/api/usernotes', methods=['POST'])
def create_user_note():
    try:
        data = request.get_json()

        user_id = data.get('user_id')
        build_id = data.get('build_id')
        note = data.get('note')

        # Create a new UserNote instance
        new_user_note = UserNote(
            user_id=user_id,
            build_id=build_id,
            note=note
        )

        db.session.add(new_user_note)
        db.session.commit()

        return jsonify({'message': 'User Note created successfully'}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Failed to create user note", "error": str(e)}), 500




@app.route('/api/usernotes/<int:build_id>', methods=['GET'])
def get_user_notes_by_build(build_id):
    try:
        # Retrieve all user notes for the specified build_id
        user_notes = UserNote.query.filter_by(build_id=build_id).all()

        # Create a list containing note_id and the actual note content
        user_notes_data = [{'note_id': note.id, 'note': note.note} for note in user_notes]

        return jsonify(user_notes_data), 200

    except Exception as e:
        return jsonify({"message": "Failed to retrieve user notes", "error": str(e)}), 500



@app.route('/api/usernotes/<int:usernote_id>', methods=['PUT'])
def update_user_note(usernote_id):
    try:
        data = request.get_json()

        # Retrieve the user note with the specified usernote_id
        user_note = UserNote.query.get(usernote_id)

        if not user_note:
            return jsonify({'error': 'User Note not found'}), 404

        # Update the note content
        user_note.note = data.get('note')

        db.session.commit()

        return jsonify({'message': 'User Note updated successfully'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Failed to update user note", "error": str(e)}), 500
    



@app.route('/api/usernotes/<int:usernote_id>', methods=['DELETE'])
def delete_user_note(usernote_id):
    try:
        # Retrieve the user note with the specified usernote_id
        user_note = UserNote.query.get(usernote_id)

        if not user_note:
            return jsonify({'error': 'User Note not found'}), 404

        db.session.delete(user_note)
        db.session.commit()

        return jsonify({'message': 'User Note deleted successfully'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Failed to delete user note", "error": str(e)}), 500


if __name__ == '__main__':
    app.run(port=5555, debug=True)