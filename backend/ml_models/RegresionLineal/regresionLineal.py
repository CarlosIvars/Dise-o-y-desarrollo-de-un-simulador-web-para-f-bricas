
import pandas as pd
import json
from sklearn.model_selection import train_test_split, cross_val_score, KFold
from sklearn.linear_model import LinearRegression, Ridge
from sklearn.metrics import mean_squared_error, mean_absolute_error
import matplotlib.pyplot as plt
import numpy as np

def caracteristicas_trabajadores(trabajadores):  
    activos = [t for t in trabajadores if t['activo']]
    if not activos:
        return 0, 0, {}
    promedio_fatiga = sum(t['fatiga'] for t in activos) / len(activos)
    promedio_coste_h = sum(t['coste_h'] for t in activos) / len(activos)
    skills = {}
    for t in activos:
        for skill in t['skills']:
            if skill in skills:
                skills[skill] += 1
            else:
                skills[skill] = 1
    
    total_skills = sum(skills.values())
    distribucion_skills = {k: v / total_skills for k, v in skills.items()}
    
    return promedio_fatiga, promedio_coste_h, distribucion_skills

def caracteristicas_maquinas(maquinas):
    activas = [m for m in maquinas if m['activo']]
    if not activas:
        return 0, 0, {}
    
    promedio_fatiga = sum(m['fatiga'] for m in activas) / len(activas)
    promedio_coste_h = sum(m['coste_h'] for m in activas) / len(activas)
    
    skills = {}
    for m in activas:
        for skill in m['skills']:
            if skill in skills:
                skills[skill] += 1
            else:
                skills[skill] = 1
    
    total_skills = sum(skills.values())
    distribucion_skills = {k: v / total_skills for k, v in skills.items()}
    
    return promedio_fatiga, promedio_coste_h, distribucion_skills

def caracteristicas_subtareas(subtareas):
    subtareas = json.loads(subtareas)
    activas = [s for s in subtareas if s['isWorking']]
    if not activas:
        return 0, 0, 0, {}
    
    coste_total = sum(s['coste'] for s in activas)
    beneficio_total = sum(s['beneficio'] for s in activas)
    promedio_duracion = sum(s['duracion'] for s in activas) / len(activas)
    
    skills = {}
    for s in activas:
        for skill in s['skills']:
            if skill in skills:
                skills[skill] += 1
            else:
                skills[skill] = 1
    
    total_skills = sum(skills.values())
    distribucion_skills = {k: v / total_skills for k, v in skills.items()}
    
    return coste_total, beneficio_total, promedio_duracion, distribucion_skills

def contar_asignaciones(asignaciones):
    trabajadores = [a for a in asignaciones if a['asignable_id'].startswith('H')]
    maquinas = [a for a in asignaciones if a['asignable_id'].startswith('M')]
    
    num_asignaciones_trabajadores = len(trabajadores)
    num_asignaciones_maquinas = len(maquinas)
    
    return num_asignaciones_trabajadores, num_asignaciones_maquinas

