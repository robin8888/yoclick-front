# Pendientes para terminar la pestaña «Más» (front y back)

Estado a 6 oct 2026: hechos y commiteados «Tu centro» (datos del centro, invitar, marca, servicios), parte de
«Equipo» (invitar equipo, registro de clases) y «Cuenta» (seguridad, privacidad y legal solo con cifras).
Pantallas de referencia: `docs/design/prototipo-yoclick.html` (ids entre paréntesis).

Antes de añadir una dependencia nueva (`expo-document-picker`, `expo-print`…) preguntar: exige reconstruir el
dev client.

## Clientes
- [ ] **Importar clientes** (`aimport`) — empezar por aquí.
  - Back: `POST /centers/:id/clients/import` (filas validadas con zod, sin duplicados por correo, informe de
    creados / omitidos / con error). Decidir si lo importado entra como membresía invitada o como invitación por correo.
  - Front: elegir el CSV, vista previa y asignación de columnas, pantalla de resultado.
- [ ] **Rutinas y prácticas** (`aroutines`) y la pestaña «Practicar» del cliente.
  - Back: biblioteca de ejercicios por sector, rutina, ejercicios de la rutina, asignación a cliente o grupo.
  - Front: biblioteca, creador de rutinas, asignar; el cliente las consulta.
- [ ] **Campañas y cupones** (`acamp`).
  - Back: campañas con segmento (p. ej. inactivos 30 días) y cupones; el envío necesita trabajos en segundo plano,
    correo y push (Redis está aplazado a API-3).

## Dinero
- [ ] **Informes** (`areports`): ingresos, ocupación por servicio, retención, inactivos, horas por instructor y
  exportación CSV. Ampliar el módulo `reports` (ya existe `/agenda/summary`). — segundo en el orden propuesto.
- [ ] **Tarifas y cobros** (`amoney`): bonos, cuotas, recibos y remesas con Stripe; cartera y pago del cliente.
- [ ] **Mi suscripción** (`asubs`, `aplans`): la facturación vive en la web (Stripe Billing), así que aquí solo
  lectura del plan, la prueba y el enlace a la web. Back: exponer plan, estado, fin de prueba y tope de clientes.

## Equipo
- [ ] **Equipo y permisos** (`ateam`): matriz de permisos por rol, disponibilidad y ausencias por persona
  (`iavail`, que también alimenta «Mi disponibilidad» del instructor y no existe en el back).
- [ ] **Perfiles y vídeos** (`aprofiles`): biografía y vídeo del equipo, lo que ve la clientela.

## Cuenta
- [ ] **Privacidad y legal** (`alegal`):
  - Documentos (contrato de encargado, política de privacidad, registro de tratamientos): hace falta el texto legal
    real del asesor; no se inventa.
  - Solicitudes RGPD de los clientes (acceso y borrado) con su plazo y respuesta: modelo `PrivacyRequest` y flujo.
- [ ] **Seguridad** (`asec`): exportar el registro de actividad, anotar más eventos (consulta de salud, bloqueos de
  acceso, exportaciones). El interruptor de apagar la verificación en dos pasos no se hace a propósito.

## Otros pendientes
- [ ] Cartel de recepción en PDF / imprimir (`expo-print`).
- [ ] Botón «Reservar» para la web del centro (widget).
- [ ] «Extraer color del logo» en Tu marca.
- [ ] Campana de avisos en la cabecera de la agenda del propietario.
- [ ] Guardar en el servidor la opción «Soy…» del registro.
- [ ] Actualizar `docs/api-requests.md` con lo ya resuelto (avisos, clientes del instructor, franjas de apertura,
  citas desde la agenda, `stepMinutes`, origen de la unión, sesiones, actividad, consentimientos) y lo que falta
  (disponibilidad y ausencias).
