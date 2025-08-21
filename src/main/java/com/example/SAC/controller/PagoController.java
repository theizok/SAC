package com.example.SAC.controller;

import com.example.SAC.dto.PagoDTO;
import com.example.SAC.dto.PagoDTO; // <- usar PagoDTO
import com.example.SAC.dto.PagoDTO;
import com.example.SAC.dto.PagoDTO;
import com.example.SAC.entity.Pago;
import com.example.SAC.entity.Reserva;
import com.example.SAC.repository.PagoRepository;
import com.example.SAC.service.PagoService;
import com.example.SAC.service.ReservaService;
import com.mercadopago.MercadoPagoConfig;
import com.mercadopago.client.payment.PaymentClient;
import com.mercadopago.client.preference.PreferenceBackUrlsRequest;
import com.mercadopago.client.preference.PreferenceClient;
import com.mercadopago.client.preference.PreferenceItemRequest;
import com.mercadopago.client.preference.PreferenceRequest;
import com.mercadopago.exceptions.MPApiException;
import com.mercadopago.exceptions.MPException;
import com.mercadopago.resources.payment.Payment;
import com.mercadopago.resources.preference.Preference;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/pago")
public class PagoController {

    private static final Logger logger = LoggerFactory.getLogger(PagoController.class);

    @Autowired
    private PagoRepository pagoRepository;
    @Autowired
    private PagoService pagoService;
    @Autowired
    private ReservaService reservaService;

    // --------- Helpers: mapeo Pago -> PagoDTO ----------
    private PagoDTO toDTO(Pago p) {
        if (p == null) return null;
        PagoDTO dto = new PagoDTO();
        dto.setIdPago(p.getIdPago());
        dto.setValor(p.getValor());
        dto.setFecha(p.getFecha());
        dto.setDescripcion(p.getDescripcion());
        dto.setCategoria(p.getCategoria());
        dto.setEstadoPago(p.getEstadoPago());
        try {
            if (p.getCuenta() != null) {
                // asume que Cuenta tiene getIdCuenta()
                Method m = p.getCuenta().getClass().getMethod("getIdCuenta");
                Object val = m.invoke(p.getCuenta());
                if (val instanceof Number) dto.setIdCuenta(((Number) val).longValue());
            }
        } catch (Exception e) {
            // si no existe getIdCuenta, ignorar (solo trazabilidad)
            logger.debug("No se pudo extraer idCuenta desde Pago.cuenta: {}", e.getMessage());
        }
        return dto;
    }

    private List<PagoDTO> toDTOList(List<Pago> pagos) {
        if (pagos == null) return Collections.emptyList();
        return pagos.stream().map(this::toDTO).collect(Collectors.toList());
    }

    // ----------------- Pago normal -----------------
    @PostMapping("/mercado-pago")
    public ResponseEntity<?> crearPreferencia(@RequestBody Pago pago) throws MPException, MPApiException {
        // marcar como pendiente y guardar inmediatamente
        pago.setEstadoPago("PENDIENTE");
        // opcional: setear fecha si no viene
        if (pago.getFecha() == null) pago.setFecha(LocalDateTime.now());
        pagoRepository.save(pago);

        // configurar Mercado Pago (mejor mover token a properties/env en producción)
        MercadoPagoConfig.setAccessToken("TEST-6124805663082328-040417-a023ca85ac047fbfca3fc9fb2316df41-2045469211");

        PreferenceBackUrlsRequest backUrls = PreferenceBackUrlsRequest.builder()
                .success("https://sac-253068519041.us-central1.run.app/ArchivosUsuarios/Pago/pago.html")
                .pending("https://sac-253068519041.us-central1.run.app/ArchivosUsuarios/Pago/pago.html")
                .failure("https://sac-253068519041.us-central1.run.app/ArchivosUsuarios/Pago/pago.html")
                .build();

        PreferenceItemRequest itemRequest = PreferenceItemRequest.builder()
                .id(String.valueOf(pago.getIdPago()))
                .title(pago.getCategoria())
                .description(pago.getDescripcion())
                .quantity(1)
                .categoryId(pago.getCategoria())
                .currencyId("COP")
                .unitPrice(BigDecimal.valueOf(pago.getValor()))
                .build();

        List<PreferenceItemRequest> items = new ArrayList<>();
        items.add(itemRequest);

        PreferenceRequest preferenceRequest = PreferenceRequest.builder()
                .items(items)
                .backUrls(backUrls)
                .notificationUrl("https://sac-253068519041.us-central1.run.app/api/pago/webhook")
                .externalReference(String.valueOf(pago.getIdPago()))
                .build();

        PreferenceClient client = new PreferenceClient();
        Preference preference = client.create(preferenceRequest);

        // DEVUELVE init_point y pago como DTO
        Map<String, Object> response = new HashMap<>();
        response.put("init_point", preference.getSandboxInitPoint());
        response.put("pago", toDTO(pago));
        return ResponseEntity.ok(response);
    }

