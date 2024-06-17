# Modelos de base de datos
"""
Resumen de Funciones y Clases:
Clase UserModel:
- __init__(username, name=None, surname=None, password=None)
- get_user(username)
- load_users()
- register_user(user)
- delete_user(username)
- check_password(password)

Clase FabricaModel:
- add_fabrica(nombre, id_usuario)
- get_fabrica(id_usuario)
- get_fabrica_by_id(id_usuario, id_fabrica)
- get_costes_beneficios(id_fabrica)
- delete_fabrica(id_fabrica)
- update_fabrica(fabrica_id, nombre=None, nuevos_costes=None, nuevos_beneficios=None)

Clase RecursosModel:
- get_humanos_fabrica(id_fabrica)
- get_maquinas_farbica(id_fabrica)
- get_trabajador(codigo)
- get_maquina(codigo)
- add_maquina(id_fabrica, nombre, fatiga, coste_uso, habilidades)
- add_trabajador(id_fabrica, nombre, apellidos, fecha_n, fatiga, coste_uso, preferencia, habilidades)
- delete_trabajador(codigo_trabajador, id_fabrica)
- update_trabajador(trabajador_id, nombre=None, apellidos=None, fecha_nacimiento=None, trabajos_apto=None, fatiga=None, coste_h=None, preferencias_trabajo=None, nuevas_habilidades=None)
- delete_maquina(codigo_maquina, id_fabrica)
- update_maquina(maquina_id, nombre=None, fatiga=None, coste_h=None, habilidades=None)
- get_habilidades_maquinas(id_fabrica)
- get_habilidades_trabajadores(fabrica_id)
- obtener_habilidades_recursos(fabrica_id)
- calcular_fatiga_total(asignacion)
- fatiga_recursos(fabrica_id)
- coste_recursos(fabrica_id)
- calcular_coste_total(asignacion)

Clase TareaModel:
- get_soft_skills()
- get_hard_skills(sector)
- get_habilidades_subtareas(fabrica_id)
- obtener_skills_chatGPT(sector,descripcion)
- get_subtask(fabrica_id)
- add_subtask(nombre, duracion, beneficio, descripcion, fabrica_id, sector)
- delete_subtask(id_subtask)
- update_subtask(fabrica_id, subtask_id, nombre=None, duracion=None, beneficio=None, descripcion=None,  nuevas_habilidades=None)
- beneficio_subtasks(fabrica_id)
- dependencias_subtasks(skills_matching)
- skills_matching(fabrica_id)
"""

from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin
from flask_mysqldb import MySQL
import json
from app import app
from flask import jsonify
import requests
import re
import unidecode
from openai import OpenAI
from config import config

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
    def get_user(username):
        try:
            cursor = get_db_connection().cursor()
           
            sql = "SELECT id, nombre, apellidos, username, password FROM usuarios WHERE username = '{0}'".format(username)
            cursor.execute(sql)
            datos = cursor.fetchone()
            
            if datos != None:
                user = {'id': datos[0], 'nombre': datos[1], 'apellidos': datos[2], 'username': datos[3], 'password' : datos[4]}            
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
    @staticmethod
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

    @staticmethod
    def delete_user(username):
        try:
            cursor = get_db_connection().cursor()
            sql = "DELETE FROM usuarios WHERE username = %s"
            cursor.execute(sql, (username))
            conexion.connection.commit()
            print("Usuario eliminado exitosamente")
        except Exception as ex:
            print(f"Error al eliminar usuario de la base de datos: {ex}")


    def check_password(self, password):
        return check_password_hash(self.password, password)

