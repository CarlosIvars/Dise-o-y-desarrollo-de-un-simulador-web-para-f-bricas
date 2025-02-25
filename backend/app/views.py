# Vistas de Flask para manejar las rutas
from app import app
from werkzeug.security import check_password_hash
from flask import *
from .forms import *
from .models import *
from onet import *
from ml_models import *
import numpy as np
import pandas as pd
import json
import ast
from config import config
from data_generator.data_generator import *
from ml_models.Fatiga.tfg import *
from ml_models.AG.genetic_algorithm import *
from ml_models.AG.ag import *
from ml_models.RegresionLineal.regresionLineal import *
from ml_models.RegresionLineal.random_forest import *
from ml_models.Fatiga.modelosML import *
from datetime import date
from bs4 import BeautifulSoup 
from collections import Counter
from deep_translator import GoogleTranslator
from datetime import datetime
from metricas import plot_metrics

#'Bearer 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'
@app.route('/')
def init():
    print(FabricaModel.get_sectores())
    #generate_data()
    
    return jsonify({'error': 'Faltan lllllllllllllllllllllllllldatos necesarios para el registro'}), 200

############################################################################################
# Pagina inicio sesion
############################################################################################
@app.route('/register', methods = ['POST'])
def register():
    data = request.json

    if not data:
        return jsonify({'error': 'No se proporcionaron datos'}), 400

    username = data.get('username')
    name = data.get('name')
    surname = data.get('surname')
    password = data.get('password')

    if not all([username, name, surname, password]):
        return jsonify({'error': 'Faltan datos necesarios para el registro'}), 400

    existing_user = UserModel.get_user(username)
    if existing_user:
        return jsonify({'error': 'El nombre de usuario ya existe'}), 409

    user = UserModel(
        username=username,
        name=name,
        surname=surname,
        password=password  
    )

    reg = UserModel.register_user(user)
    print(reg)
    if reg:
        session['usuario'] = username # Guarda el username en el session
        return jsonify({'message': 'registro exitoso', 'user': username}), 201
    else:
        return jsonify({'mensaje': 'El usuario no se pudo registrar correctamente'}), 500

@app.route('/login', methods=['POST'])
def login():
    data = request.json  
    if data:
        username = data.get('username')
        password = data.get('password')
        if not username or not password:
            return jsonify({'error': 'Faltan datos de usuario o contraseña'}), 400        
        user = UserModel.get_user(username)
        if user and check_password_hash(user.get('password'), password):      
            session['usuario'] = user.get('username') # Guarda el username en el session
            return jsonify({'message': 'Inicio de sesión exitoso', 'user': username}), 200
        else:
            return jsonify({'error': 'Datos de inicio de sesión incorrectos'}), 401   
    else:
        return jsonify({'error': 'Solicitud incorrecta, datos no proporcionados'}), 400

@app.route('/delete_user', methods=['DELETE'])
def delete_user():
    try:
        data = request.json
        if not data:
            return jsonify({'error': 'No se proporcionó usuario'}), 400
        
        username = data.get('username')
        existing_user = UserModel.get_user(username)
        if not existing_user:
            return jsonify({'error': 'El usuario no existe'}), 404

        UserModel.delete_user(username)
        return jsonify({'mensaje': f'Usuario {username} eliminado exitosamente'}), 200
    except Exception as ex:
        app.logger.error(f'Error al eliminar el usuario: {ex}')
        return jsonify({'error': 'Error al procesar la solicitud'}), 500


@app.route('/usuarios')
def listar_usuarios():
    users = UserModel.load_users()
    return jsonify({'users': users, 'mensaje': "Usuarios Listados"}), 200

############################################################################################
# Pagina principal
############################################################################################
@app.route('/fabricas', methods=['GET'])
def obtener_fabricas():
    usuario = session.get('usuario')
    if not usuario:
        return jsonify({'error': 'Usuario no autenticado'}), 401
    
    user = UserModel.get_user(usuario)
    if not user:
        return jsonify({'error': 'Usuario no encontrado'}), 404
    fabricas_data = FabricaModel.get_fabrica(user['id'])
    fabricas = [{
        'id': fabrica[0],
        'nombre': fabrica[1],
        'costes': fabrica[2],
        'beneficios': fabrica[3],
        'capital' : fabrica[4],
        'sector' : fabrica[5]
    } for fabrica in fabricas_data]
    return jsonify(fabricas), 200

