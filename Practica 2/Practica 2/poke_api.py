from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
from mysql.connector import Error
 
app = Flask(__name__)
CORS(app, supports_credentials=True)
 
# Configuración de la conexión a la base de datos
def get_db_connection():
    try:
        connection = mysql.connector.connect(
            host='localhost',
            user='root',
            password='14042006',
            database='restaurante_online',
            port=3306,
            auth_plugin='mysql_native_password'
        )
        return connection
    except Error as e:
        print(f"Error al conectar a la base de datos: {e}")
        return None
 
# Crear tablas necesarias
def create_tables():
    connection = get_db_connection()
    if not connection:
        print("No se pudo conectar a la base de datos para crear tablas.")
        return
 
    cursor = connection.cursor()
 
    try:
        # Crear tabla de productos
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS productos (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            description TEXT NOT NULL,
            description2 TEXT,
            price DECIMAL(10, 2) NOT NULL,
            image_url VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
        """)
       
        # Insertar datos iniciales si la tabla está vacía
        cursor.execute("SELECT COUNT(*) FROM productos")
        if cursor.fetchone()[0] == 0:
            initial_products = [
                ("Poke Crispy",
                 "Pollo apanado con una base de arroz blanco con ajonjolí, aguacate en cubos, lechuga crespa, tomates cherry y maiz asado.",
                 "Incluye Salsa Picante.",
                 17.50,
                 "Imagenes/pexels-deruzzi-6546181.jpg"),
                 
                ("Poke Guajiro",
                 "Chivo guisado acompañado de arroz de frijol guajiro, chips de plátano, aguacate y ensalada de payaso",
                 "",
                 18.00,
                 "img/platos/poke2.jpg"),

                ("Poke Tonkatsu",
                 "Lomo de cerdo apanado con una base de arroz, aguacte, coliflor al vapor, mango y repollo. SALSA TONKATSU",
                 "Incluye Salsa Tonkatsu",
                 18.00,
                 "img/platos/poke3.jpg"),
                
                ("Poke Mediterraneo",
                 "Pechuga de pollo asado con arroz, pepino, tomate, aceitunas, lechuga crespa con lentejas crocantes. SALSA GRIEGA",
                 "",
                 16.50,
                 "img/platos/poke4.jpg"),

                ("Poke Bowl de Pulpo",
                 "Arroz, pulpo a la parrilla, aguacate, tomate, pepino, olivas y aliño de limón y hierbas",
                 "",
                 18.99,
                 "img/platos/poke5.jpg"),

                ("Poke Bowl de Camarones",
                 "Arroz, pulpo a la parrilla, aguacate, tomate, pepino, olivas y aliño de limón y hierbas",
                 "",
                 18.99,
                 "img/platos/poke5.jpg"),
            ]
           
            insert_query = """
            INSERT INTO productos (name, description, description2, price, image_url)
            VALUES (%s, %s, %s, %s, %s)
            """
            cursor.executemany(insert_query, initial_products)
       
        connection.commit()
        print("Tabla de productos creada y datos iniciales insertados.")
       
    except Error as e:
        print(f"Error al crear tablas: {e}")
    finally:
        cursor.close()
        connection.close()
 
# Llamar a la función para crear tablas al iniciar
create_tables()
 
# Endpoint 1: Obtener todos los productos (GET)
@app.route('/api/menu', methods=['GET'])
def get_menu():
    try:
        connection = get_db_connection()
        if not connection:
            return jsonify({"error": "Error de conexión a la base de datos"}), 500
           
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT * FROM productos")
        menu_items = cursor.fetchall()
       
        return jsonify(menu_items)
       
    except Error as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if connection:
            cursor.close()
            connection.close()
 
# Endpoint 2: Crear un nuevo producto (POST)
@app.route('/api/menu', methods=['POST'])
def create_menu_item():
    data = request.get_json()
   
    # Validar campos requeridos
    required_fields = ['name', 'description', 'price', 'image_url']
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Faltan campos requeridos"}), 400
   
    try:
        connection = get_db_connection()
        if not connection:
            return jsonify({"error": "Error de conexión a la base de datos"}), 500
           
        cursor = connection.cursor()
        query = """
        INSERT INTO productos (name, description, description2, price, image_url)
        VALUES (%s, %s, %s, %s, %s)
        """
        values = (
            data['name'],
            data['description'],
            data.get('description2', ''),
            data['price'],
            data['image_url']
        )
       
        cursor.execute(query, values)
        connection.commit()
        new_id = cursor.lastrowid
       
        return jsonify({
            "message": "Producto creado exitosamente",
            "id": new_id
        }), 201
       
    except Error as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if connection:
            cursor.close()
            connection.close()
 
# Endpoint 3: Actualizar un producto (PUT)
@app.route('/api/menu/<int:product_id>', methods=['PUT'])
def update_menu_item(product_id):
    data = request.get_json()
   
    if not data:
        return jsonify({"error": "No se proporcionaron datos para actualizar"}), 400
   
    try:
        connection = get_db_connection()
        if not connection:
            return jsonify({"error": "Error de conexión a la base de datos"}), 500
           
        cursor = connection.cursor()
       
        # Construir la consulta dinámicamente
        update_fields = []
        values = []
       
        if 'name' in data:
            update_fields.append("name = %s")
            values.append(data['name'])
       
        if 'description' in data:
            update_fields.append("description = %s")
            values.append(data['description'])
       
        if 'description2' in data:
            update_fields.append("description2 = %s")
            values.append(data['description2'])
       
        if 'price' in data:
            update_fields.append("price = %s")
            values.append(data['price'])
       
        if 'image_url' in data:
            update_fields.append("image_url = %s")
            values.append(data['image_url'])
       
        if not update_fields:
            return jsonify({"error": "No se proporcionaron campos válidos para actualizar"}), 400
       
        # Añadir ID al final de los valores
        values.append(product_id)
       
        query = f"""
        UPDATE productos
        SET {', '.join(update_fields)}
        WHERE id = %s
        """
       
        cursor.execute(query, tuple(values))
        connection.commit()
       
        if cursor.rowcount == 0:
            return jsonify({"error": "Producto no encontrado"}), 404
           
        return jsonify({"message": "Producto actualizado exitosamente"}), 200
       
    except Error as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if connection:
            cursor.close()
            connection.close()
 
# Endpoint 4: Eliminar un producto (DELETE)
@app.route('/api/menu/<int:product_id>', methods=['DELETE'])
def delete_menu_item(product_id):
    try:
        connection = get_db_connection()
        if not connection:
            return jsonify({"error": "Error de conexión a la base de datos"}), 500
           
        cursor = connection.cursor()
        query = "DELETE FROM productos WHERE id = %s"
        cursor.execute(query, (product_id,))
        connection.commit()
       
        if cursor.rowcount == 0:
            return jsonify({"error": "Producto no encontrado"}), 404
           
        return jsonify({"message": "Producto eliminado exitosamente"}), 200
       
    except Error as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if connection:
            cursor.close()
            connection.close()
 
if __name__ == '__main__':
    app.run(debug=True, port=5000)