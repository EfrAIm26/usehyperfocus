# Diseño y Funcionamiento de la Base de Datos de Use Hyperfocus

## Introducción

Use Hyperfocus es una aplicación de chat con inteligencia artificial diseñada específicamente para personas neurodivergentes, con el objetivo de maximizar la concentración, el aprendizaje y la productividad. La aplicación utiliza Supabase como plataforma de desarrollo backend, aprovechando PostgreSQL como motor de base de datos relacional para garantizar un almacenamiento de datos eficiente, seguro y escalable.

## Arquitectura de la Base de Datos

La base de datos de Use Hyperfocus se estructura bajo un modelo relacional que establece relaciones claras entre las entidades principales del sistema. El diseño se fundamenta en tres tablas principales interconectadas mediante claves primarias y foráneas, lo que permite mantener la integridad referencial y facilitar la gestión de relaciones complejas entre los datos.

### Tabla de Chats (chats)

La tabla de chats constituye la entidad central que agrupa las conversaciones de cada usuario. Cada registro representa una sesión de chat individual y contiene información fundamental sobre la conversación. La estructura incluye un identificador único de tipo UUID que funciona como clave primaria, garantizando la unicidad de cada chat. El campo user_id establece una relación de clave foránea con la tabla de usuarios del sistema de autenticación, permitiendo que cada chat pertenezca exclusivamente a un usuario específico.

Adicionalmente, la tabla almacena un título descriptivo para cada chat, un campo de tema que representa el tópico principal sobre el cual se centra la conversación, y un contador de mensajes que mantiene un registro numérico de la cantidad de intercambios realizados. Los campos de timestamp created_at y updated_at permiten rastrear el momento de creación y la última modificación de cada chat, facilitando la ordenación cronológica y el seguimiento de la actividad del usuario.

### Tabla de Mensajes (messages)

La tabla de mensajes almacena cada intercambio individual dentro de las conversaciones. Esta entidad mantiene una relación de dependencia con la tabla de chats mediante la clave foránea chat_id, estableciendo que cada mensaje pertenece necesariamente a un chat específico. La estructura de esta tabla refleja la naturaleza bidireccional de la comunicación, donde el campo role distingue entre mensajes del usuario y respuestas del asistente de inteligencia artificial.

El contenido principal del mensaje se almacena en el campo content de tipo texto, mientras que el campo mermaid_code permite almacenar código de diagramas generados mediante la biblioteca Mermaid.js cuando el usuario solicita visualizaciones. El campo semantic_chunks utiliza el tipo de datos JSONB de PostgreSQL para almacenar fragmentos semánticos estructurados, permitiendo la organización del contenido en categorías como definiciones, ejemplos, acciones, puntos clave y explicaciones.

La tabla también preserva información contextual sobre el momento de renderizado del mensaje, almacenando el estilo de fuente aplicado y si se utilizó la funcionalidad de fragmentación semántica. Esto permite mantener la consistencia visual y funcional de los mensajes incluso cuando el usuario modifica sus preferencias de configuración posteriormente.

### Tabla de Configuraciones de Usuario (user_settings)

La tabla de configuraciones de usuario almacena las preferencias personalizadas de cada usuario del sistema. Esta entidad mantiene una relación uno a uno con la tabla de usuarios mediante la clave foránea user_id, garantizando que cada usuario tenga un único conjunto de configuraciones. La estructura de esta tabla refleja las características distintivas de la aplicación, diseñadas para adaptarse a las necesidades de usuarios neurodivergentes.

El campo font_style permite seleccionar entre diferentes estilos tipográficos optimizados para la lectura, incluyendo el modo biónico que mejora la velocidad de lectura mediante el resaltado de prefijos de palabras, fuentes diseñadas para dislexia, y estilos estándar. El campo focus_mode controla el comportamiento del modo de hiperconcentración, que puede estar activado o desactivado según las preferencias del usuario.

La funcionalidad de fragmentación semántica se controla mediante el campo semantic_chunking, que permite activar o desactivar la organización automática del contenido en segmentos codificados por colores. Los campos min_messages_before_topic_change y topic_similarity_threshold configuran los parámetros del sistema de detección de cambios de tema, permitiendo personalizar la sensibilidad del mecanismo de alerta cuando el usuario intenta cambiar de tema antes de alcanzar un número mínimo de mensajes o cuando la similitud entre temas es inferior a un umbral establecido.

## Relaciones entre Entidades

El diseño relacional establece conexiones jerárquicas claras entre las entidades. La relación principal se establece entre usuarios y chats, donde cada usuario puede poseer múltiples chats, pero cada chat pertenece exclusivamente a un usuario. Esta relación uno a muchos se implementa mediante la clave foránea user_id en la tabla de chats.

La relación entre chats y mensajes sigue un patrón similar, donde cada chat puede contener múltiples mensajes, pero cada mensaje pertenece a un único chat. Esta estructura permite mantener la organización lógica de las conversaciones y facilita la recuperación eficiente de los mensajes asociados a cada chat.

La relación entre usuarios y configuraciones es de tipo uno a uno, garantizando que cada usuario tenga exactamente un registro de configuración. Esta relación se establece mediante la clave foránea user_id en la tabla de configuraciones, con una restricción de unicidad que previene la creación de múltiples registros de configuración para el mismo usuario.