#Se crea la fabrica, los costes y beneficios se calculan a posteriori, estos estan por default a 0
@app.route('/fabricas', methods=['POST'])
def añadir_fabrica():
    usuario = session.get('usuario')
    if not usuario:
        return jsonify({'error': 'Usuario no autenticado'}), 401

    data = request.json
    nombre_fabrica = data.get('nombre_fabrica')
    capital = data.get('capital_inicial')
    sector  = data.get('sector')
    user = UserModel.get_user(usuario)
    resultado = FabricaModel.add_fabrica(nombre_fabrica, user['id'], capital, sector)
    if resultado:
        session['fabrica'] = resultado[0]
        session['sector'] = resultado[7]
        return jsonify({'mensaje': 'Fábrica añadida correctamente',"fabrica": resultado}), 201
    else:
        return jsonify({'error': 'No se pudo añadir la fábrica'}), 500
    
@app.route('/sectores', methods = ['GET'])
def get_sectores():
    usuario = session.get('usuario')
    if not usuario:
        return jsonify({'error': 'Usuario no autenticado'}), 401
    sectores = FabricaModel.get_sectores()
    if sectores:
        return jsonify({'mensaje': 'Sectores encontrados correctamente','sectores' : sectores}), 200
    else: 
        return jsonify({'Error al devolver los sectores'}), 400

@app.route('/select_fabrica', methods=['POST'])
def seleccionar_fabrica():
    usuario = session.get('usuario')
    if not usuario:
        return jsonify({'error': 'Usuario no autenticado'}), 401
    
    data = request.json
    if not data or 'fabrica_id' not in data:
        return jsonify({'error': 'No se proporcionó fabrica_id'}), 400
    
    user = UserModel.get_user(usuario)
    fabrica_id = data.get('fabrica_id')
    fabrica = FabricaModel.get_fabrica_by_id(user['id'], fabrica_id)
    if not fabrica:
        return jsonify({'mensaje': "Fábrica no encontrada correctamente"}), 404
    
    session['fabrica'] = fabrica_id
    session['sector'] = fabrica[7]
    trabajadores = RecursosModel.get_humanos_fabrica(fabrica_id)
    maquinas = RecursosModel.get_maquinas_farbica(fabrica_id)
    subtasks = TareaModel.get_subtasks(fabrica_id)
    dependencias = TareaModel.get_dependencias_subtasks([subtask[0] for subtask in subtasks])
    return jsonify({'mensaje': 'Fábrica seleccionada exitosamente', 'fabrica_id': fabrica, 'trabajadores' : trabajadores, 'maquinas': maquinas, 'subtasks' : subtasks, 'dependencias': dependencias}), 200

@app.route('/delete_fabrica', methods=['DELETE'])
def delete_fabrica():
    try:
        usuario = session.get('usuario')
        if not usuario:
            return jsonify({'error': 'Usuario no autenticado'}), 401
        data = request.json
        if not data:
            return jsonify({'error': 'No se proporcionó fabrica'}), 400
        fabrica_id = data.get('fabrica')
        user = UserModel.get_user(usuario)
        fabrica = FabricaModel.get_fabrica_by_id(user['id'],fabrica_id)
        if not fabrica:
            return jsonify({'error': 'La fabrica no existe'}), 404

        FabricaModel.delete_fabrica(fabrica_id)
        return jsonify({'mensaje': f"Fabrica {fabrica[0]} eliminado exitosamente"}), 200
    except Exception as ex:
        app.logger.error(f'Error al eliminar el fabrica: {ex}')
        return jsonify({'error': 'Error al procesar la solicitud'}), 500

@app.route('/update_fabrica', methods =['PATCH'])
def update_fabrica():
    try:
        usuario = session.get('usuario')
        if not usuario:
            return jsonify({'error': 'Usuario no autenticado'}), 401
        
        data=request.json
        if not data:
            return jsonify({'error': 'No se proporcionó fabrica'}), 400
        fabrica_id = data.get('id')
        nombre = data.get('nombre_fabrica')
        nuevos_costes = data.get('costes')
        nuevos_beneficios = data.get('beneficios')
        nuevo_capital = data.get('capital')
        print(data)

        fabrica = FabricaModel.update_fabrica(fabrica_id, nombre, nuevos_costes, nuevos_beneficios,nuevo_capital)
        print(fabrica)
        return jsonify({'mensaje': 'fabrica actualizada', 'fabrica' : fabrica}), 200
    except Exception as ex:
        app.logger.error(f'Error al actualizar el fabrica: {ex}')
        return jsonify({'error': 'Error al procesar la solicitud'}), 500

