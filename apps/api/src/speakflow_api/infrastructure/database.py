"""Crea motores y unidades de trabajo SQLAlchemy para la infraestructura."""

from __future__ import annotations

import sqlite3
from collections.abc import Iterator
from contextlib import contextmanager
from typing import Any

from sqlalchemy import Engine, create_engine, event
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker


class Base(DeclarativeBase):
    """Clase base compartida por todos los modelos ORM declarativos."""


def create_database_engine(database_url: str) -> Engine:
    """Crea un motor SQLAlchemy con ajustes compatibles con SQLite local.

    Args:
        database_url: URL SQLAlchemy ya normalizada por configuración.

    Returns:
        Motor con verificación de conexiones y claves foráneas activas en SQLite.
    """

    connect_args: dict[str, Any] = {}
    if database_url.startswith("sqlite"):
        connect_args["check_same_thread"] = False

    engine = create_engine(database_url, connect_args=connect_args, pool_pre_ping=True)

    if engine.dialect.name == "sqlite":

        @event.listens_for(engine, "connect")
        def enable_sqlite_foreign_keys(
            dbapi_connection: sqlite3.Connection,
            _connection_record: object,
        ) -> None:
            """Activa integridad referencial en cada conexión SQLite nueva."""

            cursor = dbapi_connection.cursor()
            cursor.execute("PRAGMA foreign_keys=ON")
            cursor.close()

    return engine


def create_session_factory(engine: Engine) -> sessionmaker[Session]:
    """Construye la fábrica de sesiones usada por rutas y repositorios."""

    return sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


@contextmanager
def transactional_session(factory: sessionmaker[Session]) -> Iterator[Session]:
    """Proporciona una transacción que confirma, revierte y cierra automáticamente.

    El bloque consumidor recibe una sesión abierta. Una salida normal ejecuta
    ``commit``; cualquier excepción ejecuta ``rollback`` y se propaga sin ocultarla.
    """

    session = factory()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()
