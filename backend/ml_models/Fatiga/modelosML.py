import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix
from xgboost import XGBClassifier
from .preproceso_fatiga import *

# Supongamos que df_modelo es el DataFrame preprocesado
# Cargar tus datos preprocesados
def modelosML(data, data_fin):
    df_modelo = preproceso_datos_fatiga(data, data_fin)  # Asegúrate de que data esté definida
    df_modelo.to_csv('./df_modelo.csv', index=False)
    # Dividir los datos en características (X) y objetivo (y)
    X = df_modelo.drop('clase_fatiga', axis=1)
    y = df_modelo['clase_fatiga']

    # Dividir los datos en conjuntos de entrenamiento y prueba
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    # Escalar las características
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # Entrenar un modelo de Random Forest
    rf_model = RandomForestClassifier(n_estimators=100, random_state=42)
    rf_model.fit(X_train_scaled, y_train)

    # Predicciones y evaluación del modelo
    rf_predictions = rf_model.predict(X_test_scaled)
    print("Random Forest Classification Report:")
    print(classification_report(y_test, rf_predictions))
    print("Random Forest Confusion Matrix:")
    print(confusion_matrix(y_test, rf_predictions))

    # Entrenar un modelo de Gradient Boosting (XGBoost)
    xgb_model = XGBClassifier(random_state=42)
    xgb_model.fit(X_train_scaled, y_train)

    # Predicciones y evaluación del modelo
    xgb_predictions = xgb_model.predict(X_test_scaled)
    print("XGBoost Classification Report:")
    print(classification_report(y_test, xgb_predictions))
    print("XGBoost Confusion Matrix:")
    print(confusion_matrix(y_test, xgb_predictions))