############################################################################################
# Simulador
############################################################################################
@app.route('/add_trabajador', methods = ['POST'])
def add_trabajador():
    fabrica_id = session.get('fabrica')
    data = request.json
    if not fabrica_id:
        return jsonify({'error': 'Fabrica no encontrada'}), 404
    if not data or not all(key in data for key in ['nombre', 'apellidos', 'fecha_nacimiento', 'fatiga', 'coste_h', 'preferencias', 'skills']):
        return jsonify({'error': 'Datos incompletos'}), 400
    print(data)
    nombre = data.get('nombre')
    apellidos = data.get('apellidos')
    fecha_nacimiento = data.get('fecha_nacimiento')
    fatiga = data.get('fatiga')
    coste_h = data.get('coste_h')
    preferencias = data.get('preferencias')
    skills = data.get('skills')
    print(skills)
    trabajador = RecursosModel.add_trabajador(fabrica_id, nombre, apellidos, fecha_nacimiento, fatiga, coste_h, preferencias, skills)
    
    if trabajador:
        return jsonify({'mensaje': 'Trabajador añadido con exitoso', 'trabajador' : trabajador}), 201
    else:
        return jsonify({'mensaje': 'El trabajador no se pudo añadir correctamente'}), 500
    
@app.route('/add_maquina', methods = ['POST'])
def add_maquina():
    fabrica_id = session.get('fabrica')
    data = request.json
    if not fabrica_id:
        return jsonify({'error': 'Fabrica no encontrada'}), 404
    if not data or not all(key in data for key in ['nombre', 'fatiga', 'coste_h', 'skills']):
        return jsonify({'error': 'Datos incompletos'}), 400
    nombre = data.get('nombre')
    fatiga = data.get('fatiga')
    coste_h = data.get('coste_h')
    skills = data.get('skills')
    print(nombre, fatiga, coste_h, skills)
    maquina = RecursosModel.add_maquina(fabrica_id, nombre, fatiga, coste_h, skills)
    if maquina:
        return jsonify({'mensaje': 'Maquina añadida con exitoso', 'maquina' : maquina}), 201
    else:
        return jsonify({'mensaje': 'La maquina no se pudo añadir correctamente'}), 500

@app.route('/delete_trabajador', methods=['DELETE'])
def delete_trabajador():
    try:
        fabrica_id = session.get('fabrica')
        if not fabrica_id:
            return jsonify({'error': 'Fabrica no encontrada'}), 401
        data = request.json
        if not data:
            return jsonify({'error': 'No se proporcionó trabajador'}), 400
        
        codigo_trabajador = data.get('trabajador')
        trabajador = RecursosModel.get_trabajador(codigo_trabajador)
        if not trabajador:
            return jsonify({'error': 'El trabajador no existe'}), 404

        RecursosModel.delete_trabajador(codigo_trabajador,fabrica_id)
        return jsonify({'mensaje': f"Trabajador {trabajador[1]} eliminado exitosamente"}), 200
    except Exception as ex:
        app.logger.error(f'Error al eliminar el trabajador: {ex}')
        return jsonify({'error': 'Error al procesar la solicitud'}), 500
    
@app.route('/delete_maquina', methods=['DELETE'])
def delete_maquina():
    try:
        fabrica_id = session.get('fabrica')
        if not fabrica_id:
            return jsonify({'error': 'Fabrica no encontrada'}), 401
        data = request.json
        if not data:
            return jsonify({'error': 'No se proporcionó maquina'}), 400
        
        codigo_maquina = data.get('maquina')
        maquina = RecursosModel.get_maquina(codigo_maquina)
        if not maquina:
            return jsonify({'error': 'La maquina no existe'}), 404

        RecursosModel.delete_maquina(codigo_maquina, fabrica_id)
        return jsonify({'mensaje': f"Maquina {maquina[1]} eliminado exitosamente"}), 200
    except Exception as ex:
        app.logger.error(f'Error al eliminar la maquina: {ex}')
        return jsonify({'error': 'Error al procesar la solicitud'}), 500

