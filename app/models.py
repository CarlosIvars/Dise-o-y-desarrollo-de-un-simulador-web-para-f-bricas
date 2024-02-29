# Modelos de base de datos
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin
from flask_mysqldb import MySQL
import json
from app import app
from flask import jsonify
import requests
from openai import OpenAI

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
            sql = "SELECT id, nombre, apellidos, username FROM usuarios WHERE username = '{0}'".format(username)
            cursor.execute(sql)
            datos = cursor.fetchone()
            
            if datos != None:
                user = {'id': datos[0], 'nombre': datos[1], 'apellidos': datos[2], 'username': datos[3]}                
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

    def check_password(self, password):
        return check_password_hash(self.password, password)

class FabricaModel:
    @staticmethod
    def add_fabrica(nombre, id_usuario):
        try:
            cursor = get_db_connection().cursor()
            sql =  "INSERT INTO Fabrica (nombre, usuario_id) VALUES (%s, %s)"
            cursor.execute(sql, (nombre, id_usuario))
            conexion.connection.commit()
            return nombre  # Retorna el ID de la nueva fábrica
        except Exception as ex:
            print(f"Error al añadir fábrica: {ex}")
            return None
    
    @staticmethod
    def get_fabricas_by_user(id_usuario):
        try:
            cursor = get_db_connection().cursor()
            sql =  "SELECT nombre, costes, beneficios FROM Fabrica WHERE usuario_id = %s"
            cursor.execute(sql, (id_usuario,))
            return cursor.fetchall()
        except Exception as ex:
            print(f"Error al obtener fábricas: {ex}")
            return []
    
    @staticmethod
    def get_costes_beneficios(id_fabrica):
        try:
            cursor = get_db_connection().cursor()
            sql = "SELECT costes, beneficios FROM Fabrica WHERE id = %s"
            cursor.execute(sql,(id_fabrica,))
            return cursor.fetchone()
        except Exception as ex:
            print(f"Error al sacar costes y beneficios: {ex}")
            return[]
    
   
        

class TareaModel:
    @staticmethod
    def get_soft_skills():
        try:
            cursor = get_db_connection().cursor()
            sql = "SELECT nombre from skills WHERE tipo ='soft'"
            cursor.execute(sql)
            soft_skills = cursor.fetchall()
            return [skill[0] for skill in soft_skills]
        except Exception as ex:
            print(f"Error al obtener las soft skills: {ex}")
            return[]
        
    @staticmethod
    def get_hard_skills(sector):
        try:
            cursor = get_db_connection().cursor()
            sql = "SELECT nombre FROM skills WHERE tipo = 'hard' AND sector = %s"
            cursor.execute(sql,(sector,))
            hard_skills = cursor.fetchall()
            return [skill[0] for skill in hard_skills]
        except Exception as ex:
            print(f"Error al obtener las hard skills: {ex}")
            return[]
        
    @staticmethod
    def obtener_skills_chatGPT(sector,tarea):
        soft_skills = TareaModel.get_soft_skills()
        hard_skills = TareaModel.get_hard_skills(sector)
        prompt = f'''Dado un listado de habilidades como este: {soft_skills} y {hard_skills}, y 
                   una descripcion de una tarea:{tarea}, quiero que me devuelvas una lista SOLO
                   con las habilidades que necesita la tarea.'''
        url = "https://api.openai.com/v1/completions"
        headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer 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'
        }
        data = {
            "prompt": prompt,
            "max_tokens": 300,
            "model": "gpt-3.5-turbo"
        }

        response = requests.post(url, headers=headers, json=data)
        respuesta_json = response.json()
        print(respuesta_json)  # Imprime la respuesta JSON en la consola para ver los datos
        
        # Devuelve la respuesta JSON como salida de la ruta
        return jsonify(respuesta_json)