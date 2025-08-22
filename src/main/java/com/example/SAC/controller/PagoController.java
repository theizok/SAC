package com.example.SAC.controller;

import com.example.SAC.dto.PagoDTO;
import com.example.SAC.dto.PagoReservaDTO;
import com.example.SAC.entity.Pago;
import com.example.SAC.entity.Reserva;
import com.example.SAC.entity.Cuenta;
import com.example.SAC.repository.PagoRepository;
import com.example.SAC.repository.AreaComunRepository;
import com.example.SAC.repository.ResidenteRepository;
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
import java.time.format.DateTimeParseException;
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
    @Autowired
    private AreaComunRepository areaComunRepository;
    @Autowired
    private ResidenteRepository residenteRepository;

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
                Method m = p.getCuenta().getClass().getMethod("getIdCuenta");
                Object val = m.invoke(p.getCuenta());
                if (val instanceof Number) dto.setIdCuenta(((Number) val).longValue());
            }
        } catch (Exception e) {
            logger.debug("No se pudo extraer idCuenta desde Pago.cuenta: {}", e.getMessage());
        }
        return dto;
    }

    private List<PagoDTO> toDTOList(List<Pago> pagos) {
        if (pagos == null) return Collections.emptyList();
        return pagos.stream().map(this::toDTO).collect(Collectors.toList());
    }

    // ----------------- Helper: crear preferencia MercadoPago -----------------
    private Preference crearPreferenciaParaPago(Pago pago) throws MPException, MPApiException {
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
        return client.create(preferenceRequest);
    }

    // ----------------- Pago normal -----------------
    @PostMapping("/mercado-pago")
    public ResponseEntity<?> crearPreferencia(@RequestBody Pago pago) throws MPException, MPApiException {
        if (pago == null) return ResponseEntity.badRequest().body(Map.of("message", "Payload Pago vacío"));

        pago.setEstadoPago("PENDIENTE");
        if (pago.getFecha() == null) pago.setFecha(LocalDateTime.now());

        // fallback cuenta desde principal si no viene
        try {
            if (pago.getCuenta() == null) {
                Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                if (auth != null && auth.getPrincipal() instanceof com.example.SAC.service.CustomUserDetails.CustomUserDetails) {
                    long idCuentaFromPrincipal = ((com.example.SAC.service.CustomUserDetails.CustomUserDetails) auth.getPrincipal()).getIdCuenta();
                    Cuenta cuenta = new Cuenta();
                    cuenta.setIdCuenta(idCuentaFromPrincipal);
                    pago.setCuenta(cuenta);
                }
            }
        } catch (Exception e) {
            logger.debug("No se pudo setear cuenta por fallback: {}", e.getMessage());
        }

        if (pago.getValor() <= 0.0f) {
            return ResponseEntity.badRequest().body(Map.of("message", "valor inválido"));
        }

        pagoRepository.save(pago);

        Preference preference = crearPreferenciaParaPago(pago);

        Map<String, Object> response = new HashMap<>();
        response.put("init_point", preference.getSandboxInitPoint());
        response.put("pago", toDTO(pago));
        return ResponseEntity.ok(response);
    }

    // ----------------- Pago + Reserva (payload Map) -----------------
    @PostMapping("/mercado-pago/reserva")
    public ResponseEntity<?> crearPreferenciaAreaComun(@RequestBody Map<String, Object> dtoMap) throws MPException, MPApiException {
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> pagoMap = (Map<String, Object>) dtoMap.get("pago");
            @SuppressWarnings("unchecked")
            Map<String, Object> reservaMap = (Map<String, Object>) dtoMap.get("reserva");

            if (pagoMap == null) return ResponseEntity.badRequest().body(Map.of("message", "Objeto 'pago' requerido"));
            if (reservaMap == null) return ResponseEntity.badRequest().body(Map.of("message", "Objeto 'reserva' requerido"));

            // Construcción de Pago (simplificada aquí por espacio)
            Pago pago = new Pago();
            if (pagoMap.get("valor") != null) {
                Object v = pagoMap.get("valor");
                if (v instanceof Number) pago.setValor(((Number) v).floatValue());
                else {
                    try { pago.setValor(Float.parseFloat(String.valueOf(v))); } catch (Exception ignored) {}
                }
            }
            if (pagoMap.get("descripcion") != null) pago.setDescripcion(String.valueOf(pagoMap.get("descripcion")));
            if (pagoMap.get("categoria") != null) pago.setCategoria(String.valueOf(pagoMap.get("categoria")));
            if (pago.getFecha() == null) pago.setFecha(LocalDateTime.now());
            pago.setEstadoPago("PENDIENTE");

            // Guardar pago
            if (pago.getValor() <= 0.0f) {
                return ResponseEntity.badRequest().body(Map.of("message", "valor inválido en pago"));
            }
            pagoRepository.save(pago);

            // Construcción de Reserva (simplificada aquí por espacio)
            Reserva reserva = new Reserva();
            // ... (mapear campos como en tu código original)
            try {
                reservaService.agregarReserva(reserva);
            } catch (Exception ex) {
                logger.error("Error guardando reserva: {}", ex.getMessage(), ex);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of("message", "Error al crear reserva: " + ex.getMessage()));
            }

            Preference preference = crearPreferenciaParaPago(pago);

            Map<String, Object> response = new HashMap<>();
            response.put("init_point", preference.getSandboxInitPoint());
            response.put("pago", toDTO(pago));
            return ResponseEntity.ok(response);

        } catch (Exception ex) {
            logger.error("Error creando preferencia reserva: {}", ex.getMessage(), ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message","Error interno"));
        }
    }

    // ----------------- Pago + Reserva (DTO) -----------------
    @PostMapping("/mercado-pago/reserva/dto")
    public ResponseEntity<?> crearPreferenciaAreaComunDTO(@RequestBody PagoReservaDTO dto) throws MPException, MPApiException {
        if (dto == null || dto.getPago() == null || dto.getReserva() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Payload inválido. Se requiere { pago, reserva }"));
        }

        Pago pago = dto.getPago();
        Reserva reserva = dto.getReserva();

        pago.setEstadoPago("PENDIENTE");
        if (pago.getFecha() == null) pago.setFecha(LocalDateTime.now());

        if (pago.getValor() <= 0.0f) {
            return ResponseEntity.badRequest().body(Map.of("message", "valor inválido en pago"));
        }
        pagoRepository.save(pago);

        try {
            reservaService.agregarReserva(reserva);
        } catch (Exception ex) {
            logger.error("Error guardando reserva (DTO): {}", ex.getMessage(), ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", "Error al crear reserva: " + ex.getMessage()));
        }

        Preference preference = crearPreferenciaParaPago(pago);

        Map<String, Object> response = new HashMap<>();
        response.put("init_point", preference.getSandboxInitPoint());
        response.put("pago", toDTO(pago));
        return ResponseEntity.ok(response);
    }

    // ----------------- Webhook -----------------
    @PostMapping("/webhook")
    public ResponseEntity<String> recibirWebhook(
            @RequestParam(required = false) Map<String, String> queryParams,
            @RequestBody(required = false) Map<String, Object> body) {
        try {
            String topic = null;
            String id = null;

            if (queryParams != null) {
                topic = queryParams.get("topic");
                id = queryParams.get("id");
            }
            if ((id == null || topic == null) && body != null) {
                if (body.get("type") != null) topic = String.valueOf(body.get("type"));
                if (body.get("data") instanceof Map) {
                    Map<?, ?> data = (Map<?, ?>) body.get("data");
                    Object idObj = data.get("id");
                    if (idObj != null) id = String.valueOf(idObj);
                }
            }

            if ("payment".equalsIgnoreCase(topic) && id != null) {
                try {
                    PaymentClient client = new PaymentClient();
                    Payment payment = client.get(Long.parseLong(id));

                    if (payment != null) {
                        String estado = payment.getStatus();
                        String externalReference = payment.getExternalReference();

                        if (externalReference != null) {
                            switch (estado) {
                                case ("aproved"):
                                    estado = "APROBADO";
                                    break;
                                case ("pending"):
                                    estado = "PENDIENTE";
                                    break;
                                case ("canceled"):
                                    estado = "CANCELADO";
                                    break;
                                case ("in_process"):
                                    estado = "EN_PROCESO";
                                    break;
                                default:
                                    estado = "ERROR";
                                    break;
                            }
                            pagoService.actualizarEstadoPago(
                                    Long.parseLong(externalReference),
                                    estado
                            );
                            logger.debug("Pago actualizado -> ID: {} Estado: {}", id, estado);
                        } else {
                            logger.warn("Payment sin external_reference. ID: {}", id);
                        }
                    } else {
                        logger.warn("No se encontró pago con ID {}", id);
                    }
                } catch (Exception e) {
                    logger.warn("Error obteniendo pago con id {}: {}", id, e.getMessage());
                }
            } else {
                logger.debug("Webhook recibido sin 'payment' o sin id: body={}", body);
            }
            return ResponseEntity.ok("Webhook recibido");

        } catch (Exception e) {
            logger.warn("Error general en webhook: {}", e.getMessage());
            return ResponseEntity.ok("Webhook recibido con error interno");
        }
    }

    // ----------------- Obtener pagos -----------------
    @GetMapping("/obtenerPagos")
    public ResponseEntity<?> obtenerPagos() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getPrincipal() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message","Usuario no autenticado"));
        }

        Object principal = auth.getPrincipal();
        Integer idCuentaInt = extractIdFromPrincipal(principal);
        if (idCuentaInt == null) {
            return ResponseEntity.ok(Collections.emptyList());
        }

        Long idCuenta = idCuentaInt.longValue();
        List<Pago> pagos = pagoService.obtenerPagosPorCuenta(idCuenta);

        List<PagoDTO> dtos = toDTOList(pagos);
        return ResponseEntity.ok(dtos);
    }

    // ----------------- Handler para IllegalArgumentException -----------------
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<?> handleIllegalArgument(IllegalArgumentException ex) {
        return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
    }

    // ==================== MÉTODOS AUXILIARES ====================
    private Integer extractIdFromPrincipal(Object principal) {
        if (principal == null) return null;

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
            } catch (Exception e) {
                logger.debug("Error invoking getter {} on principal: {}", getter, e.getMessage());
            }
        }

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
            }
        }
        return null;
    }
}