    // ----------------- Pago + Reserva -----------------
    @PostMapping("/mercado-pago/reserva")
    public ResponseEntity<?> crearPreferenciaAreaComun(@RequestBody Map<String, Object> dtoMap) throws MPException, MPApiException {
        // Recibir el DTO como mapa para evitar serialización estricta; luego mapear a Pago/Reserva
        // Se asume que el cliente envia { pago: {...}, reserva: {...} }
        try {
            // mapeo sencillo: convertir el submap a Pago y Reserva usando tu repo/servicio puede ser más robusto
            @SuppressWarnings("unchecked")
            Map<String, Object> pagoMap = (Map<String, Object>) dtoMap.get("pago");
            @SuppressWarnings("unchecked")
            Map<String, Object> reservaMap = (Map<String, Object>) dtoMap.get("reserva");

            if (pagoMap == null) return ResponseEntity.badRequest().body(Map.of("message", "Objeto 'pago' requerido"));
            if (reservaMap == null) return ResponseEntity.badRequest().body(Map.of("message", "Objeto 'reserva' requerido"));

            // Construir Pago mínimo (si tu cliente envía la entidad completa puedes simplificar)
            Pago pago = new Pago();
            // si vienen campos, asignarlos
            if (pagoMap.get("valor") != null) pago.setValor(((Number)pagoMap.get("valor")).floatValue());
            if (pagoMap.get("descripcion") != null) pago.setDescripcion(String.valueOf(pagoMap.get("descripcion")));
            if (pagoMap.get("categoria") != null) pago.setCategoria(String.valueOf(pagoMap.get("categoria")));
            if (pago.getFecha() == null) pago.setFecha(LocalDateTime.now());
            pago.setEstadoPago("PENDIENTE");

            // Si viene cuenta con idCuenta en payload, intentar enlazar (opcional)
            try {
                if (pagoMap.get("cuenta") instanceof Map) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> cuentaMap = (Map<String, Object>) pagoMap.get("cuenta");
                    Object idCuentaObj = cuentaMap.get("idCuenta");
                    if (idCuentaObj instanceof Number) {
                        // construir instancia mínima de Cuenta con solo id (evitar fetch extra)
                        Class<?> cuentaCls = Class.forName("com.example.SAC.entity.Cuenta");
                        Object cuentaInstance = cuentaCls.getDeclaredConstructor().newInstance();
                        Method setId = cuentaCls.getMethod("setIdCuenta", Long.class);
                        setId.invoke(cuentaInstance, ((Number) idCuentaObj).longValue());
                        // setear via reflection en pago.setCuenta(...)
                        Method setCuenta = Pago.class.getMethod("setCuenta", cuentaCls);
                        setCuenta.invoke(pago, cuentaInstance);
                    }
                }
            } catch (Exception ignored) {
            }

            // Guardar pago
            pagoRepository.save(pago);

            // Construir reserva simplificada (asumiendo tu servicio entiende el Map)
            Reserva reserva = new Reserva();
            // Aquí intentamos poblar ciertos campos si existen en el map
            try {
                if (reservaMap.get("idAreaComun") != null) {
                    // asumo que Reserva tiene setIdAreaComun o setIdArea
                    Method m = Reserva.class.getMethod("setIdAreaComun", Long.class);
                    m.invoke(reserva, ((Number)reservaMap.get("idAreaComun")).longValue());
                }
                if (reservaMap.get("fechaReserva") != null) {
                    Method m2 = Reserva.class.getMethod("setFechaReserva", String.class);
                    m2.invoke(reserva, String.valueOf(reservaMap.get("fechaReserva")));
                }
                if (reservaMap.get("tiempoReserva") != null) {
                    Method m3 = Reserva.class.getMethod("setTiempoReserva", String.class);
                    m3.invoke(reserva, String.valueOf(reservaMap.get("tiempoReserva")));
                }
            } catch (NoSuchMethodException nsme) {
                // Si tu entidad Reserva tiene otros nombres de setters, ignora — ReservaService.agregarReserva debe validar
            } catch (Exception e) {
                logger.debug("No se pudo mapear completamente reserva desde payload: {}", e.getMessage());
            }

            // ======= Intentar extraer idResidente desde el principal autenticado (REFLEXIÓN) =======
            try {
                Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                Object principal = (auth != null) ? auth.getPrincipal() : null;
                Integer idResFromAuth = extractIdFromPrincipal(principal);
                if (idResFromAuth != null) {
                    try {
                        Method setIdResidente = Reserva.class.getMethod("setIdResidente", Integer.class);
                        setIdResidente.invoke(reserva, idResFromAuth);
                        logger.debug("Asignado idResidente desde SecurityContext: {}", idResFromAuth);
                    } catch (NoSuchMethodException nsme) {
                        logger.debug("Reserva no tiene setIdResidente(Integer) — omitiendo asignación");
                    }
                } else {
                    logger.warn("No se pudo extraer idResidente desde el principal.");
                }
            } catch (Exception ex) {
                logger.error("Error al intentar extraer idResidente desde SecurityContext: {}", ex.getMessage(), ex);
            }

            // Agregar reserva — reservaService debe validar FK (área exist) y que idResidente esté presente
            try {
                reservaService.agregarReserva(reserva);
            } catch (IllegalArgumentException ex) {
                // devuelve 400 con mensaje claro para el frontend
                return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
            } catch (Exception ex) {
                // error inesperado -> 500
                logger.error("Error guardando reserva: {}", ex.getMessage(), ex);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of("message", "Error al crear reserva: " + ex.getMessage()));
            }

