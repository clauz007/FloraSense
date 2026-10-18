# -*- coding: utf-8 -*-
"""
FloraSense ML - Fase A: Predicción de Tasa de Secado y Horas hasta Riego
Ejecutable en Google Colab o entorno local con scikit-learn.
"""

import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error, r2_score
import joblib

def generate_synthetic_telemetry(n_samples=5000):
    """Genera datos sintéticos basados en la física de evapotranspiración de invernadero."""
    np.random.seed(42)
    current_moisture = np.random.uniform(25.0, 85.0, n_samples)
    temperature = np.random.uniform(16.0, 36.0, n_samples)
    humidity_air = np.random.uniform(30.0, 90.0, n_samples)
    solar_vpd = (temperature * 0.15) - (humidity_air * 0.05) # Déficit de presión de vapor aproximado
    pot_size_liters = np.random.choice([1.5, 3.0, 5.0, 10.0], n_samples)
    
    # Horas restantes hasta alcanzar el umbral crítico de 30%
    drying_rate_per_hour = (0.35 + 0.05 * (temperature - 20) - 0.02 * (humidity_air - 50)) / (pot_size_liters * 0.4)
    drying_rate_per_hour = np.maximum(drying_rate_per_hour, 0.08) # Mínima pérdida basal
    
    hours_to_water = (current_moisture - 30.0) / drying_rate_per_hour
    hours_to_water = np.maximum(hours_to_water, 0.0)
    
    df = pd.DataFrame({
        'current_moisture': current_moisture,
        'temperature': temperature,
        'humidity_air': humidity_air,
        'pot_size_liters': pot_size_liters,
        'solar_vpd': solar_vpd,
        'hours_to_water': hours_to_water
    })
    return df

def train_irrigation_predictor():
    print("[*] Generando dataset de telemetría de suelo...")
    df = generate_synthetic_telemetry(6000)
    
    X = df[['current_moisture', 'temperature', 'humidity_air', 'pot_size_liters', 'solar_vpd']]
    y = df['hours_to_water']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    model = RandomForestRegressor(n_estimators=120, max_depth=10, random_state=42)
    model.fit(X_train, y_train)
    
    preds = model.predict(X_test)
    rmse = np.sqrt(mean_squared_error(y_test, preds))
    r2 = r2_score(y_test, preds)
    
    print(f"[✓] Modelo de Riego Entrenado.")
    print(f"    RMSE: {rmse:.2f} horas")
    print(f"    R2 Score: {r2:.4f}")
    
    joblib.dump(model, "florasense_irrigation_predictor.joblib")
    print("[✓] Modelo exportado como 'florasense_irrigation_predictor.joblib'")

if __name__ == "__main__":
    train_irrigation_predictor()