class FabricaModel:
    @staticmethod
    def add_fabrica(nombre, id_usuario, capital,sector):
        try:
            cursor = get_db_connection().cursor()
            sql =  "INSERT INTO Fabrica (nombre, usuario_id, capital,sector) VALUES (%s, %s, %s,%s)"
            cursor.execute(sql, (nombre, id_usuario, capital, sector))
            conexion.connection.commit()

            last_id = cursor.lastrowid
            sql_select = "SELECT * FROM Fabrica WHERE id = %s"
            cursor.execute(sql_select, (last_id,))
            fabrica = cursor.fetchone()
            return fabrica  
        except Exception as ex:
            print(f"Error al añadir fábrica: {ex}")
            return None
    
    @staticmethod
    def get_fabrica(id_usuario):
        try:
            cursor = get_db_connection().cursor()
            sql =  "SELECT id, nombre, costes, beneficios, capital, sector FROM Fabrica WHERE usuario_id = %s"
            cursor.execute(sql, (id_usuario,))
            return cursor.fetchall()
        except Exception as ex:
            print(f"Error al obtener fábricas: {ex}")
            return []
    
    @staticmethod
    def get_fabrica_by_id(id_usuario, id_fabrica):
        try:
            cursor = get_db_connection().cursor()
            sql =  "SELECT * FROM Fabrica WHERE usuario_id = %s AND id = %s"
            cursor.execute(sql, (id_usuario,id_fabrica))
            return cursor.fetchone()
        except Exception as ex:
            print(f"Error al obtener fábricas: {ex}")
            return None
    
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
    
    @staticmethod
    def delete_fabrica(id_fabrica):
        try:
            cursor = get_db_connection().cursor()
            sql = "DELETE FROM Fabrica WHERE id = %s"
            cursor.execute(sql, (id_fabrica,))
            conexion.connection.commit()
            print("Fabrica eliminada exitosamente")
        except Exception as ex:
            print(f"Error al eliminar fabrica de la base de datos: {ex}")

    @staticmethod
    def update_fabrica(fabrica_id, nombre=None, nuevos_costes=None, nuevos_beneficios=None, nuevo_capital = None):
        try:
            cursor = get_db_connection().cursor()
            sql = "UPDATE Fabrica SET "
            update_values = []
            if nombre is not None:
                sql += "nombre = %s,"
                update_values.append(nombre)
            if nuevos_costes is not None:
                sql += "costes = %s, "
                update_values.append(nuevos_costes)
            if nuevos_beneficios is not None:
                sql += "beneficios = %s, "
                update_values.append(nuevos_beneficios)
            if nuevo_capital is not None:
                sql += "capital = %s"
                update_values.append(nuevo_capital) 
            sql = sql.rstrip(", ") + " WHERE id = %s"  
            update_values.append(fabrica_id)  # Agregar el ID como último valor

            if len(update_values) > 1:  # Verificar si se proporcionaron valores para actualizar
                cursor.execute(sql, tuple(update_values))
                conexion.connection.commit()
                print("Información de la fábrica actualizada exitosamente") 
                sql = "SELECT * FROM Fabrica WHERE id = %s"
                cursor.execute(sql, (fabrica_id,))
                fabrica_actualizada = cursor.fetchone()
                return fabrica_actualizada
            else:
                print("No se proporcionaron valores para actualizar")
                return None
        except Exception as ex:
            print(f"Error al actualizar información de la fábrica: {ex}")
            return None

    @staticmethod
    def add_historial(fecha,costes, beneficios, capital, trabajadores, maquinas, subtasks, asignaciones, tiempo_trabajado, fabrica_id, sector,flag):
        try: 
            cursor = get_db_connection().cursor()

            trabajadores = json.dumps(trabajadores)
            maquinas = json.dumps(maquinas)
            subtasks = json.dumps(subtasks)
            asignaciones = json.dumps(asignaciones)
            tiempo_trabajado = json.dumps(tiempo_trabajado)

            sql = '''INSERT INTO historial(fecha, costes, beneficios, capital, trabajadores, maquinas, subtasks, asignaciones, tiempo_trabajado, fabrica_id, sector, flag) 
                     VALUES(%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)'''
            cursor.execute(sql, (fecha, costes, beneficios, capital, trabajadores, maquinas, subtasks, asignaciones, tiempo_trabajado, fabrica_id, sector, flag))
            conexion.connection.commit()
            last_id = cursor.lastrowid
            sql_select = "SELECT * FROM historial WHERE id = %s"
            cursor.execute(sql_select, (last_id,))
            historial = cursor.fetchone()

            return historial
                    
        except Exception as ex:
            print(f"Error al guardar el historial: {ex}")
            return None
        
    @staticmethod
    def get_historial(fabrica_id, flag):
        try: 
            cursor = get_db_connection().cursor()
            if flag : 
                sql = '''SELECT id, fecha, costes, beneficios, capital, trabajadores, maquinas, subtasks, asignaciones, sector FROM historial WHERE fabrica_id = %s AND flag = %s'''
                cursor.execute(sql, (fabrica_id,flag))
            else:
                sql = '''SELECT id, fecha, costes, beneficios, capital, trabajadores, maquinas, subtasks, asignaciones, sector FROM historial WHERE fabrica_id = %s'''
                cursor.execute(sql, (fabrica_id,))
            lista_resultados = []
            resultados = cursor.fetchall()
            for resultado in resultados:
                registro = {
                    'id': resultado[0],
                    'fecha': str(resultado[1]),  # convertir fecha a string
                    'costes': resultado[2],
                    'beneficios': resultado[3],
                    'capital' : resultado[4],
                    'trabajadores' : resultado[5],
                    'maquinas' : resultado[6],
                    'subtasks' : resultado[7],
                    'asignaciones': resultado[8],  # convertir JSON a lista
                    'sector': resultado[9],
                    'flag' : resultado[10]
                }
                lista_resultados.append(registro)

            return lista_resultados  # convertir la lista de diccionarios a JSON
        
        except Exception as ex:
            print(f"Error al obtener el historial: {ex}")
            return None

    @staticmethod
    def get_sectores():
        try:
            cursor = get_db_connection().cursor()
            sql = "SELECT DISTINCT sector FROM skills WHERE tipo = %s "
            cursor.execute(sql, ('hard',))
            resultados = cursor.fetchall()
            return [sector[0] for sector in resultados] 
        except Exception as ex:
            print(f"Error al obtener los sectores: {ex}")
            return None

    @staticmethod
    def actualizar_hard_skills(best_hard_skills):
        for sector, skills in best_hard_skills.items():
            for skill, count in skills:
                try:
                    skill_name, skill_desc =  re.split(r' — |:', skill, 1)  # Separar el nombre y la descripción
                    cursor = get_db_connection().cursor()
                    sql = "INSERT INTO skills (nombre, info, tipo, sector) VALUES (%s, %s, %s, %s)"
                    cursor.execute(sql, (skill_name, skill_desc, 'hard', sector))
                    get_db_connection().commit()
                    
                except Exception as ex:
                    print(f"Error al añadir habilidad: {ex}")
            
        
