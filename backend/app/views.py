# Vistas de Flask para manejar las rutas
from app import app
from werkzeug.security import check_password_hash
from flask import *
from .forms import *
from .models import *
from ml_models import *
import numpy as np
import json
from config import config
from ml_models.AG.genetic_algorithm import *
from datetime import date
#'Bearer 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'
@app.route('/')
def init():
    resultado = TareaModel.skills_matching(1)
    print(resultado)
    
    skills_matching = {
    'Tarea1': ['Humano1', 'Humano2', 'Humano3', 'Humano4'],
    'Tarea2': ['Humano1', 'Humano4', 'Humano5', 'Humano6'],
    'Tarea3': ['Humano2', 'Humano3', 'Humano5', 'Humano7'],
    'Tarea4': ['Humano8', 'Humano9', 'Humano10', 'Humano11'],
    'Tarea5': ['Humano12', 'Humano13', 'Humano14', 'Humano3'],
    'Tarea6': ['Humano1', 'Humano15', 'Humano16', 'Humano17'],
    'Tarea7': ['Humano18', 'Humano19', 'Humano20', 'Humano21'],
    'Tarea8': ['Humano22', 'Humano23', 'Humano24', 'Humano25'],
    'Tarea9': ['Humano26', 'Humano27', 'Humano28', 'Humano29'],
    'Tarea10': ['Humano30'],
    'Tarea11': ['Humano30'],

    }
    beneficios= {
        'Tarea1': 100,
        'Tarea2': 150,
        'Tarea3': 120,
        'Tarea4': 130,
        'Tarea5': 80,
        'Tarea6': 200,
        'Tarea7': 110,
        'Tarea8': 90,
        'Tarea9': 160,
        'Tarea10': 140,
        'Tarea11' : 5000,
    }
    costes = {
        'Humano1': 50, 'Humano2': 45, 'Humano3': 55, 'Humano4': 40, 'Humano5': 60,
        'Humano6': 50, 'Humano7': 65, 'Humano8': 40, 'Humano9': 55, 'Humano10': 45,
        'Humano11': 60, 'Humano12': 50, 'Humano13': 55, 'Humano14': 65, 'Humano15': 40,
        'Humano16': 45, 'Humano17': 50, 'Humano18': 60, 'Humano19': 40, 'Humano20': 55,
        'Humano21': 65, 'Humano22': 45, 'Humano23': 50, 'Humano24': 55, 'Humano25': 40,
        'Humano26': 60, 'Humano27': 65, 'Humano28': 45, 'Humano29': 55, 'Humano30': 50,
        'Humano31': 40, 'Humano32': 60, 'Humano33': 65
    }
    fatigas = {
        'Humano1': 10, 'Humano2': 15, 'Humano3': 20, 'Humano4': 10, 'Humano5': 25,
        'Humano6': 5, 'Humano7': 30, 'Humano8': 10, 'Humano9': 20, 'Humano10': 15,
        'Humano11': 5, 'Humano12': 10, 'Humano13': 25, 'Humano14': 30, 'Humano15': 20,
        'Humano16': 15, 'Humano17': 10, 'Humano18': 5, 'Humano19': 25, 'Humano20': 20,
        'Humano21': 15, 'Humano22': 30, 'Humano23': 5, 'Humano24': 10, 'Humano25': 25,
        'Humano26': 20, 'Humano27': 15, 'Humano28': 10, 'Humano29': 5, 'Humano30': 10,
        'Humano31': 25, 'Humano32': 20, 'Humano33': 15
    }

    dependencias = {
        'Tarea11' : 'Tarea10',
    }
    '''
    skills_matching = TareaModel.skills_matching(fabrica_id)
    fatigas = RecursosModel.fatiga_recursos(fabrica_id)
    costes = RecursosModel.coste_recursos(fabrica_id)
    beneficios = TareaModel.beneficio_subtasks(fabrica_id)
    dependencias = TareaModel.dependencias_subtasks(skills_matching)

    '''
    k= 50

    # Parámetros para el algoritmo genético
    num_generations = 2000
    num_individuals = 50

    # Ejecutar el algoritmo genético
    mejor_individuo = run_genetic_algorithm(skills_matching,dependencias, num_generations, num_individuals,k,beneficios, costes, fatigas)
    print("valores mejor individuo:",evaluate_individual(mejor_individuo,beneficios,costes, fatigas,dependencias))
    print("El mejor individuo encontrado es:", mejor_individuo)

    #soft_skills = TareaModel.get_soft_skills();
    #print(soft_skills)
    return mejor_individuo

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
    print(session   )
    return jsonify({'mensaje': 'Fábrica seleccionada exitosamente', 'fabrica_id': fabrica, 'trabajadores' : trabajadores, 'maquinas': maquinas, 'subtasks' : subtasks}), 200

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
    nombre = data.get('nombre')
    apellidos = data.get('apellidos')
    fecha_nacimiento = data.get('fecha_nacimiento')
    fatiga = data.get('fatiga')
    coste_h = data.get('coste_h')
    preferencias = data.get('preferencias')
    skills = data.get('skills')
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
        
        trabajador_id = data.get('id')
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
        if not data or not all(key in data for key in ['nombre','duracion', 'beneficio', 'descripcion','subtask_dependencia']):
            return jsonify({'error': 'Datos incompletos'}), 400
        
        sector = session.get('sector')
        nombre = data.get('nombre')
        duracion = data.get('duracion')
        beneficio = data.get('beneficio')
        descripcion = data.get('descripcion')
        subtask_dependencia = data.get('subtask_dependencia')
        subtask= TareaModel.add_subtask(nombre, duracion, beneficio, descripcion, fabrica_id, sector)
        
        if subtask:        
            if subtask_dependencia:
                TareaModel.add_dependencias_subtasks(subtask['id'],subtask_dependencia)
            
            return jsonify({'mensaje': 'Subtask añadida con exitoso', 'subtask' : subtask}), 201
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
        descripcion = data.get('descripcion')
        if descripcion :
            nuevas_habilidades = TareaModel.obtener_skills_chatGPT(descripcion)
        subtask =TareaModel.update_subtask(fabrica_id, subtask_id, nombre, duracion, beneficio, descripcion,  nuevas_habilidades)
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
        print(skills_matching)
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
    costes = RecursosModel.coste_recursos(fabrica_id)
    beneficios = TareaModel.beneficio_subtasks(fabrica_id)
    dependencias = TareaModel.dependencias_subtasks(skills_matching)
    
    # Parámetros para el algoritmo genético
    num_individuos_seleccion= 50
    num_generations = 2000
    num_individuals = 50

    # Ejecutar el algoritmo genético
    mejor_individuo = run_genetic_algorithm(skills_matching,dependencias, num_generations, 
                                            num_individuals,num_individuos_seleccion,beneficios, costes, fatigas)
    puntuacion = evaluate_individual(mejor_individuo,beneficios,costes, fatigas,dependencias)

    print("valores mejor individuo:",puntuacion)
    print("El mejor individuo encontrado es:", mejor_individuo)

    asignaciones = {subtask: recurso for subtask, recurso in mejor_individuo}

    resultado = {
        "puntuacion": puntuacion,
        "mejor_individuo": asignaciones
    }
 
    return jsonify(resultado), 200

