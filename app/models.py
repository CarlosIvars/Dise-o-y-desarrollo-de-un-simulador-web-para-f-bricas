# Modelos de base de datos
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin
from flask_mysqldb import MySQL
import json
from app import app
from flask import jsonify

conexion = MySQL(app)

def get_db_connection():
    try:
        conn = conexion.connection
        # Intenta realizar una consulta simple para verificar la conexión
        conn.ping()
    except Exception as e:
        app.logger.error(f'Error al conectar con la base de datos: {e}')
        conn = conexion.connect  # Reconectar si hay un fallo
    return conn

class UserModel(UserMixin):

    def __init__(self, username, name=None, surname=None, password=None):
        self.id = username
        self.name = name
        self.surname = surname
        self.password = generate_password_hash(password) if password else None

    @staticmethod
    def get(username):
        try:
            cursor = get_db_connection().cursor()
            sql = "SELECT nombre, apellidos, username FROM usuarios WHERE username = '{0}'".format(username)
            cursor.execute(sql)
            datos = cursor.fetchone()
            
            if datos != None:
                user = [{'nombre': datos[0], 'apellidos': datos[1], 'username': datos[2]}]
                return user
            else:
                return None
        except Exception as ex:
            app.logger.error(f'Error al cargar usuario: {ex}')
            return []

    @staticmethod
    def load_users():
        try:
            cursor = get_db_connection().cursor()
            sql = "SELECT nombre, apellidos, username FROM usuarios"
            cursor.execute(sql)
            datos = cursor.fetchall()
            users = [{'nombre': fila[0], 'apellidos': fila[1], 'username': fila[2]} for fila in datos]
            return users
        except Exception as ex:
            app.logger.error(f'Error al cargar usuarios: {ex}')
            return []
    
    def register_user(user):
        try:
            cursor = get_db_connection().cursor()
            sql = "INSERT INTO usuarios (nombre, apellidos, username, password) VALUES (%s, %s, %s, %s)"
            cursor.execute(sql, (user.name, user.surname, user.id, user.password))
            conexion.connection.commit()
            return user
        except Exception as ex:
            print(f"Error al insertar en la base de datos: {ex}")
            return None

        

    def save_to_file(self):
        users = UserModel.load_users()
        users[self.id] = {
            'name': self.name,
            'surname': self.surname,
            'password': self.password
        }
        with open('users.json', 'w') as f:
            json.dump(users, f, indent=4)

    def check_password(self, password):
        return check_password_hash(self.password, password)
