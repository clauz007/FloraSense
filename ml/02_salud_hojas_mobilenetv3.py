# -*- coding: utf-8 -*-
"""
FloraSense ML - Fase B & C: Transfer Learning con MobileNetV3
Diagnóstico de Salud Foliar y Detección de Plagas (Cochinilla, Pulgón, Mosca Blanca, Ácaros).
Listo para ejecutar en Google Colab con aceleración por GPU.
"""

import os
import tensorflow as tf
from tensorflow.keras import layers, models
from tensorflow.keras.applications import MobileNetV3Small
from tensorflow.keras.preprocessing.image import ImageDataGenerator

IMG_SIZE = (224, 224)
BATCH_SIZE = 32
EPOCHS = 15
NUM_CLASSES = 5
CLASSES = ["sana", "cochinilla", "pulgon", "mosca_blanca", "acaros"]

def build_model(num_classes=NUM_CLASSES):
    base_model = MobileNetV3Small(
        input_shape=(224, 224, 3),
        include_top=False,
        weights='imagenet',
        pooling='avg',
        minimalistic=False
    )
    # Congelar capas base para preservar características preentrenadas
    base_model.trainable = False

    inputs = tf.keras.Input(shape=(224, 224, 3))
    x = layers.Rescaling(1./127.5, offset=-1)(inputs) # Normalizar a [-1, 1]
    
    # Data Augmentation integrado en el grafo
    x = layers.RandomFlip("horizontal")(x)
    x = layers.RandomRotation(0.15)(x)
    x = layers.RandomZoom(0.1)(x)
    
    x = base_model(x, training=False)
    x = layers.Dropout(0.3)(x)
    x = layers.Dense(128, activation='relu')(x)
    outputs = layers.Dense(num_classes, activation='softmax')(x)

    model = models.Model(inputs, outputs, name="FloraSense_MobileNetV3")
    return model, base_model

def train_pipeline(data_dir="dataset_florasense"):
    print("[*] Configurando arquitectura MobileNetV3 Small...")
    model, base_model = build_model()
    
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=1e-3),
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )
    model.summary()

    # Callback para parada temprana
    early_stop = tf.keras.callbacks.EarlyStopping(monitor='val_loss', patience=4, restore_best_weights=True)
    
    print("[*] Listo para entrenamiento con generador de datos.")
    print("    Para ejecutar en Colab, descomprime tu dataset_florasense.zip y llama:")
    print("    train_generator = train_datagen.flow_from_directory('dataset_florasense/train', target_size=(224,224)...)")

if __name__ == "__main__":
    train_pipeline()