@app.route('/add_historial', methods = ['POST'])
def añadir_historial():
    try:
        fabrica_id = session.get('fabrica')
        if not fabrica_id:
            return jsonify({'error': 'Fabrica no encontrada'}), 401
        
        data=request.json
        if not data:
            return jsonify({'error': 'No se proporcionó informacion para guardar en el historial'}), 400
        
        fecha = data.get('fecha') #date.today()
        coste = data.get('coste')
        beneficios = data.get('beneficios')
        asignaciones = data.get('asignaciones')
        result = FabricaModel.add_historial(fecha,coste,beneficios,json.dumps(asignaciones),fabrica_id)

       
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
            for resultado in resultados:
                #para trabajar con los resultados si es necesario
                id_registro = resultado[0]
                fecha = resultado[1]
                costes = resultado[2]
                beneficios = resultado[3]
                asignaciones_json = resultado[4]

                #asignaciones = json.loads(asignaciones_json)

            return resultados
        else:
            return jsonify({'error': 'Error al procesar la solicitud'}), 401
    except Exception as ex:
            app.logger.error(f'Error al obtener historial: {ex}')
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


@app.route('/<usuario>/<fabrica>',)
def ver_fabrica(usuario, fabrica):
    print(usuario, fabrica)
    # Aquí va la lógica para manejar la solicitud para una fábrica específica
    return render_template('pagina_fabrica.html', usuario=usuario, fabrica=fabrica)

@app.route('/<usuario>/<fabrica>/skill_matching')
def obtener_habilidades(fabrica_id):
    habilidades_maquinas = RecursosModel.obtener_habilidades_maquinas(fabrica_id)
    habilidades_trabajadores = RecursosModel.obtener_habilidades_trabajadores(fabrica_id)
    
    # Combinar los diccionarios de habilidades de máquinas y trabajadores en uno solo
    habilidades_totales = habilidades_maquinas.copy()
    habilidades_totales.update(habilidades_trabajadores)
    
    return habilidades_totales