            // Configurar MercadoPago y crear preferencia
            MercadoPagoConfig.setAccessToken("TEST-6124805663082328-040417-a023ca85ac047fbfca3fc9fb2316df41-2045469211");

            PreferenceBackUrlsRequest backUrls = PreferenceBackUrlsRequest.builder()
                    .success("https://sac-253068519041.us-central1.run.app/ArchivosUsuarios/Pago/pago.html")
                    .pending("https://sac-253068519041.us-central1.run.app/ArchivosUsuarios/Pago/pago.html")
                    .failure("https://sac-253068519041.us-central1.run.app/ArchivosUsuarios/Pago/pago.html")
                    .build();

            PreferenceItemRequest itemRequest = PreferenceItemRequest.builder()
                    .id(String.valueOf(pago.getIdPago()))
                    .title(pago.getCategoria())
                    .description(pago.getDescripcion())
                    .quantity(1)
                    .categoryId(pago.getCategoria())
                    .currencyId("COP")
                    .unitPrice(BigDecimal.valueOf(pago.getValor()))
                    .build();

            List<PreferenceItemRequest> items = new ArrayList<>();
            items.add(itemRequest);

            PreferenceRequest preferenceRequest = PreferenceRequest.builder()
                    .items(items)
                    .backUrls(backUrls)
                    .externalReference(String.valueOf(pago.getIdPago()))
                    .build();

            PreferenceClient client = new PreferenceClient();
            Preference preference = client.create(preferenceRequest);