class RecursosModel:
    @staticmethod
    def get_humanos_fabrica(id_fabrica):
        try:
            cursor = get_db_connection().cursor()
            sql = "SELECT * FROM Trabajadores WHERE fabrica_id = %s"
            cursor.execute(sql, (id_fabrica,))
            rows = cursor.fetchall()
            trabajadores = []
            for row in rows: 
                sql = "SELECT skill_id FROM skills_trabajadores WHERE trabajador_id = %s"
                cursor.execute(sql, (row[0],))
                skills = cursor.fetchall() 
                trabajador = row + ([skill[0] for skill in skills ],)
                trabajadores.append(trabajador)
            return tuple(trabajadores)            
        except Exception as ex:
            print(f"Error al obtener los IDs de los trabajadores: {ex}")
            return []

    @staticmethod
    def get_maquinas_farbica(id_fabrica):
        try:
            cursor = get_db_connection().cursor()
            sql = "SELECT * FROM Maquinas WHERE fabrica_id = %s"
            cursor.execute(sql, (id_fabrica,))
            rows = cursor.fetchall()
            maquinas = []
            for row in rows: 
                sql = "SELECT skill_id FROM skills_maquinas WHERE maquina_id = %s"
                cursor.execute(sql, (row[0],))
                skills = cursor.fetchall() 
                maquina = row + ([skill[0] for skill in skills ],)
                maquinas.append(maquina)    
            return tuple(maquinas)
        except Exception as ex:
            print(f"Error al obtener los IDs de las máquinas: {ex}")
            return []

    @staticmethod
    def get_trabajador(codigo):
        try:
            cursor = get_db_connection().cursor()
            sql = "SELECT *  FROM Trabajadores WHERE codigo = %s"
            cursor.execute(sql, (codigo,))
            trabajador = cursor.fetchone()
            if trabajador is None:
                print("No se encontro el trabajador con el codigo")
                return None
            sql = "SELECT skill_id FROM skills_trabajadores WHERE trabajador_id = %s"
            cursor.execute(sql, (trabajador[0],))
            skills = cursor.fetchall()
            trabajador_skills = trabajador + ([skill[0] for skill in skills],)
            return trabajador_skills
        except Exception as ex:
            print(f"Error al obtener el trabajador: {ex}")
            return None
        
    @staticmethod
    def get_maquina(codigo):
        try:
            cursor = get_db_connection().cursor()
            sql = "SELECT * FROM Maquinas WHERE codigo = %s"
            cursor.execute(sql, (codigo,))
            maquina = cursor.fetchone()
            if maquina is None:
                print("No se encontro la maquina con el codigo")
                return None
            sql = "SELECT skill_id FROM skills_maquinas WHERE maquina_id = %s"
            cursor.execute(sql, (maquina[0],))
            skills = cursor.fetchall()
            maquina_skills = maquina + ([skill[0] for skill in skills],)
            return maquina_skills
        except Exception as ex:
            print(f"Error al obtener la maquina: {ex}")
            return None

    @staticmethod
    def add_maquina(id_fabrica, nombre, fatiga, coste_uso, habilidades):
        try:
            cursor = get_db_connection().cursor()
            sql = "INSERT INTO Maquinas (nombre, fatiga, coste_h, fabrica_id) VALUES (%s, %s, %s, %s)"
            cursor.execute(sql, (nombre, fatiga, coste_uso, id_fabrica))
            id_maquina = cursor.lastrowid
            for habilidad in habilidades:
                sql_h = ''' INSERT INTO skills_maquinas (maquina_id, skill_id) VALUES (%s,%s)'''
                cursor.execute(sql_h, (id_maquina, habilidad))
            conexion.connection.commit()

            last_id = id_maquina
            sql_select = "SELECT codigo FROM Maquinas WHERE id = %s"
            cursor.execute(sql_select, (last_id,))
            maquina = cursor.fetchone()
            return RecursosModel.get_maquina(maquina)
            
        except Exception as ex:
            print(f"Error al insertar en la base de datos: {ex}")
            return None
        
    @staticmethod
    def add_trabajador(id_fabrica, nombre, apellidos, fecha_n, fatiga, coste_uso, preferencia, habilidades):
        try:
            cursor = get_db_connection().cursor()
            sql = '''INSERT INTO Trabajadores (nombre, apellidos, fecha_nacimiento, fatiga, coste_h, preferencias_trabajo, fabrica_id) 
                    VALUES (%s, %s, %s, %s, %s, %s, %s)'''
            cursor.execute(sql, (nombre, apellidos, fecha_n, fatiga, coste_uso, preferencia, id_fabrica))
            id_trabajador = cursor.lastrowid
            for habilidad in habilidades:
                sql_h = '''INSERT INTO skills_trabajadores (trabajador_id, skill_id) VALUES (%s,%s)'''
                cursor.execute(sql_h, (id_trabajador, habilidad))
            conexion.connection.commit()

            last_id = id_trabajador
            sql_select = "SELECT codigo FROM Trabajadores WHERE id = %s"
            cursor.execute(sql_select, (last_id,))
            codigo = cursor.fetchone()
            return RecursosModel.get_trabajador(codigo)

        except Exception as ex:
            print(f"Error al insertar en la base de datos: {ex}")
            return None

    
    @staticmethod
    def delete_trabajador(codigo_trabajador, id_fabrica):
        try:
            cursor = get_db_connection().cursor()
            sql = "DELETE FROM Trabajadores WHERE fabrica_id = %s AND codigo = %s"
            cursor.execute(sql, (id_fabrica, codigo_trabajador))
            conexion.connection.commit()
            print("Trabajador eliminada exitosamente")
        except Exception as ex:
            print(f"Error al eliminar trabajador de la base de datos: {ex}")

    @staticmethod
    def update_trabajador(trabajador_id, nombre=None, apellidos=None, fecha_nacimiento=None, trabajos_apto=None, fatiga=None, coste_h=None, preferencias_trabajo=None, nuevas_habilidades=None):
        try:
            connection = get_db_connection()
            cursor = connection.cursor()
            update_values_trabajador = []

            if nombre is not None:
                update_values_trabajador.append(('nombre', nombre))
            if apellidos is not None:
                update_values_trabajador.append(('apellidos', apellidos))
            if fecha_nacimiento is not None:
                update_values_trabajador.append(('fecha_nacimiento', fecha_nacimiento))
            if trabajos_apto is not None:
                update_values_trabajador.append(('trabajos_apto', trabajos_apto))
            if fatiga is not None:
                update_values_trabajador.append(('fatiga', fatiga))
            if coste_h is not None:
                update_values_trabajador.append(('coste_h', coste_h))
            if preferencias_trabajo is not None:
                update_values_trabajador.append(('preferencias_trabajo', preferencias_trabajo))

            # Actualizar tabla Trabajador
            if update_values_trabajador:
                sql_trabajador = "UPDATE Trabajadores SET " + ", ".join([f"{field} = %s" for field, _ in update_values_trabajador]) + " WHERE codigo = %s"
                values_trabajador = [value for _, value in update_values_trabajador]
                values_trabajador.append(trabajador_id)
                cursor.execute(sql_trabajador, tuple(values_trabajador))

            trabajador = RecursosModel.get_trabajador(trabajador_id)
            # Actualizar habilidades del trabajador
            if nuevas_habilidades is not None:
                # Eliminar habilidades existentes del trabajador
                cursor.execute("DELETE FROM skills_trabajadores WHERE trabajador_id = %s", (trabajador[0],))
                # Insertar nuevas habilidades
                for skill_id in nuevas_habilidades:
                    cursor.execute("INSERT INTO skills_trabajadores (trabajador_id, skill_id) VALUES (%s, %s)", (trabajador[0], skill_id))
            connection.commit()        
            return RecursosModel.get_trabajador(trabajador_id)
        except Exception as ex:
            print(f"Error al actualizar información del trabajador: {ex}")
            return None


    @staticmethod
    def delete_maquina(codigo_maquina, id_fabrica):
        try:
            cursor = get_db_connection().cursor()
            sql = "DELETE FROM Maquinas WHERE fabrica_id = %s AND codigo = %s"
            cursor.execute(sql, (id_fabrica, codigo_maquina))
            conexion.connection.commit()
            print("Máquina eliminada exitosamente")
        except Exception as ex:
            print(f"Error al eliminar máquina de la base de datos: {ex}")

    @staticmethod
    def update_maquina(maquina_id, nombre=None, fatiga=None, coste_h=None, habilidades=None):
        try:
            connection = get_db_connection()
            cursor = connection.cursor()
            update_values_maquina = []
            update_values_habilidades = []

            if nombre is not None:
                update_values_maquina.append(('nombre', nombre))
            if fatiga is not None:
                update_values_maquina.append(('fatiga', fatiga))
            if coste_h is not None:
                update_values_maquina.append(('coste_h', coste_h))

            # Actualizar tabla Maquina
            if update_values_maquina:
                sql_maquina = "UPDATE Maquinas SET " + ", ".join([f"{field} = %s" for field, _ in update_values_maquina]) + " WHERE codigo = %s"
                values_maquina = [value for _, value in update_values_maquina]
                values_maquina.append(maquina_id)
                cursor.execute(sql_maquina, tuple(values_maquina))
            maquina = RecursosModel.get_maquina(maquina_id)
            # Actualizar tabla skills_maquinas
            if habilidades is not None:
                # Eliminar habilidades existentes de la máquina
                cursor.execute("DELETE FROM skills_maquinas WHERE maquina_id = %s", (maquina[0],))
                # Insertar nuevas habilidades
                for skill_id in habilidades:
                    cursor.execute("INSERT INTO skills_maquinas (maquina_id, skill_id) VALUES (%s, %s)", (maquina[0], skill_id))
            connection.commit()
            return RecursosModel.get_maquina(maquina_id)

        except Exception as ex:
            print(f"Error al actualizar información de la máquina: {ex}")
            return None

    @staticmethod
    def get_habilidades_maquinas(id_fabrica):
        habilidades_maquinas = {}

        try:
            cursor = get_db_connection().cursor()
            sql = '''SELECT m.codigo, GROUP_CONCAT(IF(s.tipo = 'soft', s.nombre, NULL)) AS soft_skills, 
                        GROUP_CONCAT(IF(s.tipo = 'hard', s.nombre, NULL)) AS technical_skills 
                FROM Maquinas m 
                LEFT JOIN skills_maquinas sm ON m.id = sm.maquina_id 
                LEFT JOIN skills s ON sm.skill_id = s.id 
                WHERE m.fabrica_id = %s 
                GROUP BY m.codigo'''
            cursor.execute(sql, (id_fabrica,))
            resultados = cursor.fetchall()

            for resultado in resultados:
                codigo_maquina = resultado[0]
                soft_skills = resultado[1].split(',') if resultado[1] else []
                technical_skills = resultado[2].split(',') if resultado[2] else []
                habilidades_maquinas[codigo_maquina] = {"soft_skills": soft_skills, "technical_skills": technical_skills}
            return habilidades_maquinas

        except Exception as ex:
            print(f"Error al obtener las habilidades de las máquinas: {ex}")
            return {}
    
    @staticmethod
    def get_habilidades_trabajadores(fabrica_id):
        try:
            cursor = get_db_connection().cursor()
            sql = '''SELECT t.codigo, 
                            GROUP_CONCAT(IF(s.tipo = 'soft', s.nombre, NULL)) AS soft_skills, 
                            GROUP_CONCAT(IF(s.tipo = 'hard', s.nombre, NULL)) AS technical_skills 
                    FROM Trabajadores t 
                    LEFT JOIN skills_trabajadores st ON t.id = st.trabajador_id 
                    LEFT JOIN skills s ON st.skill_id = s.id 
                    WHERE t.fabrica_id = %s 
                    GROUP BY t.codigo'''
            cursor.execute(sql, (fabrica_id,))
            habilidades_trabajadores = {}
            for codigo, soft_skills, technical_skills in cursor.fetchall():
                habilidades_trabajadores[codigo] = {
                    'soft_skills': soft_skills.split(',') if soft_skills else [],
                    'technical_skills': technical_skills.split(',') if technical_skills else []
                }
            return habilidades_trabajadores
        except Exception as ex:
            print(f"Error al obtener habilidades de trabajadores: {ex}")
            return {}
        
    @staticmethod
    def obtener_habilidades_recursos(fabrica_id):
        h_t = RecursosModel.get_habilidades_trabajadores(fabrica_id)

        h_m = RecursosModel.get_habilidades_maquinas(fabrica_id)

        habilidades_combinadas = {**h_t, **h_m}
        return  habilidades_combinadas

    @staticmethod
    def calcular_fatiga_total(asignacion):
        try:
            cursor = get_db_connection().cursor()
            
            for tarea, identificador in asignacion:
                # Determinar si el identificador pertenece a un trabajador o a una máquina
                tipo = identificador[0]  # Primer carácter indica el tipo (H para trabajador, M para máquina)
                if tipo == 'H':
                    tabla = 'Trabajadores'  
                elif tipo == 'M':
                    tabla = 'Maquinas'
                # Consultar la fatiga del trabajador asignado a la tarea en la base de datos
                sql = f"SELECT fatiga FROM {tabla} WHERE id = %s"
                cursor.execute(sql, (identificador,))
                recurso_fatiga = cursor.fetchone()

                if recurso_fatiga:
                    fatiga_total += recurso_fatiga[0]

            return fatiga_total
        except Exception as ex:
            print(f"Error al calcular la fatiga total: {ex}")
            return None
        
    @staticmethod
    def fatiga_recursos(fabrica_id):
        try:
            cursor = get_db_connection().cursor()
            fatigas = {}

            # Procesar primero los trabajadores
            sql_trabajadores = "SELECT codigo, fatiga FROM Trabajadores WHERE fabrica_id = %s"
            cursor.execute(sql_trabajadores, (fabrica_id,))
            resultados_trabajadores = cursor.fetchall()

            for codigo, fatiga in resultados_trabajadores:
                fatigas[codigo] = fatiga

            # Procesar luego las máquinas
            sql_maquinas = "SELECT codigo, fatiga FROM Maquinas WHERE fabrica_id = %s"
            cursor.execute(sql_maquinas, (fabrica_id,))
            resultados_maquinas = cursor.fetchall()

            for codigo, fatiga in resultados_maquinas:
                fatigas[codigo] = fatiga

            return fatigas
        except Exception as ex:
            print(f"Error al calcular la fatiga por recurso: {ex}")
            return None


    @staticmethod
    def coste_recursos(fabrica_id):
        try:
            cursor = get_db_connection().cursor()
            costes = {}

            # Procesar primero los trabajadores
            sql_trabajadores = "SELECT codigo, coste_h FROM Trabajadores WHERE fabrica_id = %s"
            cursor.execute(sql_trabajadores, (fabrica_id,))
            resultados_trabajadores = cursor.fetchall()

            for codigo, coste in resultados_trabajadores:
                costes[codigo] = coste

            # Procesar luego las máquinas
            sql_maquinas = "SELECT codigo, coste_h FROM Maquinas WHERE fabrica_id = %s"
            cursor.execute(sql_maquinas, (fabrica_id,))
            resultados_maquinas = cursor.fetchall()

            for codigo, coste in resultados_maquinas:
                costes[codigo] = coste

            return costes
        except Exception as ex:
            print(f"Error al calcular el coste por recurso: {ex}")
            return None

    @staticmethod
    def calcular_coste_total(asignacion):
        try:
            cursor = get_db_connection().cursor()

            # Calcular el coste total de la asignación de tareas
            coste_total = 0

            for tarea, identificador in asignacion:
                # Determinar si el identificador pertenece a un trabajador o a una máquina
                tipo = identificador[0]  # Primer carácter indica el tipo (H para trabajador, M para máquina)

                if tipo == 'H':
                    tabla = 'Trabajadores'  
                elif tipo == 'M':
                    tabla = 'Maquinas'

                # Consultar el coste del trabajador o máquina en la base de datos
                sql = f"SELECT coste_h FROM {tabla} WHERE codigo = %s"
                cursor.execute(sql, (identificador,))
                resultado = cursor.fetchone()

                if resultado:
                    coste_total += resultado[0]

            return coste_total
        except Exception as ex:
            print(f"Error al calcular el coste total: {ex}")
            return None