@app.route('/update_trabajador', methods =['PATCH'])
def update_trabajador():
    try:
        fabrica_id = session.get('fabrica')
        if not fabrica_id:
            return jsonify({'error': 'Fabrica no encontrada'}), 401
        
        data=request.json
        if not data:
            return jsonify({'error': 'No se proporcionó trabajador'}), 400
        
        trabajador_id = data.get('trabajador_id')
        nombre = data.get('nombre')
        apellidos = data.get('apellidos')
        fecha_nacimiento = data.get('fecha_nacimiento')
        coste_h = data.get('coste_h')
        fatiga = data.get('fatiga')
        preferencias_trabajo = data.get('preferencia_trabajo')
        trabajos_apto = data.get('trabajos_apto')
        nuevas_habilidades = data.get('nuevas_habilidades')
        trabajador = RecursosModel.update_trabajador(trabajador_id, nombre, apellidos, fecha_nacimiento, trabajos_apto, fatiga, coste_h, preferencias_trabajo, nuevas_habilidades)
        return jsonify({'mensaje': 'Trabajador actualizado', 'trabajador' : trabajador}), 200
    except Exception as ex:
        app.logger.error(f'Error al actualizar el trabajador: {ex}')
        return jsonify({'error': 'Error al procesar la solicitud'}), 500

@app.route('/update_maquina', methods =['PATCH'])
def update_maquina():
    try:
        fabrica_id = session.get('fabrica')
        if not fabrica_id:
            return jsonify({'error': 'Fabrica no encontrada'}), 401
        
        data=request.json
        if not data:
            return jsonify({'error': 'No se proporcionó trabajador'}), 400
        
        maquina_id = data.get('id')
        nombre = data.get('nombre')
        coste_h = data.get('coste_h')
        fatiga = data.get('fatiga')
        nuevas_habilidades = data.get('nuevas_habilidades')

        maquina= RecursosModel.update_maquina(maquina_id, nombre, fatiga, coste_h, nuevas_habilidades)
        return jsonify({'mensaje': 'Trabajador actualizado', 'maquina' : maquina}), 200
    except Exception as ex:
        app.logger.error(f'Error al actualizar el trabajador: {ex}')
        return jsonify({'error': 'Error al procesar la solicitud'}), 500


@app.route('/add_subtask', methods = ['POST'])
def add_subtask():
    try:
        fabrica_id = session.get('fabrica')
        data = request.json
        if not fabrica_id:
            return jsonify({'error': 'Fabrica no encontrada'}), 404
        if not data or not all(key in data for key in ['nombre','duracion', 'beneficio','coste', 'descripcion','subtask_dependencia']):
            return jsonify({'error': 'Datos incompletos'}), 400
     
        sector = session.get('sector')
        nombre = data.get('nombre')
        duracion = data.get('duracion')
        beneficio = data.get('beneficio')
        coste = data.get('coste')
        descripcion = data.get('descripcion')
        subtask_dependencia = data.get('subtask_dependencia')
        subtask= TareaModel.add_subtask(nombre, duracion, beneficio, coste, descripcion, fabrica_id, sector)
        if subtask:        
            if subtask_dependencia:
                TareaModel.add_dependencias_subtasks(subtask[0],subtask_dependencia)
            
            return jsonify({'mensaje': 'Subtask añadida con exitoso', 'subtask' : subtask, 'dependencia' : subtask_dependencia}), 201
        else:
            return jsonify({'mensaje': 'Subtask no se pudo añadir correctamente'}), 500
    except Exception as ex:
        app.logger.error(f'Error al insertar la subtask: {ex}')
        return jsonify({'error': 'Error al procesar la solicitud'}), 500

@app.route('/delete_subtask', methods=['DELETE'])
def delete_subtask():
    try:
        fabrica_id = session.get('fabrica')
        if not fabrica_id:
            return jsonify({'error': 'Fabrica no encontrada'}), 401
        data = request.json
        if not data:
            return jsonify({'error': 'No se proporcionó subtask'}), 400
        
        subtask_id = data.get('subtask')
        subtask = TareaModel.get_subtask(subtask_id, fabrica_id)
        if not subtask:
            return jsonify({'error': 'La subtask no existe'}), 404

        TareaModel.delete_subtask(subtask_id, fabrica_id)
        return jsonify({'mensaje': f"Subtask {subtask[1]} eliminada exitosamente"}), 200
    except Exception as ex:
        app.logger.error(f'Error al eliminar la subtask: {ex}')
        return jsonify({'error': 'Error al procesar la solicitud'}), 500

