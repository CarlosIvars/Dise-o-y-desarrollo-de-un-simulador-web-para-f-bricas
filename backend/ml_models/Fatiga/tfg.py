import pandas as pd
import numpy as np
import pickle
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler
from ast import literal_eval
import os
from ml_models.Fatiga.preproceso_fatiga import preproceso_datos_fatiga_simulador
def expand_list_columns(df, column_name):
        expanded_df = pd.DataFrame(df[column_name].to_list(), index=df.index)
        expanded_df.columns = [f"{column_name}_{i}" for i in range(expanded_df.shape[1])]
        return expanded_df

# Cargar modelos
def modelo1(data):

    try:
        file_name = './ml_models/Fatiga/XGBoost150.pkl'

        # Verifica si el archivo existe en el directorio actual
        if os.path.isfile(file_name):
            with open(file_name, 'rb') as file:
                modelo_rf = pickle.load(file)
        else:
            print(f"El archivo {file_name} no existe en el directorio actual")

        # Preprocesar nuevos datos
        nuevos_datos = preproceso_datos_fatiga_simulador(data)
        t_skills_expanded = expand_list_columns(nuevos_datos, 't_skills')
        m_skills_expanded = expand_list_columns(nuevos_datos, 'm_skills')
        s_skills_expanded = expand_list_columns(nuevos_datos, 's_skills')

        t_skills_expanded = expand_list_columns(nuevos_datos, 't_skills')
        m_skills_expanded = expand_list_columns(nuevos_datos, 'm_skills')
        s_skills_expanded = expand_list_columns(nuevos_datos, 's_skills')

        nuevos_datos = pd.concat([nuevos_datos, t_skills_expanded, m_skills_expanded, s_skills_expanded], axis=1)
        nuevos_datos.drop(columns=['t_skills', 'm_skills', 's_skills'], inplace=True)
        nuevos_datos = nuevos_datos.apply(pd.to_numeric, errors='coerce')

        imputer = SimpleImputer(strategy='mean')
        nuevos_datos_imputados = imputer.fit_transform(nuevos_datos)

        scaler = StandardScaler()
        nuevos_datos_escalados = scaler.fit_transform(nuevos_datos_imputados)


        prediccion = modelo_rf.predict(nuevos_datos_escalados)

        return prediccion
    
    except Exception as ex:
        print('Error al ejecutar modelo', ex )