class TareaModel:
    @staticmethod
    def get_soft_skills():
        try:
            cursor = get_db_connection().cursor()
            sql = "SELECT nombre,id from skills WHERE tipo ='soft'"
            cursor.execute(sql)
            soft_skills = cursor.fetchall()
            return [skill for skill in soft_skills]
        except Exception as ex:
            print(f"Error al obtener las soft skills: {ex}")
            return[]
        
    @staticmethod
    def get_hard_skills(sector):
        try:
            cursor = get_db_connection().cursor()
            sql = "SELECT nombre, id FROM skills WHERE tipo = 'hard' AND sector = %s"
            cursor.execute(sql,(sector,))
            hard_skills = cursor.fetchall()
            return [skill for skill in hard_skills]
        except Exception as ex:
            print(f"Error al obtener las hard skills: {ex}")
            return[]
        
    @staticmethod
    def get_habilidades_subtareas(fabrica_id):
        try:
            cursor = get_db_connection().cursor()
            sql = '''SELECT s.id, 
                        GROUP_CONCAT(IF(sk.tipo = 'soft', sk.nombre, NULL)) AS soft_skills, 
                        GROUP_CONCAT(IF(sk.tipo = 'hard', sk.nombre, NULL)) AS technical_skills 
                    FROM Subtasks s 
                    LEFT JOIN skills_subtasks ss ON s.id = ss.subtask_id 
                    LEFT JOIN skills sk ON ss.skill_id = sk.id 
                    WHERE s.fabrica_id = %s 
                    GROUP BY s.id'''
            cursor.execute(sql, (fabrica_id,))
            habilidades_subtareas = {}
            for codigo, soft_skills, technical_skills in cursor.fetchall():
                habilidades_subtareas[codigo] = {
                    'soft_skills': soft_skills.split(',') if soft_skills else [],
                    'technical_skills': technical_skills.split(',') if technical_skills else []
                }
            return habilidades_subtareas
        except Exception as ex:
            print(f"Error al obtener habilidades de subtareas: {ex}")
            return {}




    @staticmethod
    def obtener_skills_chatGPT(sector,descripcion):
        soft_skills = TareaModel.get_soft_skills()
        hard_skills = TareaModel.get_hard_skills(sector)
        soft_skills = [skill[0] for skill in soft_skills]
        hard_skills = [skill[0] for skill in hard_skills]
        configuracion_desarrollo = config['development']()
        prompt = f'''El formato que quiero que me devuelvas la respuesta es el siguiente, donde la X representa un placeholder:
soft_skills = [X], hard_skills = [X]

Dado un listado de habilidades como este: = soft_skills {soft_skills} y hard_skills {hard_skills}, y una descripcion de una tarea:{descripcion}, quiero que me devuelvas una lista SOLO con las habilidades proporcionadas que mejor se ajusten para la tarea.
Por favor, devuélveme la respuesta siguiendo el formato: soft_skills = [X], hard_skills = [X].'''
        url = "https://api.openai.com/v1/chat/completions"
        headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + configuracion_desarrollo.CHATGPT_API_KEY
        }
        data = {
            "model": "gpt-3.5-turbo",
            "messages": [
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": prompt}
            ],
            "max_tokens": 300
        }

        response = requests.post(url, headers=headers, json=data)
        respuesta_json = response.json()

        #print(respuesta_json)  # Imprime la respuesta JSON en la consola para ver los datos
        habilidades = {'soft_skills': [], 'hard_skills': []}
        if 'choices' in respuesta_json and len(respuesta_json['choices']) > 0:
            for choice in respuesta_json['choices']:
                mensaje = choice['message']['content']
                soft_skills_list = re.findall(r"soft_skills = \[(.*?)\]", mensaje)[0]
                hard_skills_list = re.findall(r"hard_skills = \[(.*?)\]", mensaje)[0]
                soft_skills = [skill.strip().strip("'") for skill in soft_skills_list.split(',')]
                hard_skills = [skill.strip().strip("'") for skill in hard_skills_list.split(',')]
                habilidades['soft_skills'].extend(soft_skills)
                habilidades['hard_skills'].extend(hard_skills)
        #print(habilidades)
        return habilidades

    @staticmethod
    def get_subtask(subtask_id,fabrica_id):
        try:
            cursor = get_db_connection().cursor()
            sql =  "SELECT * FROM Subtasks WHERE id = %s AND fabrica_id= %s"
            cursor.execute(sql, (subtask_id,fabrica_id))
            subtask = cursor.fetchone()
            if subtask is None:
                print("No se encontro el trabajador con el codigo")
                return None
            sql = "SELECT skill_id FROM skills_subtasks WHERE subtask_id = %s"
            cursor.execute(sql, (subtask[0],))
            skills = cursor.fetchall()
            subtask_skills = subtask + ([skill[0] for skill in skills],)
            return subtask_skills
        except Exception as ex:
            print(f"Error al obtener subtask: {ex}")
            return None
    
    @staticmethod
    def get_subtasks(fabrica_id):
        try:
            cursor = get_db_connection().cursor()
            sql =  "SELECT * FROM Subtasks WHERE fabrica_id= %s"
            cursor.execute(sql, (fabrica_id,))
            subtasks= cursor.fetchall()
            if subtasks is None:
                print("No se encontraron subtasks para la fábrica")
                return None

            subtasks_with_skills = []
            for subtask in subtasks:
                sql_skills = "SELECT skill_id FROM skills_subtasks WHERE subtask_id = %s"
                cursor.execute(sql_skills, (subtask[0],))
                skills = cursor.fetchall()
                skills_list = [skill[0] for skill in skills]
                subtasks_with_skills.append(subtask + (skills_list,))

            return tuple(subtasks_with_skills)
        except Exception as ex:
            print(f"Error al obtener subtasks: {ex}")
            return None
        
    @staticmethod
    def get_skill_id(skill, sector = None):
        try:
            skill = skill.strip("'")
            skill_normalized = unidecode.unidecode(skill)
            cursor = get_db_connection().cursor()
            sql = "SELECT id FROM skills WHERE nombre = %s"
            params = (skill,)

            if sector is not None:
                sql += " AND sector = %s"
                params += (sector,)

            cursor.execute(sql, params)
            result = cursor.fetchone()

            if not result:
                # Try with normalized skill name if the first query didn't return a result
                sql = "SELECT id FROM skills WHERE nombre = %s"
                params = (skill_normalized,)

                if sector is not None:
                    sql += " AND sector = %s"
                    params += (sector,)

                cursor.execute(sql, params)
                result = cursor.fetchone()

            if result:
                return result[0]
            else:
                return None
        except Exception as ex:
            print(f"Error al obtener el ID de la habilidad: {ex}")
            return None
        
    @staticmethod
    def add_subtask(nombre, duracion, beneficio,coste, descripcion, fabrica_id, sector):
        # guardar los datos en la base de datos
        # se debe rellenar la tabla de skills_subtaks, tiendo en cuenta la tarea a la que estamos 
        # haciendo referencia y además buscar las habilidades que tocan en la tabla de skills
        
        try:
            cursor = get_db_connection().cursor()
            ### parte tabla de subtasks
            sql = '''INSERT INTO Subtasks(nombre, duracion, beneficio, coste, descripcion, fabrica_id) VALUES(%s, %s, %s, %s, %s, %s)'''
            cursor.execute(sql, (nombre, duracion, beneficio,coste, descripcion, fabrica_id))
            #parte tabla skills_subtasks
            habilidades = TareaModel.obtener_skills_chatGPT(sector, descripcion)
            id_subtask = cursor.lastrowid
            for tipo in ['soft_skills', 'hard_skills']:
                for habilidad in habilidades[tipo]:
                    if tipo == 'soft_skills':
                        skill_id = TareaModel.get_skill_id(habilidad)
                    else: 
                        skill_id = TareaModel.get_skill_id(habilidad,sector)
                    sql_h = ''' INSERT INTO skills_subtasks (subtask_id, skill_id) VALUES (%s,%s)'''
                    cursor.execute(sql_h, (id_subtask, skill_id))
                conexion.connection.commit()
            return TareaModel.get_subtask(id_subtask,fabrica_id)

        except Exception as ex:
            print(f"Error al insertar subtarea en la base de datos: {ex}")
            return {}
    
    @staticmethod
    def delete_subtask(id, fabrica_id):
        try:
            cursor = get_db_connection().cursor()

            # Luego, eliminar la subtarea de la tabla de subtasks
            sql_subtask = "DELETE FROM Subtasks WHERE id = %s AND fabrica_id = %s"
            cursor.execute(sql_subtask, (id,fabrica_id,))

            conexion.connection.commit()
        except Exception as ex:
            print(f"Error al eliminar subtarea de la base de datos: {ex}")


    @staticmethod
    def update_subtask(fabrica_id, subtask_id, nombre=None, duracion=None, beneficio=None,coste = None, descripcion=None,  nuevas_habilidades=None):
        try:
            connection = get_db_connection()
            cursor = connection.cursor()
            update_values_subtask = []

            if nombre is not None:
                update_values_subtask.append(('nombre', nombre))
            if duracion is not None:
                update_values_subtask.append(('duracion', duracion))
            if beneficio is not None:
                update_values_subtask.append(('beneficio', beneficio))
            if coste is not None:
                update_values_subtask.append(('coste', coste))
            if descripcion is not None:
                update_values_subtask.append(('descripcion', descripcion))

            # Actualizar tabla Subtask
            if update_values_subtask:
                sql_subtask = "UPDATE Subtasks SET " + ", ".join([f"{field} = %s" for field, _ in update_values_subtask]) + " WHERE id = %s AND fabrica_id = %s"
                values_subtask = [value for _, value in update_values_subtask]
                values_subtask.append(subtask_id)
                values_subtask.append(fabrica_id)
                cursor.execute(sql_subtask, tuple(values_subtask))
            if nuevas_habilidades is not None:
                # Eliminar habilidades existentes de la subtask
                cursor.execute("DELETE FROM skills_subtasks WHERE subtask_id = %s", (subtask_id,))
                # Insertar nuevas habilidades
                for skill_id in nuevas_habilidades:
                    cursor.execute("INSERT INTO skills_subtasks (subtask_id, skill_id) VALUES (%s, %s)", (subtask_id, skill_id))
            connection.commit()
            print("Información de la subtask actualizada exitosamente")
            sql_select = "SELECT * FROM Subtasks WHERE id = %s AND fabrica_id = %s"
            cursor.execute( sql_select, (subtask_id, fabrica_id))
            subtask = cursor.fetchone()
            return subtask

        except Exception as ex:
            print(f"Error al actualizar información de la subtask: {ex}")
            return None
    
    @staticmethod
    def beneficio_subtasks(fabrica_id):
        try:
            cursor = get_db_connection().cursor()
            sql = "SELECT id, beneficio FROM Subtasks WHERE fabrica_id = %s"
            cursor.execute(sql, (fabrica_id,))
            resultado = cursor.fetchall()
            beneficios = {id: beneficio for id, beneficio in resultado}
            return beneficios
        except Exception as ex:
            print(f"Error al obtener los beneficios: {ex}")
            return None
        
    @staticmethod
    def coste_subtasks(fabrica_id):
        try:
            cursor = get_db_connection().cursor()
            sql = "SELECT id, coste FROM Subtasks WHERE fabrica_id = %s"
            cursor.execute(sql, (fabrica_id,))
            resultado = cursor.fetchall()
            beneficios = {id: coste for id, coste in resultado}
            return beneficios
        except Exception as ex:
            print(f"Error al obtener los beneficios: {ex}")
            return None

    @staticmethod
    def duracion_subtasks(fabrica_id):
        try:
            cursor = get_db_connection().cursor()
            sql = "SELECT id, duracion FROM Subtasks WHERE fabrica_id = %s"
            cursor.execute(sql, (fabrica_id,))
            resultado = cursor.fetchall()
            duraciones = {id: duracion for id, duracion in resultado}
            return duraciones
        except Exception as ex:
            print(f"Error al obtener los beneficios: {ex}")
            return None


    @staticmethod
    def add_dependencias_subtasks(subtask_dependiente, subtask_dependencia):
        try:
            connection = get_db_connection()
            cursor = connection.cursor()

            sql = "INSERT INTO relaciones_subtasks (dependiente, dependencia) VALUES (%s, %s)"
            cursor.execute(sql, (subtask_dependiente, subtask_dependencia))
            connection.commit()
            return True
    
        except Exception as ex:
            print(f"Error al añadir la dependencia: {ex}")
            return False

    @staticmethod
    def get_dependencias_subtasks(tarea_ids):
        try: 
            cursor = get_db_connection().cursor()

            if len(tarea_ids) == 1:
                tarea_ids = (tarea_ids[0],)
            
            sql = "SELECT dependiente, dependencia FROM relaciones_subtasks WHERE dependiente IN %s"
            cursor.execute(sql, (tarea_ids,))
            resultado = cursor.fetchall()

            relaciones = {dependiente: dependencia for dependiente, dependencia in resultado}
            return relaciones
        
        except Exception as ex:
            print(f"Error al obtener las dependencias: {ex}")
            return None

    @staticmethod
    def skills_matching(fabrica_id):      
        try: 
            acciones = TareaModel.get_habilidades_subtareas(fabrica_id)
            recursos = RecursosModel.obtener_habilidades_recursos(fabrica_id)
            matching_skills = {}
            for accion_id, habilidades_accion in acciones.items():
                h_tecnicas_accion, h_interpersonales_accion = habilidades_accion

                humanos_validos = []
                for humano_id, habilidades_humano in recursos.items():
                    h_tecnicas_humano, h_interpersonales_humano = habilidades_humano

                    if (set(h_tecnicas_accion).intersection(set(h_tecnicas_humano)) or
                        set(h_interpersonales_accion).intersection(set(h_interpersonales_humano))):
                            humanos_validos.append(humano_id)

                matching_skills[accion_id] = humanos_validos
             
            cursor = get_db_connection().cursor()
            sql = "UPDATE Fabrica SET skills_matching = %s WHERE id = %s"
            cursor.execute(sql, (json.dumps(matching_skills),fabrica_id))
            conexion.connection.commit()
            return matching_skills
        
        except Exception as ex:
            print(f"Error al crear skills_matching: {ex}")
            return None