            Map<String, Object> response = new HashMap<>();
            response.put("init_point", preference.getSandboxInitPoint());
            response.put("pago", toDTO(pago));
            return ResponseEntity.ok(response);

        } catch (ClassCastException cce) {
            return ResponseEntity.badRequest().body(Map.of("message","Formato de payload inválido"));
        } catch (Exception ex) {
            logger.error("Error creando preferencia reserva: {}", ex.getMessage(), ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message","Error interno"));
        }
    }

    // ----------------- Webhook -----------------
    @PostMapping("/webhook")
    public ResponseEntity<String> recibirWebhook(
            @RequestParam(required = false) Map<String, String> queryParams,
            @RequestBody(required = false) Map<String, Object> body) {

        try {
            String topic = null;
            String id = null;

            // 1. Intentar leer de queryParams
            if (queryParams != null) {
                topic = queryParams.get("topic");
                id = queryParams.get("id");
            }

            // 2. Si no vino en query, intentar leer del body
            if ((id == null || topic == null) && body != null) {
                if (body.get("type") != null) {
                    topic = String.valueOf(body.get("type"));
                }
                if (body.get("data") instanceof Map) {
                    Map<?, ?> data = (Map<?, ?>) body.get("data");
                    Object idObj = data.get("id");
                    if (idObj != null) id = String.valueOf(idObj);
                }
            }

            // 3. Validar que tenemos un payment válido
            if ("payment".equalsIgnoreCase(topic) && id != null) {
                try {
                    PaymentClient client = new PaymentClient();
                    Payment payment = client.get(Long.parseLong(id));

                    if (payment != null) {
                        String estado = payment.getStatus(); // approved, pending, etc.
                        String externalReference = payment.getExternalReference();

                        if (externalReference != null) {
                            pagoService.actualizarEstadoPago(
                                    Long.parseLong(externalReference),
                                    estado
                            );
                            System.out.println("Pago actualizado -> ID: " + id + " Estado: " + estado);
                        } else {
                            System.out.println("⚠ Payment sin external_reference. ID: " + id);
                        }
                    } else {
                        System.out.println("⚠ No se encontró pago con ID " + id);
                    }
                } catch (Exception e) {
                    // Aquí NO lanzamos error hacia Mercado Pago
                    System.out.println("⚠ Error obteniendo pago con id " + id + ": " + e.getMessage());
                }
            } else {
                System.out.println("Webhook recibido sin 'payment' o sin id: " + body);
            }

            // SIEMPRE devolver 200 a Mercado Pago
            return ResponseEntity.ok("Webhook recibido");

        } catch (Exception e) {
            // Nunca responder 500 al webhook
            System.out.println("⚠ Error general en webhook: " + e.getMessage());
            return ResponseEntity.ok("Webhook recibido con error interno");
        }
    }


    // ----------------- Obtener pagos (filtrado por cuenta del usuario autenticado) -----------------
    @GetMapping("/obtenerPagos")
    public ResponseEntity<?> obtenerPagos() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getPrincipal() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message","Usuario no autenticado"));
        }

        Integer idCuentaInt = extractIdFromPrincipal(auth.getPrincipal());
        if (idCuentaInt == null) {
            // Si no podemos extraer el id, devolvemos lista vacía (más seguro que exponer todo)
            return ResponseEntity.ok(Collections.emptyList());
        }

        Long idCuenta = idCuentaInt.longValue();
        List<Pago> pagos = pagoService.obtenerPagosPorCuenta(idCuenta);

        List<PagoDTO> dtos = toDTOList(pagos);
        return ResponseEntity.ok(dtos);
    }

    // ----------------- Handler para IllegalArgumentException (opcional) -----------------
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<?> handleIllegalArgument(IllegalArgumentException ex) {
        return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
    }

    // ==================== MÉTODOS AUXILIARES ====================
    /**
     * Intenta extraer un id entero del objeto principal usando reflexión.
     * Busca varios getters comunes y campos declarados.
     * Retorna null si no encuentra nada convertible a Integer.
     */
    private Integer extractIdFromPrincipal(Object principal) {
        if (principal == null) return null;

        // Posibles nombres de getter/properties a intentar
        String[] candidateGetters = {
                "getIdResidente", "getId_residente", "getId", "getIdUsuario",
                "getIdCuenta", "getIdUser", "getUserId", "getIdPerson", "getIdOwner"
        };

        for (String getter : candidateGetters) {
            try {
                Method m = principal.getClass().getMethod(getter);
                Object val = m.invoke(principal);
                Integer parsed = convertToInteger(val);
                if (parsed != null) return parsed;
            } catch (NoSuchMethodException ignored) {
                // sigue con el siguiente getter
            } catch (Exception e) {
                logger.debug("Error invoking getter {} on principal: {}", getter, e.getMessage());
            }
        }

        // Intentar acceder a campos directos
        String[] candidateFields = {"idResidente", "id_residente", "id", "idUsuario", "idCuenta", "userId"};
        for (String fieldName : candidateFields) {
            try {
                Field f = principal.getClass().getDeclaredField(fieldName);
                f.setAccessible(true);
                Object val = f.get(principal);
                Integer parsed = convertToInteger(val);
                if (parsed != null) return parsed;
            } catch (NoSuchFieldException ignored) {
            } catch (Exception e) {
                logger.debug("Error leyendo campo {} del principal: {}", fieldName, e.getMessage());
            }
        }

        // Si no se encuentra, quizá el principal sea una UserDetails (spring) -> intentar username
        try {
            Method getUsername = principal.getClass().getMethod("getUsername");
            Object username = getUsername.invoke(principal);
            if (username != null) {
                logger.debug("Principal tiene username = {}. Si quieres asignar idResidente desde username, implementa una búsqueda en ResidenteService.", username.toString());
            }
        } catch (NoSuchMethodException ignored) {
        } catch (Exception e) {
            logger.debug("Error al intentar extraer username del principal: {}", e.getMessage());
        }

        return null;
    }

    private Integer convertToInteger(Object val) {
        if (val == null) return null;
        if (val instanceof Number) {
            return ((Number) val).intValue();
        }
        if (val instanceof String) {
            try {
                String s = ((String) val).trim();
                if (s.isEmpty()) return null;
                return Integer.parseInt(s);
            } catch (NumberFormatException e) {
                // no es un entero
            }
        }
        return null;
    }
}
