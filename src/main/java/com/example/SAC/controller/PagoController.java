package com.example.SAC.controller;

import com.example.SAC.dto.PagoReservaDTO;
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
import java.util.*;

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

    // ----------------- Pago normal -----------------
    @PostMapping("/mercado-pago")
    public ResponseEntity<?> crearPreferencia(@RequestBody Pago pago) throws MPException, MPApiException {
        pago.setEstadoPago("PENDIENTE");
        pagoRepository.save(pago);

        MercadoPagoConfig.setAccessToken("TEST-6124805663082328-040417-a023ca85ac047fbfca3fc9fb2316df41-2045469211");

        PreferenceBackUrlsRequest backUrls = PreferenceBackUrlsRequest.builder()
                .success("http://localhost:8080/")
                .pending("http://localhost:8080/")
                .failure("http://localhost:8080/")
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

        Map<String, String> response = new HashMap<>();
        response.put("init_point", preference.getSandboxInitPoint());

        return ResponseEntity.ok(response);
    }

    // ----------------- Pago + Reserva -----------------
    @PostMapping("/mercado-pago/reserva")
    public ResponseEntity<?> crearPreferenciaAreaComun(@RequestBody PagoReservaDTO dto) throws MPException, MPApiException {
        Pago pago = dto.getPago();
        Reserva reserva = dto.getReserva();

        if (pago == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Objeto 'pago' requerido"));
        }
        if (reserva == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Objeto 'reserva' requerido"));
        }

        // Guardar pago como pendiente
        pago.setEstadoPago("PENDIENTE");
        pagoRepository.save(pago);

        // ======= Intentar extraer idResidente desde el principal autenticado (REFLEXIÓN) =======
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Object principal = (auth != null) ? auth.getPrincipal() : null;
            Integer idResFromAuth = extractIdFromPrincipal(principal);
            if (idResFromAuth != null) {
                reserva.setIdResidente(idResFromAuth);
                logger.debug("Asignado idResidente desde SecurityContext: {}", idResFromAuth);
            } else {
                logger.warn("No se pudo extraer idResidente desde el principal (tipo {}). " +
                        "Se continuará y ReservaService validará la presencia del id.", principal != null ? principal.getClass().getName() : "null");
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
                .success("http://localhost:8080/")
                .pending("http://localhost:8080/")
                .failure("http://localhost:8080/")
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

        Map<String, String> response = new HashMap<>();
        response.put("init_point", preference.getSandboxInitPoint());

        return ResponseEntity.ok(response);
    }

    // ----------------- Webhook -----------------
    @PostMapping("/webhook")
    public ResponseEntity<?> recibirWebhook(@RequestParam Map<String, String> params) throws MPException, MPApiException {
        String topic = params.get("topic");
        String id = params.get("id");

        if ("payment".equals(topic)) {
            try {
                PaymentClient client = new PaymentClient();

                // Aquí se obtiene el pago real desde Mercado Pago
                Payment payment = client.get(Long.parseLong(id));

                String estado = payment.getStatus(); // approved, pending, etc.
                Long externalReference = Long.parseLong(payment.getExternalReference());

                // Aquí actualizas el pago en tu base de datos
                pagoService.actualizarEstadoPago(externalReference, estado);

                return ResponseEntity.ok("Webhook procesado correctamente");
            } catch (Exception e) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("Error procesando webhook: " + e.getMessage());
            }
        }

        return ResponseEntity.badRequest().body("Evento no soportado");
    }

    // ----------------- Obtener pagos -----------------
    @GetMapping("/obtenerPagos")
    public List<Pago> obtenerPagos() {
        return pagoService.obtenerPagos();
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
