#!/usr/bin/env python3
"""
FloraSense - Exportador de Modelos a TensorFlow Lite (INT8 / FP16)
Optimizado para despliegue en celulares Android mediante tflite_flutter.
"""

import os
import sys
import numpy as np
import tensorflow as tf

def export_model_to_tflite(saved_model_dir, output_tflite_path, quantize_mode="int8"):
    print(f"[*] Cargando modelo desde: {saved_model_dir}")
    converter = tf.lite.TFLiteConverter.from_saved_model(saved_model_dir)

    if quantize_mode == "int8":
        print("[*] Aplicando cuantización post-entrenamiento INT8...")
        converter.optimizations = [tf.lite.Optimize.DEFAULT]
        
        # Generador de datos representativos para calibración de rango dinámico
        def representative_data_gen():
            for _ in range(100):
                # Entrada de ejemplo 224x224x3 normalizada [-1, 1]
                data = np.random.uniform(-1.0, 1.0, size=(1, 224, 224, 3)).astype(np.float32)
                yield [data]

        converter.representative_dataset = representative_data_gen
        converter.target_spec.supported_ops = [tf.lite.OpsSet.TFLITE_BUILTINS_INT8]
        converter.inference_input_type = tf.uint8
        converter.inference_output_type = tf.uint8

    elif quantize_mode == "fp16":
        print("[*] Aplicando cuantización FP16...")
        converter.optimizations = [tf.lite.Optimize.DEFAULT]
        converter.target_spec.supported_types = [tf.float16]

    tflite_model = converter.convert()

    os.makedirs(os.path.dirname(output_tflite_path), exist_ok=True)
    with open(output_tflite_path, "wb") as f:
        f.write(tflite_model)

    size_mb = len(tflite_model) / (1024 * 1024)
    print(f"[✓] Modelo TFLite generado exitosamente en: {output_tflite_path}")
    print(f"[✓] Tamaño final optimizado: {size_mb:.2f} MB")

    # Generar archivo de etiquetas labels.txt
    labels = ["sana", "cochinilla", "pulgon", "mosca_blanca", "acaros"]
    labels_file = os.path.splitext(output_tflite_path)[0] + "_labels.txt"
    with open(labels_file, "w") as f:
        for lbl in labels:
            f.write(f"{lbl}\n")
    print(f"[✓] Archivo de etiquetas guardado en: {labels_file}")

if __name__ == "__main__":
    print("=== FloraSense ML TFLite Converter ===")
    # Para demostración de sintaxis y pipelines
    # export_model_to_tflite("saved_model/mobilenetv3_flora", "models/florasense_pest_int8.tflite", "int8")