def procesar_datos(df):
# Procesar datos
    try:
        print('entramos')
        # Convertir la columna de fecha a tipo datetime
        df['fecha'] = pd.to_datetime(df['fecha'])

        # Extraer el día de la semana y la hora del día
        df['dia_semana'] = df['fecha'].dt.dayofweek
        df['hora_dia'] = df['fecha'].dt.hour

        # Mostrar las primeras filas para verificar las nuevas columnas
        print(df[['fecha', 'dia_semana', 'hora_dia']])
        
        df['trabajadores'] = df['trabajadores'].apply(lambda x: json.loads(x.replace("'", "\"")))
        df['asignaciones'] = df['asignaciones'].apply(lambda x: json.loads(x.replace("'", "\"")))
        df['maquinas'] = df['maquinas'].apply(lambda x: json.loads(x.replace("'", "\"")))
        df['subatsks'] = df['subtasks'].apply(lambda x: json.loads(x.replace("'", "\"")))


        # Aplicar la función a cada fila del DataFrame
        df['promedio_fatiga_trab'] = df['trabajadores'].apply(lambda x: caracteristicas_trabajadores(x)[0])
        df['promedio_coste_h_trab'] = df['trabajadores'].apply(lambda x: caracteristicas_trabajadores(x)[1])
        df['distribucion_skills_trab'] = df['trabajadores'].apply(lambda x: caracteristicas_trabajadores(x)[2])
        # Mostrar las primeras filas para verificar las nuevas columnas
        print(df[['promedio_fatiga_trab', 'promedio_coste_h_trab', 'distribucion_skills_trab']].head())

        # Aplicar la función a cada fila del DataFrame
        df['promedio_fatiga_maq'] = df['maquinas'].apply(lambda x: caracteristicas_maquinas(x)[0])
        df['promedio_coste_h_maq'] = df['maquinas'].apply(lambda x: caracteristicas_maquinas(x)[1])
        df['distribucion_skills_maq'] = df['maquinas'].apply(lambda x: caracteristicas_maquinas(x)[2])

        # Mostrar las primeras filas para verificar las nuevas columnas
        print(df[['promedio_fatiga_maq', 'promedio_coste_h_maq', 'distribucion_skills_maq']].head())

        # Aplicar la función a cada fila del DataFrame
        df['coste_total_subt'] = df['subtasks'].apply(lambda x: caracteristicas_subtareas(x)[0])
        df['beneficio_total_subt'] = df['subtasks'].apply(lambda x: caracteristicas_subtareas(x)[1])
        df['promedio_duracion_subt'] = df['subtasks'].apply(lambda x: caracteristicas_subtareas(x)[2])
        df['distribucion_skills_subt'] = df['subtasks'].apply(lambda x: caracteristicas_subtareas(x)[3])

        # Mostrar las primeras filas para verificar las nuevas columnas
        print(df[['coste_total_subt', 'beneficio_total_subt', 'promedio_duracion_subt', 'distribucion_skills_subt']].head())

        # Aplicar la función a cada fila del DataFrame
        df['num_asignaciones_trab'] = df['asignaciones'].apply(lambda x: contar_asignaciones(x)[0])
        df['num_asignaciones_maq'] = df['asignaciones'].apply(lambda x: contar_asignaciones(x)[1])

        # Mostrar las primeras filas para verificar las nuevas columnas
        print(df[['num_asignaciones_trab', 'num_asignaciones_maq']].head())

        caracteristicas = [
            'dia_semana', 'hora_dia',
            'promedio_fatiga_trab', 'promedio_coste_h_trab',
            'promedio_fatiga_maq', 'promedio_coste_h_maq',
            'coste_total_subt', 'beneficio_total_subt', 'promedio_duracion_subt',
            'num_asignaciones_trab', 'num_asignaciones_maq'
        ]

        # Variables objetivo
        objetivos = ['costes', 'beneficios']

        # Crear DataFrame con las características y los objetivos
        df_modelo = df[caracteristicas + objetivos]

        # Mostrar las primeras filas del DataFrame de modelo
        print(df_modelo.info())

        # División de los datos en entrenamiento y prueba
        X = df_modelo[caracteristicas]
        y_costes = df_modelo['costes']
        y_beneficios = df_modelo['beneficios']

        X_train, X_test, y_costes_train, y_costes_test = train_test_split(X, y_costes, test_size=0.2, random_state=42)
        _, _, y_beneficios_train, y_beneficios_test = train_test_split(X, y_beneficios, test_size=0.2, random_state=42)

        # Modelo para predecir costes
        modelo_costes = LinearRegression()
        #modelo_costes = Ridge(alpha=1.0)
        modelo_costes.fit(X_train, y_costes_train)

        # Predicciones y evaluación para costes
        y_costes_pred = modelo_costes.predict(X_test)
        rmse_costes = mean_squared_error(y_costes_test, y_costes_pred, squared=False)
        mae_costes = mean_absolute_error(y_costes_test, y_costes_pred)

        print(f'RMSE Costes: {rmse_costes}')
        print(f'MAE Costes: {mae_costes}')

        # Validación cruzada para costes
        kf = KFold(n_splits=5, shuffle=True, random_state=42)
        rmse_costes_cv = np.sqrt(-cross_val_score(modelo_costes, X, y_costes, cv=kf, scoring='neg_mean_squared_error'))
        mae_costes_cv = -cross_val_score(modelo_costes, X, y_costes, cv=kf, scoring='neg_mean_absolute_error')
        print(f'RMSE Costes CV: {rmse_costes_cv.mean()}')
        print(f'MAE Costes CV: {mae_costes_cv.mean()}')

        # Visualización de predicciones vs valores reales para costes
        plt.scatter(y_costes_test, y_costes_pred, alpha=0.3)
        plt.plot([y_costes_test.min(), y_costes_test.max()], [y_costes_test.min(), y_costes_test.max()], 'k--', lw=2)
        plt.xlabel('Valores Reales')
        plt.ylabel('Predicciones')
        plt.title('Predicciones vs Valores Reales para Costes')
        plt.show()

        # Modelo para predecir beneficios
        modelo_beneficios = LinearRegression()
        modelo_beneficios.fit(X_train, y_beneficios_train)

        # Predicciones y evaluación para beneficios
        y_beneficios_pred = modelo_beneficios.predict(X_test)
        rmse_beneficios = mean_squared_error(y_beneficios_test, y_beneficios_pred, squared=False)
        mae_beneficios = mean_absolute_error(y_beneficios_test, y_beneficios_pred)

        print(f'RMSE Beneficios: {rmse_beneficios}')
        print(f'MAE Beneficios: {mae_beneficios}')

        # Validación cruzada para beneficios
        rmse_beneficios_cv = np.sqrt(-cross_val_score(modelo_beneficios, X, y_beneficios, cv=kf, scoring='neg_mean_squared_error'))
        mae_beneficios_cv = -cross_val_score(modelo_beneficios, X, y_beneficios, cv=kf, scoring='neg_mean_absolute_error')
        print(f'RMSE Beneficios CV: {rmse_beneficios_cv.mean()}')
        print(f'MAE Beneficios CV: {mae_beneficios_cv.mean()}')

        # Visualización de predicciones vs valores reales para beneficios
        plt.scatter(y_beneficios_test, y_beneficios_pred, alpha=0.3)
        plt.plot([y_beneficios_test.min(), y_beneficios_test.max()], [y_beneficios_test.min(), y_beneficios_test.max()], 'k--', lw=2)
        plt.xlabel('Valores Reales')
        plt.ylabel('Predicciones')
        plt.title('Predicciones vs Valores Reales para Beneficios')
        plt.show()

    except Exception as ex: 
        print(ex)

def regresionLineal(data):
    df = pd.DataFrame(data)
    procesar_datos(df)
    return df
