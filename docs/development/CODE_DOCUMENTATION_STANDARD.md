# Estándar de documentación del código

## Objetivo

El código de SpeakFlowAI debe poder leerse como material de aprendizaje. Una
persona estudiante debe poder identificar qué responsabilidad tiene un módulo,
qué contrato ofrece una función y qué efectos produce sin tener que reconstruir
todo el sistema mentalmente.

La documentación complementa los nombres y los tipos; no los repite. Los
comentarios explican intención, decisiones, límites y consecuencias.

## Qué se documenta

- Cada módulo de producción comienza con una descripción de su responsabilidad.
- Cada clase, componente, función o método importante explica su propósito.
- Los contratos públicos describen parámetros, valor devuelto y errores relevantes.
- Los efectos secundarios se nombran: red, base de datos, almacenamiento local,
  micrófono, temporizadores o actualización de estado.
- Las constantes importantes explican por qué existen y quién las consume.
- Los algoritmos y recuperaciones no evidentes incluyen el razonamiento esencial.

No se comenta una asignación obvia como `count += 1`. Tampoco se traduce línea
por línea el lenguaje de programación. Ese ruido envejece rápido y oculta las
decisiones que realmente ayudan a aprender.

## Python

Los módulos, clases y funciones usan docstrings en español. Para contratos
pequeños basta una oración. Cuando hay parámetros, retorno, excepciones o efectos
que no resultan evidentes, se usa esta estructura:

```python
def ejemplo(valor: str) -> int:
    """Convierte una entrada validada en la métrica que consume la interfaz.

    Args:
        valor: Texto normalizado recibido desde la frontera HTTP.

    Returns:
        Cantidad de unidades calculadas.

    Raises:
        ValueError: Si el texto no cumple la precondición del dominio.
    """
```

Los modelos de dominio explican el concepto que representan. Los modelos ORM
explican la tabla y las relaciones; no describen cada columna cuando su nombre y
tipo ya son suficientes.

## TypeScript y React

Los contratos exportados y las funciones importantes usan TSDoc (`/** ... */`).
Las etiquetas se reservan para información que agrega valor:

```ts
/**
 * Guarda preferencias validadas en el único adaptador autorizado de LocalStorage.
 *
 * @param changes Cambios parciales que se combinan con el estado vigente.
 * @returns Resultado discriminado; nunca lanza por un fallo del navegador.
 */
```

Los componentes React explican qué pantalla o pieza representan, las propiedades
que reciben y los efectos principales. Los estados locales solo llevan comentario
cuando representan una máquina de estados, un mecanismo de recuperación o una
decisión de privacidad.

## Pruebas y mantenimiento

- Los nombres `describe`/`it` o `test_*` expresan el comportamiento observable.
- Una prueba lleva comentario adicional solo cuando la preparación no revela por
  sí misma el riesgo que protege.
- Todo cambio de comportamiento actualiza primero los tipos y luego su documentación.
- Formato, lint, tipos, pruebas y build detectan que los comentarios no hayan
  alterado accidentalmente el código.

## Definición de terminado

Un módulo está documentado cuando una persona estudiante puede responder:

1. ¿Por qué existe este archivo?
2. ¿Qué entra y qué sale de sus funciones importantes?
3. ¿Qué datos o sistemas modifica?
4. ¿Qué errores controla y cuáles propaga?
5. ¿Desde qué parte del flujo se llama y qué ocurre después?