@app.route('/update_subtask', methods = ['PATCH'])
def update_subtask():
    try:
        fabrica_id = session.get('fabrica')
        if not fabrica_id:
            return jsonify({'error': 'Fabrica no encontrada'}), 401
        
        data=request.json
        if not data:
            return jsonify({'error': 'No se proporcionó subtask'}), 400
        
        subtask_id = data.get('id')
        nombre = data.get('nombre')
        duracion = data.get('duracion')
        beneficio = data.get('beneficio')
        coste = data.get('coste')
        descripcion = data.get('descripcion')
        nuevas_skills = data.get('skills')
        subtask =TareaModel.update_subtask(fabrica_id, subtask_id, nombre, duracion, beneficio, coste, descripcion,  nuevas_skills)
        return jsonify({'mensaje': 'Subtask actualizado', 'subtask' : subtask}), 200
    except Exception as ex:
        app.logger.error(f'Error al actualizar subtask: {ex}')
        return jsonify({'error': 'Error al procesar la solicitud'}), 500

@app.route('/get_skills', methods =['GET'])
def get_skills():
    try:
        sector = session.get('sector')
        hard_skills = TareaModel.get_hard_skills(sector)
        soft_skills = TareaModel.get_soft_skills()
        
        return jsonify({'hard_skills': list(hard_skills), 'soft_skills': list(soft_skills)}), 200
    
    except Exception as e:
        app.logger.error(f'Error para obtener skills: {e}')
        return jsonify({'error': 'Error al procesar la solicitud'}), 500
    
@app.route('/skills_matching', methods = ['GET'])
def skills_matching():
    try:
        fabrica_id = session.get('fabrica')
        skills_matching = TareaModel.skills_matching(fabrica_id)
        return jsonify({'skills_matching' : skills_matching}), 200
    
    except Exception as e:
        app.logger.error(f'Error para obtener skills_mathcing: {e}')
        return jsonify({'error': 'Error al procesar la solicitud'}), 500    

@app.route('/alg_genetico', methods = ['GET'])
def algoritmo_genetico():
    fabrica_id = session.get('fabrica')
    if not fabrica_id:
        return jsonify({'error': 'Fabrica no encontrada'}), 404
    
    skills_matching = TareaModel.skills_matching(fabrica_id)
    fatigas = RecursosModel.fatiga_recursos(fabrica_id)
    costes_recursos = RecursosModel.coste_recursos(fabrica_id)
    costes_subtareas = TareaModel.coste_subtasks(fabrica_id)
    beneficios = TareaModel.beneficio_subtasks(fabrica_id)
    duracion = TareaModel.duracion_subtasks(fabrica_id)
    skills_id = list(skills_matching.keys())
    dependencias = TareaModel.get_dependencias_subtasks(skills_id)
    '''
    # Parámetros para el algoritmo genético
    num_individuos_seleccion= 100
    num_generations = 5000
    num_individuals = 200

    # Ejecutar el algoritmo genético
    mejor_individuo, metrics = run_genetic_algorithm(skills_matching,dependencias, num_generations, 
                                            num_individuals,num_individuos_seleccion,beneficios, costes_recursos,costes_subtareas, fatigas)


    # Visualizar las métricas
    plot_metrics(metrics)
    puntuacion = evaluate_individual(mejor_individuo,beneficios,costes_recursos, costes_subtareas, fatigas,dependencias)

    print("valores mejor individuo:",puntuacion)
    print("El mejor individuo encontrado es:", mejor_individuo)

    asignaciones = {subtask: recurso for subtask, recurso in mejor_individuo}

    resultado = {
        "puntuacion": puntuacion,
        "mejor_individuo": asignaciones
    }
    '''
    recursos = {id : {'coste_hora' : costes_recursos[id], 'fatiga' : fatigas[id]} for id in costes_recursos}
    subtareas = {id : {'coste_inicio': costes_subtareas[id], 'beneficio': beneficios[id],
                       'duracion': duracion[id], 'skills_matching': skills_matching[id]} for id in costes_subtareas}
    '''
    print(recursos)
    print('#####################################################################################################################')
    print(subtareas)
    '''

    resultado, stats = genetic_algorithm_assignment(recursos, subtareas)

    mejor_individuo_list = list(resultado.items())

    # Crear la nueva respuesta con la lista de tuplas
    nueva_respuesta = {
        'puntuacion': stats,
        'mejor_individuo': mejor_individuo_list
    }
    
    return jsonify(nueva_respuesta), 200

