import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier, AdaBoostClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.neighbors import KNeighborsClassifier
from sklearn.neural_network import MLPClassifier
from sklearn.naive_bayes import GaussianNB
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import classification_report, confusion_matrix
from xgboost import XGBClassifier
from imblearn.over_sampling import SMOTE

# Asumiendo que las funciones de preprocesamiento y afinidad están en 'preproceso_fatiga.py'
from .preproceso_fatiga import preproceso_datos_fatiga

def expand_list_columns(df, column_name):
    expanded_df = pd.DataFrame(df[column_name].to_list(), index=df.index)
    expanded_df.columns = [f"{column_name}_{i}" for i in range(expanded_df.shape[1])]
    return expanded_df

def verificar_distribucion_clases(df, nombre):
    print(f"Distribución de clases en {nombre}:")
    print(df['clase_fatiga'].value_counts())
    print("\n")

def balancear_clases_smote(X, y):
    smote = SMOTE(random_state=42)
    X_resampled, y_resampled = smote.fit_resample(X, y)
    return X_resampled, y_resampled

def modelosML(data, data_fin):
    df_modelo = preproceso_datos_fatiga(data, data_fin)
    df_modelo.to_csv('./df_modelo.csv', index=False)

    # Expandir las columnas que contienen listas
    t_skills_expanded = expand_list_columns(df_modelo, 't_skills')
    m_skills_expanded = expand_list_columns(df_modelo, 'm_skills')
    s_skills_expanded = expand_list_columns(df_modelo, 's_skills')

    # Unir las columnas expandidas al DataFrame original
    df_modelo = pd.concat([df_modelo, t_skills_expanded, m_skills_expanded, s_skills_expanded], axis=1)

    # Eliminar las columnas originales de listas
    df_modelo.drop(columns=['t_skills', 'm_skills', 's_skills'], inplace=True)

    # Convertir todas las características a numéricas
    df_modelo = df_modelo.apply(pd.to_numeric, errors='coerce')

    # Eliminar filas con valores NaN en clase_fatiga
    df_modelo = df_modelo.dropna(subset=['clase_fatiga'])

    # Verificar distribución de clases antes del balanceo
    verificar_distribucion_clases(df_modelo, "conjunto de datos completo")

    # Dividir los datos en características (X) y objetivo (y)
    X = df_modelo.drop('clase_fatiga', axis=1)
    y = df_modelo['clase_fatiga']

    # Convertir características a arrays NumPy
    X = X.values
    y = y.values

    # Balancear las clases usando SMOTE
    X_resampled, y_resampled = balancear_clases_smote(X, y)

    # Verificar distribución de clases después del balanceo
    df_resampled = pd.DataFrame(X_resampled, columns=df_modelo.drop('clase_fatiga', axis=1).columns)
    df_resampled['clase_fatiga'] = y_resampled
    verificar_distribucion_clases(df_resampled, "conjunto de datos balanceado")

    # Dividir los datos en conjuntos de entrenamiento y prueba
    X_train, X_test, y_train, y_test = train_test_split(X_resampled, y_resampled, test_size=0.2, random_state=42, stratify=y_resampled)

    # Escalar las características
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # Ajustar el número de vecinos para KNN
    min_samples_per_class = min(np.bincount(y_train.astype(int)))
    n_neighbors = min(5, min_samples_per_class)

    # Definir los modelos
    models = {
        'Logistic Regression': LogisticRegression(max_iter=10000, random_state=42),
        'SVM': SVC(kernel='linear', random_state=42),
        #'K-Nearest Neighbors': KNeighborsClassifier(n_neighbors=n_neighbors),
        'Gradient Boosting': GradientBoostingClassifier(random_state=42),
        'AdaBoost': AdaBoostClassifier(random_state=42),
        'Neural Network': MLPClassifier(max_iter=10000, random_state=42),
        'Naive Bayes': GaussianNB(),
        'Decision Tree': DecisionTreeClassifier(random_state=42),
        'Random Forest': RandomForestClassifier(n_estimators=100, random_state=42),
        'XGBoost': XGBClassifier(random_state=42)
    }

    # Entrenar y evaluar cada modelo
    for name, model in models.items():
        model.fit(X_train_scaled, y_train)
        predictions = model.predict(X_test_scaled)
        print(f"{name} Classification Report:")
        print(classification_report(y_test, predictions, zero_division=1))
        print(f"{name} Confusion Matrix:")
        print(confusion_matrix(y_test, predictions))