## Integridad Referencial y Seguridad

El diseño de la base de datos implementa mecanismos de integridad referencial mediante la definición de restricciones de claves foráneas con la opción de eliminación en cascada. Esto significa que cuando se elimina un usuario o un chat, todos los registros relacionados se eliminan automáticamente, previniendo la existencia de datos huérfanos y manteniendo la consistencia de la base de datos.

La seguridad de los datos se garantiza mediante la implementación de Row Level Security (RLS) de PostgreSQL, que permite definir políticas de seguridad a nivel de fila. Estas políticas aseguran que los usuarios solo puedan acceder, modificar o eliminar sus propios datos, implementando un control de acceso granular que protege la privacidad de la información almacenada.

Las políticas de seguridad se aplican a las tres tablas principales, restringiendo las operaciones de selección, inserción, actualización y eliminación únicamente a los registros donde el identificador del usuario autenticado coincide con el user_id almacenado en cada registro. Este mecanismo proporciona una capa adicional de seguridad que complementa las medidas de autenticación implementadas por Supabase.

## Optimización y Rendimiento

Para garantizar un rendimiento óptimo en las consultas más frecuentes, la base de datos implementa índices estratégicos en campos clave. Se han creado índices en los campos user_id de las tablas de chats y mensajes, permitiendo búsquedas rápidas de todos los chats y mensajes asociados a un usuario específico. Adicionalmente, se han implementado índices en los campos de fecha para facilitar la ordenación cronológica de los registros.

Los índices en los campos created_at y updated_at de la tabla de chats permiten recuperar eficientemente las conversaciones ordenadas por fecha de creación o última modificación, lo cual es esencial para la funcionalidad de la interfaz de usuario que muestra el historial de conversaciones. De manera similar, el índice en el campo timestamp de la tabla de mensajes optimiza la recuperación de mensajes en orden cronológico dentro de cada chat.

## Automatización mediante Triggers

El sistema implementa funciones automatizadas mediante triggers de PostgreSQL que mejoran la funcionalidad y consistencia de la base de datos. Un trigger automático actualiza el campo updated_at en las tablas de chats y configuraciones cada vez que se modifica un registro, garantizando que la fecha de última modificación refleje siempre el estado actual de los datos.

Adicionalmente, se ha implementado un trigger que se ejecuta automáticamente cuando se crea un nuevo usuario en el sistema de autenticación, generando un registro de configuración predeterminado para el nuevo usuario. Este mecanismo asegura que todos los usuarios tengan configuraciones iniciales desde el momento de su registro, proporcionando una experiencia de usuario consistente y evitando la necesidad de crear manualmente estos registros.

## Tipos de Datos Personalizados

La base de datos utiliza tipos de datos enumerados (ENUM) para restringir los valores permitidos en ciertos campos, garantizando la integridad de los datos y facilitando la validación. Se han definido tipos enumerados para los estilos de fuente, los modos de enfoque y los tipos de fragmentos semánticos, proporcionando un conjunto limitado de opciones válidas que reflejan las funcionalidades específicas de la aplicación.

El uso de tipos enumerados mejora la consistencia de los datos almacenados y facilita el mantenimiento del código de la aplicación, ya que los valores permitidos están claramente definidos a nivel de base de datos. Esto previene errores de datos inválidos y proporciona documentación implícita sobre los valores esperados en cada campo.

## Almacenamiento de Datos Estructurados

La tabla de mensajes utiliza el tipo de datos JSONB de PostgreSQL para almacenar los fragmentos semánticos en un formato estructurado. Este tipo de dato permite almacenar información en formato JSON mientras mantiene la capacidad de realizar consultas eficientes sobre los datos estructurados. Los fragmentos semánticos se organizan en un arreglo de objetos, donde cada objeto contiene un tipo de fragmento y su contenido correspondiente.

Esta estructura permite que la aplicación organice automáticamente el contenido de las respuestas de inteligencia artificial en categorías visualmente distinguibles, mejorando la comprensión y facilitando el aprendizaje para usuarios con diferentes estilos cognitivos. El uso de JSONB proporciona flexibilidad para almacenar estructuras de datos complejas mientras mantiene las ventajas de rendimiento de una base de datos relacional.

## Conclusión

La base de datos de Use Hyperfocus representa un diseño cuidadosamente estructurado que refleja las necesidades específicas de una aplicación de chat con inteligencia artificial orientada a usuarios neurodivergentes. El modelo relacional implementado mediante Supabase y PostgreSQL proporciona una base sólida para el almacenamiento seguro y eficiente de datos, mientras que las características avanzadas como Row Level Security, triggers automatizados y tipos de datos personalizados garantizan la integridad, seguridad y funcionalidad del sistema.

La arquitectura de la base de datos facilita la escalabilidad de la aplicación y proporciona las bases para futuras expansiones y mejoras. La integración con el sistema de autenticación de Supabase y la capacidad de generar automáticamente APIs RESTful y GraphQL a partir del esquema de la base de datos simplifican el desarrollo y mantenimiento de la aplicación, permitiendo a los desarrolladores concentrarse en la lógica de negocio y la experiencia del usuario.