@app.route('/predecir_fatiga', methods = ['POST'])
def modelosPredictivos():
    try:
        fabrica_id = session.get('fabrica')
        if not fabrica_id:
            return jsonify({'error': 'Fabrica no encontrada'}), 404
        
        data=request.json
       
        if not data:
            return jsonify({'error': 'No se proporcionó toda la informacion'}), 400
        
        trabajadores = data.get('trabajadores')
        maquinas = data.get('maquinas')
        subtasks = data.get('subtasks')
        asignaciones = data.get('asignaciones')
        tiempo_trabajado = data.get('tiempo_trabajado')
        sector = session.get('sector')

        if not all([trabajadores, maquinas, subtasks, asignaciones, tiempo_trabajado, sector]):
            return jsonify({'error': 'Faltan datos en la solicitud'}), 400
        
        datos = {
            'trabajadores': [json.dumps(trabajadores)],
            'maquinas': [json.dumps(maquinas)],
            'subtasks': [json.dumps(subtasks)],
            'asignaciones': [json.dumps(asignaciones)],
            'tiempo_trabajado': [tiempo_trabajado],
            'sector': [sector]
        }

        # Llamar a la función del modelo
        resultado = modelo1(datos)

        # Formatear la respuesta
        response = {
            'resultado': int(resultado) 
        } 
        print(response)

        return jsonify(response)
    except Exception as ex:
        app.logger.error(f'Error regresion lineal: {ex}')
        return jsonify({'error': 'Error al procesar la solicitud regresion lineal'}), 500
   

@app.route('/add_historial', methods = ['POST'])
def añadir_historial():
    try:
        
        fabrica_id = session.get('fabrica')
        if not fabrica_id:
            return jsonify({'error': 'Fabrica no encontrada'}), 401
        
        data=request.json
        if not data:
            return jsonify({'error': 'No se proporcionó informacion para guardar en el historial'}), 400
        current_time = datetime.now()
        
        fecha = data.get('fecha')
        costes = data.get('costes')
        beneficios = data.get('beneficios')
        capital = data.get('capital')
        trabajadores = data.get('trabajadores')
        maquinas = data.get('maquinas')
        subtasks = data.get('subtasks')
        asignaciones = data.get('asignaciones')
        tiempo_trabajado = data.get('tiempo_trabajado')
        sector = session.get('sector')
        flag = data.get('flag')

        result = FabricaModel.add_historial(fecha,costes, beneficios, capital, trabajadores, maquinas, subtasks, asignaciones, tiempo_trabajado, fabrica_id, sector, flag)
        return jsonify({'mensaje': 'Historial actualizado' , 'historial' : result}), 200
   
    except Exception as ex:
        app.logger.error(f'Error al actualizar historial: {ex}')
        return jsonify({'error': 'Error al procesar la solicitud'}), 500

@app.route('/get_historial', methods = ['GET'])
def get_historial():
    try:
        fabrica_id = session.get('fabrica')
        if not fabrica_id:
            return jsonify({'error': 'Fabrica no encontrada'}), 401
        
        resultados = FabricaModel.get_historial(fabrica_id)
        if resultados:
            return jsonify({'historial' : resultados[-1]}), 200
        else:
            return jsonify({'error': 'Error al procesar la solicitud'}), 401
    except Exception as ex:
        app.logger.error(f'Error al obtener historial: {ex}')
        return jsonify({'error': 'Error al procesar la solicitud'}), 500
    
@app.route('/generar_fabrica', methods = ['POST'])
def generate_fabrica():
    try:
        user_id = session.get('usuario')
        if not user_id:
            return jsonify({'error': 'Usuario no autenticado'}), 404
        data = request.json
        if not data:
            return jsonify({'error': 'No se proporcionaron datos'}), 400
        n_humanos = data.get('n_trabajadores')
        n_maquinas = data.get('n_maquinas')
        n_subtareas = data.get('n_subtasks')
        fabrica = generar_fabrica(n_humanos, n_maquinas, n_subtareas, user_id)
        return jsonify({'fabrica' : fabrica}), 200
    except Exception as ex:
        app.logger.error(f'Error al generar fabrica: {ex}')
        return jsonify({'error': 'Error al procesar la solicitud'}), 500

