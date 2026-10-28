# 14 · Términos y condiciones — puntos obligatorios

Borrador de requisitos para los T&C que firma el centro al contratar Yoclick. Revisar con un asesor legal antes de publicar.

## Responsabilidad del centro frente al alumno (decidido 2026-10-16)

Debe aparecer de forma clara y destacada (no escondido en letra pequeña):

1. **Yoclick es solo software.** Yoclick no vende servicios al alumno, no recibe, custodia ni transfiere dinero del alumno, y no es parte de la relación entre centro y alumno.
2. **El centro es el responsable de los cobros.** Los pagos online (bonos, alquileres) se procesan en la cuenta de Stripe del propio centro (cargos directos). El centro es el vendedor y el comerciante.
3. **El centro es el responsable de los reembolsos y reclamaciones.** Reembolsos, devoluciones, contracargos y disputas los gestiona y asume el centro, y se descuentan de su saldo de Stripe.
4. **El centro es el responsable de la fiscalidad.** IVA, facturas, recibos, retenciones y cualquier obligación fiscal derivada de sus ventas al alumno son del centro. Los recibos se emiten a nombre y con el NIF del centro.
5. **Yoclick no cobra comisión por transacción** (mientras sea así), por lo que no interviene en el importe cobrado ni en el reembolsado. Si cambia, actualizar este punto.
6. **Deber del centro con Stripe.** El centro acepta los términos de Stripe Connect y completa su verificación (KYC).
7. **Lo único que factura Yoclick** es la suscripción del plan al centro (web, Stripe Billing).

## Cambio de plan y límite de clientes activos (decidido 2026-10-28)

Debe constar en los T&C y en el correo con el enlace de pago. No debe mostrarse dentro de la app (la app no habla de contratar ni de pagos: App Store 3.1.1). Borrador para revisión legal:

1. **Efecto de la bajada de plan.** Si el centro pasa a un plan de menor precio o acorta la periodicidad, el cambio se aplica **al terminar el periodo ya pagado**: hasta entonces conserva lo que pagó.
2. **Qué ocurre si hay más clientes activos que el límite del nuevo plan.** Yoclick **no borra, desactiva ni bloquea** a ningún cliente ni sus datos. Los clientes existentes mantienen el acceso a sus reservas y a sus datos. Mientras el centro supere el límite **no podrá dar de alta clientes nuevos** (código de unión, invitaciones ni importaciones).
3. **Quién decide.** Es el centro quien decide a quién da de baja o archiva para volver a estar dentro del límite, o si pasa a un plan superior. Yoclick no actúa sobre los datos de los clientes por este motivo (el centro es el responsable del tratamiento; Yoclick, el encargado).
4. **Qué es un cliente activo.** Definir en los T&C el criterio (actividad en un periodo determinado) para que el centro pueda calcularlo.
5. **Sin cargos por exceso.** Yoclick no cobra recargos automáticos por superar el límite; solo propone cambiar de plan, y cualquier cambio de precio requiere la aceptación expresa del centro.
6. **Aviso.** Al superar el límite, Yoclick avisa al propietario (aviso en la app y push) y a quien intenta unirse se le muestra un mensaje neutro, sin datos de facturación del centro.
7. **Excepciones.** Yoclick puede ajustar el límite de un centro de forma manual.

## Relacionado

- Decisión técnica: cargos directos y reembolsos desde la cuenta del centro, sin comisión. Ver memoria `yoclick-stripe-connect`.
- Pendiente: textos de política de privacidad y condiciones de uso del alumno (aceptación separada y desmarcada, según CLAUDE.md M6).