@app.route('/generar_trabajadores', methods = ['POST'])
def generar_trabajadores():
    try:
        fabrica_id = session.get('fabrica')
        sector = session.get('sector')
        if not fabrica_id:
            return jsonify({'error': 'Fabrica no encontrada'}), 404
        data = request.json
        if not data:
            return jsonify({'error': 'No se proporcionaron datos'}), 400
        n_humanos = data.get('n_trabajadores')
        trabajadores = generate_trabajadores(n_humanos,sector,fabrica_id)
        return jsonify({'trabajadores' : trabajadores}), 200
    except Exception as ex:
        app.logger.error(f'Error al generar trabajador: {ex}')
        return jsonify({'error': 'Error al procesar la solicitud'}), 500

@app.route('/generar_maquinas', methods = ['POST'])
def generar_maquinas():
    try:
        fabrica_id = session.get('fabrica')
        sector = session.get('sector')
        if not fabrica_id:
            return jsonify({'error': 'Fabrica no encontrada'}), 404
        data = request.json
        if not data:
            return jsonify({'error': 'No se proporcionaron datos'}), 400
        n_maquinas = data.get('n_maquinas')
        maquinas = generate_maquinas(n_maquinas,sector,fabrica_id)
        return jsonify({'maquinas' : maquinas}), 200
    except Exception as ex:
        app.logger.error(f'Error al generar maquinas: {ex}')
        return jsonify({'error': 'Error al procesar la solicitud'}), 500

@app.route('/generar_subtareas', methods = ['POST'])
def generar_subtareas():
    try:
        fabrica_id = session.get('fabrica')
        sector = session.get('sector')
        if not fabrica_id:
            return jsonify({'error': 'Fabrica no encontrada'}), 404
        data = request.json
        if not data:
            return jsonify({'error': 'No se proporcionaron datos'}), 400
        n_subtareas = data.get('n_subtareas')
        subtasks = generate_subtasks(n_subtareas,sector,fabrica_id)
        return jsonify({'subtareas' : subtasks}), 200
    except Exception as ex:
        app.logger.error(f'Error al generar subtareas: {ex}')
        return jsonify({'error': 'Error al procesar la solicitud'}), 500


############################################################################################
# En proceso ¡¡¡No usar aun !!!
############################################################################################
@app.route('/upload', methods=['GET', 'POST'])
def upload_file():
    if request.method == 'POST':
        if 'file' not in request.files:
            print("No file part")
            return 'No file part'
        file = request.files['file']
        if file.filename == '':
            print("No selected file")
            return 'No selected file'
        if file:
            print("File received:", file.filename)
            # Procesamiento adicional aquí
            return 'File uploaded successfully'
    return render_template('upload.html')

@app.route('/actualizar_hard_skills',methods = ['GET'])
def actualizar_hard_skills():
    try:
        df = pd.read_csv('./skills/onet_skills_data.csv')
    except FileNotFoundError:
        return "El archivo CSV no fue encontrado.", 404

    try:
        df['Skills'] = df['Skills'].apply(ast.literal_eval)
    except ValueError:
        return "Error en la conversión de datos de Skills.", 400

    try:
        cluster_skill_counts = df.groupby('Cluster')['Skills'].agg(lambda skill_lists: Counter(skill for skills in skill_lists for skill in skills))
        top_10_skills = cluster_skill_counts.apply(lambda x: x.most_common(10))
    except Exception as e:
        return f"Error al procesar habilidades: {str(e)}", 500

    try:
        def traducir(texto):
            return GoogleTranslator(source='auto', target='es').translate(texto)

        # Traducir el nombre del sector
        top_10_skills.index = [traducir(cluster) for cluster in top_10_skills.index]

        # Traducir las habilidades
        for cluster in top_10_skills.index:
            top_10_skills[cluster] = [(traducir(skill), count) for skill, count in top_10_skills[cluster]]
            

    except Exception as e:
        return f"Error al traducir: {str(e)}", 500
    FabricaModel.actualizar_hard_skills(top_10_skills)
    
    return "Habilidades duras actualizadas correctamente.", 200

